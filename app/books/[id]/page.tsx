'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, User, Tag, Building, ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

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
      <div className="min-h-screen bg-neutral-50">
        {/* Guest Header */}
        {!session && (
          <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/discover" className="flex items-center space-x-2">
                  <BookOpen className="w-8 h-8 text-primary-teal" />
                  <span className="text-xl font-bold text-zinc-900">Librarium</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-neutral-600 hover:text-primary-teal"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary-teal text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    Join Library
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}
        
        <div className={`${!session ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''} text-center py-20`}>
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (!bookData) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Guest Header */}
        {!session && (
          <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/discover" className="flex items-center space-x-2">
                  <BookOpen className="w-8 h-8 text-primary-teal" />
                  <span className="text-xl font-bold text-zinc-900">Librarium</span>
                </Link>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-neutral-600 hover:text-primary-teal"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary-teal text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                  >
                    Join Library
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`${!session ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''} text-center py-20`}>
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Book Not Found</h2>
          <p className="text-slate-600 mb-6">The book you&apos;re looking for doesn&apos;t exist.</p>
          <Link href={session ? "/member/discover" : "/discover"}>
            <Button className="bg-teal-600 hover:bg-teal-700">Browse Books</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { book, author, category, copies } = bookData
  const isAvailable = book.availableCopies > 0
  const backUrl = session ? "/member/discover" : "/discover"

  const content = (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={backUrl}
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

          <div className="pt-4">
            {isAvailable ? (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800 mb-2">
                  <strong>This book is available!</strong> 
                  {!session ? (
                    <> <Link href="/login" className="underline font-semibold">Sign in</Link> or <Link href="/register" className="underline font-semibold">join the library</Link> to borrow it.</>
                  ) : (
                    <> Visit the library to borrow it, or contact a librarian for assistance.</>
                  )}
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  All copies are currently borrowed. 
                  {!session ? (
                    <> <Link href="/login" className="underline font-semibold">Sign in</Link> to check back later or ask a librarian about reserving a copy.</>
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

      {/* Call to Action for Guests */}
      {!session && (
        <Card className="p-8 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">
              Want to Borrow This Book?
            </h2>
            <p className="text-neutral-600 mb-6">
              Join our library to borrow books, manage your reading history, and get personalized recommendations.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 bg-primary-teal text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 border border-primary-teal text-primary-teal rounded-lg font-medium hover:bg-teal-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  )

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Guest Header */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/discover" className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-primary-teal" />
                <span className="text-xl font-bold text-zinc-900">Librarium</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-primary-teal"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-teal text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Join Library
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {content}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-sm text-neutral-600">
              <p>&copy; 2025 Librarium. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return content
}
