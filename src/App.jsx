import './styles.css'
import DemoPage from './frontend/components/DemoPage'
import OnboardingPage from './frontend/components/OnboardingPage'
import SettingsPage from './frontend/components/SettingsPage'

export default function App() {
  const hashPath = window.location.hash.replace(/^#/, '') || '/'
  const resolvedPath = hashPath !== '/' ? hashPath : window.location.pathname

  const isDemoPage = resolvedPath === '/demo'
  const isSettingsPage = resolvedPath === '/settings'

  if (isDemoPage) {
    return <DemoPage />
  }

  if (isSettingsPage) {
    return <SettingsPage />
  }

  return <OnboardingPage />
}
