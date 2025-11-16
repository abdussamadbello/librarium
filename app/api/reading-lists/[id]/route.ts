import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import {
  getReadingListWithBooks,
  updateReadingList,
  deleteReadingList,
  addBookToList,
  removeBookFromList,
} from '@/lib/services/reading-lists'
import { z } from 'zod'

const updateListSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
})

const bookActionSchema = z.object({
  bookId: z.number().positive(),
  action: z.enum(['add', 'remove']),
})

/**
 * GET /api/reading-lists/[id] - Get a reading list with its books
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await props.params
    const listId = parseInt(params.id)

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      )
    }

    const listWithBooks = await getReadingListWithBooks(listId, session.user.id)

    return NextResponse.json(listWithBooks)
  } catch (error) {
    console.error('Error fetching reading list:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch reading list' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/reading-lists/[id] - Update a reading list
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await props.params
    const listId = parseInt(params.id)

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = updateListSchema.parse(body)

    const list = await updateReadingList({
      listId,
      userId: session.user.id,
      ...validatedData,
    })

    return NextResponse.json({
      success: true,
      list,
      message: 'Reading list updated successfully',
    })
  } catch (error) {
    console.error('Error updating reading list:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update reading list' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reading-lists/[id] - Delete a reading list
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await props.params
    const listId = parseInt(params.id)

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      )
    }

    await deleteReadingList(listId, session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Reading list deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting reading list:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete reading list' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reading-lists/[id] - Add or remove book from list
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await props.params
    const listId = parseInt(params.id)

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { bookId, action } = bookActionSchema.parse(body)

    if (action === 'add') {
      await addBookToList({
        listId,
        bookId,
        userId: session.user.id,
      })

      return NextResponse.json({
        success: true,
        message: 'Book added to list',
      })
    } else {
      await removeBookFromList({
        listId,
        bookId,
        userId: session.user.id,
      })

      return NextResponse.json({
        success: true,
        message: 'Book removed from list',
      })
    }
  } catch (error) {
    console.error('Error managing book in list:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }
      if (error.message === 'Book already in this list') {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to manage book in list' },
      { status: 500 }
    )
  }
}
