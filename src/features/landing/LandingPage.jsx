import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import VideoSection from './components/VideoSection'
import UseCases from './components/UseCases'
import CTASection from './components/CTASection'

export default function LandingPage() {
  return (
    <main className="font-['Space_Grotesk'] text-slate-100">
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.2),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.18),transparent_34%),linear-gradient(160deg,#020617_0%,#0b1120_48%,#060d1b_100%)]">
        <Navbar />
        <HeroSection />
        <VideoSection />
        <UseCases />
        <CTASection />
      </div>
    </main>
  )
}
