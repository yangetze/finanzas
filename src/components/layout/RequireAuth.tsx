import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'

interface RequireAuthProps {
  children: React.ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { session, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (user && !user.onboardingDone) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
