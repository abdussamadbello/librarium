import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { fines, transactions, bookCopies, books } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all fines for the user
    const userFines = await db
      .select({
        fine: {
          id: fines.id,
          amount: fines.amount,
          reason: fines.reason,
          status: fines.status,
          daysOverdue: fines.daysOverdue,
          createdAt: fines.createdAt,
        },
        transaction: {
          id: transactions.id,
          checkoutDate: transactions.checkoutDate,
          returnDate: transactions.returnDate,
        },
        book: {
          id: books.id,
          title: books.title,
        },
      })
      .from(fines)
      .leftJoin(transactions, eq(fines.transactionId, transactions.id))
      .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
      .leftJoin(books, eq(bookCopies.bookId, books.id))
      .where(eq(fines.userId, session.user.id))
      .orderBy(desc(fines.createdAt))

    // Calculate totals
    const pending = userFines.filter((f) => f.fine.status === 'pending')
    const paid = userFines.filter((f) => f.fine.status === 'paid')
    const waived = userFines.filter((f) => f.fine.status === 'waived')

    const totalPending = pending.reduce((sum, f) => sum + parseFloat(f.fine.amount || '0'), 0)
    const totalPaid = paid.reduce((sum, f) => sum + parseFloat(f.fine.amount || '0'), 0)

    return NextResponse.json({
      fines: userFines,
      summary: {
        totalPending,
        totalPaid,
        pendingCount: pending.length,
        paidCount: paid.length,
        waivedCount: waived.length,
      },
    })
  } catch (error) {
    console.error('Error fetching fines:', error)
    return NextResponse.json({ error: 'Failed to fetch fines' }, { status: 500 })
  }
}
