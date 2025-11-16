import { NextRequest, NextResponse } from 'next/server'
import { getSimilarBooks } from '@/lib/services/recommendations'

/**
 * GET /api/books/[id]/similar - Get similar books for "You might also like"
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const bookId = parseInt(params.id)

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    const similarBooks = await getSimilarBooks(bookId, limit)

    return NextResponse.json({ similarBooks })
  } catch (error) {
    console.error('Error fetching similar books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch similar books' },
      { status: 500 }
    )
  }
}
