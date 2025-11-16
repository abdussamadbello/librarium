import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createReview, getBookReviews, getUserReviewForBook } from '@/lib/services/reviews'
import { createReviewSchema, listReviewsSchema } from '@/lib/validations/review'

/**
 * GET /api/books/[id]/reviews
 * Get all reviews for a book
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

    const { searchParams } = new URL(req.url)
    const sortBy = searchParams.get('sortBy') || 'recent'
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 20

    // Validate query params
    const validation = listReviewsSchema.safeParse({ sortBy, page, limit })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Get user's review if authenticated
    const session = await auth()
    let userReview = null
    if (session?.user?.id) {
      userReview = await getUserReviewForBook(session.user.id, bookId)
    }

    const result = await getBookReviews(bookId, validation.data)

    return NextResponse.json({
      ...result,
      userReview,
    })
  } catch (error) {
    console.error('Get book reviews error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch book reviews' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/books/[id]/reviews
 * Create a review for a book
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookId = parseInt(id)

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 })
    }

    const body = await req.json()

    // Validate input
    const validation = createReviewSchema.safeParse({ ...body, bookId })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Create review
    const review = await createReview({
      userId: session.user.id,
      ...validation.data,
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review submitted successfully',
    })
  } catch (error) {
    console.error('Create review error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
