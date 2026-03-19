import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getInteractionHistory } from '../services/apiService'
import useUser from '../hooks/useUser'

export default function History() {
  const { displayName } = useUser()
  const navigate = useNavigate()
  const [interactions, setInteractions] = useState([])

  useEffect(() => {
    let cancelled = false

    const loadHistory = async () => {
      try {
        const items = await getInteractionHistory()
        if (!cancelled) {
          setInteractions(Array.isArray(items) ? items : [])
        }
      } catch {
        if (!cancelled) {
          setInteractions([])
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [])

  const renderResponse = (interaction) => {
    return interaction.response || interaction.description || ''
  }

  const renderTimestamp = (interaction) => {
    const value = interaction.timestamp || interaction.createdAt
    return value ? new Date(value).toLocaleString() : ''
  }

  const renderQuery = (interaction) => interaction.query || ''

  return (
    <section className="onboarding-card" aria-label="History page">
      <section className="cta-section" aria-label="History header">
        <h2>Interaction History</h2>
        <p>Your previous AI vision analysis and responses</p>
      </section>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="secondary-btn"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="mt-8">
        {interactions.length === 0 ? (
          <p className="text-center text-slate-400">
            No interactions yet. Start using the AI assistant to build your history.
          </p>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction, idx) => (
              <div
                key={interaction.id || interaction._id || `${interaction.query || 'interaction'}-${idx}`}
                className="rounded-lg border border-slate-200/10 bg-slate-900/40 p-4"
              >
                <p className="text-sm text-slate-300">
                  <strong>Query:</strong> {renderQuery(interaction)}
                </p>
                {renderResponse(interaction) && (
                  <p className="mt-2 text-sm text-slate-300">
                    <strong>Response:</strong> {renderResponse(interaction)}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">{renderTimestamp(interaction)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
