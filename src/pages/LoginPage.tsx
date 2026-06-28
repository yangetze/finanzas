import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { signInWithMagicLink } from '@/lib/supabase'
import { signInAsDemo, DEMO_PENDING_KEY } from '@/lib/demo'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const { error: authError } = await signInWithMagicLink(email.trim())

    if (authError) {
      setError('No pudimos enviar el enlace. Intenta de nuevo.')
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError(null)
    localStorage.setItem(DEMO_PENDING_KEY, 'true')

    const { error: authError } = await signInAsDemo()

    if (authError) {
      console.error('[demo] login failed in LoginPage:', authError)
      localStorage.removeItem(DEMO_PENDING_KEY)
      setError(`No se pudo acceder al demo. ${authError.message}`)
      setDemoLoading(false)
    }
    // On success: onAuthStateChange in useAuth handles redirect
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display italic text-5xl text-gold mb-2">sobres.</h1>
          <p className="text-ink-muted text-sm font-ui">Finanzas personales</p>
        </div>

        <Card>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-sage/20 border border-sage/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-lg font-medium text-ink font-ui mb-2">
                Revisa tu correo
              </h2>
              <p className="text-sm text-ink-muted font-ui mb-1">
                Enviamos un enlace de acceso a:
              </p>
              <p className="text-sm font-mono text-gold">{email}</p>
              <p className="text-xs text-ink-faint font-ui mt-4">
                Haz clic en el enlace para entrar. No necesitas contraseña.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-medium text-ink font-ui mb-1">Acceder</h2>
                  <p className="text-sm text-ink-muted font-ui">
                    Te enviamos un enlace mágico, sin contraseña.
                  </p>
                </div>

                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  autoFocus
                  error={error ?? undefined}
                />

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  disabled={!email.trim() || demoLoading}
                  className="w-full"
                >
                  {loading ? 'Enviando...' : 'Recibir enlace de acceso →'}
                </Button>
              </form>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-ink-faint font-ui">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="lg"
                loading={demoLoading}
                disabled={loading || demoLoading}
                onClick={handleDemoLogin}
                className="w-full border border-border"
              >
                {demoLoading ? 'Cargando demo...' : 'Ver demo →'}
              </Button>
            </div>
          )}
        </Card>

        {!sent && (
          <p className="text-center text-sm text-ink-faint font-ui mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-gold hover:text-gold/80 transition-colors">
              Crear cuenta →
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
