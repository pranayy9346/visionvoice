import OnboardingHeader from './OnboardingHeader'
import PipelineDemo from './PipelineDemo'

export default function DemoPage() {
  const handleBackHome = () => {
    window.location.assign('/#/')
  }

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <OnboardingHeader />

        <section className="onboarding-card" aria-label="Live demo page">
          <section className="cta-section" aria-label="Demo page header">
            <h2>Live Demo</h2>
            <p>Capture, analyze, and hear real-time scene guidance</p>
            <button type="button" className="secondary-btn" onClick={handleBackHome}>
              Back to Home
            </button>
          </section>

          <PipelineDemo />
        </section>
      </div>
    </main>
  )
}
