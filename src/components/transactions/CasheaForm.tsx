import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Envelope, Wallet, Currency } from '@/types'

const NONE = '__none__'

interface CasheaTransaction {
  date: string
  description: string
  type: 'expense'
  status: 'apartado'
  envelopeId: string | null
  walletId: string | null
  originCurrencyId: string
  originAmount: number
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: null
  baseCurrencyId: string
  baseAmount: number
  baseRate: null
  installmentNumber: number
  installmentTotal: number
  groupId: string
  notes: string | null
}

interface CasheaFormProps {
  envelopes: Envelope[]
  wallets: Wallet[]
  currencies: Currency[]
  onSubmit: (transactions: CasheaTransaction[]) => void
  onCancel: () => void
  loading?: boolean
  baseCurrencyId?: string
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  return d.toISOString().split('T')[0]
}

function randomGroupId() {
  return crypto.randomUUID()
}

export function CasheaForm({ envelopes, wallets, currencies, onSubmit, onCancel, loading, baseCurrencyId }: CasheaFormProps) {
  const [description, setDescription] = useState('')
  const [total, setTotal] = useState('')
  const [installments, setInstallments] = useState('12')
  const [startDate, setStartDate] = useState(today())
  const [envelopeId, setEnvelopeId] = useState(NONE)
  const [walletId, setWalletId] = useState(NONE)
  const [currencyId, setCurrencyId] = useState(currencies[0]?.id ?? '')
  const [notes, setNotes] = useState('')
  const [descError, setDescError] = useState('')

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
      setDescError('La descripción es requerida')
      return
    }
    setDescError('')
    const n = Math.max(1, Math.min(60, parseInt(installments) || 1))
    const totalAmount = parseFloat(total) || 0
    const installmentAmount = Math.round((totalAmount / n) * 100) / 100
    const baseCcy = baseCurrencyId ?? currencyId
    const groupId = randomGroupId()

    const txs: CasheaTransaction[] = Array.from({ length: n }, (_, i) => ({
      date: addMonths(startDate, i),
      description: `${description.trim()} (${i + 1}/${n})`,
      type: 'expense',
      status: 'apartado',
      envelopeId: envelopeId === NONE ? null : envelopeId,
      walletId: walletId === NONE ? null : walletId,
      originCurrencyId: currencyId,
      originAmount: installmentAmount,
      paymentCurrencyId: currencyId,
      paymentAmount: installmentAmount,
      conversionRate: null,
      baseCurrencyId: baseCcy,
      baseAmount: installmentAmount,
      baseRate: null,
      installmentNumber: i + 1,
      installmentTotal: n,
      groupId,
      notes: notes.trim() || null,
    }))
    onSubmit(txs)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={descError}
        placeholder="Ej. Camisa Zara, iPhone 15"
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="Monto total"
            type="number"
            step="0.01"
            min={0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
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

      <div className="flex gap-3">
        <div className="w-28">
          <Input
            label="Cuotas"
            type="number"
            min={1}
            max={60}
            value={installments}
            onChange={(e) => setInstallments(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Primera cuota"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

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
