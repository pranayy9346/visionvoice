import { SignUp } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function Signup() {
  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <section className="onboarding-card auth-card" aria-label="Sign up page">
          <section className="cta-section" aria-label="Authentication header">
            <h2>Create your VisionVoice account</h2>
            <p>
              Sign up with email or Google and continue to onboarding.
            </p>
          </section>

          <div className="auth-toggle" role="tablist" aria-label="Authentication mode switcher">
            <Link className="secondary-btn" to={ROUTES.login}>
              Sign In
            </Link>
            <button type="button" className="secondary-btn auth-toggle-active">
              Sign Up
            </button>
          </div>

          <div className="auth-widget-wrap">
            <SignUp
              routing="virtual"
              oauthFlow="popup"
              forceRedirectUrl={ROUTES.onboarding}
              fallbackRedirectUrl={ROUTES.onboarding}
              signInUrl={ROUTES.login}
              appearance={{
                elements: {
                  card: 'clerk-card',
                },
              }}
            />
          </div>
        </section>
      </div>
    </main>
  )
}
