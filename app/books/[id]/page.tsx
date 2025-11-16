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

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBook()
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
          <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 rounded-2xl shadow-soft flex items-center justify-center p-8 relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            
            <div className="text-center relative z-10">
              <div className="p-6 rounded-2xl bg-primary/10 backdrop-blur-sm inline-block mb-4">
                <BookOpen className="w-20 h-20 text-primary" />
              </div>
              <p className="text-sm text-foreground/80 font-serif font-medium px-4 line-clamp-3">{book.title}</p>
            </div>
          </div>
        </div>

        {/* Book Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-5xl font-serif font-bold text-foreground mb-3 leading-tight">{book.title}</h1>
            {author && (
              <p className="text-2xl text-muted-foreground font-serif">by {author.name}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {category && <Badge variant="outline" className="border-primary/20 text-primary font-mono">{category.name}</Badge>}
            {isAvailable ? (
              <Badge className="bg-chart-5 hover:bg-chart-5 font-mono">
                {book.availableCopies} Available
              </Badge>
            ) : (
              <Badge variant="destructive" className="font-mono">Out of Stock</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">Publisher</p>
                <p className="font-semibold font-sans">{book.publisher}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">Year</p>
                <p className="font-semibold font-sans">{book.publicationYear || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">ISBN</p>
                <p className="font-semibold font-sans">{book.isbn || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-mono">Copies</p>
                <p className="font-semibold font-sans">
                  {book.availableCopies}/{book.totalCopies}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {isAvailable ? (
              <div className="bg-chart-5/10 border border-chart-5/30 rounded-xl p-6">
                <p className="text-sm text-foreground font-sans">
                  <strong className="font-semibold">This book is available!</strong> 
                  {!session ? (
                    <> <Link href="/login" className="underline font-semibold text-primary hover:text-primary/80">Sign in</Link> or <Link href="/register" className="underline font-semibold text-primary hover:text-primary/80">join the library</Link> to borrow it.</>
                  ) : (
                    <> Visit the library to borrow it, or contact a librarian for assistance.</>
                  )}
                </p>
              </div>
            ) : (
              <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
                <p className="text-sm text-foreground font-sans">
                  All copies are currently borrowed. 
                  {!session ? (
                    <> <Link href="/login" className="underline font-semibold text-primary hover:text-primary/80">Sign in</Link> to check back later or ask a librarian about reserving a copy.</>
                  ) : (
                    <> Check back later or ask a librarian about reserving a copy.</>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-foreground">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed font-sans">{book.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Author Bio */}
      {author?.biography && (
        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-foreground">About the Author</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-xl font-serif text-foreground mb-2">{author.name}</h3>
                <p className="text-muted-foreground leading-relaxed font-sans">{author.biography}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copy Details */}
      <Card className="shadow-soft border-0">
        <CardHeader>
          <CardTitle className="font-serif text-2xl text-foreground">Copy Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {copies.map((copy) => (
              <div
                key={copy.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl transition-all hover:shadow-soft"
              >
                <div>
                  <span className="text-sm font-semibold font-sans">
                    Copy #{copy.copyNumber || copy.id}
                  </span>
                  {copy.condition && (
                    <span className="text-xs text-muted-foreground ml-2 font-mono">
                      ({copy.condition})
                    </span>
                  )}
                </div>
                <Badge
                  variant={copy.status === 'available' ? 'default' : 'secondary'}
                  className={copy.status === 'available' ? 'bg-chart-5 hover:bg-chart-5 font-mono' : 'font-mono'}
                >
                  {copy.status}
                </Badge>
              </div>
            ))}
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
