import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Spinner'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
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
