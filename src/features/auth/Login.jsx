import { SignIn } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function Login() {
  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <section className="onboarding-card auth-card" aria-label="Sign in page">
          <section className="cta-section" aria-label="Authentication header">
            <h2>Sign in to VisionVoice</h2>
            <p>
              Continue with email, password, or Google. Configure Google in Clerk
              Dashboard to enable social login.
            </p>
          </section>

          <div className="auth-toggle" role="tablist" aria-label="Authentication mode switcher">
            <button type="button" className="secondary-btn auth-toggle-active">
              Sign In
            </button>
            <Link className="secondary-btn" to={ROUTES.signup}>
              Sign Up
            </Link>
          </div>

          <div className="auth-widget-wrap">
            <SignIn
              routing="virtual"
              oauthFlow="popup"
              forceRedirectUrl="/onboarding"
              fallbackRedirectUrl="/onboarding"
              signUpUrl={ROUTES.signup}
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
