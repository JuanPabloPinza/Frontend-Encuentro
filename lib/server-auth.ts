// Server-side authentication utilities
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export interface DecodedToken {
  sub?: string
  email?: string
  exp?: number
  iat?: number
  [key: string]: any
}

export const serverAuthUtils = {
  // Get token from request (checks both cookie and Authorization header)
  getTokenFromRequest: async (request: NextRequest): Promise<string | null> => {
    // First try to get from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Then try to get from httpOnly cookie
    try {
      const cookieStore = await cookies()
      return cookieStore.get('authToken')?.value || null
    } catch (error) {
      console.error('Error reading cookies:', error)
      return null
    }
  },

  // Validate token with your backend
  validateToken: async (token: string): Promise<{ valid: boolean; user?: any }> => {
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const user = await response.json()
        return { valid: true, user }
      } else {
        return { valid: false }
      }
    } catch (error) {
      console.error('Error validating token:', error)
      return { valid: false }
    }
  },

  // Middleware helper to protect routes
  requireAuth: async (request: NextRequest): Promise<{ authorized: boolean; user?: any; token?: string }> => {
    const token = await serverAuthUtils.getTokenFromRequest(request)
    
    if (!token) {
      return { authorized: false }
    }

    const validation = await serverAuthUtils.validateToken(token)
    
    if (!validation.valid) {
      return { authorized: false }
    }

    return { 
      authorized: true, 
      user: validation.user,
      token 
    }
  }
}

// Simple JWT decode function (for server-side, use with caution)
export const decodeJWTServer = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = Buffer.from(base64, 'base64').toString()
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT on server:', error)
    return null
  }
}
