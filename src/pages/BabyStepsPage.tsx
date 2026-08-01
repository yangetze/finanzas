import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { DebtStepCard } from '@/components/babysteps/DebtStepCard'
import { Spinner } from '@/components/ui/Spinner'
import { totalDebtByCurrency } from '@/lib/debtTotals'

export function BabyStepsPage() {
  const { user } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()

  const isLoading = walletsLoading || currenciesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const totals = totalDebtByCurrency(wallets ?? [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-ui font-semibold text-ink">Metas</h1>
      <DebtStepCard totals={totals} currencies={currencies ?? []} />
    </div>
  )
}
