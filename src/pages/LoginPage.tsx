import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { signInWithMagicLink } from '@/lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const { error } = await signInWithMagicLink(email.trim())

    if (error) {
      setError('No pudimos enviar el enlace. Intenta de nuevo.')
    } else {
      setSent(true)
    }

    setLoading(false)
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
                disabled={!email.trim()}
                className="w-full"
              >
                {loading ? 'Enviando...' : 'Recibir enlace de acceso →'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
