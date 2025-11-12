import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, authors, categories } from '@/lib/db/schema'
import { eq, like, or, desc, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    let whereConditions = undefined

    if (search && categoryId) {
      whereConditions = and(
        eq(books.categoryId, parseInt(categoryId)),
        or(
          like(books.title, `%${search}%`),
          like(books.isbn, `%${search}%`)
        )
      )
    } else if (search) {
      whereConditions = or(
        like(books.title, `%${search}%`),
        like(books.isbn, `%${search}%`)
      )
    } else if (categoryId) {
      whereConditions = eq(books.categoryId, parseInt(categoryId))
    }

    // Fetch books with author and category info
    const booksList = await db
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
      .where(whereConditions)
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({ books: booksList, total: booksList.length })
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}
