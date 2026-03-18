import './styles.css'
import DemoPage from './frontend/components/DemoPage'
import OnboardingPage from './frontend/components/OnboardingPage'

export default function App() {
  const isDemoPage = window.location.pathname === '/demo'

  if (isDemoPage) {
    return <DemoPage />
  }

  return <OnboardingPage />
}
