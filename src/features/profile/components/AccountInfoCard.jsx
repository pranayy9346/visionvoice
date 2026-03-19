export default function AccountInfoCard({ user }) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200/10 bg-slate-900/40 p-6">
      <h3 className="text-lg font-semibold text-slate-100">Account Information</h3>
      <div>
        <p className="text-sm text-slate-400">Email</p>
        <p className="text-slate-200">{user?.primaryEmailAddress?.emailAddress || 'Not set'}</p>
      </div>
      <div>
        <p className="text-sm text-slate-400">Name</p>
        <p className="text-slate-200">{user?.fullName || 'Not set'}</p>
      </div>
    </div>
  )
}
