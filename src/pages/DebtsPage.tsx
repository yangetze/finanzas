import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { TDCCard } from '@/components/debts/TDCCard'
import { Spinner } from '@/components/ui/Spinner'

export function DebtsPage() {
  const { user } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()

  const isLoading = walletsLoading || currenciesLoading

  const creditWallets = wallets?.filter((w) => w.type === 'credit') ?? []

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
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
      <h1 className="text-xl font-ui font-semibold text-ink">Deudas</h1>

      {creditWallets.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
          <p className="text-3xl">💳</p>
          <p className="text-ink-muted font-ui text-sm">No tienes tarjetas de crédito registradas</p>
          <Link
            to="/billeteras"
            className="text-sm font-ui text-gold hover:text-gold/80 inline-flex items-center gap-1 mt-1"
          >
            Agregar tarjeta <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {creditWallets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {creditWallets.map((wallet) => {
            const currency = getCurrency(wallet.currencyId)
            if (!currency) return null
            return <TDCCard key={wallet.id} wallet={wallet} currency={currency} />
          })}
        </div>
      )}
    </div>
  )
}
