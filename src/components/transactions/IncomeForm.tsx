import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Wallet, Currency } from '@/types'

export interface IncomeFormValues {
  date: string
  description: string
  status: 'pendiente' | 'pagado'
  walletId: string | null
  currencyId: string
  amount: number
  notes: string | null
}

interface IncomeFormInitial {
  date: string
  description: string
  status: 'pendiente' | 'pagado'
  walletId: string | null
  currencyId: string
  amount: number
  notes: string | null
}

interface IncomeFormProps {
  wallets: Wallet[]
  currencies: Currency[]
  initialValues?: IncomeFormInitial
  onSubmit: (values: IncomeFormValues) => void
  onCancel: () => void
  loading?: boolean
}

const STATUS_OPTIONS = [
  { value: 'pagado', label: 'Recibido' },
  { value: 'pendiente', label: 'Pendiente' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function IncomeForm({ wallets, currencies, initialValues, onSubmit, onCancel, loading }: IncomeFormProps) {
  const [date, setDate] = useState(initialValues?.date ?? today())
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [status, setStatus] = useState<'pendiente' | 'pagado'>(initialValues?.status ?? 'pagado')
  const [walletId, setWalletId] = useState<string>(initialValues?.walletId ?? '')
  const [currencyId, setCurrencyId] = useState(initialValues?.currencyId ?? (currencies[0]?.id ?? ''))
  const [amount, setAmount] = useState(initialValues?.amount != null ? String(initialValues.amount) : '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [descriptionError, setDescriptionError] = useState('')

  const walletOptions = [
    { value: '', label: 'Sin billetera' },
    ...wallets.map((w) => ({ value: w.id, label: w.name })),
  ]
  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) {
      setDescriptionError('La descripción es requerida')
      return
    }
    setDescriptionError('')
    onSubmit({
      date,
      description: description.trim(),
      status,
      walletId: walletId !== '' ? walletId : null,
      currencyId,
      amount: amount !== '' ? Number(amount) : 0,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Fecha"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <Input
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={descriptionError}
        placeholder="Ej. Salario, Freelance, Aguinaldo"
      />

      <Select
        label="Estado"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => setStatus(e.target.value as 'pendiente' | 'pagado')}
      />

      <Select
        label="Billetera"
        options={walletOptions}
        value={walletId}
        onChange={(e) => setWalletId(e.target.value)}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="w-32">
          <Select
            label="Moneda"
            options={currencyOptions}
            value={currencyId}
            onChange={(e) => setCurrencyId(e.target.value)}
          />
        </div>
      </div>

      <Input
        label="Notas"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Opcional"
      />

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Guardar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
