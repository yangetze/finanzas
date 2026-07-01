import { useState } from 'react'
import { Plus, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useCreateTransactionsBatch, useMarkTransactionPaid } from '@/hooks/useTransactions'
import { useBudgetItems } from '@/hooks/useBudgetItems'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { useWallets } from '@/hooks/useWallets'
import { useCurrencies } from '@/hooks/useCurrencies'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { CasheaForm } from '@/components/transactions/CasheaForm'
import { MonthOpener } from '@/components/budget/MonthOpener'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Transaction } from '@/types'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

type TabFilter = 'all' | 'pendiente'

export function TransactionsPage() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth())
  const [tab, setTab] = useState<TabFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [showCashea, setShowCashea] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { data: transactions, isLoading: txLoading } = useTransactions(user?.id, month)
  const { data: budgetItems } = useBudgetItems(user?.id)
  const { data: envelopes } = useEnvelopes(user?.id)
  const { data: wallets } = useWallets(user?.id)
  const { data: currencies } = useCurrencies()

  const createTx = useCreateTransaction()
  const updateTx = useUpdateTransaction()
  const deleteTx = useDeleteTransaction()
  const batchCreate = useCreateTransactionsBatch()
  const markPaid = useMarkTransactionPaid()

  const [year, monthNum] = month.split('-').map(Number)

  function getEnvelope(id: string | null) {
    return id ? envelopes?.find((e) => e.id === id) : undefined
  }

  function getCurrency(id: string) {
    return currencies?.find((c) => c.id === id)
  }

  function handleClose() {
    setShowForm(false)
    setShowCashea(false)
    setEditing(null)
  }

  function handleEdit(tx: Transaction) {
    setEditing(tx)
    setShowForm(true)
  }

  function handleMarkPaid(id: string) {
    const tx = transactions?.find((t) => t.id === id)
    if (!tx) return
    markPaid.mutate({ id, walletId: tx.walletId, paymentAmount: tx.paymentAmount })
  }

  function handleDelete(id: string) {
    deleteTx.mutate(id)
  }

  function handleSubmit(values: {
    date: string
    description: string
    type: Transaction['type']
    status: 'apartado' | 'pagado'
    envelopeId: string | null
    walletId: string | null
    currencyId: string
    amount: number
    originAmount: number
    conversionRate: number | null
    paymentCurrencyId: string | null
    paymentAmount: number
    notes: string | null
  }) {
    const baseCurrencyId = user?.baseCurrencyId ?? values.currencyId
    const effectivePaymentCurrencyId = values.paymentCurrencyId ?? values.currencyId
    const payload = {
      userId: user!.id,
      date: values.date,
      description: values.description,
      type: values.type,
      status: values.status,
      envelopeId: values.envelopeId,
      walletId: values.walletId,
      originCurrencyId: values.currencyId,
      originAmount: values.originAmount,
      paymentCurrencyId: effectivePaymentCurrencyId,
      paymentAmount: values.paymentAmount,
      conversionRate: values.conversionRate,
      baseCurrencyId,
      baseAmount: values.paymentAmount,
    }
    if (editing) {
      updateTx.mutate({ id: editing.id, data: payload }, { onSuccess: handleClose })
    } else {
      createTx.mutate(payload, { onSuccess: handleClose })
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
        <h1 className="text-xl font-ui font-semibold text-ink">Gastos</h1>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-sm font-ui bg-canvas-soft border border-border rounded-lg px-3 py-1.5 text-ink focus:outline-none focus:border-gold"
          />
          <Button size="sm" variant="ghost" onClick={() => setShowCashea(true)}>
            <ShoppingBag size={16} />
            Cashea
          </Button>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nuevo
          </Button>
        </div>
      </div>

      {budgetItems && envelopes && currencies && user && (
        <MonthOpener
          items={budgetItems}
          userId={user.id}
          year={year}
          month={monthNum}
          baseCurrencyId={user.baseCurrencyId ?? currencies[0]?.id ?? ''}
          onOpen={(txs) => batchCreate.mutate(txs)}
          loading={batchCreate.isPending}
        />
      )}

      {showCashea && envelopes && wallets && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <h2 className="text-base font-ui font-semibold text-ink mb-4">Compra en cuotas (Cashea)</h2>
          <CasheaForm
            envelopes={envelopes}
            wallets={wallets}
            currencies={currencies}
            baseCurrencyId={user?.baseCurrencyId ?? undefined}
            onSubmit={(txs) => {
              const withUserId = txs.map((t) => ({ ...t, userId: user!.id }))
              batchCreate.mutate(withUserId, { onSuccess: handleClose })
            }}
            onCancel={handleClose}
            loading={batchCreate.isPending}
          />
        </div>
      )}

      {showForm && envelopes && wallets && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <h2 className="text-base font-ui font-semibold text-ink mb-4">
            {editing ? 'Editar gasto' : 'Nuevo gasto'}
          </h2>
          <TransactionForm
            envelopes={envelopes}
            wallets={wallets}
            currencies={currencies}
            multiCurrency={user?.multiCurrency}
            baseCurrencyId={user?.baseCurrencyId ?? undefined}
            initialValues={
              editing
                ? {
                    date: editing.date,
                    description: editing.description,
                    type: editing.type,
                    status: editing.status === 'anulado' || editing.status === 'pendiente' ? 'apartado' : editing.status,
                    envelopeId: editing.envelopeId,
                    walletId: editing.walletId,
                    currencyId: editing.paymentCurrencyId,
                    amount: editing.paymentAmount,
                    notes: editing.notes,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={createTx.isPending || updateTx.isPending}
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
        const filtered = transactions?.filter((tx) =>
          tab === 'pendiente' ? tx.status === 'pendiente' : true,
        ) ?? []

        if (filtered.length === 0 && !showForm) {
          return (
            <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
              <p className="text-3xl">🧾</p>
              <p className="text-ink-muted font-ui">
                {tab === 'pendiente' ? 'Sin transacciones pendientes' : 'Sin transacciones este mes'}
              </p>
              {tab === 'all' && (
                <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
                  Agregar gasto
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
                  <TransactionRow
                    transaction={tx}
                    currency={currency}
                    envelope={getEnvelope(tx.envelopeId)}
                    onEdit={handleEdit}
                    onMarkPaid={handleMarkPaid}
                    onDelete={handleDelete}
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
