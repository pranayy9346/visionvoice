import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function NotFoundPage() {
  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <section className="onboarding-card" aria-label="Page not found">
          <section className="cta-section" aria-label="Not found message">
            <h2>404 - Page Not Found</h2>
            <p>The page you are trying to access does not exist.</p>
            <Link className="primary-btn" to={ROUTES.root}>
              Back to Home
            </Link>
          </section>
        </section>
      </div>
    </main>
  )
}
