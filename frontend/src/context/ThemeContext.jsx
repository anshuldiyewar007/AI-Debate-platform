import React, { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    // Check for saved preference or default to dark
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      setIsDarkMode(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const darkTheme = {
  bg: {
    primary: '#0f0f0f',
    secondary: '#1a1a1a',
    tertiary: '#252525',
    hover: '#2d2d2d',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    accent: '#64b5f6',
  },
  border: '#333333',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  primaryAccent: '#2196F3',
  secondaryAccent: '#1abc9c',
}

export const lightTheme = {
  bg: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#eeeeee',
    hover: '#e0e0e0',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#1976d2',
  },
  border: '#dddddd',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  primaryAccent: '#2196F3',
  secondaryAccent: '#1abc9c',
}
