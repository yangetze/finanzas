import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { BudgetItem, Envelope, Currency, Wallet } from '@/types'

interface BudgetFormValues {
  name: string
  envelopeId: string
  currencyId: string
  baseAmount: number
  paymentCurrencyId: string | null
  referenceRate: number | null
  frequency: BudgetItem['frequency']
  spendingType: BudgetItem['spendingType']
  walletId: string | null
  paymentDay: number | null
  notes: string | null
}

interface BudgetFormInitial {
  name: string
  envelopeId: string
  currencyId: string
  baseAmount: number
  paymentCurrencyId: string | null
  referenceRate: number | null
  frequency: BudgetItem['frequency']
  spendingType: BudgetItem['spendingType']
  walletId: string | null
  paymentDay: number | null
  notes: string | null
}

interface BudgetFormProps {
  envelopes: Envelope[]
  currencies: Currency[]
  wallets: Wallet[]
  multiCurrency?: boolean
  initialValues?: BudgetFormInitial
  onSubmit: (values: BudgetFormValues) => void
  onCancel: () => void
  loading?: boolean
}

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
]

const SPENDING_TYPE_OPTIONS = [
  { value: 'supervivencia', label: 'Supervivencia — crítico' },
  { value: 'flexible', label: 'Flexible — importante' },
  { value: 'crecimiento', label: 'Crecimiento — opcional' },
]

export function BudgetForm({ envelopes, currencies, wallets, multiCurrency, initialValues, onSubmit, onCancel, loading }: BudgetFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [envelopeId, setEnvelopeId] = useState(initialValues?.envelopeId ?? (envelopes[0]?.id ?? ''))
  const [currencyId, setCurrencyId] = useState(initialValues?.currencyId ?? (currencies[0]?.id ?? ''))
  const [baseAmount, setBaseAmount] = useState(initialValues?.baseAmount != null ? String(initialValues.baseAmount) : '')
  const [paymentCurrencyId, setPaymentCurrencyId] = useState<string>(initialValues?.paymentCurrencyId ?? '')
  const [referenceRate, setReferenceRate] = useState(initialValues?.referenceRate != null ? String(initialValues.referenceRate) : '')
  const [frequency, setFrequency] = useState<BudgetItem['frequency']>(initialValues?.frequency ?? 'monthly')
  const [spendingType, setSpendingType] = useState<BudgetItem['spendingType']>(initialValues?.spendingType ?? 'supervivencia')
  const [walletId, setWalletId] = useState<string>(initialValues?.walletId ?? '')
  const [paymentDay, setPaymentDay] = useState(initialValues?.paymentDay != null ? String(initialValues.paymentDay) : '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [nameError, setNameError] = useState('')

  const envelopeOptions = envelopes.map((e) => ({
    value: e.id,
    label: `${e.emoji ? e.emoji + ' ' : ''}${e.name}`,
  }))
  const currencyOptions = currencies.map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` }))
  const paymentCurrencyOptions = [
    { value: '', label: 'Misma que presupuesto' },
    ...currencies.filter((c) => c.type === 'fiat').map((c) => ({ value: c.id, label: `${c.code} — ${c.name}` })),
  ]
  const walletOptions = [
    { value: '', label: 'Sin billetera predeterminada' },
    ...wallets.map((w) => ({ value: w.id, label: w.name })),
  ]

  const showReferenceRate = multiCurrency && paymentCurrencyId !== '' && paymentCurrencyId !== currencyId

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('El nombre es requerido')
      return
    }
    setNameError('')
    onSubmit({
      name: name.trim(),
      envelopeId,
      currencyId,
      baseAmount: baseAmount !== '' ? Number(baseAmount) : 0,
      paymentCurrencyId: paymentCurrencyId !== '' ? paymentCurrencyId : null,
      referenceRate: showReferenceRate && referenceRate !== '' ? Number(referenceRate) : null,
      frequency,
      spendingType,
      walletId: walletId !== '' ? walletId : null,
      paymentDay: paymentDay !== '' ? Number(paymentDay) : null,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError}
        placeholder="Ej. Inter, Netflix, Mercado"
      />

      <Select
        label="Sobre"
        options={envelopeOptions}
        value={envelopeId}
        onChange={(e) => setEnvelopeId(e.target.value)}
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
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
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

      {multiCurrency && (
        <Select
          label="Moneda de pago"
          options={paymentCurrencyOptions}
          value={paymentCurrencyId}
          onChange={(e) => setPaymentCurrencyId(e.target.value)}
        />
      )}

      {showReferenceRate && (
        <Input
          label="Tasa de referencia"
          type="number"
          step="0.01"
          min={0}
          value={referenceRate}
          onChange={(e) => setReferenceRate(e.target.value)}
          placeholder="Ej. 36.5"
        />
      )}

      <Select
        label="Tipo de gasto"
        options={SPENDING_TYPE_OPTIONS}
        value={spendingType}
        onChange={(e) => setSpendingType(e.target.value as BudgetItem['spendingType'])}
      />

      <Select
        label="Frecuencia"
        options={FREQUENCY_OPTIONS}
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as BudgetItem['frequency'])}
      />

      <Input
        label="Día de pago"
        type="number"
        min={1}
        max={31}
        value={paymentDay}
        onChange={(e) => setPaymentDay(e.target.value)}
        placeholder="Ej. 15"
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
