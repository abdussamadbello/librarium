import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getListsContainingBook } from '@/lib/services/reading-lists'

/**
 * GET /api/reading-lists/check?bookId=123 - Check which lists contain a book
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    if (!bookId || isNaN(parseInt(bookId))) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      )
    }

    const lists = await getListsContainingBook(session.user.id, parseInt(bookId))

    return NextResponse.json({ lists })
  } catch (error) {
    console.error('Error checking book lists:', error)
    return NextResponse.json(
      { error: 'Failed to check book lists' },
      { status: 500 }
    )
  }
}
