'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StarRating } from '@/components/ui/star-rating'
import { Badge } from '@/components/ui/badge'
import { Sparkles, BookOpen } from 'lucide-react'

interface RecommendedBook {
  book: {
    id: number
    title: string
    coverImageUrl: string | null
    availableCopies: number
  }
  author: {
    id: number
    name: string
  } | null
  avgRating: number
  reason: string
}

interface RecommendationsWidgetProps {
  bookId?: number
  title?: string
  limit?: number
}

export function RecommendationsWidget({
  bookId,
  title,
  limit = 6
}: RecommendationsWidgetProps) {
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [bookId])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const endpoint = bookId
        ? `/api/books/${bookId}/similar?limit=${limit}`
        : `/api/recommendations?limit=${limit}`

      const res = await fetch(endpoint)
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.similarBooks || data.recommendations || [])
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-slate-600 mt-2 text-sm">Loading recommendations...</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="font-serif text-2xl font-semibold text-slate-900">
          {title || (bookId ? 'You Might Also Like' : 'Recommended for You')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.book.id}
            href={`/member/books/${rec.book.id}`}
            className="block"
          >
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-lift hover:border-primary/30 transition-all h-full">
              <div className="flex gap-3">
                {rec.book.coverImageUrl && (
                  <img
                    src={rec.book.coverImageUrl}
                    alt={rec.book.title}
                    className="w-16 h-24 object-cover rounded shadow-soft flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-semibold text-slate-900 line-clamp-2 mb-1">
                    {rec.book.title}
                  </h4>
                  <p className="text-xs text-slate-600 mb-2">
                    by {rec.author?.name || 'Unknown'}
                  </p>

                  {rec.avgRating > 0 && (
                    <div className="mb-2">
                      <StarRating rating={rec.avgRating} size="sm" showNumber={false} />
                    </div>
                  )}

                  <p className="text-xs text-slate-500 italic line-clamp-1">
                    {rec.reason}
                  </p>

                  <div className="mt-2">
                    {rec.book.availableCopies > 0 ? (
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-slate-500">
                        Out
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
