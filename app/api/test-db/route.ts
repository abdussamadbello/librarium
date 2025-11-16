import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, authors, categories } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    console.log('Testing book detail query...')
    
    const bookId = 1
    
    // Test the exact same query pattern as list endpoint
    const result = await db
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
      .where(eq(books.id, bookId))
      .limit(1)
    
    console.log('Query result:', result)
    
    return NextResponse.json({ 
      success: true,
      result 
    })
  } catch (error) {
    console.error('Test query error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
