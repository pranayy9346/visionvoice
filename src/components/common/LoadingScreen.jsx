export default function LoadingScreen({ label = 'Loading...' }) {
  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <section className="onboarding-card" aria-label="Loading page">
          <section className="cta-section" aria-label="Loading message">
            <h2>{label}</h2>
            <p>Please wait while we prepare your workspace.</p>
          </section>
        </section>
      </div>
    </main>
  )
}
