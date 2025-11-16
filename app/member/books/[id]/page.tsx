'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, User, Tag, Building, ArrowLeft, Bell, Clock, Star } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { ReviewForm } from '@/components/reviews/review-form'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { RatingStats } from '@/components/reviews/rating-stats'
import { StarRating } from '@/components/ui/star-rating'

interface BookData {
  book: {
    id: number
    title: string
    isbn: string | null
    publisher: string
    publicationYear: number | null
    description: string | null
    totalCopies: number
    availableCopies: number
    createdAt: Date
  }
  author: {
    id: number
    name: string
    biography: string | null
  } | null
  category: {
    id: number
    name: string
    description: string | null
  } | null
  copies: Array<{
    id: number
    copyNumber: number | null
    status: string
    condition: string | null
  }>
}

interface AvailabilityData {
  availableCopies: number
  totalCopies: number
  queueLength: number
  userReservation: {
    id: number
    queuePosition: number
    status: string
    reservedAt: string
  } | null
}

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [ratingStats, setRatingStats] = useState<any>(null)
  const [userReview, setUserReview] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  useEffect(() => {
    fetchBook()
    fetchAvailability()
    fetchReviews()
    fetchRatingStats()
  }, [params.id])

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}`)
      if (!res.ok) {
        throw new Error('Book not found')
      }
      const data = await res.json()
      setBookData(data)
    } catch (error) {
      console.error('Failed to fetch book:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}/availability`)
      if (res.ok) {
        const data = await res.json()
        setAvailability(data)
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
    }
  }

  const handleReserve = async () => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: Number(params.id) }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create reservation')
      }

      const result = await res.json()
      toast({
        title: 'Reservation created',
        description: result.message || 'You have been added to the queue.',
      })

      // Refresh availability
      await fetchAvailability()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create reservation',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelReservation = async () => {
    if (!availability?.userReservation) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/reservations/${availability.userReservation.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to cancel reservation')
      }

      const result = await res.json()
      toast({
        title: 'Reservation cancelled',
        description: result.message || 'Your reservation has been cancelled.',
      })

      // Refresh availability
      await fetchAvailability()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel reservation',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/books/${params.id}/reviews?sortBy=recent&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setUserReview(data.userReview || null)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchRatingStats = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}/reviews/stats`)
      if (res.ok) {
        const data = await res.json()
        setRatingStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch rating stats:', error)
    }
  }

  const handleReviewChange = () => {
    fetchReviews()
    fetchRatingStats()
    setShowReviewForm(false)
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading book details...</p>
      </div>
    )
  }

  if (!bookData) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Book Not Found</h2>
        <p className="text-slate-600 mb-6">The book you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/member/discover">
          <Button className="bg-teal-600 hover:bg-teal-700">Browse Books</Button>
        </Link>
      </div>
    )
  }

  const { book, author, category, copies } = bookData
  const isAvailable = book.availableCopies > 0

  return (
    <div className="container max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/member/discover"
        className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Discover
      </Link>

      {/* Book Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg shadow-lg flex items-center justify-center p-8">
            <div className="text-center">
              <BookOpen className="w-24 h-24 text-teal-600 mx-auto mb-4" />
              <p className="text-sm text-teal-700 font-medium">{book.title}</p>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{book.title}</h1>
            {author && (
              <p className="text-xl text-slate-600">by {author.name}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {category && <Badge variant="outline">{category.name}</Badge>}
            {isAvailable ? (
              <Badge className="bg-green-600">
                {book.availableCopies} Available
              </Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-2">
              <Building className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Publisher</p>
                <p className="font-medium">{book.publisher}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Year</p>
                <p className="font-medium">{book.publicationYear || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">ISBN</p>
                <p className="font-medium">{book.isbn || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Copies</p>
                <p className="font-medium">
                  {book.availableCopies}/{book.totalCopies}
                </p>
              </div>
            </div>
          </div>

          {/* Availability & Reservation Actions */}
          <div className="pt-4 space-y-4">
            {/* Queue Information */}
            {availability && availability.queueLength > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {availability.queueLength} {availability.queueLength === 1 ? 'person' : 'people'} in queue
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      There is currently a waitlist for this book
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* User's Active Reservation */}
            {availability?.userReservation && (
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">
                        You have an active reservation
                      </p>
                      <p className="text-xs text-primary/70 mt-1">
                        Queue position: #{availability.userReservation.queuePosition}
                      </p>
                      {availability.userReservation.status === 'fulfilled' && (
                        <p className="text-xs text-primary font-medium mt-2">
                          Book is ready for pickup! Please visit the library within 48 hours.
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReservation}
                    disabled={actionLoading}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Action Button */}
            {!availability?.userReservation && (
              <>
                {isAvailable ? (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-lg p-6 shadow-soft">
                    <div className="flex items-start gap-3 mb-4">
                      <BookOpen className="w-6 h-6 text-teal-600 mt-0.5" />
                      <div>
                        <p className="font-serif text-lg font-semibold text-teal-900 mb-1">
                          This book is available!
                        </p>
                        <p className="text-sm text-teal-700">
                          Visit the library to borrow it, or contact a librarian for assistance.
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Visit Library to Borrow
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-lg p-6 shadow-soft">
                    <div className="flex items-start gap-3 mb-4">
                      <Bell className="w-6 h-6 text-slate-600 mt-0.5" />
                      <div>
                        <p className="font-serif text-lg font-semibold text-slate-900 mb-1">
                          All copies are currently borrowed
                        </p>
                        <p className="text-sm text-slate-600">
                          Reserve this book and we&apos;ll notify you when it becomes available.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleReserve}
                      disabled={actionLoading}
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {actionLoading ? 'Reserving...' : 'Reserve This Book'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{book.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Author Bio */}
      {author?.biography && (
        <Card>
          <CardHeader>
            <CardTitle>About the Author</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-1">{author.name}</h3>
                <p className="text-slate-700 leading-relaxed">{author.biography}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copy Details */}
      <Card>
        <CardHeader>
          <CardTitle>Copy Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {copies.map((copy) => (
              <div
                key={copy.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <span className="text-sm font-medium">
                    Copy #{copy.copyNumber || copy.id}
                  </span>
                  {copy.condition && (
                    <span className="text-xs text-slate-500 ml-2">
                      ({copy.condition})
                    </span>
                  )}
                </div>
                <Badge
                  variant={copy.status === 'available' ? 'default' : 'secondary'}
                  className={copy.status === 'available' ? 'bg-green-600' : ''}
                >
                  {copy.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews & Ratings */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            Reviews & Ratings
          </h2>
          {ratingStats && ratingStats.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={ratingStats.averageRating} size="md" />
              <span className="text-sm text-slate-600">
                {ratingStats.averageRating.toFixed(1)} ({ratingStats.totalReviews})
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rating Statistics */}
          <div className="lg:col-span-1">
            {ratingStats && (
              <RatingStats
                averageRating={ratingStats.averageRating}
                totalReviews={ratingStats.totalReviews}
                verifiedReviews={ratingStats.verifiedReviews}
                ratingDistribution={ratingStats.ratingDistribution}
              />
            )}
          </div>

          {/* Reviews List & Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Write Review Section */}
            {session?.user && (
              <Card className="shadow-soft border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      {userReview ? 'Your Review' : 'Write a Review'}
                    </span>
                    {userReview && !showReviewForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(true)}
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        Edit Review
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!userReview || showReviewForm ? (
                    <ReviewForm
                      bookId={Number(params.id)}
                      existingReview={userReview}
                      onSuccess={handleReviewChange}
                    />
                  ) : (
                    <div className="space-y-3">
                      <StarRating rating={userReview.rating} size="md" />
                      {userReview.reviewText && (
                        <p className="text-slate-700 leading-relaxed">
                          {userReview.reviewText}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Posted on {new Date(userReview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>
                  {reviews.length > 0
                    ? `All Reviews (${reviews.length})`
                    : 'Reviews'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">Loading reviews...</p>
                  </div>
                ) : (
                  <ReviewsList
                    reviews={reviews}
                    currentUserId={session?.user?.id}
                    onReviewChange={handleReviewChange}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
