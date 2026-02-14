import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Debate from './pages/Debate'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme, darkTheme, lightTheme } from './context/ThemeContext'

// Protected route - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/debate/:id" 
        element={
          <ProtectedRoute>
            <Debate />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

function AppContent() {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? darkTheme : lightTheme

  const appStyle = {
    minHeight: '100vh',
    backgroundColor: theme.bg.primary,
    color: theme.text.primary,
    transition: 'background-color 0.3s, color 0.3s',
  }

  return (
    <div style={appStyle}>
      <Navbar />
      <AppRoutes />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
