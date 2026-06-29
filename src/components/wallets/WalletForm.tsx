import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Currency, WalletType } from '@/types'

interface WalletFormValues {
  name: string
  currencyId: string
  type: WalletType
  creditLimit: number | null
  balance: number
  notes: string | null
}

interface WalletFormInitial {
  id?: string
  name: string
  currencyId: string
  type: WalletType
  creditLimit: number | null
  balance: number
  notes: string | null
}

interface WalletFormProps {
  currencies: Currency[]
  initialValues?: WalletFormInitial
  onSubmit: (values: WalletFormValues) => void
  onCancel: () => void
  loading?: boolean
}

export function WalletForm({ currencies, initialValues, onSubmit, onCancel, loading }: WalletFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [currencyId, setCurrencyId] = useState(initialValues?.currencyId ?? (currencies[0]?.id ?? ''))
  const [type, setType] = useState<WalletType>(initialValues?.type ?? 'asset')
  const [creditLimit, setCreditLimit] = useState<string>(
    initialValues?.creditLimit != null ? String(initialValues.creditLimit) : '',
  )
  const [balance, setBalance] = useState<string>(
    initialValues?.balance != null ? String(initialValues.balance) : '0',
  )
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [nameError, setNameError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('El nombre es requerido')
      return
    }
    setNameError('')
    onSubmit({
      name: name.trim(),
      currencyId,
      type,
      creditLimit: type === 'credit' && creditLimit !== '' ? Number(creditLimit) : null,
      balance: balance !== '' ? Number(balance) : 0,
      notes: notes.trim() || null,
    })
  }

  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))
  const typeOptions = [
    { value: 'asset', label: 'Activo' },
    { value: 'credit', label: 'Crédito' },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError}
        placeholder="Ej. Binance, Efectivo, Visa"
      />

      <Select
        label="Moneda"
        options={currencyOptions}
        value={currencyId}
        onChange={(e) => setCurrencyId(e.target.value)}
      />

      <Select
        label="Tipo"
        options={typeOptions}
        value={type}
        onChange={(e) => setType(e.target.value as WalletType)}
      />

      {type === 'credit' && (
        <Input
          label="Límite de crédito"
          type="number"
          min={0}
          step="0.01"
          value={creditLimit}
          onChange={(e) => setCreditLimit(e.target.value)}
          placeholder="0.00"
        />
      )}

      <Input
        label="Saldo inicial"
        type="number"
        step="0.01"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="0.00"
      />

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
