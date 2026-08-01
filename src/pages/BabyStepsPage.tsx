import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { useEnvelopeAllocations } from '@/hooks/useEnvelopeAllocations'
import { useEnvelopeSpending } from '@/hooks/useEnvelopeSpending'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { DebtStepCard } from '@/components/babysteps/DebtStepCard'
import { EmergencyFundStepCard } from '@/components/babysteps/EmergencyFundStepCard'
import { Spinner } from '@/components/ui/Spinner'
import { totalDebtByCurrency } from '@/lib/debtTotals'
import { consolidateEmergencyFund, isDollarEquivalent } from '@/lib/emergencyFund'

const EMERGENCY_FUND_TARGET = 1000

export function BabyStepsPage() {
  const { user } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: envelopes, isLoading: envelopesLoading } = useEnvelopes(user?.id)
  const { data: allocations } = useEnvelopeAllocations(user?.id)
  const { data: spending } = useEnvelopeSpending(user?.id)
  const { data: rates } = useExchangeRates()

  const isLoading = walletsLoading || currenciesLoading || envelopesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const debtTotals = totalDebtByCurrency(wallets ?? [])

  const fundEnvelopes = (envelopes ?? []).filter((e) => e.isSavings && e.isEmergencyFund)
  const fundEntries = fundEnvelopes
    .map((e) => {
      const allocs = (allocations ?? []).filter((a) => a.envelopeId === e.id)
      const allocated = allocs.reduce((sum, a) => sum + a.amount, 0)
      const spent = spending?.find((s) => s.envelopeId === e.id)?.spent ?? 0
      const currencyId = allocs[0]?.currencyId
      if (!currencyId) return null
      return { envelopeId: e.id, currencyId, accumulated: allocated - spent }
    })
    .filter((entry): entry is { envelopeId: string; currencyId: string; accumulated: number } => entry !== null)

  const dollarGroupIds = new Set((currencies ?? []).filter(isDollarEquivalent).map((c) => c.id))
  const fundResult = consolidateEmergencyFund(fundEntries, dollarGroupIds, rates ?? [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-ui font-semibold text-ink">Metas</h1>
      <EmergencyFundStepCard result={fundResult} target={EMERGENCY_FUND_TARGET} currencies={currencies ?? []} />
      <DebtStepCard totals={debtTotals} currencies={currencies ?? []} />
    </div>
  )
}
