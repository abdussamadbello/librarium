import { z } from 'zod'

export const createReviewSchema = z.object({
  bookId: z.number().positive('Book is required'),
  rating: z.number().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars'),
  reviewText: z.string().max(2000, 'Review text cannot exceed 2000 characters').optional(),
})

export const updateReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1 star').max(5, 'Rating cannot exceed 5 stars').optional(),
  reviewText: z.string().max(2000, 'Review text cannot exceed 2000 characters').optional(),
}).refine(data => data.rating !== undefined || data.reviewText !== undefined, {
  message: 'At least one field (rating or reviewText) must be provided',
})

export const listReviewsSchema = z.object({
  page: z.number().positive().optional().default(1),
  limit: z.number().positive().max(100).optional().default(20),
  sortBy: z.enum(['recent', 'rating-high', 'rating-low', 'verified']).optional().default('recent'),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ListReviewsInput = z.infer<typeof listReviewsSchema>
