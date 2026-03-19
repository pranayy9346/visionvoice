export default function ToggleRow({ label, value, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-slate-400/30 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-300/60"
      aria-pressed={value}
    >
      <span>{label}</span>
      <span className={value ? 'text-emerald-300' : 'text-slate-400'}>{value ? 'ON' : 'OFF'}</span>
    </button>
  )
}
