import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWallets, useCreateWallet, useUpdateWallet, useDeactivateWallet } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { WalletCard } from '@/components/wallets/WalletCard'
import { WalletForm } from '@/components/wallets/WalletForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Wallet } from '@/types'

export function WalletsPage() {
  const { user } = useAuth()
  const { data: wallets, isLoading: walletsLoading } = useWallets(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()
  const deactivateWallet = useDeactivateWallet()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Wallet | null>(null)

  const isLoading = walletsLoading || currenciesLoading

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
  }

  function handleEdit(wallet: Wallet) {
    setEditing(wallet)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-ui font-semibold text-ink">Billeteras</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nueva
        </Button>
      </div>

      {showForm && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
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
    </div>
  )
}
