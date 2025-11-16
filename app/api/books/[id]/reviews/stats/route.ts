import { NextResponse } from 'next/server'
import { getBookRatingStats } from '@/lib/services/reviews'

/**
 * GET /api/books/[id]/reviews/stats
 * Get rating statistics for a book
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const bookId = parseInt(id)

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    const stats = await getBookRatingStats(bookId)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get rating stats error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch rating statistics' },
      { status: 500 }
    )
  }
}
