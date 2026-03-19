import { Link } from 'react-router-dom'
import { UserButton, useAuth } from '@clerk/clerk-react'
import { ROUTES } from '../../../utils/constants'

export default function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-cyan-400/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to={ROUTES.root} className="group inline-flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/40 bg-cyan-400/15 text-lg shadow-[0_0_28px_rgba(34,211,238,0.32)] transition group-hover:scale-105">
            VV
          </span>
          <span className="text-lg font-semibold tracking-wide text-slate-100">VisionVoice</span>
        </Link>

        <div className="flex items-center gap-4">
          {isSignedIn && (
            <Link
              to={ROUTES.dashboard}
              className="rounded-lg border border-slate-300/40 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300 hover:bg-slate-800/60"
            >
              Dashboard
            </Link>
          )}

          {isSignedIn ? (
            <UserButton afterSignOutUrl={ROUTES.root} />
          ) : (
            <Link
              to={ROUTES.signup}
              className="rounded-xl border border-cyan-300/50 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:scale-105 hover:border-cyan-200 hover:bg-cyan-300/20 hover:shadow-[0_0_26px_rgba(34,211,238,0.38)]"
            >
              Get Started
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
