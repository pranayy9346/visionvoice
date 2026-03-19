export default function PersonList({ persons, onRemove, onClear }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Known people</h4>
        <button
          type="button"
          onClick={onClear}
          disabled={persons.length === 0}
          className="rounded-md border border-rose-300/40 px-2 py-1 text-xs text-rose-200 disabled:opacity-50"
        >
          Clear all
        </button>
      </div>

      {persons.length === 0 ? (
        <p className="text-sm text-slate-400">No people registered yet.</p>
      ) : (
        <ul className="space-y-2">
          {persons.map((person) => (
            <li key={person.id} className="flex items-center justify-between rounded-lg border border-slate-500/30 bg-slate-900/50 px-3 py-2">
              <div>
                <p className="text-sm text-slate-100">{person.name}</p>
                <p className="text-xs text-slate-400">Embeddings: {person.embeddings?.length || 0}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(person.id)}
                className="rounded-md border border-slate-500/40 px-2 py-1 text-xs text-slate-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
