'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function MemberError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Member Error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <CardTitle>Oops! Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            {error.message || 'We encountered an error while loading this page.'}
          </p>
          {error.digest && (
            <p className="text-xs text-neutral-500 mt-2">Error ID: {error.digest}</p>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/member/discover'}>
            Go to Discover
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
