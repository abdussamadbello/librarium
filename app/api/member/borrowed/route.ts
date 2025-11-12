import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { transactions, bookCopies, books, authors } from '@/lib/db/schema'
import { eq, isNull, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active (unreturned) transactions for the user
    const borrowedBooks = await db
      .select({
        transaction: {
          id: transactions.id,
          checkoutDate: transactions.checkoutDate,
          dueDate: transactions.dueDate,
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
          isNull(transactions.returnDate)
        )
      )

    // Calculate overdue status for each book
    const booksWithStatus = borrowedBooks.map((item) => {
      const dueDate = item.transaction.dueDate ? new Date(item.transaction.dueDate) : null
      const isOverdue = dueDate ? dueDate < new Date() : false
      const daysOverdue = isOverdue && dueDate
        ? Math.ceil((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      return {
        ...item,
        isOverdue,
        daysOverdue,
      }
    })

    return NextResponse.json({ borrowedBooks: booksWithStatus })
  } catch (error) {
    console.error('Error fetching borrowed books:', error)
    return NextResponse.json({ error: 'Failed to fetch borrowed books' }, { status: 500 })
  }
}
