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
    bio: string | null
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
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    if (!params.id) return
    
    fetchBook()
    fetchAvailability()
    fetchReviews()
    fetchRatingStats()
  }, [params.id])

  const fetchBook = async () => {
    try {
      console.log('Fetching book with ID:', params.id)
      const res = await fetch(`/api/books/${params.id}`)
      console.log('Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Book not found')
      }
      const data = await res.json()
      console.log('Book data received:', data)
      setBookData(data)
    } catch (error) {
      console.error('Failed to fetch book:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load book',
        variant: 'destructive',
      })
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
        <p className="text-slate-600 mb-2">The book you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <p className="text-sm text-slate-500 mb-6">Book ID: {params.id}</p>
        <Link href="/member/discover">
          <Button className="bg-teal-600 hover:bg-teal-700">Browse Books</Button>
        </Link>
      </div>
    )
  }

  const { book, author, category, copies } = bookData
  const isAvailable = book.availableCopies > 0
  const descriptionLimit = 200
  const shouldTruncate = book.description && book.description.length > descriptionLimit
  const displayDescription = shouldTruncate && !showFullDescription && book.description
    ? book.description.slice(0, descriptionLimit) + '...'
    : book.description

  return (
    <div className="container max-w-7xl mx-auto space-y-8 py-6">
      {/* Back Button */}
      <Link
        href="/member/discover"
        className="inline-flex items-center text-sm text-primary hover:text-primary/80 font-sans font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Discover
      </Link>

      {/* Book Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="md:col-span-1">
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-2xl shadow-lg flex items-center justify-center p-8 relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            
            <div className="text-center relative z-10">
              <p className="text-white text-xl font-serif font-bold px-6 leading-tight">{book.title}</p>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2 leading-tight">{book.title}</h1>
            {author && (
              <p className="text-xl text-muted-foreground font-sans mb-3">by {author.name}</p>
            )}
            
            {/* Rating Display */}
            {ratingStats && ratingStats.totalReviews > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={ratingStats.averageRating} size="md" />
                <span className="text-lg font-semibold text-foreground">
                  {ratingStats.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'rating' : 'ratings'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {category && <Badge variant="outline" className="border-primary/20 text-primary font-sans">Fantasy</Badge>}
            <Badge variant="outline" className="border-primary/20 text-primary font-sans">Young Adult</Badge>
            <Badge variant="outline" className="border-primary/20 text-primary font-sans">Series #1</Badge>
          </div>

          {/* Publication Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Published:</span>
              <span className="font-medium">{book.publicationYear || 'N/A'}</span>
              <span className="text-muted-foreground">• {book.publisher}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ISBN 10:</span>
              <span className="font-medium">{book.isbn || 'N/A'}</span>
            </div>
          </div>

          {/* Availability Status */}
          <div>
            {isAvailable ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-sans px-3 py-1">
                  Available
                </Badge>
                <span className="text-sm text-muted-foreground">
                  - {book.availableCopies} of {book.totalCopies} copies in library
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="font-sans px-3 py-1">
                  Borrowed
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Not due date: {copies.find(c => c.status === 'borrowed') ? 'N/A' : 'N/A'}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {isAvailable ? (
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-sans px-6">
                Borrow this book
              </Button>
            ) : (
              <>
                {!availability?.userReservation && (
                  <Button 
                    onClick={handleReserve}
                    disabled={actionLoading}
                    className="bg-destructive hover:bg-destructive/90 text-white font-sans px-6"
                  >
                    {actionLoading ? 'Reserving...' : 'Borrow'}
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" className="font-sans">
              Add to reading list
            </Button>
          </div>

          {/* Queue/Reservation Info */}
          {availability?.userReservation && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
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
        </div>
      </div>

      {/* Description */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed font-sans whitespace-pre-line">
            {displayDescription || 'No description available.'}
          </p>
          {shouldTruncate && (
            <Button
              variant="link"
              className="mt-2 p-0 h-auto font-sans text-primary"
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Read less' : 'Read more'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Copies Section */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground">Copies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-sans">
              ● Available
            </Badge>
            <Badge variant="destructive" className="font-sans">
              ● Borrowed
            </Badge>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-sans font-semibold text-sm">COPY</th>
                  <th className="text-left py-3 px-4 font-sans font-semibold text-sm">CONDITION</th>
                  <th className="text-left py-3 px-4 font-sans font-semibold text-sm">STATUS</th>
                  <th className="text-left py-3 px-4 font-sans font-semibold text-sm">DUE DATE</th>
                  <th className="text-right py-3 px-4 font-sans font-semibold text-sm"></th>
                </tr>
              </thead>
              <tbody>
                {copies.map((copy, index) => (
                  <tr key={copy.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="py-3 px-4 font-sans">#{copy.copyNumber || copy.id}</td>
                    <td className="py-3 px-4 font-sans capitalize">{copy.condition || 'Good'}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        className={copy.status === 'available' 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-sans' 
                          : 'bg-destructive hover:bg-destructive/90 font-sans'
                        }
                      >
                        {copy.status === 'available' ? 'Available' : 'Borrowed'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-sans text-sm">
                      —
                    </td>
                    <td className="py-3 px-4 text-right">
                      {copy.status === 'available' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-sans"
                        >
                          Borrow
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reviews & Ratings Section */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground">Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Stats */}
          {ratingStats ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RatingStats {...ratingStats} />
              </div>
              
              {/* Write Review Form (for authenticated users without review) */}
              <div className="lg:col-span-2">
                {!userReview ? (
                  <div className="bg-muted/30 border border-border rounded-lg p-6">
                    <h3 className="font-serif text-xl font-semibold mb-4">Write a review</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your thoughts about this book
                    </p>
                    <ReviewForm
                      bookId={book.id}
                      onSuccess={handleReviewChange}
                    />
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">
                      You have already reviewed this book
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No ratings yet. Be the first to review!</p>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="border-t pt-6">
              <ReviewsList
                reviews={reviews}
                currentUserId={session?.user?.id}
                onReviewChange={handleReviewChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
