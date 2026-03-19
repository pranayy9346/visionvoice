import { Navigate, Outlet } from 'react-router-dom'
import LoadingScreen from '../../components/common/LoadingScreen'
import useAuth from '../../hooks/useAuth'
import { ROUTES } from '../../utils/constants'

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, isProfileLoading, profile } = useAuth()

  if (!isLoaded) {
    return <LoadingScreen label="Checking session..." />
  }

  if (!isSignedIn) {
    return <Navigate to={ROUTES.login} replace />
  }

  if (isProfileLoading) {
    return <LoadingScreen label="Loading your profile..." />
  }

  if (!profile?.onboarded) {
    return <Navigate to={ROUTES.onboarding} replace />
  }

  return children || <Outlet />
}
