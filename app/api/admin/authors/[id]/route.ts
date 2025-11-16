import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { authors, books } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { authorSchema } from '@/lib/validations/category'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authorId = parseInt(params.id)

    const [author] = await db
      .select()
      .from(authors)
      .where(eq(authors.id, authorId))

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    // Get book count for this author
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.authorId, authorId))

    return NextResponse.json({
      ...author,
      bookCount: bookCount.count,
    })
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authorId = parseInt(params.id)
    const body = await req.json()
    const validatedData = authorSchema.parse(body)

    const [updatedAuthor] = await db
      .update(authors)
      .set({
        name: validatedData.name,
        bio: validatedData.bio,
        imageUrl: validatedData.imageUrl,
      })
      .where(eq(authors.id, authorId))
      .returning()

    if (!updatedAuthor) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json(updatedAuthor)
  } catch (error: any) {
    console.error('Error updating author:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authorId = parseInt(params.id)

    // Check if author has books
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.authorId, authorId))

    if (bookCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete author with ${bookCount.count} associated books` },
        { status: 400 }
      )
    }

    const [deletedAuthor] = await db
      .delete(authors)
      .where(eq(authors.id, authorId))
      .returning()

    if (!deletedAuthor) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Author deleted successfully' })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 })
  }
}
