import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, updateUserProfile } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'

const SIGNUP_DATA_KEY = 'sobres_signup_data'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const raw = localStorage.getItem(SIGNUP_DATA_KEY)
        if (raw) {
          localStorage.removeItem(SIGNUP_DATA_KEY)
          try {
            const { name, baseCurrencyId } = JSON.parse(raw) as {
              name: string | null
              baseCurrencyId: string
            }
            await updateUserProfile(session.user.id, {
              ...(name ? { name } : {}),
              baseCurrencyId,
              onboardingDone: true,
            })
          } catch {
            // ignore malformed data
          }
        }
        navigate('/', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-ink-muted font-ui text-sm">Iniciando sesión...</p>
      </div>
    </div>
  )
}
