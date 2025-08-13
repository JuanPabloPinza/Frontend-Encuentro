import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { serverAuthUtils } from './lib/server-auth'

// Define which routes require authentication
const protectedRoutes = [
  //'/profile',
  // '/eventos/create', // Temporarily disabled - using client-side protection
  //'/eventos/edit',
  '/api/protected',
]

// Define public routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/user/login',
  '/user/register',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    const auth = await serverAuthUtils.requireAuth(request)
    
    if (!auth.authorized) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/user/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Add user info to headers for use in route handlers
    const response = NextResponse.next()
    response.headers.set('x-user', JSON.stringify(auth.user))
    return response
  }

  if (isAuthRoute) {
    const auth = await serverAuthUtils.requireAuth(request)
    
    if (auth.authorized) {
      // Redirect to profile if already authenticated
      return NextResponse.redirect(new URL('/profile', request.url))
    }
  }

  return NextResponse.next()
}

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
