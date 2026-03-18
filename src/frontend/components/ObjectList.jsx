export default function ObjectList({
  items,
  isLoading,
  onDelete,
  deletingId,
}) {
  if (isLoading) {
    return <p className="object-message">Loading objects...</p>;
  }

  if (!items.length) {
    return <p className="object-message">No objects added yet</p>;
  }

  return (
    <ul className="object-list">
      {items.map((item) => (
        <li
          key={item.id || item.name}
          className="object-list-item"
        >
          <div className="object-list-main">
            <p className="object-list-name">{item.name}</p>
            {item.updatedAt && (
              <p className="object-list-meta">
                Updated {new Date(item.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="object-list-side">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="object-preview"
              />
            ) : (
              <span className="object-list-meta">No preview</span>
            )}

            {typeof onDelete === "function" && (
              <button
                type="button"
                className="secondary-btn object-delete-btn"
                onClick={() => onDelete(item.id)}
                disabled={!item.id || deletingId === item.id}
              >
                {deletingId === item.id ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
