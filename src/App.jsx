import { useEffect } from 'react'
import './styles.css'
import DemoPage from './frontend/components/DemoPage'
import OnboardingPage from './frontend/components/OnboardingPage'
import SettingsPage from './frontend/components/SettingsPage'

function NotFoundPage() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.assign('/')
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <section className="onboarding-card" aria-label="Page not found">
          <section className="cta-section" aria-label="Not found message">
            <h2>404 - Page Not Found</h2>
            <p>
              The page you are trying to access does not exist or has been moved.
              Return to the home page to continue.
            </p>
            <p>Redirecting to home automatically in a few seconds...</p>
            <button
              type="button"
              className="primary-btn"
              onClick={() => window.location.assign('/')}
            >
              Back to Home
            </button>
          </section>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const path = window.location.pathname
  const isHomePage = path === '/'
  const isDemoPage = path === '/demo'
  const isSettingsPage = path === '/settings'

  if (isDemoPage) {
    return <DemoPage />
  }

  if (isSettingsPage) {
    return <SettingsPage />
  }

  if (!isHomePage) {
    return <NotFoundPage />
  }

  return <OnboardingPage />
}
