import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, authors, categories, bookCopies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookId = parseInt(id)

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    // Fetch book with author and category
    const [book] = await db
      .select({
        book: books,
        author: authors,
        category: categories,
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, bookId))
      .limit(1)

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Get all copies of this book
    const copies = await db
      .select()
      .from(bookCopies)
      .where(eq(bookCopies.bookId, bookId))

    return NextResponse.json({
      ...book,
      copies,
    })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}
