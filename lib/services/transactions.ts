import { db } from '@/lib/db'
import { transactions, bookCopies, fines, activityLog, users, books } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { IssueBookFormData, ReturnBookFormData } from '@/lib/validations/transaction'
import { assignNextInQueue } from '@/lib/services/reservations'

// Fine calculation: $0.50 per day overdue
const FINE_PER_DAY = 0.5

interface IssueBookParams extends IssueBookFormData {
  issuedBy: string // Staff/Admin user ID
}

interface ReturnBookParams extends ReturnBookFormData {
  returnedTo: string // Staff/Admin user ID
}

export async function issueBook(params: IssueBookParams) {
  const { userId, bookCopyId, dueDate, notes, issuedBy } = params

  // 1. Check if book copy exists and is available
  const [bookCopy] = await db
    .select()
    .from(bookCopies)
    .where(eq(bookCopies.id, bookCopyId))
    .limit(1)

  if (!bookCopy) {
    throw new Error('Book copy not found')
  }

  if (bookCopy.status !== 'available') {
    throw new Error(`Book copy is ${bookCopy.status} and cannot be issued`)
  }

  // 2. Check member eligibility
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

  if (!user) {
    throw new Error('User not found')
  }

  // Check if user has active membership
  if (user.membershipExpiry && new Date(user.membershipExpiry) < new Date()) {
    throw new Error('User membership has expired')
  }

  // Check if user has any overdue books
  const overdueTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.returnDate),
        // Check if due date is in the past
      )
    )

  const hasOverdue = overdueTransactions.some(
    (t) => t.dueDate && new Date(t.dueDate) < new Date()
  )

  if (hasOverdue) {
    throw new Error('User has overdue books and cannot borrow more')
  }

  // 3. Create transaction using database transaction for atomicity
  try {
    const result = await db.transaction(async (tx) => {
      // Create transaction record
      const [newTransaction] = await tx
        .insert(transactions)
        .values({
          userId,
          bookCopyId,
          issuedBy,
          checkoutDate: new Date(),
          dueDate: new Date(dueDate),
          type: 'checkout',
          notes,
        })
        .returning()

      // Update book copy status
      await tx
        .update(bookCopies)
        .set({ status: 'borrowed' })
        .where(eq(bookCopies.id, bookCopyId))

      // Update available copies count
      if (bookCopy.bookId) {
        await tx.execute(`
          UPDATE books
          SET available_copies = available_copies - 1
          WHERE id = ${bookCopy.bookId}
        `)
      }

      // Log activity
      await tx.insert(activityLog).values({
        userId: issuedBy,
        action: 'issue_book',
        entityType: 'transaction',
        entityId: newTransaction!.id,
        metadata: { bookCopyId, userId },
      })

      return newTransaction
    })

    return result
  } catch (error) {
    console.error('Error issuing book:', error)
    throw new Error('Failed to issue book. Please try again.')
  }
}

export async function returnBook(params: ReturnBookParams) {
  const { transactionId, notes, returnedTo } = params

  // 1. Find transaction
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1)

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  if (transaction.returnDate) {
    throw new Error('Book has already been returned')
  }

  // 2. Calculate overdue days and fine
  const returnDate = new Date()
  const dueDate = transaction.dueDate ? new Date(transaction.dueDate) : new Date()
  const overdueDays = Math.max(
    0,
    Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  )
  const fineAmount = overdueDays * FINE_PER_DAY

  try {
    const result = await db.transaction(async (tx) => {
      // Update transaction with return info
      const [updatedTransaction] = await tx
        .update(transactions)
        .set({
          returnDate: returnDate,
          returnedTo,
          notes: notes || transaction.notes,
        })
        .where(eq(transactions.id, transactionId))
        .returning()

      // Update book copy status back to available
      await tx
        .update(bookCopies)
        .set({ status: 'available' })
        .where(eq(bookCopies.id, transaction.bookCopyId!))

      // Update available copies count
      const [bookCopy] = await tx
        .select()
        .from(bookCopies)
        .where(eq(bookCopies.id, transaction.bookCopyId!))
        .limit(1)

      if (bookCopy?.bookId) {
        await tx.execute(`
          UPDATE books
          SET available_copies = available_copies + 1
          WHERE id = ${bookCopy.bookId}
        `)
      }

      // Create fine if overdue
      let fine = null
      if (overdueDays > 0 && fineAmount > 0) {
        const [newFine] = await tx
          .insert(fines)
          .values({
            transactionId,
            userId: transaction.userId!,
            amount: fineAmount.toString(),
            reason: `Book returned ${overdueDays} day(s) late`,
            daysOverdue: overdueDays,
            status: 'pending',
          })
          .returning()

        fine = newFine
      }

      // Log activity
      await tx.insert(activityLog).values({
        userId: returnedTo,
        action: 'return_book',
        entityType: 'transaction',
        entityId: transactionId,
        metadata: {
          bookCopyId: transaction.bookCopyId,
          overdueDays,
          fineAmount: overdueDays > 0 ? fineAmount : 0,
        },
      })

      return { transaction: updatedTransaction, fine, overdueDays, fineAmount, bookId: bookCopy?.bookId }
    })

    // Try to assign book to next person in reservation queue
    if (result.bookId) {
      try {
        await assignNextInQueue(result.bookId)
      } catch (error) {
        console.error('Error assigning next in queue:', error)
        // Don't fail the return if queue assignment fails
      }
    }

    return result
  } catch (error) {
    console.error('Error returning book:', error)
    throw new Error('Failed to return book. Please try again.')
  }
}

export async function getActiveTransactionsByUser(userId: string) {
  return await db
    .select({
      transaction: transactions,
      bookCopy: bookCopies,
      book: books,
    })
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .leftJoin(books, eq(bookCopies.bookId, books.id))
    .where(and(eq(transactions.userId, userId), isNull(transactions.returnDate)))
}

export async function getOverdueTransactions() {
  const allActive = await db
    .select({
      transaction: transactions,
      user: users,
      bookCopy: bookCopies,
      book: books,
    })
    .from(transactions)
    .leftJoin(users, eq(transactions.userId, users.id))
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .leftJoin(books, eq(bookCopies.bookId, books.id))
    .where(isNull(transactions.returnDate))

  // Filter overdue in JavaScript (Drizzle doesn't support date comparison easily)
  return allActive.filter((t) => t.transaction.dueDate && new Date(t.transaction.dueDate) < new Date())
}
