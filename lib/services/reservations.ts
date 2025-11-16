import { db } from '@/lib/db'
import { reservations, books, users, activityLog, notifications } from '@/lib/db/schema'
import { eq, and, isNull, lt, desc, sql, asc } from 'drizzle-orm'

// Reservation expires 48 hours after book becomes available
const HOLD_EXPIRY_HOURS = 48

interface CreateReservationParams {
  userId: string
  bookId: number
}

interface CancelReservationParams {
  reservationId: number
  userId: string
}

interface FulfillReservationParams {
  reservationId: number
  fulfilledBy: string // Admin/Staff user ID
}

/**
 * Create a new reservation (add user to queue)
 */
export async function createReservation(params: CreateReservationParams) {
  const { userId, bookId } = params

  try {
    // 1. Check if book exists
    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1)

    if (!book) {
      throw new Error('Book not found')
    }

    // 2. Check if user already has an active reservation for this book
    const existingReservation = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.bookId, bookId),
          eq(reservations.status, 'active')
        )
      )
      .limit(1)

    if (existingReservation.length > 0) {
      throw new Error('You already have an active reservation for this book')
    }

    // 3. Get current queue position (count active reservations + 1)
    const [queueCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.bookId, bookId),
          eq(reservations.status, 'active')
        )
      )

    const queuePosition = Number(queueCount?.count || 0) + 1

    // 4. Create reservation
    const result = await db.transaction(async (tx) => {
      const [newReservation] = await tx
        .insert(reservations)
        .values({
          userId,
          bookId,
          status: 'active',
          queuePosition,
          reservedAt: new Date(),
        })
        .returning()

      // Log activity
      await tx.insert(activityLog).values({
        userId,
        action: 'create_reservation',
        entityType: 'reservation',
        entityId: newReservation!.id,
        metadata: { bookId, queuePosition },
      })

      return newReservation!
    })

    // Check if book is available and assign immediately
    if (book.availableCopies && book.availableCopies > 0 && queuePosition === 1) {
      await assignNextInQueue(bookId)
    }

    return result
  } catch (error) {
    console.error('Error creating reservation:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create reservation. Please try again.')
  }
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(params: CancelReservationParams) {
  const { reservationId, userId } = params

  try {
    // 1. Find reservation
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1)

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    // 2. Verify ownership
    if (reservation.userId !== userId) {
      throw new Error('You can only cancel your own reservations')
    }

    // 3. Check if already cancelled or fulfilled
    if (reservation.status !== 'active') {
      throw new Error(`Reservation is already ${reservation.status}`)
    }

    // 4. Cancel reservation and update queue
    const result = await db.transaction(async (tx) => {
      // Cancel the reservation
      const [cancelled] = await tx
        .update(reservations)
        .set({ status: 'cancelled' })
        .where(eq(reservations.id, reservationId))
        .returning()

      // Update queue positions for others in queue
      await updateQueuePositions(tx, reservation.bookId!)

      // Log activity
      await tx.insert(activityLog).values({
        userId,
        action: 'cancel_reservation',
        entityType: 'reservation',
        entityId: reservationId,
        metadata: { bookId: reservation.bookId },
      })

      return cancelled
    })

    // Try to assign the next person in queue
    if (reservation.bookId) {
      await assignNextInQueue(reservation.bookId)
    }

    return result
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to cancel reservation. Please try again.')
  }
}

/**
 * Admin: Fulfill a reservation (mark as ready for pickup)
 */
export async function fulfillReservation(params: FulfillReservationParams) {
  const { reservationId, fulfilledBy } = params

  try {
    // 1. Find reservation
    const [reservation] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1)

    if (!reservation) {
      throw new Error('Reservation not found')
    }

    if (reservation.status !== 'active') {
      throw new Error('Only active reservations can be fulfilled')
    }

    // 2. Set expiry date (48 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + HOLD_EXPIRY_HOURS)

    // 3. Update reservation
    const result = await db.transaction(async (tx) => {
      const [fulfilled] = await tx
        .update(reservations)
        .set({
          status: 'fulfilled',
          fulfilledAt: new Date(),
          notifiedAt: new Date(),
          expiresAt,
        })
        .where(eq(reservations.id, reservationId))
        .returning()

      // Create notification
      await tx.insert(notifications).values({
        userId: reservation.userId!,
        type: 'reservation_ready',
        title: 'Your Reserved Book is Ready!',
        message: `Your reserved book is now available for pickup. Please collect it within 48 hours.`,
        link: `/member/reservations`,
        metadata: { reservationId, expiresAt: expiresAt.toISOString() },
      })

      // Log activity
      await tx.insert(activityLog).values({
        userId: fulfilledBy,
        action: 'fulfill_reservation',
        entityType: 'reservation',
        entityId: reservationId,
        metadata: { bookId: reservation.bookId, userId: reservation.userId },
      })

      return fulfilled
    })

    // TODO: Send email notification when email service is integrated

    return result
  } catch (error) {
    console.error('Error fulfilling reservation:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fulfill reservation. Please try again.')
  }
}

/**
 * Assign book to next person in queue (called when book becomes available)
 */
export async function assignNextInQueue(bookId: number) {
  try {
    // 1. Find first person in active queue
    const [nextReservation] = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.bookId, bookId),
          eq(reservations.status, 'active')
        )
      )
      .orderBy(asc(reservations.queuePosition), asc(reservations.reservedAt))
      .limit(1)

    if (!nextReservation) {
      return null // No one in queue
    }

    // 2. Check if book is actually available
    const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1)

    if (!book || !book.availableCopies || book.availableCopies < 1) {
      return null // Book not available
    }

    // 3. Auto-fulfill the reservation
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + HOLD_EXPIRY_HOURS)

    const result = await db.transaction(async (tx) => {
      const [assigned] = await tx
        .update(reservations)
        .set({
          status: 'fulfilled',
          fulfilledAt: new Date(),
          notifiedAt: new Date(),
          expiresAt,
        })
        .where(eq(reservations.id, nextReservation.id))
        .returning()

      // Create notification
      await tx.insert(notifications).values({
        userId: nextReservation.userId!,
        type: 'reservation_ready',
        title: 'Your Reserved Book is Ready!',
        message: `Your reserved book is now available for pickup. Please collect it within 48 hours or your reservation will expire.`,
        link: `/member/reservations`,
        metadata: { reservationId: nextReservation.id, expiresAt: expiresAt.toISOString() },
      })

      // Log activity
      await tx.insert(activityLog).values({
        userId: 'system',
        action: 'auto_assign_reservation',
        entityType: 'reservation',
        entityId: nextReservation.id,
        metadata: { bookId, userId: nextReservation.userId },
      })

      return assigned
    })

    // TODO: Send email notification when email service is integrated

    return result
  } catch (error) {
    console.error('Error assigning next in queue:', error)
    return null
  }
}

/**
 * Check for expired reservations and mark them as expired
 */
export async function checkExpiredReservations() {
  try {
    const now = new Date()

    // Find fulfilled reservations that have expired
    const expiredReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.status, 'fulfilled'),
          lt(reservations.expiresAt!, now)
        )
      )

    if (expiredReservations.length === 0) {
      return []
    }

    // Mark as expired and try to assign next in queue
    const results = []
    for (const reservation of expiredReservations) {
      try {
        await db.transaction(async (tx) => {
          // Mark as expired
          await tx
            .update(reservations)
            .set({ status: 'expired' })
            .where(eq(reservations.id, reservation.id))

          // Log activity
          await tx.insert(activityLog).values({
            userId: 'system',
            action: 'expire_reservation',
            entityType: 'reservation',
            entityId: reservation.id,
            metadata: { bookId: reservation.bookId, userId: reservation.userId },
          })
        })

        // Try to assign to next person in queue
        if (reservation.bookId) {
          await assignNextInQueue(reservation.bookId)
        }

        results.push(reservation)
      } catch (error) {
        console.error(`Error expiring reservation ${reservation.id}:`, error)
      }
    }

    return results
  } catch (error) {
    console.error('Error checking expired reservations:', error)
    return []
  }
}

/**
 * Update queue positions after a cancellation
 */
async function updateQueuePositions(tx: any, bookId: number) {
  // Get all active reservations for this book, ordered by current queue position
  const activeReservations = await tx
    .select()
    .from(reservations)
    .where(
      and(
        eq(reservations.bookId, bookId),
        eq(reservations.status, 'active')
      )
    )
    .orderBy(asc(reservations.queuePosition), asc(reservations.reservedAt))

  // Update queue positions sequentially
  for (let i = 0; i < activeReservations.length; i++) {
    const reservation = activeReservations[i]
    const newPosition = i + 1

    if (reservation.queuePosition !== newPosition) {
      await tx
        .update(reservations)
        .set({ queuePosition: newPosition })
        .where(eq(reservations.id, reservation.id))
    }
  }
}

/**
 * Get user's active reservations
 */
export async function getUserReservations(userId: string) {
  return await db
    .select({
      reservation: reservations,
      book: books,
    })
    .from(reservations)
    .leftJoin(books, eq(reservations.bookId, books.id))
    .where(eq(reservations.userId, userId))
    .orderBy(desc(reservations.reservedAt))
}

/**
 * Get all reservations for a book (for admin)
 */
export async function getBookReservations(bookId: number) {
  return await db
    .select({
      reservation: reservations,
      user: users,
    })
    .from(reservations)
    .leftJoin(users, eq(reservations.userId, users.id))
    .where(eq(reservations.bookId, bookId))
    .orderBy(asc(reservations.queuePosition), asc(reservations.reservedAt))
}

/**
 * Get book availability status
 */
export async function getBookAvailability(bookId: number) {
  const [book] = await db.select().from(books).where(eq(books.id, bookId)).limit(1)

  if (!book) {
    throw new Error('Book not found')
  }

  const [queueCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(reservations)
    .where(
      and(
        eq(reservations.bookId, bookId),
        eq(reservations.status, 'active')
      )
    )

  return {
    available: book.availableCopies && book.availableCopies > 0,
    availableCopies: book.availableCopies || 0,
    totalCopies: book.totalCopies || 0,
    queueLength: Number(queueCount?.count || 0),
  }
}
