import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useTransactions, useUpcomingTransactions } from '@/hooks/useTransactions'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { useEnvelopeAllocations } from '@/hooks/useEnvelopeAllocations'
import { useEnvelopeSpending } from '@/hooks/useEnvelopeSpending'
import { usePersonalDebts } from '@/hooks/usePersonalDebts'
import { usePersonalDebtPaymentsForUser } from '@/hooks/usePersonalDebtPayments'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import { MiniBarChart } from '@/components/dashboard/MiniBarChart'
import { CategoryBarList, type CategoryBarRow } from '@/components/dashboard/CategoryBarList'
import { sumByCurrency, type CurrencyTotal } from '@/lib/budgetTotals'
import { totalDebtByCurrency } from '@/lib/debtTotals'
import { netByDebtor } from '@/lib/personalDebtTotals'
import { netWorthByCurrency, monthlyExpenseSeries } from '@/lib/dashboardSummary'
import { formatCurrency, formatCurrencyWithCode, cn } from '@/lib/utils'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function DashboardPage() {
  const { user } = useAuth()
  const month = currentMonth()

  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: upcoming } = useUpcomingTransactions(user?.id)
  const { data: envelopes } = useEnvelopes(user?.id)
  const { data: monthAllocations } = useEnvelopeAllocations(user?.id, month)
  const { data: monthSpending } = useEnvelopeSpending(user?.id, month)
  const { data: allTransactions } = useTransactions(user?.id)
  const { data: personalDebts } = usePersonalDebts(user?.id)
  const { data: personalDebtPayments } = usePersonalDebtPaymentsForUser(user?.id)

  const isLoading = walletsLoading || currenciesLoading

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
  }

  function getEnvelope(id: string | null) {
    return id ? envelopes?.find((e) => e.id === id) : undefined
  }

  const assetWallets = wallets?.filter((w) => w.type === 'asset') ?? []
  const creditWallets = wallets?.filter((w) => w.type === 'credit') ?? []

  // Patrimonio: activos por moneda menos deudas (TDC/Cashea) por moneda.
  const assetTotals = sumByCurrency(assetWallets.map((w) => ({ currencyId: w.currencyId, baseAmount: w.balance })))
  const walletDebtTotals = totalDebtByCurrency(wallets ?? [])
  const netWorthRows = netWorthByCurrency(assetTotals, walletDebtTotals)

  // Deudas personales: neto por moneda (positivo = me deben, negativo = debo).
  const personalDebtNet = netByDebtor(personalDebts ?? [], personalDebtPayments ?? [])
  const oweMeTotals = personalDebtNet.filter((t) => t.total > 0)
  const iOweTotals = personalDebtNet.filter((t) => t.total < 0).map((t) => ({ ...t, total: -t.total }))

  // Este mes: sobres tipo "allocation" con presupuesto asignado en el mes actual.
  const spendableEnvelopes = (envelopes ?? []).filter((e) => !e.isSavings)
  const monthRows = spendableEnvelopes
    .map((envelope) => {
      const allocs = (monthAllocations ?? []).filter((a) => a.envelopeId === envelope.id)
      if (allocs.length === 0) return null
      const budget = allocs.reduce((sum, a) => sum + a.amount, 0)
      const spent = monthSpending?.find((s) => s.envelopeId === envelope.id)?.spent ?? 0
      return { envelope, currencyId: allocs[0].currencyId, budget, spent }
    })
    .filter((r): r is { envelope: NonNullable<typeof envelopes>[number]; currencyId: string; budget: number; spent: number } => r !== null)

  const monthBudgetTotals = sumByCurrency(monthRows.map((r) => ({ currencyId: r.currencyId, baseAmount: r.budget })))
  const monthSpentTotals = sumByCurrency(monthRows.map((r) => ({ currencyId: r.currencyId, baseAmount: r.spent })))

  const topCategories: CategoryBarRow[] = [...monthRows]
    .filter((r) => r.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)
    .map((r) => ({
      key: r.envelope.id,
      name: r.envelope.name,
      emoji: r.envelope.emoji,
      spent: r.spent,
      symbol: getCurrency(r.currencyId)?.symbol ?? '',
    }))

  // Evolución: gastos pagados de los últimos 6 meses, por moneda.
  const series = monthlyExpenseSeries(
    (allTransactions ?? []).map((t) => ({
      date: t.date,
      status: t.status,
      type: t.type,
      paymentCurrencyId: t.paymentCurrencyId,
      paymentAmount: t.paymentAmount,
    })),
    6,
    new Date(),
  )
  const evolutionCurrencyIds = [
    ...new Set(series.flatMap((p) => p.totalsByCurrency.map((t) => t.currencyId))),
  ].filter((currencyId) => series.some((p) => (p.totalsByCurrency.find((t) => t.currencyId === currencyId)?.total ?? 0) > 0))

  function monthLabel(yearMonth: string) {
    const [y, m] = yearMonth.split('-')
    return format(new Date(Number(y), Number(m) - 1, 1), 'MMM', { locale: es })
  }

  function totalFor(totals: CurrencyTotal[], currencyId: string) {
    return totals.find((t) => t.currencyId === currencyId)?.total ?? 0
  }

  const monthTitle = format(new Date(), 'MMMM yyyy', { locale: es })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-ui font-semibold text-ink">Resumen</h1>
        <p className="text-sm font-ui text-ink-faint capitalize">{monthTitle}</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-32">
          <Spinner />
        </div>
      )}

      {!isLoading && wallets && wallets.length === 0 && (
        <Card padding="md" className="text-center flex flex-col items-center gap-2 py-8">
          <p className="text-2xl">💰</p>
          <p className="text-ink-muted font-ui text-sm">Aún no tienes billeteras.</p>
          <Link
            to="/billeteras"
            className="text-sm font-ui text-gold hover:text-gold/80 inline-flex items-center gap-1 mt-1"
          >
            Crear primera billetera <ArrowRight size={14} />
          </Link>
        </Card>
      )}

      {!isLoading && netWorthRows.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">Patrimonio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {netWorthRows.map((row) => {
              const currency = getCurrency(row.currencyId)
              if (!currency) return null
              return (
                <Card key={row.currencyId} padding="sm" className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-ui text-ink-faint">{currency.code}</span>
                    <Scale size={14} className="text-ink-faint" />
                  </div>
                  <span
                    className={cn('text-xl font-mono font-semibold', row.net >= 0 ? 'text-sage' : 'text-coral')}
                  >
                    {formatCurrency(row.net, currency.symbol)}
                  </span>
                  <div className="flex items-center justify-between text-xs font-ui pt-1 border-t border-border">
                    <span className="flex items-center gap-1 text-ink-faint">
                      <TrendingUp size={12} className="text-sage" /> {formatCurrency(row.assets, currency.symbol)}
                    </span>
                    <span className="flex items-center gap-1 text-ink-faint">
                      <TrendingDown size={12} className="text-coral" /> {formatCurrency(row.debts, currency.symbol)}
                    </span>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {monthBudgetTotals.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">Este mes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card padding="md" className="flex flex-col gap-3">
              {monthBudgetTotals.map((t) => {
                const currency = getCurrency(t.currencyId)
                if (!currency) return null
                const spent = totalFor(monthSpentTotals, t.currencyId)
                return (
                  <div key={t.currencyId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm font-ui">
                      <span className="text-ink-faint">{currency.code}</span>
                      <span className={cn('font-mono font-semibold', spent > t.total ? 'text-coral' : 'text-ink')}>
                        {formatCurrency(spent, currency.symbol)} de {formatCurrency(t.total, currency.symbol)}
                      </span>
                    </div>
                    <ProgressBar value={spent} max={t.total} />
                  </div>
                )
              })}
            </Card>
            {topCategories.length > 0 && (
              <Card padding="md">
                <h3 className="text-xs font-ui font-semibold text-ink-faint uppercase tracking-wide mb-3">
                  Top categorías
                </h3>
                <CategoryBarList rows={topCategories} />
              </Card>
            )}
          </div>
        </section>
      )}

      {evolutionCurrencyIds.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
            Evolución — últimos 6 meses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evolutionCurrencyIds.map((currencyId) => {
              const currency = getCurrency(currencyId)
              if (!currency) return null
              return (
                <Card key={currencyId} padding="md" className="flex flex-col gap-2">
                  <span className="text-xs font-ui text-ink-faint">Gastos en {currency.code}</span>
                  <MiniBarChart
                    points={series.map((p) => ({
                      label: monthLabel(p.yearMonth),
                      value: totalFor(p.totalsByCurrency, currencyId),
                    }))}
                  />
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {(oweMeTotals.length > 0 || iOweTotals.length > 0) && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
              Deudas personales
            </h2>
            <Link to="/deudas" className="text-xs font-ui text-ink-faint hover:text-gold inline-flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card padding="sm" className="flex flex-col gap-1">
              <span className="text-xs font-ui text-ink-faint">Me deben</span>
              {oweMeTotals.length === 0 && <span className="text-sm font-mono text-ink-faint">—</span>}
              {oweMeTotals.map((t) => {
                const currency = getCurrency(t.currencyId)
                if (!currency) return null
                return (
                  <span key={t.currencyId} className="text-lg font-mono font-semibold text-sage">
                    {formatCurrencyWithCode(t.total, currency)}
                  </span>
                )
              })}
            </Card>
            <Card padding="sm" className="flex flex-col gap-1">
              <span className="text-xs font-ui text-ink-faint">Debo</span>
              {iOweTotals.length === 0 && <span className="text-sm font-mono text-ink-faint">—</span>}
              {iOweTotals.map((t) => {
                const currency = getCurrency(t.currencyId)
                if (!currency) return null
                return (
                  <span key={t.currencyId} className="text-lg font-mono font-semibold text-coral">
                    {formatCurrencyWithCode(t.total, currency)}
                  </span>
                )
              })}
            </Card>
          </div>
        </section>
      )}

      {upcoming && upcoming.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
              Próximos pagos
            </h2>
            <Link to="/gastos" className="text-xs font-ui text-ink-faint hover:text-gold inline-flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="bg-canvas-soft border border-border rounded-xl overflow-hidden">
            {upcoming.map((tx, idx) => {
              const currency = getCurrency(tx.paymentCurrencyId)
              const envelope = getEnvelope(tx.envelopeId)
              const days = daysUntil(tx.date)
              return (
                <div key={tx.id} className={cn('flex items-center gap-3 px-4 py-3', idx > 0 && 'border-t border-border')}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-ui text-ink truncate">{tx.description}</p>
                    {envelope && (
                      <p className="text-xs font-ui text-ink-faint mt-0.5">
                        {envelope.emoji ? `${envelope.emoji} ` : ''}{envelope.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono font-semibold text-coral">
                      {currency ? `${currency.symbol} ${tx.paymentAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : tx.paymentAmount}
                    </p>
                    <p className={cn('text-xs font-ui', days === 0 ? 'text-gold' : days <= 3 ? 'text-coral' : 'text-ink-faint')}>
                      {days === 0 ? 'Hoy' : days === 1 ? 'Mañana' : `En ${days} días`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!isLoading && assetWallets.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">Billeteras</h2>
            <Link to="/billeteras" className="text-xs font-ui text-ink-faint hover:text-gold inline-flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {assetWallets.map((wallet) => {
              const currency = getCurrency(wallet.currencyId)
              return (
                <Card key={wallet.id} padding="sm" className="flex flex-col gap-1">
                  <span className="text-xs font-ui text-ink-faint">{currency?.code ?? '—'}</span>
                  <span className="text-sm font-ui font-medium text-ink">{wallet.name}</span>
                  <span className="text-lg font-mono font-semibold text-sage">
                    {currency ? formatCurrency(wallet.balance, currency.symbol) : wallet.balance}
                  </span>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {!isLoading && creditWallets.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">Crédito</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {creditWallets.map((wallet) => {
              const currency = getCurrency(wallet.currencyId)
              return (
                <Card key={wallet.id} padding="sm" className="flex flex-col gap-1">
                  <span className="text-xs font-ui text-ink-faint">{currency?.code ?? '—'}</span>
                  <span className="text-sm font-ui font-medium text-ink">{wallet.name}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-mono font-semibold text-coral">
                      {currency ? formatCurrency(wallet.balance, currency.symbol) : wallet.balance}
                    </span>
                    {wallet.creditLimit !== null && (
                      <span className="text-xs font-mono text-ink-faint">
                        / {currency ? formatCurrency(wallet.creditLimit, currency.symbol) : wallet.creditLimit}
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
