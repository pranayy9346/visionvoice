import { createContext, useEffect, useMemo, useState } from 'react'
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react'
import {
  getUserProfile,
  setActiveUserId,
  syncAuthenticatedUser,
} from '../services/apiService'

const INITIAL_PROFILE = {
  onboarded: false,
  name: '',
  email: '',
  useCase: '',
  preferences: null,
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn } = useClerkAuth()
  const { user } = useClerkUser()
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [profile, setProfile] = useState(INITIAL_PROFILE)

  useEffect(() => {
    let mounted = true

    const syncProfile = async () => {
      if (!isLoaded) {
        return
      }

      if (!isSignedIn || !user?.id) {
        setActiveUserId(null)
        if (mounted) {
          setProfile(INITIAL_PROFILE)
          setProfileError('')
          setIsProfileLoading(false)
        }
        return
      }

      setIsProfileLoading(true)
      setProfileError('')
      setActiveUserId(user.id)

      try {
        await syncAuthenticatedUser({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          name: user.fullName || user.firstName || '',
        })

        const persisted = await getUserProfile({ userId: user.id })
        if (!mounted) {
          return
        }

        setProfile({
          onboarded: persisted?.onboarded === true,
          name: persisted?.name || user.fullName || user.firstName || '',
          email: persisted?.email || user.primaryEmailAddress?.emailAddress || '',
          useCase: persisted?.useCase || '',
          preferences: persisted?.preferences || null,
        })
      } catch (error) {
        if (!mounted) {
          return
        }

        setProfileError(error?.message || 'Failed to sync user profile.')
        setProfile((previous) => ({
          ...previous,
          name: user.fullName || user.firstName || previous.name,
          email: user.primaryEmailAddress?.emailAddress || previous.email,
        }))
      } finally {
        if (mounted) {
          setIsProfileLoading(false)
        }
      }
    }

    syncProfile()

    return () => {
      mounted = false
    }
  }, [isLoaded, isSignedIn, user])

  const value = useMemo(
    () => ({
      isLoaded,
      isSignedIn,
      user,
      isProfileLoading,
      profileError,
      profile,
      setProfile,
    }),
    [isLoaded, isProfileLoading, isSignedIn, profile, profileError, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
