import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { transactions, users, bookCopies, books, authors } from '@/lib/db/schema'
import { and, isNotNull, eq, desc, aliasedTable } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '100')

    const returnedToUser = aliasedTable(users, 'returnedToUser')

    // Get all returned books
    const returnedTransactions = await db
      .select({
        transaction: transactions,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        book: {
          id: books.id,
          title: books.title,
          isbn: books.isbn,
        },
        author: {
          name: authors.name,
        },
        bookCopy: {
          id: bookCopies.id,
          copyNumber: bookCopies.copyNumber,
        },
        returnedToUser: {
          id: returnedToUser.id,
          name: returnedToUser.name,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
      .leftJoin(books, eq(bookCopies.bookId, books.id))
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(returnedToUser, eq(transactions.returnedTo, returnedToUser.id))
      .where(
        and(
          eq(transactions.type, 'checkout'),
          isNotNull(transactions.returnDate)
        )
      )
      .orderBy(desc(transactions.returnDate))
      .limit(limit)

    return NextResponse.json(returnedTransactions)
  } catch (error) {
    console.error('Error fetching returned books:', error)
    return NextResponse.json({ error: 'Failed to fetch returned books' }, { status: 500 })
  }
}
