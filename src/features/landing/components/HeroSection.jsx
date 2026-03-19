import { Link } from 'react-router-dom'
import { ROUTES } from '../../../utils/constants'

export default function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pt-16 text-center sm:px-6 sm:pt-20">
      <p className="mb-5 inline-flex rounded-full border border-cyan-300/35 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
        AI Accessibility Companion
      </p>
      <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-100 sm:text-5xl md:text-6xl">
        See the World Through AI
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
        VisionVoice helps visually impaired users understand surroundings, identify objects, and receive
        real-time voice guidance with confidence.
      </p>
      <div className="mt-9 flex justify-center">
        <Link
          to={ROUTES.signup}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3 text-base font-semibold text-slate-950 transition hover:scale-105 hover:shadow-[0_0_34px_rgba(56,189,248,0.55)]"
        >
          Get Started
        </Link>
      </div>
    </section>
  )
}
