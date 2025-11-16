import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updateReview, deleteReview } from '@/lib/services/reviews'
import { updateReviewSchema } from '@/lib/validations/review'

/**
 * PUT /api/reviews/[id]
 * Update a review
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const reviewId = parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 })
    }

    const body = await req.json()

    // Validate input
    const validation = updateReviewSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      )
    }

    // Update review
    const review = await updateReview({
      reviewId,
      userId: session.user.id,
      ...validation.data,
    })

    return NextResponse.json({
      success: true,
      review,
      message: 'Review updated successfully',
    })
  } catch (error) {
    console.error('Update review error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reviews/[id]
 * Delete a review
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const reviewId = parseInt(id)

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 })
    }

    // Delete review
    await deleteReview({
      reviewId,
      userId: session.user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    })
  } catch (error) {
    console.error('Delete review error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
