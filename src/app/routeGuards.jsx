import { Navigate } from 'react-router-dom'
import LoadingScreen from '../components/common/LoadingScreen'
import useAuth from '../hooks/useAuth'
import { ROUTES, APP_TEXT } from '../utils/constants'

export function GuestRoute({ children }) {
  const { isLoaded, isSignedIn, isProfileLoading, profile } = useAuth()

  if (!isLoaded) {
    return <LoadingScreen label={APP_TEXT.loadingSession} />
  }

  if (isSignedIn) {
    if (isProfileLoading) {
      return <LoadingScreen label={APP_TEXT.loadingProfile} />
    }

    return <Navigate to={profile?.onboarded ? ROUTES.dashboard : ROUTES.onboarding} replace />
  }

  return children
}

export function OnboardingRoute({ children }) {
  const { isLoaded, isSignedIn, isProfileLoading, profile } = useAuth()

  if (!isLoaded) {
    return <LoadingScreen label={APP_TEXT.loadingSession} />
  }

  if (!isSignedIn) {
    return <Navigate to={ROUTES.login} replace />
  }

  if (isProfileLoading) {
    return <LoadingScreen label={APP_TEXT.loadingOnboarding} />
  }

  if (profile?.onboarded) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  return children
}
