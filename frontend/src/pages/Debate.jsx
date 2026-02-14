import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { debateService } from '../api/debateService'
import { useAuth } from '../context/AuthContext'
import { useTheme, darkTheme, lightTheme } from '../context/ThemeContext'

export default function Debate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? darkTheme : lightTheme

  const [debate, setDebate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newArgument, setNewArgument] = useState('')
  const [selectedSide, setSelectedSide] = useState('FOR')
  const [submitting, setSubmitting] = useState(false)
  const [votedArguments, setVotedArguments] = useState(new Set())
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const wsRef = useRef(null)
  const [messages, setMessages] = useState([])

  // Load debate and establish WebSocket on mount
  useEffect(() => {
    loadDebate()
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [id])

  const loadDebate = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await debateService.getDebate(id)
      setDebate(data)
    } catch (err) {
      setError(err.message || 'Failed to load debate')
    } finally {
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const wsUrl = `${protocol}://${apiUrl.split('://')[1]}/ws/debate/${id}`

    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        setMessages((prev) => [...prev, message])
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (err) {
      console.error('Failed to connect WebSocket:', err)
    }
  }

  const handleAddArgument = async (e) => {
    e.preventDefault()
    if (!newArgument.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await debateService.addArgument(id, selectedSide, newArgument)
      setNewArgument('')
      await loadDebate()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add argument')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (argumentId) => {
    if (!isAuthenticated) {
      setError('Please login to vote')
      return
    }

    if (votedArguments.has(argumentId)) {
      setError('You already voted on this argument')
      return
    }

    try {
      setError(null)
      await debateService.voteOnArgument(id, argumentId)
      setVotedArguments((prev) => new Set(prev).add(argumentId))
      await loadDebate()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to vote')
    }
  }

  const handleGenerateSummary = async () => {
    try {
      setGeneratingSummary(true)
      setError(null)
      const result = await debateService.generateSummary(id)
      await loadDebate()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  if (loading) {
    return (
      <div style={{ ...getStyles(theme).container, paddingTop: '4rem' }}>
        ⏳ Loading debate...
      </div>
    )
  }

  if (!debate) {
    return (
      <div style={getStyles(theme).container}>
        <p style={{ color: theme.text.secondary }}>{error || 'Debate not found'}</p>
        <button
          onClick={() => navigate('/')}
          style={getStyles(theme).backButton}
          onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          ← Back to Debates
        </button>
      </div>
    )
  }

  const forArguments = debate.arguments?.filter((arg) => arg.side === 'FOR') || []
  const againstArguments = debate.arguments?.filter((arg) => arg.side === 'AGAINST') || []
  const userArguments = debate.arguments?.filter((arg) => arg.side === 'USER') || []
  const debateStyles = getStyles(theme)

  return (
    <div style={debateStyles.container}>
      <button
        onClick={() => navigate('/')}
        style={debateStyles.backButton}
        onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.target.style.opacity = '1')}
      >
        ← Back
      </button>

      <h1 style={debateStyles.title}>{debate.topic}</h1>

      {error && <div style={debateStyles.error}>{error}</div>}

      {debate.summary && (
        <div style={debateStyles.summary}>
          <strong style={{ color: theme.primaryAccent }}>📋 Summary:</strong> {debate.summary}
        </div>
      )}

      {isAuthenticated && user?.role === 'admin' && !debate.summary && (
        <button
          onClick={handleGenerateSummary}
          style={debateStyles.buttonPrimary}
          disabled={generatingSummary}
          onMouseEnter={(e) => !generatingSummary && (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => !generatingSummary && (e.target.style.opacity = '1')}
        >
          {generatingSummary ? '⏳ Generating...' : '✨ Generate Summary'}
        </button>
      )}

      {/* Add Argument Form */}
      {isAuthenticated && (
        <div style={debateStyles.participateSection}>
          <h3 style={{ color: theme.primaryAccent }}>💡 Share Your Perspective</h3>
          <form onSubmit={handleAddArgument}>
            <div style={debateStyles.formGroup}>
              <label style={debateStyles.label}>Your Position:</label>
              <select
                value={selectedSide}
                onChange={(e) => setSelectedSide(e.target.value)}
                style={debateStyles.select}
              >
                <option value="FOR">✓ Supporting</option>
                <option value="AGAINST">✗ Opposing</option>
              </select>
            </div>

            <div style={debateStyles.formGroup}>
              <label style={debateStyles.label}>Your Argument:</label>
              <textarea
                value={newArgument}
                onChange={(e) => setNewArgument(e.target.value)}
                placeholder="Share your thoughts..."
                style={debateStyles.textarea}
                disabled={submitting}
              />
            </div>

            <button
              type="submit"
              style={debateStyles.buttonPrimary}
              disabled={submitting}
              onMouseEnter={(e) => !submitting && (e.target.style.opacity = '0.9')}
              onMouseLeave={(e) => !submitting && (e.target.style.opacity = '1')}
            >
              {submitting ? '⏳ Adding...' : '→ Post Argument'}
            </button>
          </form>
        </div>
      )}

      {/* Arguments Display */}
      <div style={debateStyles.argumentsSection}>
        <div style={debateStyles.sideSection}>
          <h3 style={{ ...debateStyles.forTitle }}>✓ Supporting ({forArguments.length})</h3>
          {forArguments.length === 0 ? (
            <p style={debateStyles.empty}>No arguments yet</p>
          ) : (
            forArguments.map((arg) => (
              <ArgumentCard
                key={arg.id}
                argument={arg}
                onVote={handleVote}
                hasVoted={votedArguments.has(arg.id)}
                canVote={isAuthenticated && arg.createdBy !== user?.id}
                theme={theme}
              />
            ))
          )}
        </div>

        <div style={debateStyles.sideSection}>
          <h3 style={{ ...debateStyles.againstTitle }}>✗ Opposing ({againstArguments.length})</h3>
          {againstArguments.length === 0 ? (
            <p style={debateStyles.empty}>No arguments yet</p>
          ) : (
            againstArguments.map((arg) => (
              <ArgumentCard
                key={arg.id}
                argument={arg}
                onVote={handleVote}
                hasVoted={votedArguments.has(arg.id)}
                canVote={isAuthenticated && arg.createdBy !== user?.id}
                theme={theme}
              />
            ))
          )}
        </div>
      </div>

      {/* User Arguments */}
      {userArguments.length > 0 && (
        <div style={debateStyles.userArgumentsSection}>
          <h3 style={{ color: theme.secondaryAccent }}>User Arguments ({userArguments.length})</h3>
          {userArguments.map((arg) => (
            <ArgumentCard
              key={arg.id}
              argument={arg}
              onVote={handleVote}
              hasVoted={votedArguments.has(arg.id)}
              canVote={isAuthenticated && arg.createdBy !== user?.id}
              theme={theme}
            />
          ))}
        </div>
      )}

      {/* Live Messages */}
      {messages.length > 0 && (
        <div style={debateStyles.messagesSection}>
          <h3 style={{ color: theme.primaryAccent }}>🔔 Live Activity ({messages.length})</h3>
          <div style={debateStyles.messagesList}>
            {messages.map((msg, idx) => (
              <div key={idx} style={debateStyles.message}>
                <strong style={{ color: theme.primaryAccent }}>[{msg.type}]</strong>{' '}
                <span style={{ color: theme.text.secondary }}>{msg.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ArgumentCard({ argument, onVote, hasVoted, canVote, theme }) {
  return (
    <div
      style={{
        ...getStyles(theme).argumentCard,
      }}
    >
      <p style={{ color: theme.text.primary, lineHeight: '1.5' }}>{argument.content}</p>
      <div style={getStyles(theme).argumentMeta}>
        <span style={{ color: theme.text.secondary }}>
          👍 <strong>{argument.votes}</strong>
        </span>
        {argument.createdBy && (
          <span style={getStyles(theme).userBadge}>👤 User</span>
        )}
      </div>
      {canVote && (
        <button
          onClick={() => onVote(argument.id)}
          style={{
            ...getStyles(theme).voteButton,
            opacity: hasVoted ? 0.5 : 1,
            cursor: hasVoted ? 'not-allowed' : 'pointer',
          }}
          disabled={hasVoted}
          onMouseEnter={(e) =>
            !hasVoted && (e.target.style.opacity = '0.9')
          }
          onMouseLeave={(e) => !hasVoted && (e.target.style.opacity = '1')}
        >
          {hasVoted ? '✓ Voted' : '👍 Vote'}
        </button>
      )}
    </div>
  )
}

function getStyles(theme) {
  return {
    container: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2rem',
    },
    backButton: {
      padding: '0.5rem 1rem',
      backgroundColor: theme.bg.secondary,
      color: theme.text.primary,
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '1.5rem',
      transition: 'all 0.2s',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1.5rem',
      color: theme.primaryAccent,
    },
    error: {
      backgroundColor: theme.error,
      color: '#fff',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
    },
    summary: {
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.primaryAccent}`,
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
      color: theme.text.primary,
    },
    buttonPrimary: {
      padding: '0.75rem 1.5rem',
      backgroundColor: theme.primaryAccent,
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '1.5rem',
      fontWeight: '600',
      transition: 'all 0.2s',
    },
    participateSection: {
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border}`,
      padding: '1.5rem',
      borderRadius: '8px',
      marginBottom: '2rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      color: theme.text.primary,
      fontWeight: '500',
      marginBottom: '0.5rem',
    },
    select: {
      width: '100%',
      padding: '0.5rem',
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      color: theme.text.primary,
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border}`,
      borderRadius: '6px',
      minHeight: '120px',
      fontFamily: 'Arial, sans-serif',
      color: theme.text.primary,
      boxSizing: 'border-box',
      resize: 'vertical',
    },
    argumentsSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    sideSection: {
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border}`,
      padding: '1.5rem',
      borderRadius: '8px',
    },
    forTitle: {
      color: theme.success,
      marginBottom: '1rem',
    },
    againstTitle: {
      color: theme.error,
      marginBottom: '1rem',
    },
    argumentCard: {
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border}`,
      padding: '1rem',
      marginBottom: '1rem',
      borderRadius: '8px',
      transition: 'all 0.2s',
    },
    argumentMeta: {
      fontSize: '0.85rem',
      marginTop: '0.75rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
    },
    userBadge: {
      backgroundColor: theme.bg.hover,
      color: theme.secondaryAccent,
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '500',
    },
    voteButton: {
      padding: '0.5rem 1rem',
      backgroundColor: theme.primaryAccent,
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginTop: '0.75rem',
      transition: 'all 0.2s',
    },
    empty: {
      color: theme.text.secondary,
      textAlign: 'center',
      padding: '1.5rem',
    },
    userArgumentsSection: {
      marginTop: '2rem',
      borderTop: `2px solid ${theme.border}`,
      paddingTop: '1.5rem',
    },
    messagesSection: {
      marginTop: '2rem',
      borderTop: `2px solid ${theme.border}`,
      paddingTop: '1.5rem',
      backgroundColor: theme.bg.secondary,
      padding: '1.5rem',
      borderRadius: '8px',
    },
    messagesList: {
      maxHeight: '300px',
      overflowY: 'auto',
    },
    message: {
      padding: '0.75rem 0',
      fontSize: '0.9rem',
      borderBottom: `1px solid ${theme.border}`,
      color: theme.text.primary,
    },
  }
}
