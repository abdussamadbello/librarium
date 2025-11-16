import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { cancelReservation } from '@/lib/services/reservations'
import { db } from '@/lib/db'
import { reservations, books } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/reservations/[id]
 * Get a single reservation
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reservationId = parseInt(params.id)

    if (isNaN(reservationId)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 })
    }

    // Get reservation with book details
    const [reservation] = await db
      .select({
        reservation: reservations,
        book: books,
      })
      .from(reservations)
      .leftJoin(books, eq(reservations.bookId, books.id))
      .where(eq(reservations.id, reservationId))
      .limit(1)

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Verify ownership
    if (reservation.reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Get reservation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reservation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reservations/[id]
 * Cancel a reservation
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reservationId = parseInt(params.id)

    if (isNaN(reservationId)) {
      return NextResponse.json({ error: 'Invalid reservation ID' }, { status: 400 })
    }

    // Cancel reservation
    const cancelled = await cancelReservation({
      reservationId,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      reservation: cancelled,
      message: 'Reservation cancelled successfully',
    })
  } catch (error) {
    console.error('Cancel reservation error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    )
  }
}
