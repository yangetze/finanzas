import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Wallet, Currency } from '@/types'

export interface TransferFormValues {
  date: string
  fromWalletId: string
  toWalletId: string
  fromCurrencyId: string
  toCurrencyId: string
  amountSent: number
  commission: number
  amountReceived: number
  fromWalletName: string
  toWalletName: string
  notes: string | null
}

interface TransferFormProps {
  wallets: Wallet[]
  currencies: Currency[]
  onSubmit: (values: TransferFormValues) => void
  onCancel: () => void
  loading?: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function TransferForm({ wallets, currencies, onSubmit, onCancel, loading }: TransferFormProps) {
  const [date, setDate] = useState(today())
  const [fromWalletId, setFromWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [amountSent, setAmountSent] = useState('')
  const [commission, setCommission] = useState('')
  const [amountReceived, setAmountReceived] = useState('')
  const [receivedTouched, setReceivedTouched] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const walletOptions = [
    { value: '', label: 'Seleccione una billetera' },
    ...wallets.map((w) => ({ value: w.id, label: w.name })),
  ]

  const fromWallet = wallets.find((w) => w.id === fromWalletId)
  const toWallet = wallets.find((w) => w.id === toWalletId)
  const fromCurrency = currencies.find((c) => c.id === fromWallet?.currencyId)
  const toCurrency = currencies.find((c) => c.id === toWallet?.currencyId)

  // Stablecoins are 1:1 with USD, so recibido can be derived when both
  // sides are the same currency or both are stablecoins; otherwise the
  // user enters the amount from the real operation (implicit rate).
  const autoDerivable =
    !!fromCurrency &&
    !!toCurrency &&
    (fromCurrency.id === toCurrency.id ||
      (fromCurrency.type === 'stable' && toCurrency.type === 'stable'))

  function derivedReceived(sent: string, comm: string) {
    if (sent === '') return ''
    const value = Number(sent) - (comm !== '' ? Number(comm) : 0)
    return value > 0 ? String(value) : ''
  }

  function syncReceived(sent: string, comm: string) {
    if (autoDerivable && !receivedTouched) {
      setAmountReceived(derivedReceived(sent, comm))
    }
  }

  function handleFromChange(id: string) {
    setFromWalletId(id)
  }

  function handleToChange(id: string) {
    setToWalletId(id)
    const wallet = wallets.find((w) => w.id === id)
    const currency = currencies.find((c) => c.id === wallet?.currencyId)
    const derivable =
      !!fromCurrency &&
      !!currency &&
      (fromCurrency.id === currency.id ||
        (fromCurrency.type === 'stable' && currency.type === 'stable'))
    if (derivable && !receivedTouched) {
      setAmountReceived(derivedReceived(amountSent, commission))
    } else if (!derivable && !receivedTouched) {
      setAmountReceived('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromWalletId || !toWalletId) {
      setError('Seleccione billetera de origen y destino')
      return
    }
    if (fromWalletId === toWalletId) {
      setError('La billetera de destino debe ser distinta a la de origen')
      return
    }
    const sent = amountSent !== '' ? Number(amountSent) : 0
    if (sent <= 0) {
      setError('El monto enviado debe ser mayor a cero')
      return
    }
    const received = amountReceived !== '' ? Number(amountReceived) : 0
    if (received <= 0) {
      setError('El monto recibido debe ser mayor a cero')
      return
    }
    if (!fromWallet || !toWallet) return
    setError('')
    onSubmit({
      date,
      fromWalletId,
      toWalletId,
      fromCurrencyId: fromWallet.currencyId,
      toCurrencyId: toWallet.currencyId,
      amountSent: sent,
      commission: commission !== '' ? Number(commission) : 0,
      amountReceived: received,
      fromWalletName: fromWallet.name,
      toWalletName: toWallet.name,
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

      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            label="Origen"
            options={walletOptions}
            value={fromWalletId}
            onChange={(e) => handleFromChange(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Select
            label="Destino"
            options={walletOptions}
            value={toWalletId}
            onChange={(e) => handleToChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label={`Monto enviado${fromCurrency ? ` (${fromCurrency.code})` : ''}`}
            id="monto-enviado"
            type="number"
            step="0.01"
            min={0}
            value={amountSent}
            onChange={(e) => {
              setAmountSent(e.target.value)
              syncReceived(e.target.value, commission)
            }}
            placeholder="0.00"
          />
        </div>
        <div className="flex-1">
          <Input
            label={`Comisión${fromCurrency ? ` (${fromCurrency.code})` : ''}`}
            id="comision"
            type="number"
            step="0.01"
            min={0}
            value={commission}
            onChange={(e) => {
              setCommission(e.target.value)
              syncReceived(amountSent, e.target.value)
            }}
            placeholder="0.00"
          />
        </div>
      </div>

      <Input
        label={`Monto recibido${toCurrency ? ` (${toCurrency.code})` : ''}`}
        id="monto-recibido"
        type="number"
        step="0.01"
        min={0}
        value={amountReceived}
        onChange={(e) => {
          setReceivedTouched(true)
          setAmountReceived(e.target.value)
        }}
        placeholder="0.00"
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
          Transferir
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
