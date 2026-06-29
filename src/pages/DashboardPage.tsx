import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

function formatAmount(amount: number, symbol: string) {
  return `${symbol} ${Math.abs(amount).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()

  const isLoading = walletsLoading || currenciesLoading

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
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
    </div>
  )
}
