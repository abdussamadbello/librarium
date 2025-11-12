import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="text-center space-y-6 p-8">
        <div className="flex items-center justify-center">
          <BookOpen className="w-20 h-20 text-primary-teal" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-neutral-800">404</h1>
          <h2 className="text-2xl font-semibold text-neutral-700">Page Not Found</h2>
          <p className="text-neutral-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/member/discover">
            <Button>Member Portal</Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline">Admin Portal</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
