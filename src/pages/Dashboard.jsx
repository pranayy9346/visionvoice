import { useNavigate } from 'react-router-dom'
import VoiceAssistant from '../features/demo/VoiceAssistant'
import useUser from '../hooks/useUser'

export default function Dashboard() {
  const { displayEmail, displayName } = useUser()
  const navigate = useNavigate()

  return (
    <section className="onboarding-card" aria-label="Dashboard page">
      <section className="cta-section" aria-label="Dashboard header">
        <h2>AI Vision Assistant</h2>
        <p>Capture, analyze, and hear real-time scene guidance</p>
        <p className="tech-description user-meta">
          Signed in as <strong>{displayName}</strong>
          {displayEmail ? ` (${displayEmail})` : ''}
        </p>
      </section>

      <div className="mt-12 flex gap-4">
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="secondary-btn"
        >
          View History
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="secondary-btn"
        >
          Profile Settings
        </button>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="secondary-btn"
        >
          Settings Hub
        </button>
      </div>

      <VoiceAssistant />
    </section>
  )
}
