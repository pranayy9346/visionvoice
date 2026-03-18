import './styles.css'
import DemoPage from './frontend/components/DemoPage'
import OnboardingPage from './frontend/components/OnboardingPage'
import SettingsPage from './frontend/components/SettingsPage'

export default function App() {
  const isDemoPage = window.location.pathname === '/demo'
  const isSettingsPage = window.location.pathname === '/settings'

  if (isDemoPage) {
    return <DemoPage />
  }

  if (isSettingsPage) {
    return <SettingsPage />
  }

  return <OnboardingPage />
}
