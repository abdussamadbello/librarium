import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { transactions, bookCopies, books, authors } from '@/lib/db/schema'
import { eq, isNotNull, and, desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get all returned transactions for the user
    const history = await db
      .select({
        transaction: {
          id: transactions.id,
          checkoutDate: transactions.checkoutDate,
          dueDate: transactions.dueDate,
          returnDate: transactions.returnDate,
          notes: transactions.notes,
        },
        book: {
          id: books.id,
          title: books.title,
          isbn: books.isbn,
          publicationYear: books.publicationYear,
        },
        author: {
          id: authors.id,
          name: authors.name,
        },
        copy: {
          id: bookCopies.id,
          copyNumber: bookCopies.copyNumber,
        },
      })
      .from(transactions)
      .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
      .leftJoin(books, eq(bookCopies.bookId, books.id))
      .leftJoin(authors, eq(books.authorId, authors.id))
      .where(
        and(
          eq(transactions.userId, session.user.id),
          isNotNull(transactions.returnDate)
        )
      )
      .orderBy(desc(transactions.returnDate))
      .limit(limit)
      .offset(offset)

    // Calculate if each was returned late
    const historyWithStatus = history.map((item) => {
      const dueDate = item.transaction.dueDate ? new Date(item.transaction.dueDate) : null
      const returnDate = item.transaction.returnDate ? new Date(item.transaction.returnDate) : null
      const wasLate = dueDate && returnDate ? returnDate > dueDate : false
      const daysLate = wasLate && dueDate && returnDate
        ? Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      return {
        ...item,
        wasLate,
        daysLate,
      }
    })

    return NextResponse.json({ history: historyWithStatus })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
