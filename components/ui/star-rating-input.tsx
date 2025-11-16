'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingInputProps {
  value: number
  onChange: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
}

export function StarRatingInput({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  disabled = false,
  className,
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating)
    }
  }

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= (hoverRating || value)

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            disabled={disabled}
            className={cn(
              'transition-all duration-200 ease-out',
              !disabled && 'hover:scale-110 cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Rate ${starValue} out of ${maxRating} stars`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-all duration-200',
                isFilled
                  ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                  : 'fill-slate-200 text-slate-300'
              )}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="text-sm font-medium text-slate-700 ml-2">
          {value} {value === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  )
}
