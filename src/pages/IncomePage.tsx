import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions, useCreateIncome, useUpdateIncome, useDeleteTransaction, useMarkIncomeReceived } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { IncomeRow } from '@/components/transactions/IncomeRow'
import { IncomeForm, type IncomeFormValues } from '@/components/transactions/IncomeForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ScrollAnchor } from '@/components/ui/ScrollAnchor'
import type { Transaction } from '@/types'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type TabFilter = 'all' | 'pendiente'

export function IncomePage() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth())
  const [tab, setTab] = useState<TabFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { data: transactions, isLoading: txLoading } = useTransactions(user?.id, month)
  const { data: wallets } = useWallets(user?.id)
  const { data: currencies } = useCurrencies()

  const createIncome = useCreateIncome()
  const updateIncome = useUpdateIncome()
  const deleteTx = useDeleteTransaction()
  const markReceived = useMarkIncomeReceived()

  const incomes = (transactions ?? []).filter((tx) => tx.type === 'income')

  function getWallet(id: string | null) {
    return id ? wallets?.find((w) => w.id === id) : undefined
  }

  function getCurrency(id: string) {
    return currencies?.find((c) => c.id === id)
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  function handleEdit(tx: Transaction) {
    setEditing(tx)
    setShowForm(true)
  }

  function handleMarkReceived(id: string) {
    const tx = incomes.find((t) => t.id === id)
    if (!tx) return
    markReceived.mutate({ id, walletId: tx.walletId, paymentAmount: tx.paymentAmount })
  }

  function handleSubmit(values: IncomeFormValues) {
    const baseCurrencyId = user?.baseCurrencyId ?? values.currencyId
    const payload = {
      userId: user!.id,
      date: values.date,
      description: values.description,
      status: values.status,
      envelopeId: null,
      walletId: values.walletId,
      originCurrencyId: values.currencyId,
      originAmount: values.amount,
      paymentCurrencyId: values.currencyId,
      paymentAmount: values.amount,
      conversionRate: null,
      baseCurrencyId,
      baseAmount: values.amount,
      notes: values.notes,
    }
    if (editing) {
      updateIncome.mutate(
        {
          id: editing.id,
          oldState: {
            status: editing.status,
            walletId: editing.walletId,
            amount: editing.paymentAmount,
          },
          data: { ...payload, type: 'income' },
        },
        { onSuccess: handleClose },
      )
    } else {
      createIncome.mutate(payload, { onSuccess: handleClose })
    }
  }

  if (txLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-ui font-semibold text-ink">Ingresos</h1>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm font-ui bg-canvas-soft border border-border rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-gold"
          />
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nuevo
          </Button>
        </div>
      </div>

      {showForm && wallets && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <ScrollAnchor />
          <h2 className="text-base font-ui font-semibold text-ink mb-4">
            {editing ? 'Editar ingreso' : 'Nuevo ingreso'}
          </h2>
          <IncomeForm
            wallets={wallets}
            currencies={currencies}
            initialValues={
              editing
                ? {
                    date: editing.date,
                    description: editing.description,
                    status: editing.status === 'pagado' ? 'pagado' : 'pendiente',
                    walletId: editing.walletId,
                    currencyId: editing.paymentCurrencyId,
                    amount: editing.paymentAmount,
                    notes: editing.notes,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={createIncome.isPending || updateIncome.isPending}
          />
        </div>
      )}

      <div className="flex gap-1 border-b border-border">
        {(['all', 'pendiente'] as TabFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-ui transition-colors ${
              tab === t
                ? 'text-ink border-b-2 border-gold -mb-px'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {t === 'all' ? 'Todos' : 'Pendientes'}
          </button>
        ))}
      </div>

      {(() => {
        const filtered = incomes.filter((tx) =>
          tab === 'pendiente' ? tx.status === 'pendiente' : true,
        )

        if (filtered.length === 0 && !showForm) {
          return (
            <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
              <p className="text-3xl">💰</p>
              <p className="text-ink-muted font-ui">
                {tab === 'pendiente' ? 'Sin ingresos pendientes' : 'Sin ingresos este mes'}
              </p>
              {tab === 'all' && (
                <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
                  Registrar ingreso
                </Button>
              )}
            </div>
          )
        }

        return filtered.length > 0 ? (
          <div className="bg-canvas-soft border border-border rounded-xl overflow-hidden">
            {filtered.map((tx, idx) => {
              const currency = getCurrency(tx.paymentCurrencyId)
              if (!currency) return null
              return (
                <div key={tx.id} className={idx > 0 ? 'border-t border-border' : ''}>
                  <IncomeRow
                    income={tx}
                    currency={currency}
                    wallet={getWallet(tx.walletId)}
                    onEdit={handleEdit}
                    onMarkReceived={handleMarkReceived}
                    onDelete={(id) => deleteTx.mutate(id)}
                  />
                </div>
              )
            })}
          </div>
        ) : null
      })()}
    </div>
  )
}
