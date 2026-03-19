import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './styles/index.css'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function MissingConfigScreen() {
  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <section className="onboarding-card" aria-label="Configuration error">
          <section className="cta-section" aria-label="Missing environment variable">
            <h2>Configuration Required</h2>
            <p>
              Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your frontend
              environment.
            </p>
            <p>
              Add it to <code>.env</code>, then restart the dev server.
            </p>
          </section>
        </section>
      </div>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <MissingConfigScreen />
    )}
  </React.StrictMode>,
)
