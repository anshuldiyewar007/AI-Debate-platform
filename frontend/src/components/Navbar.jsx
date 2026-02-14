import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, darkTheme, lightTheme } from '../context/ThemeContext'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const theme = isDarkMode ? darkTheme : lightTheme

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navStyle = {
    backgroundColor: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border}`,
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  }

  const brandStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.primaryAccent,
    textDecoration: 'none',
    cursor: 'pointer',
  }

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  }

  const buttonBaseStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s',
  }

  const themeButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: theme.bg.tertiary,
    color: theme.text.primary,
    border: `1px solid ${theme.border}`,
  }

  const logoutButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: theme.error,
    color: '#fff',
  }

  const userInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  }

  const userNameStyle = {
    fontSize: '0.9rem',
    color: theme.text.primary,
  }

  const userEmailStyle = {
    fontSize: '0.8rem',
    color: theme.text.secondary,
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={brandStyle}>
        ⚡ AI Debate
      </Link>

      {isAuthenticated ? (
        <div style={rightSectionStyle}>
          <button
            onClick={toggleDarkMode}
            style={themeButtonStyle}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <div style={userInfoStyle}>
            <div style={userNameStyle}>{user?.name || 'User'}</div>
            <div style={userEmailStyle}>{user?.email}</div>
          </div>

          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.target.style.opacity = '1')}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={rightSectionStyle}>
          <button
            onClick={toggleDarkMode}
            style={themeButtonStyle}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      )}
    </nav>
  )
}
