export default function SettingsModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-cyan-300/20 bg-slate-900/95 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.75)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-500/40 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-300/70 hover:text-cyan-100"
            aria-label="Close settings dialog"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
