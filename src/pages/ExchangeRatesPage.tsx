import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useExchangeRates, useUpsertExchangeRate } from '@/hooks/useExchangeRates'
import { useCurrencies } from '@/hooks/useCurrencies'
import { fetchBcvRate } from '@/lib/bcv'
import { RateCard } from '@/components/exchange-rates/RateCard'
import { RateForm } from '@/components/exchange-rates/RateForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ExchangeRate } from '@/types'

export function ExchangeRatesPage() {
  const { data: rates, isLoading: ratesLoading } = useExchangeRates()
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const upsert = useUpsertExchangeRate()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ExchangeRate | null>(null)
  const [bcvLoading, setBcvLoading] = useState(false)
  const [bcvError, setBcvError] = useState('')

  const isLoading = ratesLoading || currenciesLoading

  function handleEdit(rate: ExchangeRate) {
    setEditing(rate)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  function handleSubmit(values: {
    fromCurrencyId: string
    toCurrencyId: string
    rate: number
    rateDate: string
    source: string | null
  }) {
    upsert.mutate(values, { onSuccess: handleClose })
  }

  async function handleFetchBcv() {
    setBcvError('')
    setBcvLoading(true)
    try {
      const { rate, date } = await fetchBcvRate()
      const usdCurrency = currencies?.find((c) => c.code === 'USD')
      const vesCurrency = currencies?.find((c) => c.code === 'VES')
      if (!usdCurrency || !vesCurrency) {
        setBcvError('No se encontraron las monedas USD o VES en la base de datos.')
        return
      }
      await upsert.mutateAsync({
        fromCurrencyId: usdCurrency.id,
        toCurrencyId: vesCurrency.id,
        rate,
        rateDate: date,
        source: 'BCV',
      })
    } catch {
      setBcvError('No se pudo obtener la tasa del BCV. Intenta de nuevo.')
    } finally {
      setBcvLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-ui font-semibold text-ink">Tasas de cambio</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={handleFetchBcv} loading={bcvLoading}>
            <RefreshCw size={14} />
            BCV
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nueva
          </Button>
        </div>
      </div>

      {bcvError && (
        <p className="text-sm text-coral font-ui">{bcvError}</p>
      )}

      {showForm && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <h2 className="text-base font-ui font-semibold text-ink mb-4">
            {editing ? 'Editar tasa' : 'Nueva tasa'}
          </h2>
          <RateForm
            currencies={currencies}
            initialValues={
              editing
                ? {
                    fromCurrencyId: editing.fromCurrencyId,
                    toCurrencyId: editing.toCurrencyId,
                    rate: editing.rate,
                    rateDate: editing.rateDate,
                    source: editing.source,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={upsert.isPending}
          />
        </div>
      )}

      {rates && rates.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
          <p className="text-3xl">📈</p>
          <p className="text-ink-muted font-ui">Aún no tienes tasas registradas</p>
          <div className="flex gap-2 mt-1">
            <Button size="sm" variant="ghost" onClick={handleFetchBcv} loading={bcvLoading}>
              <RefreshCw size={14} />
              Obtener del BCV
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
              Ingresar manualmente
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates?.map((rate) => (
          <RateCard key={rate.id} rate={rate} currencies={currencies ?? []} onEdit={handleEdit} />
        ))}
      </div>
    </div>
  )
}
