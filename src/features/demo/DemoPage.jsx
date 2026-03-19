import { UserButton } from '@clerk/clerk-react'
import AppHeader from '../../components/layout/AppHeader'
import useUser from '../../hooks/useUser'
import VoiceAssistant from './VoiceAssistant'

export default function DemoPage() {
  const { displayEmail, displayName } = useUser()

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <AppHeader rightContent={<UserButton afterSignOutUrl="/auth/login" />} />

        <section className="onboarding-card" aria-label="Live demo page">
          <section className="cta-section" aria-label="Demo page header">
            <h2>Live Demo</h2>
            <p>Capture, analyze, and hear real-time scene guidance</p>
            <p className="tech-description user-meta">
              Signed in as <strong>{displayName}</strong>
              {displayEmail ? ` (${displayEmail})` : ''}
            </p>
          </section>

          <VoiceAssistant />
        </section>
      </div>
    </main>
  )
}
