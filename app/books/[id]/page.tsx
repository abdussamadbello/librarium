'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, User, Tag, Building, ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { StarRating } from '@/components/ui/star-rating'
import { RatingStats } from '@/components/reviews/rating-stats'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { ReviewForm } from '@/components/reviews/review-form'

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
    dueDate?: Date | string | null
  }>
}

interface RatingStats {
  averageRating: number
  totalReviews: number
  verifiedReviews: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

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

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    if (!params.id) return
    fetchBookData()
  }, [params.id])

  const fetchBookData = async () => {
    try {
      console.log('Fetching book with ID:', params.id)
      
      // Fetch book details
      const bookRes = await fetch(`/api/books/${params.id}`)
      console.log('Book response status:', bookRes.status)
      
      if (!bookRes.ok) {
        const errorData = await bookRes.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.error || 'Book not found')
      }
      const bookData = await bookRes.json()
      console.log('Book data received:', bookData)
      setBookData(bookData)

      // Fetch rating stats
      const statsRes = await fetch(`/api/books/${params.id}/reviews/stats`)
      if (statsRes.ok) {
        const stats = await statsRes.json()
        setRatingStats(stats)
      }

      // Fetch reviews
      const reviewsRes = await fetch(`/api/books/${params.id}/reviews?limit=10`)
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json()
        setReviews(reviewsData.reviews || [])
        
        // Check if current user has reviewed
        if (session?.user?.id) {
          const userReviewData = reviewsData.reviews?.find(
            (r: Review) => r.user?.id === session.user.id
          )
          setUserReview(userReviewData || null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch book data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewChange = () => {
    fetchBookData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Guest Header */}
        {!session && (
          <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/discover" className="flex items-center space-x-3 group">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold text-foreground">Librarium</span>
                    <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono hidden sm:inline-flex">
                      Public Collection
                    </Badge>
                  </div>
                </Link>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Join Library
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}
        
        <div className={`${!session ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''} text-center py-20`}>
          <div className="inline-flex p-6 rounded-full bg-primary/10 mb-4">
            <BookOpen className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-mono">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-background">
        {/* Guest Header */}
        {!session && (
          <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/discover" className="flex items-center space-x-3 group">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold text-foreground">Librarium</span>
                    <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono hidden sm:inline-flex">
                      Public Collection
                    </Badge>
                  </div>
                </Link>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Join Library
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`${!session ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''} text-center py-20`}>
          <div className="inline-flex p-6 rounded-full bg-muted/50 mb-4">
            <BookOpen className="w-16 h-16 text-muted-foreground/40" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Book Not Found</h2>
          <p className="text-muted-foreground mb-6 font-sans">The book you're looking for doesn't exist.</p>
          <Link href={session ? "/member/discover" : "/discover"}>
            <Button className="bg-primary hover:bg-primary/90 font-sans">Browse Books</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { book, author, category, copies } = bookData
  const isAvailable = book.availableCopies > 0
  const backUrl = session ? "/member/discover" : "/discover"

  const descriptionLimit = 200
  const shouldTruncate = book.description && book.description.length > descriptionLimit
  const displayDescription = shouldTruncate && !showFullDescription && book.description
    ? book.description.slice(0, descriptionLimit) + '...'
    : book.description

  const content = (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href={backUrl}
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
            {category && <Badge variant="outline" className="border-primary/20 text-primary font-sans">Young Adult</Badge>}
            {category && <Badge variant="outline" className="border-primary/20 text-primary font-sans">Series #1</Badge>}
          </div>

          {/* Publication Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Published:</span>
              <span className="font-medium">{book.publicationYear || 'N/A'}</span>
              <span className="text-muted-foreground">• seconday Publishing</span>
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
                  Not due date: {copies.find(c => c.dueDate)?.dueDate ? new Date(copies.find(c => c.dueDate)!.dueDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
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
              <Button className="bg-destructive hover:bg-destructive/90 text-white font-sans px-6">
                Borrow
              </Button>
            )}
            <Button variant="outline" className="font-sans">
              Add to reading list
            </Button>
          </div>
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
                    <td className="py-3 px-4 font-sans">{copy.condition || 'Good'}</td>
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
                      {copy.dueDate 
                        ? new Date(copy.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'
                      }
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
          {ratingStats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RatingStats {...ratingStats} />
              </div>
              
              {/* Write Review Form (for authenticated users without review) */}
              <div className="lg:col-span-2">
                {session && !userReview ? (
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
                ) : !session ? (
                  <div className="bg-muted/30 border border-border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      <Link href="/login" className="underline font-semibold text-primary hover:text-primary/80">Sign in</Link>
                      {' '}to write a review
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="border-t pt-6">
            <ReviewsList
              reviews={reviews}
              currentUserId={session?.user?.id}
              onReviewChange={handleReviewChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Call to Action for Guests */}
      {!session && (
        <Card className="shadow-soft border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5" />
          <div className="relative z-10 p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
                Want to Borrow This Book?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 font-sans max-w-xl mx-auto">
                Join our library to borrow books, manage your reading history, and get personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 font-sans"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all font-sans"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  // Always show guest layout for public book pages
  return (
    <div className="min-h-screen bg-background">
      {/* Guest Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/discover" className="flex items-center space-x-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold text-foreground">Librarium</span>
                <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono hidden sm:inline-flex">
                  Public Collection
                </Badge>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <Link
                  href="/member/dashboard"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-sans font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Join Library
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {content}
      </main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground font-mono">
                &copy; 2025 Librarium. Curated with care.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans">
                Home
              </Link>
              <Link href="/discover" className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans">
                Discover
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
