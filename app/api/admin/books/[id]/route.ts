import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { books, authors, categories, bookCopies, activityLog } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { updateBookSchema } from '@/lib/validations/book'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookId = parseInt(id)

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

    // Get book copies
    const copies = await db
      .select()
      .from(bookCopies)
      .where(eq(bookCopies.bookId, bookId))

    return NextResponse.json({ ...book, copies })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookId = parseInt(id)
    const body = await req.json()
    const validatedData = updateBookSchema.parse(body)

    const [updatedBook] = await db
      .update(books)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId))
      .returning()

    if (!updatedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: session.user.id,
      action: 'update_book',
      entityType: 'book',
      entityId: bookId,
      metadata: { title: updatedBook.title },
    })

    return NextResponse.json(updatedBook)
  } catch (error: any) {
    console.error('Error updating book:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookId = parseInt(id)

    // Check if book has active transactions
    const activeTransactions = await db.execute(
      sql`SELECT COUNT(*)::int as count FROM transactions t
          INNER JOIN book_copies bc ON t.book_copy_id = bc.id
          WHERE bc.book_id = ${bookId} AND t.returned_at IS NULL`
    )

    const toArray = <T>(result: any): T[] => {
      if (Array.isArray(result)) return result
      if ('rows' in result) return result.rows
      return []
    }

    if ((toArray(activeTransactions)[0] as any)?.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete book with active transactions' },
        { status: 400 }
      )
    }

    const [deletedBook] = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning()

    if (!deletedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Log activity
    await db.insert(activityLog).values({
      userId: session.user.id,
      action: 'delete_book',
      entityType: 'book',
      entityId: bookId,
      metadata: { title: deletedBook.title },
    })

    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
