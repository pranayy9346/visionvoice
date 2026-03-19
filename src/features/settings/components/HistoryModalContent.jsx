export default function HistoryModalContent({ historyCount, onViewHistory, onClearHistory }) {
  return (
    <div className="space-y-4 text-sm text-slate-300">
      <p>
        Saved interactions: <span className="font-semibold text-slate-100">{historyCount}</span>
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onViewHistory}
          className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20"
        >
          View History
        </button>
        <button
          type="button"
          onClick={onClearHistory}
          className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-4 py-2 text-amber-100 transition hover:border-amber-200 hover:bg-amber-500/20"
        >
          Clear History
        </button>
      </div>
    </div>
  )
}
