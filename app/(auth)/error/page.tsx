'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link is invalid or has expired.',
    OAuthSignin: 'Error occurred during OAuth sign in.',
    OAuthCallback: 'Error occurred during OAuth callback.',
    OAuthCreateAccount: 'Could not create OAuth account.',
    EmailCreateAccount: 'Could not create email account.',
    Callback: 'Error occurred during callback.',
    OAuthAccountNotLinked: 'Account already exists with different credentials.',
    EmailSignin: 'Failed to send sign-in email.',
    CredentialsSignin: 'Invalid email or password.',
    SessionRequired: 'Please sign in to access this page.',
    default: 'An error occurred during authentication.',
  }

  const errorMessage = error ? errorMessages[error] || errorMessages.default : errorMessages.default

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-6 h-6" />
          <CardTitle>Authentication Error</CardTitle>
        </div>
        <CardDescription className="text-red-600">
          {errorMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-neutral-600">
          If this problem persists, please contact support or try a different sign-in method.
        </p>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Link href="/auth/login" className="flex-1">
          <Button className="w-full">Try Again</Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full">Go Home</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
