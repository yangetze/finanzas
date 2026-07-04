import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { getLatestExchangeRate } from '@/lib/supabase'
import type { Envelope, Wallet, Currency } from '@/types'

const today = () => new Date().toISOString().split('T')[0]

interface TransactionFormValues {
  date: string
  description: string
  status: 'apartado' | 'pagado'
  envelopeId: string | null
  walletId: string | null
  currencyId: string
  amount: number
  originAmount: number
  conversionRate: number | null
  paymentCurrencyId: string | null
  paymentAmount: number
  notes: string | null
}

interface TransactionFormInitial {
  date: string
  description: string
  status: 'apartado' | 'pagado'
  envelopeId: string | null
  walletId: string | null
  currencyId: string
  amount: number
  notes: string | null
}

interface TransactionFormProps {
  envelopes: Envelope[]
  wallets: Wallet[]
  currencies: Currency[]
  multiCurrency?: boolean
  baseCurrencyId?: string
  initialValues?: TransactionFormInitial
  onSubmit: (values: TransactionFormValues) => void
  onCancel: () => void
  loading?: boolean
}

const STATUS_OPTIONS = [
  { value: 'pagado', label: 'Pagado' },
  { value: 'apartado', label: 'Apartado (reservado)' },
]

const NONE = '__none__'

export function TransactionForm({
  envelopes,
  wallets,
  currencies,
  multiCurrency = false,
  baseCurrencyId,
  initialValues,
  onSubmit,
  onCancel,
  loading,
}: TransactionFormProps) {
  const [date, setDate] = useState(initialValues?.date ?? today())
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [status, setStatus] = useState<'apartado' | 'pagado'>(initialValues?.status ?? 'pagado')
  const [envelopeId, setEnvelopeId] = useState(initialValues?.envelopeId ?? NONE)
  const [walletId, setWalletId] = useState(initialValues?.walletId ?? NONE)
  const [currencyId, setCurrencyId] = useState(initialValues?.currencyId ?? (currencies[0]?.id ?? ''))
  const [amount, setAmount] = useState(initialValues?.amount != null ? String(initialValues.amount) : '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [exchangeRate, setExchangeRate] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  const selectedCurrency = currencies.find((c) => c.id === currencyId)
  const isFiatOrigin = multiCurrency && selectedCurrency?.type === 'fiat' && currencyId !== baseCurrencyId

  useEffect(() => {
    if (!isFiatOrigin || !baseCurrencyId) {
      setExchangeRate('')
      return
    }
    getLatestExchangeRate(currencyId, baseCurrencyId).then((rate) => {
      if (rate != null) setExchangeRate(String(rate))
    })
  }, [isFiatOrigin, currencyId, baseCurrencyId])

  const envelopeOptions = [
    { value: NONE, label: 'Sin sobre' },
    ...envelopes.map((e) => ({ value: e.id, label: `${e.emoji ? e.emoji + ' ' : ''}${e.name}` })),
  ]
  const walletOptions = [
    { value: NONE, label: 'Sin billetera' },
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
    const parsedAmount = amount !== '' ? Number(amount) : 0
    const parsedRate = exchangeRate !== '' ? Number(exchangeRate) : null
    const paymentAmount = isFiatOrigin && parsedRate ? parsedAmount / parsedRate : parsedAmount
    onSubmit({
      date,
      description: description.trim(),
      status,
      envelopeId: envelopeId === NONE ? null : envelopeId,
      walletId: walletId === NONE ? null : walletId,
      currencyId,
      amount: parsedAmount,
      originAmount: parsedAmount,
      conversionRate: isFiatOrigin ? parsedRate : null,
      paymentCurrencyId: isFiatOrigin ? (baseCurrencyId ?? null) : null,
      paymentAmount,
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
        placeholder="Ej. Netflix, Mercado, Condominio"
      />

      <Select
        label="Estado"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(e) => setStatus(e.target.value as 'apartado' | 'pagado')}
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
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="w-36">
          <Select
            label="Moneda"
            options={currencyOptions}
            value={currencyId}
            onChange={(e) => setCurrencyId(e.target.value)}
          />
        </div>
      </div>

      {isFiatOrigin && (
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label={`Tasa (${selectedCurrency?.code ?? ''}/${currencies.find((c) => c.id === baseCurrencyId)?.code ?? ''})`}
              type="number"
              step="0.01"
              min={0}
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="0.00"
            />
          </div>
          {exchangeRate && Number(exchangeRate) > 0 && (
            <div className="flex-1 flex flex-col justify-end pb-1">
              <span className="text-xs text-ink-muted font-ui mb-1">Equivale a</span>
              <span className="text-sm font-ui text-ink">
                {(Number(amount || 0) / Number(exchangeRate)).toFixed(2)}{' '}
                {currencies.find((c) => c.id === baseCurrencyId)?.code}
              </span>
            </div>
          )}
        </div>
      )}

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
