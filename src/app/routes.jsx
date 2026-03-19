import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoadingScreen from '../components/common/LoadingScreen'
import NotFoundPage from '../components/common/NotFoundPage'
import { ROUTES } from '../utils/constants'
import Login from '../features/auth/Login'
import Signup from '../features/auth/Signup'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import OnboardingPage from '../features/onboarding/OnboardingPage'
import LandingPage from '../features/landing/LandingPage'
import { GuestRoute, OnboardingRoute } from './routeGuards'
import AuthenticatedLayout from '../pages/AuthenticatedLayout'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const History = lazy(() => import('../pages/History'))
const Profile = lazy(() => import('../pages/Profile'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

function LazyPage({ children }) {
  return <Suspense fallback={<LoadingScreen label="Loading page..." />}>{children}</Suspense>
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      {/* Landing page: accessible to everyone */}
      <Route path={ROUTES.root} element={<LandingPage />} />

      {/* Auth routes: login and signup pages */}
      <Route
        path={ROUTES.login}
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path={ROUTES.signup}
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />

      {/* Redirect /auth to login */}
      <Route path={ROUTES.auth} element={<Navigate to={ROUTES.login} replace />} />

      {/* ==================== AUTHENTICATED ROUTES ==================== */}
      {/* Onboarding: only for authenticated but not onboarded users */}
      <Route
        path={ROUTES.onboarding}
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        }
      />

      {/* Main app - protected dashboard, history, profile */}
      <Route
        path={ROUTES.dashboard}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LazyPage><Dashboard /></LazyPage>} />
      </Route>

      <Route
        path={ROUTES.history}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LazyPage><History /></LazyPage>} />
      </Route>

      <Route
        path={ROUTES.profile}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LazyPage><Profile /></LazyPage>} />
      </Route>

      <Route
        path={ROUTES.settings}
        element={
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LazyPage><SettingsPage /></LazyPage>} />
      </Route>

      {/* Legacy route redirects */}
      <Route path={ROUTES.demo} element={<Navigate to={ROUTES.dashboard} replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
