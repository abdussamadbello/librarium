import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { transactions, users, bookCopies, books, authors } from '@/lib/db/schema'
import { eq, and, gte, lte, desc, isNull, isNotNull } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'all', 'active', 'returned'
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search') // Search by member name or book title
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build query conditions
    const conditions = []

    // Type filter
    if (type === 'active') {
      conditions.push(eq(transactions.type, 'checkout'))
      conditions.push(isNull(transactions.returnDate))
    } else if (type === 'returned') {
      conditions.push(eq(transactions.type, 'checkout'))
      conditions.push(isNotNull(transactions.returnDate))
    }

    // User filter
    if (userId) {
      conditions.push(eq(transactions.userId, userId))
    }

    // Date range filter
    if (startDate) {
      conditions.push(gte(transactions.checkoutDate, new Date(startDate)))
    }

    if (endDate) {
      conditions.push(lte(transactions.checkoutDate, new Date(endDate)))
    }

    // Base query
    let query = db
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
        issuedByUser: {
          id: users.id,
          name: users.name,
        },
        returnedToUser: {
          id: users.id,
          name: users.name,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
      .leftJoin(books, eq(bookCopies.bookId, books.id))
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(
        { issuedByUser: users },
        eq(transactions.issuedBy, users.id)
      )
      .leftJoin(
        { returnedToUser: users },
        eq(transactions.returnedTo, users.id)
      )

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    const allTransactions = await query
      .orderBy(desc(transactions.createdAt))
      .limit(limit)

    // Apply search filter in memory (simpler than complex SQL)
    let filteredTransactions = allTransactions
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTransactions = allTransactions.filter(
        (t) =>
          t.user?.name.toLowerCase().includes(searchLower) ||
          t.book?.title.toLowerCase().includes(searchLower) ||
          t.author?.name.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json(filteredTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
