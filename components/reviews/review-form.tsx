'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StarRatingInput } from '@/components/ui/star-rating-input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface ReviewFormProps {
  bookId: number
  existingReview?: {
    id: number
    rating: number
    reviewText: string | null
  } | null
  onSuccess: () => void
}

export function ReviewForm({ bookId, existingReview, onSuccess }: ReviewFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating before submitting',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : `/api/books/${bookId}/reviews`

      const method = existingReview ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      const result = await res.json()
      toast({
        title: existingReview ? 'Review updated' : 'Review submitted',
        description: result.message || 'Thank you for your feedback!',
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit review',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Rating *
        </label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          size="lg"
          disabled={submitting}
        />
      </div>

      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-slate-700 mb-2">
          Your Review (Optional)
        </label>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this book..."
          maxLength={2000}
          rows={4}
          disabled={submitting}
          className="resize-none"
        />
        <p className="text-xs text-slate-500 mt-1">
          {reviewText.length}/2000 characters
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
      >
        {submitting
          ? existingReview
            ? 'Updating...'
            : 'Submitting...'
          : existingReview
          ? 'Update Review'
          : 'Submit Review'}
      </Button>
    </form>
  )
}
