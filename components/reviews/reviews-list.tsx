'use client'

import { useState } from 'react'
import { StarRating } from '@/components/ui/star-rating'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ReviewForm } from './review-form'

interface Review {
  review: {
    id: number
    rating: number
    reviewText: string | null
    isVerifiedBorrower: boolean
    createdAt: Date | string
    updatedAt: Date | string
  }
  user: {
    id: string
    name: string | null
    image: string | null
  } | null
}

interface ReviewsListProps {
  reviews: Review[]
  currentUserId?: string
  onReviewChange: () => void
}

export function ReviewsList({ reviews, currentUserId, onReviewChange }: ReviewsListProps) {
  const { toast } = useToast()
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null)

  const handleDelete = async (reviewId: number) => {
    setDeletingReviewId(reviewId)

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete review')
      }

      toast({
        title: 'Review deleted',
        description: 'Your review has been deleted successfully',
      })

      onReviewChange()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete review',
        variant: 'destructive',
      })
    } finally {
      setDeletingReviewId(null)
    }
  }

  const formatDate = (dateString: Date | string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No reviews yet. Be the first to review this book!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map(({ review, user }) => {
        const isOwnReview = currentUserId === user?.id
        const isEditing = editingReviewId === review.id

        if (isEditing && isOwnReview) {
          return (
            <div
              key={review.id}
              className="border border-slate-200 rounded-lg p-6 bg-slate-50 shadow-soft"
            >
              <h4 className="font-serif text-lg font-semibold mb-4">Edit Your Review</h4>
              <ReviewForm
                bookId={0}
                existingReview={{
                  id: review.id,
                  rating: review.rating,
                  reviewText: review.reviewText,
                }}
                onSuccess={() => {
                  setEditingReviewId(null)
                  onReviewChange()
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingReviewId(null)}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          )
        }

        return (
          <div
            key={review.id}
            className="border border-slate-200 rounded-lg p-6 bg-white shadow-soft hover:shadow-lift transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{user?.name || 'Anonymous'}</p>
                    {review.isVerifiedBorrower && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs border-green-600 text-green-700 bg-green-50"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Verified Borrower
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {/* Actions for own review */}
              {isOwnReview && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingReviewId(review.id)}
                    disabled={deletingReviewId === review.id}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingReviewId === review.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-3">
              <StarRating rating={review.rating} size="md" showNumber={false} />
            </div>

            {/* Review Text */}
            {review.reviewText && (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {review.reviewText}
              </p>
            )}

            {/* Updated indicator */}
            {review.updatedAt !== review.createdAt && (
              <p className="text-xs text-slate-400 mt-3">
                Edited {formatDate(review.updatedAt)}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
