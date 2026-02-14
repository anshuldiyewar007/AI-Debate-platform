import React, { createContext, useState, useEffect } from 'react'
import { authService } from '../api/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = authService.getCurrentUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login(email, password)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed'
      setError(message)
      throw err
    }
  }

  const register = async (email, password, name) => {
    try {
      setError(null)
      const response = await authService.register(email, password, name)
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed'
      setError(message)
      throw err
    }
  }

  const logout = () => {
    setError(null)
    authService.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
