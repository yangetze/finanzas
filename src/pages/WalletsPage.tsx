import { useState } from 'react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWallets, useCreateWallet, useUpdateWallet, useDeactivateWallet } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useTransfers, useCreateTransfer, useDeleteTransfer } from '@/hooks/useTransfers'
import { WalletCard } from '@/components/wallets/WalletCard'
import { WalletForm } from '@/components/wallets/WalletForm'
import { TransferForm, type TransferFormValues } from '@/components/wallets/TransferForm'
import { TransferRow } from '@/components/wallets/TransferRow'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ScrollAnchor } from '@/components/ui/ScrollAnchor'
import { sumByCurrency } from '@/lib/budgetTotals'
import type { Wallet, Transfer } from '@/types'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function WalletsPage() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth())
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: transfers } = useTransfers(user?.id, month)
  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()
  const deactivateWallet = useDeactivateWallet()
  const createTransfer = useCreateTransfer()
  const deleteTransfer = useDeleteTransfer()

  const [showForm, setShowForm] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [editing, setEditing] = useState<Wallet | null>(null)

  const isLoading = walletsLoading || currenciesLoading

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
  }

  function getWallet(walletId: string) {
    return wallets?.find((w) => w.id === walletId)
  }

  function handleEdit(wallet: Wallet) {
    setEditing(wallet)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setShowTransfer(false)
    setEditing(null)
  }

  function handleSubmit(values: {
    name: string
    currencyId: string
    type: 'asset' | 'credit'
    creditLimit: number | null
    balance: number
    notes: string | null
  }) {
    if (editing) {
      updateWallet.mutate(
        { id: editing.id, data: values },
        { onSuccess: handleClose },
      )
    } else {
      createWallet.mutate(
        { userId: user!.id, ...values },
        { onSuccess: handleClose },
      )
    }
  }

  function handleTransfer(values: TransferFormValues) {
    createTransfer.mutate(
      { userId: user!.id, ...values },
      { onSuccess: handleClose },
    )
  }

  function handleDeleteTransfer(transfer: Transfer) {
    deleteTransfer.mutate({
      id: transfer.id,
      fromWalletId: transfer.fromWalletId,
      toWalletId: transfer.toWalletId,
      amountSent: transfer.amountSent,
      amountReceived: transfer.amountReceived,
      commissionTransactionId: transfer.commissionTransactionId,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const commissionTotals = sumByCurrency(
    (transfers ?? [])
      .filter((t) => t.commission > 0)
      .map((t) => ({ currencyId: t.fromCurrencyId, baseAmount: t.commission })),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-ui font-semibold text-ink">Billeteras</h1>
        <div className="flex items-center gap-2">
          {(wallets?.length ?? 0) >= 2 && (
            <Button size="sm" variant="ghost" onClick={() => setShowTransfer(true)}>
              <ArrowLeftRight size={16} />
              Transferir
            </Button>
          )}
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nueva
          </Button>
        </div>
      </div>

      {showTransfer && wallets && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <ScrollAnchor />
          <h2 className="text-base font-ui font-semibold text-ink mb-4">Transferir entre billeteras</h2>
          <TransferForm
            wallets={wallets}
            currencies={currencies}
            onSubmit={handleTransfer}
            onCancel={handleClose}
            loading={createTransfer.isPending}
          />
        </div>
      )}

      {showForm && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <ScrollAnchor />
          <h2 className="text-base font-ui font-semibold text-ink mb-4">
            {editing ? 'Editar billetera' : 'Nueva billetera'}
          </h2>
          <WalletForm
            currencies={currencies}
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={createWallet.isPending || updateWallet.isPending}
          />
        </div>
      )}

      {wallets && wallets.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
          <p className="text-3xl">💰</p>
          <p className="text-ink-muted font-ui">Aún no tienes billeteras registradas</p>
          <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
            Crear primera billetera
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets?.map((wallet) => {
          const currency = getCurrency(wallet.currencyId)
          if (!currency) return null
          return (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              currency={currency}
              onEdit={handleEdit}
              onDeactivate={(id) => deactivateWallet.mutate(id)}
            />
          )
        })}
      </div>

      {!!wallets?.length && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
              Transferencias
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {commissionTotals.length > 0 && (
                <span className="text-xs font-ui text-amber-fin">
                  Comisiones:{' '}
                  {commissionTotals
                    .map(({ currencyId, total }) => {
                      const currency = getCurrency(currencyId)
                      return `${currency?.symbol ?? ''} ${total.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    })
                    .join(' · ')}
                </span>
              )}
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="text-sm font-ui bg-canvas-soft border border-border rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {(transfers?.length ?? 0) === 0 ? (
            <p className="text-sm font-ui text-ink-faint py-2">Sin transferencias este mes.</p>
          ) : (
            <div className="bg-canvas-soft border border-border rounded-xl overflow-hidden">
              {transfers!.map((transfer, idx) => (
                <div key={transfer.id} className={idx > 0 ? 'border-t border-border' : ''}>
                  <TransferRow
                    transfer={transfer}
                    fromWallet={getWallet(transfer.fromWalletId)}
                    toWallet={getWallet(transfer.toWalletId)}
                    fromCurrency={getCurrency(transfer.fromCurrencyId)}
                    toCurrency={getCurrency(transfer.toCurrencyId)}
                    onDelete={handleDeleteTransfer}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
