import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { useEnvelopeAllocations } from '@/hooks/useEnvelopeAllocations'
import { useEnvelopeSpending } from '@/hooks/useEnvelopeSpending'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { useBudgetItems } from '@/hooks/useBudgetItems'
import { useTransactions } from '@/hooks/useTransactions'
import { DebtStepCard } from '@/components/babysteps/DebtStepCard'
import { EmergencyFundStepCard } from '@/components/babysteps/EmergencyFundStepCard'
import { FullEmergencyFundStepCard } from '@/components/babysteps/FullEmergencyFundStepCard'
import { InvestmentStepCard } from '@/components/babysteps/InvestmentStepCard'
import { Spinner } from '@/components/ui/Spinner'
import { totalDebtByCurrency } from '@/lib/debtTotals'
import { consolidateEmergencyFund, isDollarEquivalent } from '@/lib/emergencyFund'
import { totalMonthlyExpensesByCurrency, consolidateMonthlyExpenses } from '@/lib/monthlyExpenses'
import {
  totalMonthlyInvestmentByCurrency,
  averageMonthlyIncomeByCurrency,
  consolidateToDollarGroup,
} from '@/lib/investing'
import { updateUserProfile } from '@/lib/supabase'

export function BabyStepsPage() {
  const { user, refreshUser } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: envelopes, isLoading: envelopesLoading } = useEnvelopes(user?.id)
  const { data: allocations } = useEnvelopeAllocations(user?.id)
  const { data: spending } = useEnvelopeSpending(user?.id)
  const { data: rates } = useExchangeRates()
  const { data: budgetItems, isLoading: budgetItemsLoading } = useBudgetItems(user?.id)
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(user?.id)

  const isLoading =
    walletsLoading || currenciesLoading || envelopesLoading || budgetItemsLoading || transactionsLoading

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

  const expenseTotals = totalMonthlyExpensesByCurrency(budgetItems ?? [], envelopes ?? [])
  const expensesResult = consolidateMonthlyExpenses(expenseTotals, dollarGroupIds, rates ?? [])

  const investmentEnvelopeIds = new Set(
    (envelopes ?? []).filter((e) => e.isSavings && e.countsAsInvestment).map((e) => e.id),
  )
  const investmentTotals = totalMonthlyInvestmentByCurrency(budgetItems ?? [], investmentEnvelopeIds)
  const investmentResult = consolidateToDollarGroup(investmentTotals, dollarGroupIds, rates ?? [])

  const incomeEntries = (transactions ?? [])
    .filter((t) => t.type === 'income' && t.status === 'pagado')
    .map((t) => ({ yearMonth: t.date.slice(0, 7), currencyId: t.paymentCurrencyId, amount: t.paymentAmount }))
  const incomeTotals = averageMonthlyIncomeByCurrency(incomeEntries)
  const incomeResult = consolidateToDollarGroup(incomeTotals, dollarGroupIds, rates ?? [])

  async function handleSaveTarget(amount: number) {
    if (!user) return
    await updateUserProfile(user.id, { emergencyFundTarget: amount })
    await refreshUser()
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-ui font-semibold text-ink">Metas</h1>
      <EmergencyFundStepCard
        result={fundResult}
        target={user?.emergencyFundTarget ?? 1000}
        currencies={currencies ?? []}
        onSaveTarget={handleSaveTarget}
      />
      <DebtStepCard totals={debtTotals} currencies={currencies ?? []} />
      <FullEmergencyFundStepCard fund={fundResult} expenses={expensesResult} currencies={currencies ?? []} />
      <InvestmentStepCard
        income={incomeResult}
        investment={investmentResult}
        hasIncomeHistory={incomeEntries.length > 0}
        currencies={currencies ?? []}
      />
    </div>
  )
}
