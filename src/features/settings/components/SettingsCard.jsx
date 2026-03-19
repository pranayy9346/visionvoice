export default function SettingsCard({ icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-cyan-200/10 bg-slate-900/55 p-5 text-left shadow-[0_14px_40px_rgba(2,6,23,0.55)] backdrop-blur-sm transition duration-300 hover:scale-[1.02] hover:border-cyan-300/45 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <div className="text-cyan-200 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </button>
  )
}
