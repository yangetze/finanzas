import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useUpcomingTransactions } from '@/hooks/useTransactions'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

function formatAmount(amount: number, symbol: string) {
  return `${symbol} ${Math.abs(amount).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: upcoming } = useUpcomingTransactions(user?.id)
  const { data: envelopes } = useEnvelopes(user?.id)

  const isLoading = walletsLoading || currenciesLoading

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
  }

  function getEnvelope(id: string | null) {
    return id ? envelopes?.find((e) => e.id === id) : undefined
  }

  const assetWallets = wallets?.filter((w) => w.type === 'asset') ?? []
  const creditWallets = wallets?.filter((w) => w.type === 'credit') ?? []

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-ui font-semibold text-ink">Resumen</h1>

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

      {!isLoading && assetWallets.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">Activos</h2>
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
                    {currency ? formatAmount(wallet.balance, currency.symbol) : wallet.balance}
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
                      {currency ? formatAmount(wallet.balance, currency.symbol) : wallet.balance}
                    </span>
                    {wallet.creditLimit !== null && (
                      <span className="text-xs font-mono text-ink-faint">
                        / {currency ? formatAmount(wallet.creditLimit, currency.symbol) : wallet.creditLimit}
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
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
    </div>
  )
}
