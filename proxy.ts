import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { canAccessAdmin, canAccessMember } from '@/lib/auth/roles'

const handler = auth((request) => {
  const session = request.auth
  const { pathname } = request.nextUrl
  const role = session?.user?.role

  console.log('[middleware] incoming request', {
    pathname,
    userId: session?.user?.id,
    role,
  })

  // Auth routes (login/register)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(pathname)
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/error', '/discover']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Guest-accessible routes (books browsing)
  const isGuestBookRoute = pathname.startsWith('/books/')
  
  // Admin routes
  const isAdminRoute = pathname.startsWith('/admin')

  // Member routes
  const isMemberRoute = pathname.startsWith('/member')

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && session?.user) {
    if (canAccessAdmin(session.user.role)) {
      console.log('[middleware] redirecting authenticated admin away from auth route', {
        pathname,
        role,
      })
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      console.log('[middleware] redirecting authenticated member away from auth route', {
        pathname,
        role,
      })
      return NextResponse.redirect(new URL('/member/dashboard', request.url))
    }
  }

  // Redirect from home page if logged in
  if (pathname === '/' && session?.user) {
    if (canAccessAdmin(session.user.role)) {
      console.log('[middleware] redirecting admin from home to dashboard', { role })
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    } else {
      console.log('[middleware] redirecting member from home to dashboard', { role })
      return NextResponse.redirect(new URL('/member/dashboard', request.url))
    }
  }

  // Allow public routes and guest book browsing
  if (isPublicRoute || isGuestBookRoute || isAuthRoute) {
    console.log('[middleware] allowing public/auth route', {
      pathname,
      isPublicRoute,
      isGuestBookRoute,
      isAuthRoute,
    })
    return NextResponse.next()
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!session?.user) {
      console.log('[middleware] unauthenticated access to admin route, redirecting to login', {
        pathname,
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!canAccessAdmin(session.user.role)) {
      console.log('[middleware] non-admin attempting admin route, redirecting to member discover', {
        pathname,
        role,
      })
      return NextResponse.redirect(new URL('/member/discover', request.url))
    }

    return NextResponse.next()
  }

  // Protect member routes
  if (isMemberRoute) {
    // DEBUG: log session and cookies for inspection
    console.log('[middleware][DEBUG] member route request cookies:', request.headers.get('cookie'))
    console.log('[middleware][DEBUG] member route session:', session)
    if (!session?.user) {
      console.log('[middleware] unauthenticated access to member route, redirecting to login', {
        pathname,
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!canAccessMember(session.user.role)) {
      console.log('[middleware] unauthorized role for member route, redirecting to login', {
        pathname,
        role,
      })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  console.log('[middleware] request allowed to proceed', { pathname })
  return NextResponse.next()
})

export default handler

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
