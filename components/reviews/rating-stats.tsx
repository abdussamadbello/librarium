import { Star } from 'lucide-react'
import { StarRating } from '@/components/ui/star-rating'

interface RatingStatsProps {
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

export function RatingStats({
  averageRating,
  totalReviews,
  verifiedReviews,
  ratingDistribution,
}: RatingStatsProps) {
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0
    return Math.round((count / totalReviews) * 100)
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-lg p-6 shadow-soft">
      <div className="text-center mb-6">
        <div className="inline-flex flex-col items-center">
          <p className="text-5xl font-bold text-slate-900 mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </p>
          {averageRating > 0 && (
            <>
              <StarRating rating={averageRating} size="lg" />
              <p className="text-sm text-slate-600 mt-2">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
              {verifiedReviews > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {verifiedReviews} verified {verifiedReviews === 1 ? 'borrower' : 'borrowers'}
                </p>
              )}
            </>
          )}
          {averageRating === 0 && (
            <p className="text-sm text-slate-600 mt-2">No ratings yet</p>
          )}
        </div>
      </div>

      {totalReviews > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars as keyof typeof ratingDistribution]
            const percentage = getPercentage(count)

            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium text-slate-700">{stars}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
