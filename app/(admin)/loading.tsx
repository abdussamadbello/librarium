import { LoadingSpinner } from '@/components/shared/loading-spinner'

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    </div>
  )
}
