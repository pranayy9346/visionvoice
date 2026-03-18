import { useState } from 'react'
import { useCases } from '../services/useCaseService'
import OnboardingHeader from './OnboardingHeader'
import UseCasesSection from './UseCasesSection'
import VideoModal from './VideoModal'

const HERO_VIDEO_SRC = 'https://go.screenpal.com/watch/cOeFqcnZRyk4'
const TECH_VIDEO_SRC = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'

const highlights = ['Activate Instantly', 'Capture Surroundings', 'Receive Voice Guidance']
const techLabels = ['Camera', 'Speaker', 'Adaptive Light', 'Processing Unit']

export default function OnboardingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const handleGoToDemoPage = () => {
    window.location.assign('/#/demo')
  }

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <OnboardingHeader />

        <section className="onboarding-card" aria-label="Onboarding">
          <section className="hero-video-section" aria-label="Hero video">
            <div className="hero-video-wrap">
              <video className="hero-video" src={HERO_VIDEO_SRC} autoPlay muted loop playsInline />

              <div className="hero-overlay" />

              <div className="hero-content">
                <h1>See the World Through AI</h1>
                <p>
                  An intelligent system that helps visually impaired users understand and
                  navigate their surroundings in real time with confidence
                </p>

                <div className="hero-actions">
                  <button type="button" className="primary-btn" onClick={handleGoToDemoPage}>
                    Get Started
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setIsVideoOpen(true)}
                  >
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="feature-highlights" aria-label="Feature highlights">
            {highlights.map((item) => (
              <article key={item} className="highlight-pill">
                {item}
              </article>
            ))}
          </section>

          <UseCasesSection title="Real-Life Use Cases" useCases={useCases} />

          <section className="cta-section" aria-label="Get started call to action">
            <h2>Experience the World with Assistive Intelligence</h2>
            <p>Try the live demo and see how the system understands your world</p>
            <button type="button" className="primary-btn" onClick={handleGoToDemoPage}>
              Get Started
            </button>
          </section>

          <section className="tech-video-section" aria-label="Technical overview">
            <h2>Technical Overview</h2>
            <p className="tech-description">A glimpse into how the system works in real time</p>

            <div className="tech-video-wrap">
              <video className="tech-video" src={TECH_VIDEO_SRC} controls playsInline />
            </div>

            <div className="tech-labels" aria-label="System components">
              {techLabels.map((label) => (
                <span key={label} className="tech-label">
                  {label}
                </span>
              ))}
            </div>

            <p className="tech-description">Engineered to capture, understand, and respond instantly</p>
          </section>
        </section>
      </div>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoSrc={TECH_VIDEO_SRC}
      />
    </main>
  )
}
