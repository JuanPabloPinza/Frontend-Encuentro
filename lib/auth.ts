// Client-side authentication utilities

export interface AuthTokens {
  token: string
}

export const authUtils = {
  // Get token from localStorage (client-side only)
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  },

  // Set token in localStorage
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('authToken', token)
  },

  // Remove token from localStorage
  removeToken: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('authToken')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!authUtils.getToken()
  },

  // Logout function
  logout: async (): Promise<void> => {
    // Remove from localStorage
    authUtils.removeToken()
    
    // Remove from httpOnly cookie
    try {
      await fetch('/api/auth/set-token', {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error removing auth token:', error)
    }
  },

  // Get authorization header for API calls
  getAuthHeader: (): Record<string, string> => {
    const token = authUtils.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  },

  // Authenticated fetch wrapper
  authenticatedFetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = {
      'Content-Type': 'application/json',
      ...authUtils.getAuthHeader(),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    // If token is invalid/expired, logout
    if (response.status === 401) {
      await authUtils.logout()
      window.location.href = '/user/login'
    }

    return response
  },
}

// Decode JWT payload (client-side only, for non-sensitive data)
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

// Check if JWT is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true
    
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    return true
  }
}
