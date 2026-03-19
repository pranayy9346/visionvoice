import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import AccountInfoCard from './components/AccountInfoCard'
import PreferencesCard from './components/PreferencesCard'
import useProfilePreferences from './hooks/useProfilePreferences'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    preferences,
    isSaving,
    message,
    setPreference,
    savePreferences,
  } = useProfilePreferences()

  return (
    <section className="onboarding-card" aria-label="Profile page">
      <section className="cta-section" aria-label="Profile header">
        <h2>Profile & Settings</h2>
        <p>Manage your account and preferences</p>
      </section>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => navigate('/dashboard')} className="secondary-btn">
          ← Back to Dashboard
        </button>
      </div>

      <div className="mt-8">
        <AccountInfoCard user={user} />
        <PreferencesCard
          preferences={preferences}
          message={message}
          isSaving={isSaving}
          onChange={setPreference}
          onSave={savePreferences}
        />
      </div>
    </section>
  )
}
