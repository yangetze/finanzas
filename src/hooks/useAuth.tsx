import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, getUserProfile } from '@/lib/supabase'
import { DEMO_PENDING_KEY } from '@/lib/demo'
import type { UserProfile } from '@/types'

interface AuthContextValue {
  session: Session | null
  user: UserProfile | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const loadedUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const profile = await getUserProfile(session.user.id)
        loadedUserIdRef.current = profile?.id ?? null
        setUser(profile)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (!session?.user) {
          loadedUserIdRef.current = null
          setUser(null)
          setLoading(false)
          return
        }
        // Token refresh on tab refocus fires this for the already-loaded
        // user; skip the redundant profile fetch.
        if (loadedUserIdRef.current === session.user.id) {
          setLoading(false)
          return
        }
        const userId = session.user.id
        // supabase-js holds an internal auth lock while dispatching this
        // callback; awaiting another Supabase call here deadlocks and the
        // app hangs on a spinner until reload. Defer to a macrotask.
        setTimeout(async () => {
          const profile = await getUserProfile(userId)
          const demoPending = localStorage.getItem(DEMO_PENDING_KEY)
          if (demoPending) localStorage.removeItem(DEMO_PENDING_KEY)
          loadedUserIdRef.current = profile?.id ?? null
          setUser(
            profile && demoPending && !profile.onboardingDone
              ? { ...profile, onboardingDone: true }
              : profile,
          )
          setLoading(false)
        }, 0)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function refreshUser() {
    const { data: { session: current } } = await supabase.auth.getSession()
    if (current?.user) {
      const profile = await getUserProfile(current.user.id)
      loadedUserIdRef.current = profile?.id ?? null
      setUser(profile)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
