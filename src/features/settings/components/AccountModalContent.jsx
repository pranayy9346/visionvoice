export default function AccountModalContent({ user, onManageAccount, onLogout }) {
  return (
    <div className="space-y-3 text-sm text-slate-300">
      <p>
        <span className="text-slate-400">Name:</span> {user?.fullName || 'Not set'}
      </p>
      <p>
        <span className="text-slate-400">Email:</span> {user?.primaryEmailAddress?.emailAddress || 'Not set'}
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onManageAccount}
          className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20"
        >
          Manage Account
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-2 text-red-200 transition hover:border-red-200 hover:bg-red-500/20"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
