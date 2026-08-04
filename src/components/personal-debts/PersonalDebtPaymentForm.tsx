import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Wallet, Currency } from '@/types'

interface PersonalDebtPaymentFormValues {
  walletId: string
  amount: number
  date: string
  notes: string | null
}

interface PersonalDebtPaymentFormProps {
  wallets: Wallet[]
  currency: Currency
  outstanding: number
  onSubmit: (values: PersonalDebtPaymentFormValues) => void
  onCancel: () => void
  loading?: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function PersonalDebtPaymentForm({
  wallets,
  currency,
  outstanding,
  onSubmit,
  onCancel,
  loading,
}: PersonalDebtPaymentFormProps) {
  const [walletId, setWalletId] = useState('')
  const [amount, setAmount] = useState(String(outstanding))
  const [date, setDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!walletId) {
      setError('Debe seleccionar una billetera')
      return
    }
    const value = amount !== '' ? Number(amount) : 0
    if (value <= 0) {
      setError('El monto debe ser mayor a cero')
      return
    }
    if (value > outstanding) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(outstanding, currency.symbol)})`)
      return
    }
    setError('')
    onSubmit({ walletId, amount: value, date, notes: notes.trim() || null })
  }

  const walletOptions = [
    { value: '', label: 'Seleccione una billetera' },
    ...wallets.map((w) => ({ value: w.id, label: w.name })),
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-xs font-ui text-ink-faint">
        Saldo pendiente: {formatCurrency(outstanding, currency.symbol)}
      </p>

      <Select
        label="Billetera"
        options={walletOptions}
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
      />

      <Input
        label={`Monto (${currency.code})`}
        type="number"
        step="0.01"
        min={0}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
      />

      <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <Input
        label="Notas"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Opcional"
      />

      {error && <p className="text-xs text-coral font-ui">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Registrar pago
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
