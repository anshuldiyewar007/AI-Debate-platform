import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { debateService } from '../api/debateService'
import { useAuth } from '../context/AuthContext'
import { useTheme, darkTheme, lightTheme } from '../context/ThemeContext'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? darkTheme : lightTheme
  const navigate = useNavigate()
  const [debates, setDebates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [topic, setTopic] = useState('')

  useEffect(() => {
    loadDebates()
  }, [page])

  const loadDebates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await debateService.listDebates(page, 10)
      setDebates(data.debates || [])
      setTotalPages(Math.ceil(data.total / 10))
    } catch (err) {
      setError(err.message || 'Failed to load debates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDebate = async (e) => {
    e.preventDefault()
    if (!topic.trim()) return

    try {
      setError(null)
      await debateService.createDebate(topic)
      setTopic('')
      setPage(1)
      await loadDebates()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create debate')
    }
  }

  const containerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem',
  }

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '2rem',
    background: `linear-gradient(135deg, ${theme.primaryAccent}, ${theme.secondaryAccent})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const createSectionStyle = {
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border}`,
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '2rem',
  }

  const createTitleStyle = {
    fontSize: '1.3rem',
    marginBottom: '1rem',
    color: theme.text.primary,
  }

  const formStyle = {
    display: 'flex',
    gap: '1rem',
  }

  const inputStyle = {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    backgroundColor: theme.bg.tertiary,
    color: theme.text.primary,
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  }

  const buttonPrimaryStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.primaryAccent,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s',
  }

  const sectionStyle = {
    marginTop: '2rem',
  }

  const sectionTitleStyle = {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: theme.text.primary,
  }

  const errorStyle = {
    backgroundColor: theme.error,
    color: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  }

  const debatesListStyle = {
    display: 'grid',
    gap: '1.5rem',
  }

  const debateCardStyle = {
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border}`,
    padding: '1.5rem',
    borderRadius: '12px',
    transition: 'all 0.2s',
    cursor: 'pointer',
  }

  const debateCardHover = {
    ...debateCardStyle,
    borderColor: theme.primaryAccent,
    backgroundColor: theme.bg.tertiary,
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px rgba(33, 150, 243, 0.1)`,
  }

  const debateTitleStyle = {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: theme.text.primary,
  }

  const debateMetaStyle = {
    fontSize: '0.9rem',
    color: theme.text.secondary,
    marginBottom: '1rem',
  }

  const summaryStyle = {
    marginTop: '1rem',
    fontSize: '0.9rem',
    color: theme.text.secondary,
    backgroundColor: theme.bg.tertiary,
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: `3px solid ${theme.primaryAccent}`,
  }

  const linkStyle = {
    display: 'inline-block',
    marginTop: '1rem',
    color: theme.primaryAccent,
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.2s',
  }

  const emptyStyle = {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: theme.text.secondary,
    backgroundColor: theme.bg.secondary,
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
  }

  const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
  }

  const paginationBtnStyle = {
    padding: '0.5rem 1rem',
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    cursor: 'pointer',
    color: theme.text.primary,
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎯 Active Debates</h1>

      {isAuthenticated && (
        <div style={createSectionStyle}>
          <h2 style={createTitleStyle}>💡 Start New Debate</h2>
          <form onSubmit={handleCreateDebate} style={formStyle}>
            <input
              type="text"
              placeholder="What would you like to debate?..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = theme.primaryAccent)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
            <button
              type="submit"
              style={buttonPrimaryStyle}
              onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.target.style.opacity = '1')}
            >
              Create
            </button>
          </form>
        </div>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          📚 Browse Discussions ({debates.length})
        </h2>

        {loading ? (
          <p style={{ color: theme.text.secondary }}>⏳ Loading debates...</p>
        ) : debates.length === 0 ? (
          <div style={emptyStyle}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              📭 No debates yet
            </p>
            {!isAuthenticated && (
              <p>
                <Link to="/login" style={{ color: theme.primaryAccent }}>
                  Sign in
                </Link>{' '}
                to start or participate!
              </p>
            )}
          </div>
        ) : (
          <div style={debatesListStyle}>
            {debates.map((debate) => (
              <div
                key={debate.id}
                style={debateCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.primaryAccent
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.backgroundColor = theme.bg.secondary
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <h3 style={debateTitleStyle}>{debate.topic}</h3>
                <p style={debateMetaStyle}>
                  💬 {debate.arguments?.length || 0} arguments
                </p>
                {debate.summary && (
                  <div style={summaryStyle}>
                    <strong>Summary:</strong> {debate.summary}
                  </div>
                )}
                <Link to={`/debate/${debate.id}`} style={linkStyle}>
                  View & Participate →
                </Link>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={paginationStyle}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                ...paginationBtnStyle,
                opacity: page === 1 ? 0.5 : 1,
              }}
            >
              ← Previous
            </button>
            <span style={{ color: theme.text.secondary }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{
                ...paginationBtnStyle,
                opacity: page === totalPages ? 0.5 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
