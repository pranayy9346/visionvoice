import { Link } from 'react-router-dom'
import { ROUTES } from '../../../utils/constants'

export default function CTASection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24">
      <div className="rounded-2xl border border-cyan-300/25 bg-slate-900/55 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.65)] backdrop-blur-md sm:p-10">
        <h2 className="text-balance text-2xl font-semibold text-slate-100 sm:text-3xl">
          Start experiencing AI-powered vision today
        </h2>
        <div className="mt-7">
          <Link
            to={ROUTES.signup}
            className="inline-flex rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3 text-base font-semibold text-slate-950 transition hover:scale-105 hover:shadow-[0_0_34px_rgba(56,189,248,0.55)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}
