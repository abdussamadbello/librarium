import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= rating
        const isPartial = starValue > rating && starValue - 1 < rating

        return (
          <div key={index} className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              )}
            />
            {isPartial && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${(rating - (starValue - 1)) * 100}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    'fill-amber-400 text-amber-400'
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
      {showNumber && (
        <span className="text-sm font-medium text-slate-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
