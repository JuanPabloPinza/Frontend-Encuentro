'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authUtils, decodeJWT, isTokenExpired } from '../../lib/auth'

interface User {
  id: string
  email: string
  name?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => void
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app initialization
    const storedToken = authUtils.getToken()
    
    if (storedToken && !isTokenExpired(storedToken)) {
      const decoded = decodeJWT(storedToken)
      if (decoded) {
        setToken(storedToken)
        setUser({
          id: decoded.sub || decoded.id,
          email: decoded.email,
          name: decoded.name,
          ...decoded
        })
      }
    } else if (storedToken) {
      // Token is expired, remove it
      authUtils.removeToken()
    }
    
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    const decoded = decodeJWT(newToken)
    if (decoded) {
      setToken(newToken)
      setUser({
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
        ...decoded
      })
      authUtils.setToken(newToken)
    }
  }

  const logout = async () => {
    setUser(null)
    setToken(null)
    await authUtils.logout()
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
