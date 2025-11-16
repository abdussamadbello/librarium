import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { books, authors, categories, bookCopies } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  
  try {
    console.log('\n========================================')
    console.log('📚 BOOK DETAIL API CALLED')
    console.log('========================================')
    
    const resolvedParams = await params
    console.log('1️⃣ Params resolved:', JSON.stringify(resolvedParams))
    
    const { id } = resolvedParams
    console.log('2️⃣ ID extracted:', id)
    
    const bookId = parseInt(id)
    console.log('3️⃣ Parsed book ID:', bookId, 'isNaN:', isNaN(bookId))

    if (isNaN(bookId)) {
      console.log('❌ Invalid book ID - not a number')
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    console.log('4️⃣ Starting database query for book', bookId)
    
    // Fetch book with author and category - simplified selection
    const bookResults = await db
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
          createdAt: books.createdAt,
        },
        author: authors,
        category: categories,
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, bookId))
      .limit(1)

    console.log('5️⃣ Query executed. Results:', bookResults.length, 'rows')
    
    const book = bookResults[0]

    if (!book) {
      console.log('❌ Book not found in database for ID:', bookId)
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    console.log('✅ Book found:', book.book.title)
    console.log('6️⃣ Fetching book copies...')
    
    // Get all copies of this book
    const copies = await db
      .select()
      .from(bookCopies)
      .where(eq(bookCopies.bookId, bookId))

    console.log('7️⃣ Found', copies.length, 'copies')
    
    const response = {
      ...book,
      copies,
    }
    
    const duration = Date.now() - startTime
    console.log('✅ SUCCESS - Request completed in', duration, 'ms')
    console.log('========================================\n')

    return NextResponse.json(response)
    
  } catch (error) {
    const duration = Date.now() - startTime
    console.log('\n========================================')
    console.log('❌ BOOK DETAIL API ERROR')
    console.log('========================================')
    console.log('Error type:', error?.constructor?.name)
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.log('Duration before error:', duration, 'ms')
    console.log('========================================\n')
    
    return NextResponse.json({ 
      error: 'Failed to fetch book',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
