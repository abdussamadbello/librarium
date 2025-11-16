import { db } from '@/lib/db'
import { reviews, books, users, transactions, activityLog, bookCopies } from '@/lib/db/schema'
import { eq, and, desc, asc, isNull, isNotNull, sql } from 'drizzle-orm'
import { CreateReviewInput, UpdateReviewInput } from '@/lib/validations/review'

interface CreateReviewParams extends CreateReviewInput {
  userId: string
}

interface UpdateReviewParams extends UpdateReviewInput {
  reviewId: number
  userId: string
}

interface DeleteReviewParams {
  reviewId: number
  userId: string
}

/**
 * Check if a user has ever borrowed a specific book
 */
export async function hasUserBorrowedBook(userId: string, bookId: number): Promise<boolean> {
  const [transaction] = await db
    .select()
    .from(transactions)
    .leftJoin(bookCopies, eq(transactions.bookCopyId, bookCopies.id))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(bookCopies.bookId, bookId),
        isNotNull(transactions.checkoutDate)
      )
    )
    .limit(1)

  return !!transaction
}

/**
 * Create a new book review
 */
export async function createReview(params: CreateReviewParams) {
  const { userId, bookId, rating, reviewText } = params

  // 1. Check if book exists
  const [book] = await db
    .select()
    .from(books)
    .where(eq(books.id, bookId))
    .limit(1)

  if (!book) {
    throw new Error('Book not found')
  }

  // 2. Check if user already reviewed this book
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
    .limit(1)

  if (existingReview) {
    throw new Error('You have already reviewed this book. You can edit your existing review.')
  }

  // 3. Check if user has borrowed this book (for verified borrower badge)
  const isVerifiedBorrower = await hasUserBorrowedBook(userId, bookId)

  // 4. Create review in a transaction
  const result = await db.transaction(async (tx) => {
    const [newReview] = await tx
      .insert(reviews)
      .values({
        userId,
        bookId,
        rating,
        reviewText: reviewText || null,
        isVerifiedBorrower,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Log activity
    await tx.insert(activityLog).values({
      userId,
      action: 'create_review',
      entityType: 'review',
      entityId: newReview!.id,
      metadata: { bookId, rating, isVerifiedBorrower },
    })

    return newReview!
  })

  return result
}

/**
 * Update an existing review
 */
export async function updateReview(params: UpdateReviewParams) {
  const { reviewId, userId, rating, reviewText } = params

  // 1. Find review and verify ownership
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1)

  if (!review) {
    throw new Error('Review not found')
  }

  if (review.userId !== userId) {
    throw new Error('You can only edit your own reviews')
  }

  // 2. Update review
  const updateData: any = {
    updatedAt: new Date(),
  }

  if (rating !== undefined) {
    updateData.rating = rating
  }

  if (reviewText !== undefined) {
    updateData.reviewText = reviewText || null
  }

  const [updated] = await db
    .update(reviews)
    .set(updateData)
    .where(eq(reviews.id, reviewId))
    .returning()

  // Log activity
  await db.insert(activityLog).values({
    userId,
    action: 'update_review',
    entityType: 'review',
    entityId: reviewId,
    metadata: { bookId: review.bookId, rating, reviewText },
  })

  return updated!
}

/**
 * Delete a review
 */
export async function deleteReview(params: DeleteReviewParams) {
  const { reviewId, userId } = params

  // 1. Find review and verify ownership
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1)

  if (!review) {
    throw new Error('Review not found')
  }

  if (review.userId !== userId) {
    throw new Error('You can only delete your own reviews')
  }

  // 2. Delete review
  const [deleted] = await db
    .delete(reviews)
    .where(eq(reviews.id, reviewId))
    .returning()

  // Log activity
  await db.insert(activityLog).values({
    userId,
    action: 'delete_review',
    entityType: 'review',
    entityId: reviewId,
    metadata: { bookId: review.bookId },
  })

  return deleted!
}

/**
 * Get all reviews for a book with user information
 */
export async function getBookReviews(bookId: number, options?: { sortBy?: string; page?: number; limit?: number }) {
  const { sortBy = 'recent', page = 1, limit = 20 } = options || {}

  let query = db
    .select({
      review: reviews,
      user: {
        id: users.id,
        name: users.name,
        image: users.image,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.bookId, bookId))
    .$dynamic()

  // Apply sorting
  switch (sortBy) {
    case 'rating-high':
      query = query.orderBy(desc(reviews.rating), desc(reviews.createdAt))
      break
    case 'rating-low':
      query = query.orderBy(asc(reviews.rating), desc(reviews.createdAt))
      break
    case 'verified':
      query = query.orderBy(desc(reviews.isVerifiedBorrower), desc(reviews.createdAt))
      break
    case 'recent':
    default:
      query = query.orderBy(desc(reviews.createdAt))
      break
  }

  const allReviews = await query

  // Pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedReviews = allReviews.slice(startIndex, endIndex)

  return {
    reviews: paginatedReviews,
    pagination: {
      page,
      limit,
      total: allReviews.length,
      totalPages: Math.ceil(allReviews.length / limit),
    },
  }
}

/**
 * Get user's review for a specific book
 */
export async function getUserReviewForBook(userId: string, bookId: number) {
  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.bookId, bookId)))
    .limit(1)

  return review || null
}

/**
 * Get book rating statistics
 */
export async function getBookRatingStats(bookId: number) {
  const [stats] = await db
    .select({
      averageRating: sql<number>`ROUND(AVG(${reviews.rating})::numeric, 1)`,
      totalReviews: sql<number>`COUNT(*)`,
      verifiedReviews: sql<number>`SUM(CASE WHEN ${reviews.isVerifiedBorrower} THEN 1 ELSE 0 END)`,
      rating1: sql<number>`SUM(CASE WHEN ${reviews.rating} = 1 THEN 1 ELSE 0 END)`,
      rating2: sql<number>`SUM(CASE WHEN ${reviews.rating} = 2 THEN 1 ELSE 0 END)`,
      rating3: sql<number>`SUM(CASE WHEN ${reviews.rating} = 3 THEN 1 ELSE 0 END)`,
      rating4: sql<number>`SUM(CASE WHEN ${reviews.rating} = 4 THEN 1 ELSE 0 END)`,
      rating5: sql<number>`SUM(CASE WHEN ${reviews.rating} = 5 THEN 1 ELSE 0 END)`,
    })
    .from(reviews)
    .where(eq(reviews.bookId, bookId))

  return {
    averageRating: stats?.averageRating ? Number(stats.averageRating) : 0,
    totalReviews: stats?.totalReviews ? Number(stats.totalReviews) : 0,
    verifiedReviews: stats?.verifiedReviews ? Number(stats.verifiedReviews) : 0,
    ratingDistribution: {
      1: stats?.rating1 ? Number(stats.rating1) : 0,
      2: stats?.rating2 ? Number(stats.rating2) : 0,
      3: stats?.rating3 ? Number(stats.rating3) : 0,
      4: stats?.rating4 ? Number(stats.rating4) : 0,
      5: stats?.rating5 ? Number(stats.rating5) : 0,
    },
  }
}
