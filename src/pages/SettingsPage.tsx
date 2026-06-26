import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/Toast'
import { getCurrencies, updateUserProfile, signOut } from '@/lib/supabase'

export function SettingsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [baseCurrencyId, setBaseCurrencyId] = useState('')
  const [multiCurrency, setMultiCurrency] = useState(false)
  const [saving, setSaving] = useState(false)

  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: getCurrencies,
  })

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setBaseCurrencyId(user.baseCurrencyId ?? '')
      setMultiCurrency(user.multiCurrency)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const currencyOptions = currencies.map((c) => ({
    value: c.id,
    label: `${c.code} — ${c.name}`,
  }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    const { error } = await updateUserProfile(user.id, {
      name: name.trim() || undefined,
      baseCurrencyId: baseCurrencyId || undefined,
      multiCurrency,
    })

    if (error) {
      showToast('Error al guardar los cambios', 'error')
    } else {
      showToast('Cambios guardados correctamente')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-display italic text-gold mb-6">Configuración</h1>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-ink-muted font-ui uppercase tracking-wider mb-4">
            Tu perfil
          </h2>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Opcional"
            />
            <Input
              label="Correo electrónico"
              value={user?.email ?? ''}
              readOnly
              disabled
              helper="No se puede cambiar"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink-muted font-ui uppercase tracking-wider mb-4">
            Preferencias
          </h2>
          <div className="flex flex-col gap-4">
            <Select
              label="Moneda principal"
              options={currencyOptions}
              value={baseCurrencyId}
              onChange={(e) => setBaseCurrencyId(e.target.value)}
              placeholder="Selecciona una moneda"
            />
            <Toggle
              checked={multiCurrency}
              onChange={setMultiCurrency}
              label="Múltiples monedas"
              description="Actívalo si manejas más de una moneda"
            />
          </div>
        </Card>

        <Button type="submit" loading={saving} className="w-full">
          Guardar cambios
        </Button>
      </form>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink-muted font-ui uppercase tracking-wider mb-4">
          Zona de peligro
        </h2>
        <Button variant="danger" onClick={handleSignOut} className="w-full">
          Cerrar sesión
        </Button>
      </Card>
    </div>
  )
}
