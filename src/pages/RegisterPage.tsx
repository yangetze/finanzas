import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { getCurrencies, signInWithMagicLink } from '@/lib/supabase'

const SIGNUP_DATA_KEY = 'sobres_signup_data'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [baseCurrencyId, setBaseCurrencyId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !baseCurrencyId) return

    setLoading(true)
    setError(null)

    localStorage.setItem(
      SIGNUP_DATA_KEY,
      JSON.stringify({ name: name.trim() || null, baseCurrencyId }),
    )

    const { error: authError } = await signInWithMagicLink(email.trim())

    if (authError) {
      localStorage.removeItem(SIGNUP_DATA_KEY)
      setError('No pudimos enviar el enlace. Intenta de nuevo.')
      setLoading(false)
      return
    }

    setSent(true)
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
                Haz clic en el enlace para crear tu cuenta. No necesitas contraseña.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-medium text-ink font-ui mb-1">Crear cuenta</h2>
                <p className="text-sm text-ink-muted font-ui">
                  Configura tu perfil y empieza en segundos.
                </p>
              </div>

              <Input
                label="Nombre (opcional)"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                autoFocus
              />

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="baseCurrency"
                  className="text-sm font-medium text-ink-muted font-ui"
                >
                  Moneda principal
                </label>
                <select
                  id="baseCurrency"
                  value={baseCurrencyId}
                  onChange={(e) => setBaseCurrencyId(e.target.value)}
                  required
                  className="bg-canvas-muted border border-border rounded-lg px-3 py-2 text-ink font-ui text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold"
                >
                  <option value="">Selecciona tu moneda...</option>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                error={error ?? undefined}
              />

              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={!email.trim() || !baseCurrencyId}
                className="w-full"
              >
                {loading ? 'Enviando...' : 'Crear cuenta →'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-ink-faint font-ui mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-gold hover:text-gold/80 transition-colors">
            Acceder
          </Link>
        </p>
      </div>
    </div>
  )
}
