import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function MemberLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-neutral-600">Loading content...</p>
      </div>
    </div>
  )
}
