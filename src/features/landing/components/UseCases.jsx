const USE_CASES = [
  {
    icon: '🧭',
    title: 'Navigation Assistance',
    description: 'Get scene-aware voice cues to move safely through indoor and outdoor spaces.',
  },
  {
    icon: '📦',
    title: 'Object Recognition',
    description: 'Quickly identify nearby objects and understand their position in real time.',
  },
  {
    icon: '📰',
    title: 'Reading Text',
    description: 'Read signs, labels, and printed content aloud with reliable AI interpretation.',
  },
  {
    icon: '🎙️',
    title: 'Voice Guidance',
    description: 'Receive concise spoken guidance that adapts to your context and intent.',
  },
]

export default function UseCases() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
      <h2 className="text-center text-3xl font-semibold text-slate-100 sm:text-4xl">Real-Life Use Cases</h2>
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {USE_CASES.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-100/15 bg-slate-900/45 p-6 shadow-[0_8px_26px_rgba(2,6,23,0.48)] backdrop-blur-md transition duration-300 hover:scale-[1.03] hover:border-cyan-300/45 hover:shadow-[0_0_34px_rgba(34,211,238,0.35)]"
          >
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-500/10 text-xl">
              {item.icon}
            </span>
            <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
