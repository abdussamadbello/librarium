import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { books, authors, categories, reservations } from '@/lib/db/schema'
import { lte, eq, and, count, sql } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const alertType = searchParams.get('type') // 'low-stock', 'high-demand', 'all'
    const threshold = parseInt(searchParams.get('threshold') || '3')

    // Get books with low stock (available copies <= threshold)
    const lowStockBooks = await db
      .select({
        book: books,
        author: {
          name: authors.name,
        },
        category: {
          name: categories.name,
        },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(lte(books.availableCopies, threshold))

    // Get books with high demand (many active reservations)
    const highDemandBooks = await db
      .select({
        book: books,
        author: {
          name: authors.name,
        },
        category: {
          name: categories.name,
        },
        reservationCount: sql<number>`count(${reservations.id})::int`,
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(
        reservations,
        and(eq(reservations.bookId, books.id), eq(reservations.status, 'active'))
      )
      .groupBy(books.id, authors.id, categories.id)
      .having(sql`count(${reservations.id}) >= 3`)

    // Calculate stats
    const totalBooks = await db.select({ count: count() }).from(books)
    const outOfStock = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.availableCopies, 0))

    return NextResponse.json({
      lowStock: lowStockBooks,
      highDemand: highDemandBooks,
      stats: {
        totalBooks: totalBooks[0].count,
        lowStock: lowStockBooks.length,
        outOfStock: outOfStock[0].count,
        highDemand: highDemandBooks.length,
      },
    })
  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory alerts' }, { status: 500 })
  }
}
