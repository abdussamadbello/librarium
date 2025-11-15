/**
 * Get the application URL dynamically based on environment
 * Works for Production, Preview, and Development
 */
export function getAppUrl(): string {
  // Check for explicitly set URL (production)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  // Vercel automatically sets VERCEL_URL for all deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Fallback to localhost for local development
  return 'http://localhost:3000'
}

/**
 * Get the public-facing app URL (client-side safe)
 */
export function getPublicAppUrl(): string {
  // Use NEXT_PUBLIC_APP_URL if explicitly set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // For client-side, use window.location.origin if available
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Vercel preview deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}
