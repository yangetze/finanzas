import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { getCurrencies, updateUserProfile } from '@/lib/supabase'

const TOTAL_STEPS = 3

export function OnboardingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [baseCurrencyId, setBaseCurrencyId] = useState('')
  const [multiCurrency, setMultiCurrency] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies,
  })

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user])

  const currencyOptions = currencies.map((c) => ({
    value: c.id,
    label: `${c.code} — ${c.name}`,
  }))

  const canProceed = step === 1 || (step === 2 && baseCurrencyId !== '') || step === 3

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true)

    await updateUserProfile(user.id, {
      name: name.trim() || undefined,
      baseCurrencyId,
      multiCurrency,
      onboardingDone: true,
    })

    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display italic text-5xl text-gold mb-2">sobres.</h1>
          <p className="text-ink-muted text-sm font-ui">Configuremos tu cuenta</p>
        </div>

        <Card>
          <div className="flex flex-col gap-6">
            <StepIndicator current={step} total={TOTAL_STEPS} />

            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-medium text-ink font-ui mb-1">
                    ¿Cómo quieres que te llamemos?
                  </h2>
                  <p className="text-sm text-ink-faint font-ui">
                    Puedes cambiarlo después
                  </p>
                </div>
                <Input
                  label="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Opcional"
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-medium text-ink font-ui mb-1">
                    ¿Cuál es tu moneda principal?
                  </h2>
                  <p className="text-sm text-ink-faint font-ui">
                    Todos los reportes usarán esta moneda como base
                  </p>
                </div>
                <Select
                  label="Moneda principal"
                  options={currencyOptions}
                  value={baseCurrencyId}
                  onChange={(e) => setBaseCurrencyId(e.target.value)}
                  placeholder="Selecciona una moneda"
                  required
                />
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-medium text-ink font-ui mb-1">
                    ¿Manejas más de una moneda?
                  </h2>
                </div>
                <Toggle
                  checked={multiCurrency}
                  onChange={setMultiCurrency}
                  label="Múltiples monedas"
                  description="Actívalo si pagas en diferentes monedas (ej: bolívares y dólares)"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={step === 1}
              >
                Atrás
              </Button>

              {step < TOTAL_STEPS ? (
                <Button size="sm" onClick={handleNext} disabled={!canProceed}>
                  Siguiente →
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  loading={saving}
                  disabled={!canProceed}
                >
                  Empezar →
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
