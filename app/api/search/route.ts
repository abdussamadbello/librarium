import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, authors, categories, bookCopies } from '@/lib/db/schema'
import { eq, like, or, and, gte, lte, desc, asc, sql } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Search parameters
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('category')
    const authorId = searchParams.get('author')
    const yearFrom = searchParams.get('yearFrom')
    const yearTo = searchParams.get('yearTo')
    const availability = searchParams.get('availability') // 'available', 'all'
    const sortBy = searchParams.get('sortBy') || 'title' // title, year, author
    const sortOrder = searchParams.get('sortOrder') || 'asc' // asc, desc
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const conditions: any[] = []

    // Text search
    if (query) {
      conditions.push(
        or(
          like(books.title, `%${query}%`),
          like(books.isbn, `%${query}%`),
          like(books.description, `%${query}%`)
        )
      )
    }

    // Category filter
    if (categoryId) {
      conditions.push(eq(books.categoryId, parseInt(categoryId)))
    }

    // Author filter
    if (authorId) {
      conditions.push(eq(books.authorId, parseInt(authorId)))
    }

    // Year range filter
    if (yearFrom) {
      conditions.push(gte(books.publicationYear, parseInt(yearFrom)))
    }
    if (yearTo) {
      conditions.push(lte(books.publicationYear, parseInt(yearTo)))
    }

    // Availability filter
    if (availability === 'available') {
      conditions.push(sql`${books.availableCopies} > 0`)
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build order by
    let orderByClause
    const direction = sortOrder === 'desc' ? desc : asc

    switch (sortBy) {
      case 'year':
        orderByClause = direction(books.publicationYear)
        break
      case 'author':
        orderByClause = direction(authors.name)
        break
      default:
        orderByClause = direction(books.title)
    }

    // Fetch books with filters
    const results = await db
      .select({
        book: {
          id: books.id,
          title: books.title,
          isbn: books.isbn,
          publisher: books.publisher,
          publicationYear: books.publicationYear,
          description: books.description,
          totalCopies: books.totalCopies,
          availableCopies: books.availableCopies,
        },
        author: {
          id: authors.id,
          name: authors.name,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .where(whereClause)

    const total = countResult[0]?.count || 0

    return NextResponse.json({
      results,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error searching books:', error)
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 })
  }
}
