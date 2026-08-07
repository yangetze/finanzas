import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { statusForOutstanding } from '@/lib/personalDebtTotals'
import { formatCurrencyWithCode } from '@/lib/utils'
import type { Currency, PersonalDebt } from '@/types'

type DebtWithOutstanding = PersonalDebt & { outstanding: number }

export interface PersonalDebtOffsetFormValues {
  theyOweMeDebtId: string
  iOweThemDebtId: string
  amount: number
  currencyId: string
  date: string
}

interface PersonalDebtOffsetFormProps {
  theyOweMeDebts: DebtWithOutstanding[]
  iOweThemDebts: DebtWithOutstanding[]
  currencies: Currency[]
  onSubmit: (values: PersonalDebtOffsetFormValues) => void
  onCancel: () => void
  loading?: boolean
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function PersonalDebtOffsetForm({
  theyOweMeDebts,
  iOweThemDebts,
  currencies,
  onSubmit,
  onCancel,
  loading,
}: PersonalDebtOffsetFormProps) {
  const [theyOweMeDebtId, setTheyOweMeDebtId] = useState('')
  const [iOweThemDebtId, setIOweThemDebtId] = useState('')
  const [date, setDate] = useState(today())
  const [error, setError] = useState('')

  const theyOweMeDebt = theyOweMeDebts.find((d) => d.id === theyOweMeDebtId)
  const iOweThemDebt = iOweThemDebts.find((d) => d.id === iOweThemDebtId)
  const sameCurrency = !!theyOweMeDebt && !!iOweThemDebt && theyOweMeDebt.currencyId === iOweThemDebt.currencyId
  const currency = sameCurrency ? currencies.find((c) => c.id === theyOweMeDebt!.currencyId) : undefined

  const preview =
    sameCurrency && currency
      ? (() => {
          const offsetAmount = Math.min(theyOweMeDebt!.outstanding, iOweThemDebt!.outstanding)
          const theyOweMeRemaining = theyOweMeDebt!.outstanding - offsetAmount
          const iOweThemRemaining = iOweThemDebt!.outstanding - offsetAmount
          return {
            offsetAmount,
            theyOweMeRemaining,
            iOweThemRemaining,
            theyOweMeStatus: statusForOutstanding(theyOweMeDebt!.originalAmount, theyOweMeRemaining),
            iOweThemStatus: statusForOutstanding(iOweThemDebt!.originalAmount, iOweThemRemaining),
          }
        })()
      : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!theyOweMeDebtId || !iOweThemDebtId) {
      setError('Seleccione una deuda de cada lado')
      return
    }
    if (!sameCurrency || !preview || !currency) {
      setError('Las dos deudas deben estar en la misma moneda')
      return
    }
    setError('')
    onSubmit({
      theyOweMeDebtId,
      iOweThemDebtId,
      amount: preview.offsetAmount,
      currencyId: currency.id,
      date,
    })
  }

  const theyOweMeOptions = [
    { value: '', label: 'Seleccione una deuda' },
    ...theyOweMeDebts.map((d) => {
      const c = currencies.find((c) => c.id === d.currencyId)
      return {
        value: d.id,
        label: `${d.description} (${c ? formatCurrencyWithCode(d.outstanding, c) : ''})`,
      }
    }),
  ]
  const iOweThemOptions = [
    { value: '', label: 'Seleccione una deuda' },
    ...iOweThemDebts.map((d) => {
      const c = currencies.find((c) => c.id === d.currencyId)
      return {
        value: d.id,
        label: `${d.description} (${c ? formatCurrencyWithCode(d.outstanding, c) : ''})`,
      }
    }),
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Deuda que me deben"
        options={theyOweMeOptions}
        value={theyOweMeDebtId}
        onChange={(e) => setTheyOweMeDebtId(e.target.value)}
      />

      <Select
        label="Deuda que le debo"
        options={iOweThemOptions}
        value={iOweThemDebtId}
        onChange={(e) => setIOweThemDebtId(e.target.value)}
      />

      <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      {theyOweMeDebtId && iOweThemDebtId && !sameCurrency && (
        <p className="text-xs text-coral font-ui">Las dos deudas deben estar en la misma moneda</p>
      )}

      {preview && currency && (
        <div className="bg-canvas-muted rounded-lg p-3 flex flex-col gap-1.5 text-sm font-ui">
          <p className="text-ink-muted">
            Compensación: <span className="font-mono text-ink">{formatCurrencyWithCode(preview.offsetAmount, currency)}</span>
          </p>
          <p className="text-ink-faint text-xs">
            Me deben quedará en {formatCurrencyWithCode(preview.theyOweMeRemaining, currency)} (
            {preview.theyOweMeStatus})
          </p>
          <p className="text-ink-faint text-xs">
            Le debo quedará en {formatCurrencyWithCode(preview.iOweThemRemaining, currency)} (
            {preview.iOweThemStatus})
          </p>
        </div>
      )}

      {error && <p className="text-xs text-coral font-ui">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Compensar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
