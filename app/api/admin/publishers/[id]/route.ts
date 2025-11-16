import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { publishers, books } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { canAccessAdmin } from '@/lib/auth/roles'
import { publisherSchema } from '@/lib/validations/category'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || !canAccessAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const publisherId = parseInt(params.id)

    const [publisher] = await db
      .select()
      .from(publishers)
      .where(eq(publishers.id, publisherId))

    if (!publisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    // Get book count for this publisher
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.publisherId, publisherId))

    return NextResponse.json({
      ...publisher,
      bookCount: bookCount.count,
    })
  } catch (error) {
    console.error('Error fetching publisher:', error)
    return NextResponse.json({ error: 'Failed to fetch publisher' }, { status: 500 })
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

    const publisherId = parseInt(params.id)
    const body = await req.json()
    const validatedData = publisherSchema.parse(body)

    const [updatedPublisher] = await db
      .update(publishers)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        website: validatedData.website || null,
        contactEmail: validatedData.contactEmail || null,
      })
      .where(eq(publishers.id, publisherId))
      .returning()

    if (!updatedPublisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    return NextResponse.json(updatedPublisher)
  } catch (error: any) {
    console.error('Error updating publisher:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Publisher with this name already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update publisher' }, { status: 500 })
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

    const publisherId = parseInt(params.id)

    // Check if publisher has books
    const [bookCount] = await db
      .select({ count: count() })
      .from(books)
      .where(eq(books.publisherId, publisherId))

    if (bookCount.count > 0) {
      return NextResponse.json(
        { error: `Cannot delete publisher with ${bookCount.count} associated books` },
        { status: 400 }
      )
    }

    const [deletedPublisher] = await db
      .delete(publishers)
      .where(eq(publishers.id, publisherId))
      .returning()

    if (!deletedPublisher) {
      return NextResponse.json({ error: 'Publisher not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Publisher deleted successfully' })
  } catch (error) {
    console.error('Error deleting publisher:', error)
    return NextResponse.json({ error: 'Failed to delete publisher' }, { status: 500 })
  }
}
