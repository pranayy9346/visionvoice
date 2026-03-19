import { useEffect, useState } from 'react'
import { UserButton } from '@clerk/clerk-react'
import AppHeader from '../../components/layout/AppHeader'
import {
  DEFAULT_PREFERENCES,
  getUserProfile,
  updateUserProfile,
} from '../../services/apiService'

const OPTIONS = {
  responseStyle: ['short', 'detailed'],
  languageLevel: ['simple', 'moderate'],
  safetySensitivity: ['high', 'normal'],
  voiceSpeed: ['slow', 'normal', 'fast'],
}

function prettify(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const profile = await getUserProfile()
        if (mounted) {
          setPreferences(profile.preferences)
          setMessage('')
        }
      } catch {
        if (mounted) {
          setMessage('Could not load profile. Using defaults.')
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const onChange = (key, value) => {
    setPreferences((previous) => ({ ...previous, [key]: value }))
  }

  const onSave = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const updated = await updateUserProfile(preferences)
      setPreferences(updated.preferences)
      setMessage('Settings saved.')
    } catch (error) {
      setMessage(error?.message || 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <AppHeader rightContent={<UserButton afterSignOutUrl="/auth/login" />} />

        <section className="onboarding-card" aria-label="Settings page">
          <section className="settings-section">
            <h2>Assistant Settings</h2>
            <div className="settings-content">
              <p className="tech-description">Customize how VisionVoice responds to you.</p>

              <div className="settings-grid">
                {Object.keys(OPTIONS).map((key) => (
                  <label key={key} className="settings-field">
                    <span>{prettify(key.replace(/([A-Z])/g, ' $1'))}</span>
                    <select
                      value={preferences[key]}
                      onChange={(event) => onChange(key, event.target.value)}
                    >
                      {OPTIONS[key].map((value) => (
                        <option key={value} value={value}>
                          {prettify(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="settings-actions">
                <button
                  type="button"
                  className="primary-btn settings-primary-btn"
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              {message && <p className="settings-message">{message}</p>}
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
