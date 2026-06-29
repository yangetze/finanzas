import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Currency } from '@/types'

interface RateFormValues {
  fromCurrencyId: string
  toCurrencyId: string
  rate: number
  rateDate: string
  source: string | null
}

interface RateFormInitial {
  fromCurrencyId: string
  toCurrencyId: string
  rate: number
  rateDate: string
  source: string | null
}

interface RateFormProps {
  currencies: Currency[]
  initialValues?: RateFormInitial
  onSubmit: (values: RateFormValues) => void
  onCancel: () => void
  loading?: boolean
}

export function RateForm({ currencies, initialValues, onSubmit, onCancel, loading }: RateFormProps) {
  const [fromCurrencyId, setFromCurrencyId] = useState(initialValues?.fromCurrencyId ?? (currencies[0]?.id ?? ''))
  const [toCurrencyId, setToCurrencyId] = useState(initialValues?.toCurrencyId ?? (currencies[1]?.id ?? currencies[0]?.id ?? ''))
  const [rate, setRate] = useState(initialValues?.rate != null ? String(initialValues.rate) : '')
  const [rateDate, setRateDate] = useState(initialValues?.rateDate ?? new Date().toISOString().slice(0, 10))
  const [source, setSource] = useState(initialValues?.source ?? '')
  const [rateError, setRateError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rate || isNaN(Number(rate)) || Number(rate) <= 0) {
      setRateError('La tasa es requerida y debe ser mayor a 0')
      return
    }
    setRateError('')
    onSubmit({
      fromCurrencyId,
      toCurrencyId,
      rate: Number(rate),
      rateDate,
      source: source.trim() || null,
    })
  }

  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Desde"
        options={currencyOptions}
        value={fromCurrencyId}
        onChange={(e) => setFromCurrencyId(e.target.value)}
      />

      <Select
        label="Hacia"
        options={currencyOptions}
        value={toCurrencyId}
        onChange={(e) => setToCurrencyId(e.target.value)}
      />

      <Input
        label="Tasa"
        type="number"
        step="any"
        min={0}
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        error={rateError}
        placeholder="0.00"
      />

      <Input
        label="Fecha"
        type="date"
        value={rateDate}
        onChange={(e) => setRateDate(e.target.value)}
      />

      <Input
        label="Fuente"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder="BCV, manual, etc."
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
