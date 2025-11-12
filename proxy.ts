import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin, canAccessMember } from '@/lib/auth/roles'

export default async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/error', '/discover']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Guest-accessible routes (books browsing)
  const isGuestBookRoute = pathname.startsWith('/books/')
  
  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // Member routes
  const isMemberRoute = pathname.startsWith('/member')

  // If it's a public route, allow access
  if (isPublicRoute || isGuestBookRoute) {
    // Redirect to appropriate dashboard if already logged in (only for main public routes, not book details)
    if (session?.user && publicRoutes.includes(pathname)) {
      if (canAccessAdmin(session.user.role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else if (canAccessMember(session.user.role)) {
        return NextResponse.redirect(new URL('/member/discover', request.url))
      }
    }
    return NextResponse.next()
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!canAccessAdmin(session.user.role)) {
      return NextResponse.redirect(new URL('/member/discover', request.url))
    }

    return NextResponse.next()
  }

  // Protect member routes
  if (isMemberRoute) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!canAccessMember(session.user.role)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
