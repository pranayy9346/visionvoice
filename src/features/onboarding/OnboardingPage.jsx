import { UserButton } from '@clerk/clerk-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../components/layout/AppHeader'
import useAuth from '../../hooks/useAuth'
import { ROUTES, ONBOARDING_USE_CASE_OPTIONS } from '../../utils/constants'
import { normalizeText } from '../../utils/helpers'
import { submitOnboarding } from './onboardingService'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, profile, profileError, setProfile } = useAuth()
  const [name, setName] = useState(profile?.name || user?.fullName || user?.firstName || '')
  const [useCase, setUseCase] = useState(profile?.useCase || ONBOARDING_USE_CASE_OPTIONS[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const email = profile?.email || user?.primaryEmailAddress?.emailAddress || ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const normalizedName = normalizeText(name)
    const normalizedUseCase = normalizeText(useCase)

    if (!normalizedName) {
      setSubmitError('Name is required to continue.')
      return
    }

    if (!normalizedUseCase) {
      setSubmitError('Please select your primary use case.')
      return
    }

    if (!user?.id) {
      setSubmitError('User session is unavailable. Please sign in again.')
      return
    }

    setIsSubmitting(true)
    try {
      const saved = await submitOnboarding({
        userId: user.id,
        email,
        name: normalizedName,
        useCase: normalizedUseCase,
      })

      setProfile((previous) => ({
        ...previous,
        onboarded: true,
        name: saved?.name || normalizedName,
        email: saved?.email || email,
        useCase: saved?.useCase || normalizedUseCase,
        preferences: saved?.preferences || previous.preferences,
      }))

      navigate(ROUTES.demo, { replace: true })
    } catch (error) {
      setSubmitError(error?.message || 'Failed to save onboarding details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <AppHeader
          showSettingsToggle={false}
          rightContent={<UserButton afterSignOutUrl={ROUTES.login} />}
        />

        <section className="onboarding-card" aria-label="Onboarding">
          <section className="cta-section" aria-label="Onboarding intro">
            <h2>Set up your VisionVoice profile</h2>
            <p>
              Tell us how you plan to use the app so we can personalize guidance and
              response style.
            </p>
          </section>

          <form className="onboarding-form" onSubmit={handleSubmit}>
            <label className="settings-field" htmlFor="onboarding-name">
              <span>Name</span>
              <input
                id="onboarding-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </label>

            <label className="settings-field" htmlFor="onboarding-email">
              <span>Email</span>
              <input
                id="onboarding-email"
                value={email}
                disabled
                readOnly
                aria-readonly="true"
              />
            </label>

            <label className="settings-field" htmlFor="onboarding-usecase">
              <span>Primary Accessibility Need / Use Case</span>
              <select
                id="onboarding-usecase"
                value={useCase}
                onChange={(event) => setUseCase(event.target.value)}
              >
                {ONBOARDING_USE_CASE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            {(profileError || submitError) && (
              <p className="settings-message">{submitError || profileError}</p>
            )}

            <div className="settings-actions">
              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Continue to Demo'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
