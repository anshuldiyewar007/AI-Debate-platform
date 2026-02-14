import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme, darkTheme, lightTheme } from '../context/ThemeContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? darkTheme : lightTheme

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  }

  const formBoxStyle = {
    backgroundColor: theme.bg.secondary,
    border: `2px solid ${theme.border}`,
    padding: '2.5rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  }

  const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: theme.primaryAccent,
    textAlign: 'center',
  }

  const formGroupStyle = {
    marginBottom: '1.5rem',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: theme.text.primary,
    fontWeight: '500',
    fontSize: '0.95rem',
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: theme.bg.tertiary,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    fontSize: '1rem',
    color: theme.text.primary,
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  }

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: theme.primaryAccent,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '1.5rem',
    opacity: loading ? 0.7 : 1,
    transition: 'all 0.2s',
  }

  const errorStyle = {
    backgroundColor: theme.error,
    color: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  }

  const linkContainerStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.95rem',
    color: theme.text.secondary,
  }

  const linkTextStyle = {
    color: theme.primaryAccent,
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s',
  }

  return (
    <div style={containerStyle}>
      <div style={formBoxStyle}>
        <h2 style={titleStyle}>🔐 Welcome Back</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              disabled={loading}
              placeholder="you@example.com"
              onFocus={(e) => (e.target.style.borderColor = theme.primaryAccent)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              disabled={loading}
              placeholder="••••••••"
              onFocus={(e) => (e.target.style.borderColor = theme.primaryAccent)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
          </div>

          <button
            type="submit"
            style={buttonStyle}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
          >
            {loading ? '⏳ Logging in...' : '✓ Login'}
          </button>
        </form>

        <p style={linkContainerStyle}>
          Don't have an account?{' '}
          <Link to="/register" style={linkTextStyle}>
            Create one here
          </Link>
        </p>
      </div>
    </div>
  )
}
