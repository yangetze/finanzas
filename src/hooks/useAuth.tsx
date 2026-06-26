import { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, getUserProfile } from '@/lib/supabase'
import { DEMO_PENDING_KEY } from '@/lib/demo'
import type { UserProfile } from '@/types'

interface AuthContextValue {
  session: Session | null
  user: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const profile = await getUserProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          const profile = await getUserProfile(session.user.id)
          const demoPending = localStorage.getItem(DEMO_PENDING_KEY)
          if (demoPending) localStorage.removeItem(DEMO_PENDING_KEY)
          setUser(
            profile && demoPending && !profile.onboardingDone
              ? { ...profile, onboardingDone: true }
              : profile,
          )
        } else {
          setUser(null)
        }
        setLoading(false)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
