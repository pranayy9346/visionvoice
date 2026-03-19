import { Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import { UserButton } from '@clerk/clerk-react'

export default function AuthenticatedLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.2),transparent_42%),linear-gradient(160deg,#020617_0%,#0b1120_48%,#060d1b_100%)]">
      <AppHeader rightContent={<UserButton afterSignOutUrl="/" />} />
      <div className="onboarding-app">
        <div className="onboarding-layout">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
