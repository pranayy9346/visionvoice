import UseCaseCard from './UseCaseCard'

export default function UseCasesSection({ useCases, title = 'Use Cases' }) {
  return (
    <section className="use-cases" aria-labelledby="use-cases-title">
      <h2 id="use-cases-title">{title}</h2>
      <div className="use-cases-grid">
        {useCases.map((item) => (
          <UseCaseCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  )
}
