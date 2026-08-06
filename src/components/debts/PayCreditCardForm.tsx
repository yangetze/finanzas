import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getLatestExchangeRate } from '@/lib/supabase'
import { formatCurrency, calcBaseAmount } from '@/lib/utils'
import type { Wallet, Currency } from '@/types'

interface PayCreditCardFormValues {
  walletId: string
  amount: number
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: number | null
}

interface PayCreditCardFormProps {
  wallets: Wallet[]
  currencies: Currency[]
  currency: Currency
  outstanding: number
  onSubmit: (values: PayCreditCardFormValues) => void
  onCancel: () => void
  loading?: boolean
}

export function PayCreditCardForm({
  wallets,
  currencies,
  currency,
  outstanding,
  onSubmit,
  onCancel,
  loading,
}: PayCreditCardFormProps) {
  const [walletId, setWalletId] = useState('')
  const [amount, setAmount] = useState(String(outstanding))
  const [paymentAmount, setPaymentAmount] = useState('')
  const [rate, setRate] = useState('')
  const [error, setError] = useState('')

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const walletCurrency = currencies.find((c) => c.id === selectedWallet?.currencyId)
  const needsConversion = !!walletCurrency && walletCurrency.id !== currency.id

  useEffect(() => {
    if (!needsConversion || !walletCurrency) {
      setRate('')
      return
    }
    getLatestExchangeRate(walletCurrency.id, currency.id).then((r) => {
      if (r != null) {
        setRate(String(r))
        setPaymentAmount(String(outstanding * r))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsConversion, walletCurrency?.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!walletId) {
      setError('Debe seleccionar una billetera')
      return
    }

    let debtAmount: number
    let payAmount: number
    let payCurrencyId: string
    let conversionRate: number | null

    if (needsConversion && walletCurrency) {
      const parsedRate = rate !== '' ? Number(rate) : 0
      payAmount = paymentAmount !== '' ? Number(paymentAmount) : 0
      if (parsedRate <= 0) {
        setError('La tasa debe ser mayor a cero')
        return
      }
      if (payAmount <= 0) {
        setError('El monto debe ser mayor a cero')
        return
      }
      debtAmount = calcBaseAmount(payAmount, parsedRate)
      payCurrencyId = walletCurrency.id
      conversionRate = parsedRate
    } else {
      debtAmount = amount !== '' ? Number(amount) : 0
      if (debtAmount <= 0) {
        setError('El monto debe ser mayor a cero')
        return
      }
      payAmount = debtAmount
      payCurrencyId = currency.id
      conversionRate = null
    }

    if (debtAmount > outstanding) {
      setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(outstanding, currency.symbol)})`)
      return
    }

    setError('')
    onSubmit({
      walletId,
      amount: debtAmount,
      paymentCurrencyId: payCurrencyId,
      paymentAmount: payAmount,
      conversionRate,
    })
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

      {needsConversion && walletCurrency ? (
        <>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label={`Monto a pagar (${walletCurrency.code})`}
                type="number"
                step="0.01"
                min={0}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="flex-1">
              <Input
                label={`Tasa (${walletCurrency.code}/${currency.code})`}
                type="number"
                step="0.00000001"
                min={0}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          {rate !== '' && Number(rate) > 0 && paymentAmount !== '' && (
            <p className="text-xs font-ui text-ink-faint">
              ≈ {formatCurrency(calcBaseAmount(Number(paymentAmount), Number(rate)), currency.symbol)}
            </p>
          )}
        </>
      ) : (
        <Input
          label={`Monto (${currency.code})`}
          type="number"
          step="0.01"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />
      )}

      {error && <p className="text-xs text-coral font-ui">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Pagar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
