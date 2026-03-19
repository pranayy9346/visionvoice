export default function PrivacyModalContent({ onDeleteUserData }) {
  return (
    <div className="space-y-4 text-sm text-slate-300">
      <p>Delete your saved history data from the database and clear local session data.</p>
      <button
        type="button"
        onClick={onDeleteUserData}
        className="rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-2 text-red-200 transition hover:border-red-200 hover:bg-red-500/20"
      >
        Delete User Data
      </button>
    </div>
  )
}
