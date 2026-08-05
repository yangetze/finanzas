import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import type { Currency, PersonalDebtDirection } from '@/types'

interface PersonalDebtFormValues {
  direction: PersonalDebtDirection
  description: string
  currencyId: string
  originalAmount: number
  date: string
  isIndexed: boolean
  notes: string | null
}

interface PersonalDebtFormInitial {
  direction: PersonalDebtDirection
  description: string
  currencyId: string
  originalAmount: number
  date: string
  isIndexed: boolean
  notes: string | null
}

interface PersonalDebtFormProps {
  currencies: Currency[]
  initialValues?: PersonalDebtFormInitial
  onSubmit: (values: PersonalDebtFormValues) => void
  onCancel: () => void
  loading?: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const DIRECTION_OPTIONS = [
  { value: 'they_owe_me', label: 'Me deben' },
  { value: 'i_owe_them', label: 'Le debo' },
]

export function PersonalDebtForm({ currencies, initialValues, onSubmit, onCancel, loading }: PersonalDebtFormProps) {
  const [direction, setDirection] = useState<PersonalDebtDirection>(initialValues?.direction ?? 'they_owe_me')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [currencyId, setCurrencyId] = useState(initialValues?.currencyId ?? (currencies[0]?.id ?? ''))
  const [originalAmount, setOriginalAmount] = useState<string>(
    initialValues?.originalAmount != null ? String(initialValues.originalAmount) : '',
  )
  const [date, setDate] = useState(initialValues?.date ?? today())
  const [isIndexed, setIsIndexed] = useState(initialValues?.isIndexed ?? false)
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) {
      setError('La descripción es requerida')
      return
    }
    const amount = originalAmount !== '' ? Number(originalAmount) : 0
    if (amount <= 0) {
      setError('El monto debe ser mayor a cero')
      return
    }
    setError('')
    onSubmit({
      direction,
      description: description.trim(),
      currencyId,
      originalAmount: amount,
      date,
      isIndexed,
      notes: notes.trim() || null,
    })
  }

  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Dirección"
        options={DIRECTION_OPTIONS}
        value={direction}
        onChange={(e) => setDirection(e.target.value as PersonalDebtDirection)}
      />

      <Input
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ej. Cena del viernes"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            label="Moneda"
            options={currencyOptions}
            value={currencyId}
            onChange={(e) => setCurrencyId(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Monto"
            type="number"
            step="0.01"
            min={0}
            value={originalAmount}
            onChange={(e) => setOriginalAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <Toggle
        checked={isIndexed}
        onChange={setIsIndexed}
        label="Deuda indexada"
        description="El monto queda anclado a esta moneda, pero se puede pagar en otra a la tasa del día"
      />

      <Input
        label="Notas"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Opcional"
      />

      {error && <p className="text-xs text-coral font-ui">{error}</p>}

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
