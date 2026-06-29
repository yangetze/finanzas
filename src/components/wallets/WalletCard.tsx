import { Pencil, PowerOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Wallet, Currency } from '@/types'

interface WalletCardProps {
  wallet: Wallet
  currency: Currency
  onEdit: (wallet: Wallet) => void
  onDeactivate: (id: string) => void
}

function formatAmount(amount: number, symbol: string) {
  return `${symbol} ${Math.abs(amount).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function WalletCard({ wallet, currency, onEdit, onDeactivate }: WalletCardProps) {
  const isCredit = wallet.type === 'credit'
  const balanceColor = isCredit
    ? wallet.balance < 0
      ? 'text-coral'
      : 'text-ink'
    : 'text-sage'

  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-ui text-ink-faint uppercase tracking-wide">
            {isCredit ? 'Crédito' : 'Activo'} · {currency.code}
          </span>
          <span className="text-base font-ui font-semibold text-ink">{wallet.name}</span>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => onEdit(wallet)} aria-label="Editar">
            <Pencil size={14} />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDeactivate(wallet.id)} aria-label="Desactivar">
            <PowerOff size={14} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-ui text-ink-muted">Saldo</span>
          <span className={`text-lg font-mono font-semibold ${balanceColor}`}>
            {formatAmount(wallet.balance, currency.symbol)}
          </span>
        </div>

        {isCredit && wallet.creditLimit !== null && (
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-ui text-ink-muted">Límite</span>
            <span className="text-sm font-mono text-ink-muted">
              {formatAmount(wallet.creditLimit, currency.symbol)}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
