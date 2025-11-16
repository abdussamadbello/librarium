import { NextResponse } from 'next/server'
import { getBookAvailability } from '@/lib/services/reservations'

/**
 * GET /api/books/[id]/availability
 * Check book availability and queue status
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookId = parseInt(params.id)

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    const availability = await getBookAvailability(bookId)

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Get book availability error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to check book availability' },
      { status: 500 }
    )
  }
}
