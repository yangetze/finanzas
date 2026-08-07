import { useState, useEffect } from 'react'
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
  indexCurrencyId: string | null
  notes: string | null
}

interface PersonalDebtFormInitial {
  direction: PersonalDebtDirection
  description: string
  currencyId: string
  originalAmount: number
  date: string
  isIndexed: boolean
  indexCurrencyId: string | null
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
  const [indexCurrencyId, setIndexCurrencyId] = useState(initialValues?.indexCurrencyId ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [error, setError] = useState('')

  // First time a new debt (no initialValues) is marked as indexed, default
  // the index currency to the debt's own currency — the common case is a
  // debt fixed and indexed in the same currency (e.g. "$18.56, indexed"),
  // payable in anything else at the day's rate. Still changeable, including
  // to a different currency (e.g. a debt recorded in VES indexed to USD).
  useEffect(() => {
    if (!isIndexed || initialValues || indexCurrencyId) return
    setIndexCurrencyId(currencyId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIndexed])

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
    if (isIndexed && !indexCurrencyId) {
      setError('Debe seleccionar una moneda índice')
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
      indexCurrencyId: isIndexed ? indexCurrencyId : null,
      notes: notes.trim() || null,
    })
  }

  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))
  const indexCurrencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))

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
        description="El saldo mantiene su valor frente a una moneda de referencia, sin importar en cuál se pague"
      />

      {isIndexed && (
        <Select
          label="Moneda índice"
          helper="Moneda de referencia a la que esta deuda mantiene su valor (por defecto, la misma de arriba)"
          options={indexCurrencyOptions}
          value={indexCurrencyId}
          onChange={(e) => setIndexCurrencyId(e.target.value)}
          placeholder="Seleccione una moneda"
        />
      )}

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
