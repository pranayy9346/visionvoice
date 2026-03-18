export default function UseCaseCard({ item }) {
  return (
    <article className="use-case-card">
      <span className="use-case-icon" aria-hidden="true">
        {item.icon}
      </span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </article>
  )
}
