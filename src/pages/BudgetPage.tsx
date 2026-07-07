import { useState } from 'react'
import { Plus, Stamp } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBudgetItems, useCreateBudgetItem, useUpdateBudgetItem, useDeactivateBudgetItem } from '@/hooks/useBudgetItems'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { useCurrencies } from '@/hooks/useCurrencies'
import { useWallets } from '@/hooks/useWallets'
import { useEnvelopeSpending } from '@/hooks/useEnvelopeSpending'
import { useEnvelopePending } from '@/hooks/useEnvelopePending'
import { useStampMonth } from '@/hooks/useStampMonth'
import { BudgetItemRow } from '@/components/budget/BudgetItemRow'
import { BudgetForm } from '@/components/budget/BudgetForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { BudgetItem } from '@/types'
import type { BudgetItemStampInput } from '@/lib/stampMonth'
import { sumByCurrency, isMissingRateForSingleCurrencySum } from '@/lib/budgetTotals'
import { useExchangeRates } from '@/hooks/useExchangeRates'
import { TriangleAlert } from 'lucide-react'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const SPENDING_TYPE_LABELS: Record<BudgetItem['spendingType'], string> = {
  supervivencia: '🔴 Supervivencia',
  flexible: '🟡 Flexible',
  crecimiento: '🟢 Crecimiento',
}

export function BudgetPage() {
  const { user } = useAuth()
  const [month] = useState(currentMonth())
  const { data: items, isLoading: itemsLoading } = useBudgetItems(user?.id)
  const { data: envelopes, isLoading: envsLoading } = useEnvelopes(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const { data: wallets } = useWallets(user?.id)
  const { data: rates } = useExchangeRates()
  const { data: spending } = useEnvelopeSpending(user?.id, month)
  const { data: pendingData } = useEnvelopePending(user?.id, month)
  const createItem = useCreateBudgetItem()
  const updateItem = useUpdateBudgetItem()
  const deactivateItem = useDeactivateBudgetItem()
  const stampMonth = useStampMonth()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)

  const isLoading = itemsLoading || envsLoading || currenciesLoading

  function getSpent(envelopeId: string) {
    return spending?.find((s) => s.envelopeId === envelopeId)?.spent
  }

  function getPending(envelopeId: string) {
    return pendingData?.find((p) => p.envelopeId === envelopeId)?.pending
  }

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
  }

  function getEnvelope(envelopeId: string) {
    return envelopes?.find((e) => e.id === envelopeId)
  }

  function handleEdit(item: BudgetItem) {
    setEditing(item)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  function handleSubmit(values: {
    name: string
    envelopeId: string
    currencyId: string
    baseAmount: number
    paymentCurrencyId: string | null
    referenceRate: number | null
    frequency: BudgetItem['frequency']
    spendingType: BudgetItem['spendingType']
    walletId: string | null
    paymentDay: number | null
    startMonth: number | null
    notes: string | null
  }) {
    if (editing) {
      updateItem.mutate({ id: editing.id, data: values }, { onSuccess: handleClose })
    } else {
      createItem.mutate({ userId: user!.id, ...values }, { onSuccess: handleClose })
    }
  }

  function handleStampMonth() {
    if (!user?.baseCurrencyId || !items) return
    const stampInputs: BudgetItemStampInput[] = items.map((item) => ({
      id: item.id,
      envelopeId: item.envelopeId,
      walletId: item.walletId,
      name: item.name,
      baseAmount: item.baseAmount,
      currencyId: item.currencyId,
      paymentCurrencyId: item.paymentCurrencyId,
      referenceRate: item.referenceRate,
      paymentDay: item.paymentDay,
      frequency: item.frequency,
      startMonth: item.startMonth,
    }))
    stampMonth.mutate({
      userId: user.id,
      baseCurrencyId: user.baseCurrencyId,
      yearMonth: month,
      items: stampInputs,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const spendingTypes: BudgetItem['spendingType'][] = ['supervivencia', 'flexible', 'crecimiento']

  function groupTotals(type: BudgetItem['spendingType']) {
    return sumByCurrency((items ?? []).filter((i) => i.spendingType === type))
  }

  const missingRate = isMissingRateForSingleCurrencySum(items ?? [], currencies ?? [], rates ?? [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-ui font-semibold text-ink">Presupuesto</h1>
        <div className="flex items-center gap-2">
          {!!items?.length && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStampMonth}
              loading={stampMonth.isPending}
              disabled={!user?.baseCurrencyId}
            >
              <Stamp size={16} />
              Timbrar mes
            </Button>
          )}
          <Button size="sm" onClick={() => setShowForm(true)} disabled={!envelopes?.length}>
            <Plus size={16} />
            Nuevo
          </Button>
        </div>
      </div>

      {missingRate && (
        <div className="flex items-start gap-2.5 bg-amber-fin/10 border border-amber-fin/40 rounded-xl px-4 py-3">
          <TriangleAlert size={16} className="text-amber-fin mt-0.5 shrink-0" />
          <p className="text-sm font-ui text-amber-fin">
            No hay tasa de cambio registrada para sumar los totales en una sola moneda. Los totales
            se muestran por separado en cada moneda.
          </p>
        </div>
      )}

      {!envelopes?.length && !showForm && (
        <p className="text-sm font-ui text-ink-muted">
          Crea sobres primero para poder asignar partidas de presupuesto.
        </p>
      )}

      {showForm && envelopes && currencies && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <h2 className="text-base font-ui font-semibold text-ink mb-4">
            {editing ? 'Editar partida' : 'Nueva partida'}
          </h2>
          <BudgetForm
            envelopes={envelopes}
            currencies={currencies}
            wallets={wallets ?? []}
            multiCurrency={user?.multiCurrency}
            initialValues={
              editing
                ? {
                    name: editing.name,
                    envelopeId: editing.envelopeId,
                    currencyId: editing.currencyId,
                    baseAmount: editing.baseAmount,
                    paymentCurrencyId: editing.paymentCurrencyId,
                    frequency: editing.frequency,
                    spendingType: editing.spendingType,
                    walletId: editing.walletId,
                    paymentDay: editing.paymentDay,
                    startMonth: editing.startMonth,
                    notes: editing.notes,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={createItem.isPending || updateItem.isPending}
          />
        </div>
      )}

      {items && items.length === 0 && !showForm && !!envelopes?.length && (
        <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
          <p className="text-3xl">📋</p>
          <p className="text-ink-muted font-ui">Aún no tienes partidas de presupuesto</p>
          <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
            Agregar primera partida
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {spendingTypes.map((type) => {
          const typeItems = (items ?? []).filter((i) => i.spendingType === type)
          if (typeItems.length === 0) return null
          const totals = groupTotals(type)

          return (
            <section key={type} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
                  {SPENDING_TYPE_LABELS[type]}
                </h2>
                <div className="flex flex-wrap justify-end gap-x-3">
                  {totals.map(({ currencyId, total }) => {
                    const currency = getCurrency(currencyId)
                    return (
                      <span key={currencyId} className="text-sm font-mono text-ink-muted">
                        {currency?.symbol ?? ''}{' '}
                        {total.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="bg-canvas-soft border border-border rounded-xl overflow-hidden">
                {(() => {
                  const envelopeIds = [...new Set(typeItems.map((i) => i.envelopeId))]
                  const parentIds = [...new Set(
                    envelopeIds.map((id) => getEnvelope(id)?.parentId ?? id)
                  )]

                  return parentIds.map((parentId, parentIdx) => {
                    const parentEnv = getEnvelope(parentId)
                    const childEnvIds = envelopeIds.filter(
                      (id) => (getEnvelope(id)?.parentId ?? id) === parentId
                    )

                    return (
                      <div key={parentId} className={parentIdx > 0 ? 'border-t border-border' : ''}>
                        <div className="px-3 py-1.5 flex items-center gap-1.5 bg-canvas-muted/70">
                          {parentEnv?.emoji && <span className="text-sm">{parentEnv.emoji}</span>}
                          <span className="text-xs font-ui font-semibold text-ink-muted uppercase tracking-wide">
                            {parentEnv?.name ?? '—'}
                          </span>
                        </div>
                        {childEnvIds.map((childEnvId) => {
                          const childEnv = getEnvelope(childEnvId)
                          const childItems = typeItems.filter((i) => i.envelopeId === childEnvId)
                          const isDirectOnParent = childEnvId === parentId

                          return (
                            <div key={childEnvId}>
                              {!isDirectOnParent && (
                                <div className="pl-6 pr-3 py-1 flex items-center gap-1.5 border-t border-border/40 bg-canvas-soft">
                                  {childEnv?.emoji && <span className="text-xs">{childEnv.emoji}</span>}
                                  <span className="text-xs font-ui text-ink-faint">
                                    {childEnv?.name ?? '—'}
                                  </span>
                                </div>
                              )}
                              {childItems.map((item) => {
                                const currency = getCurrency(item.currencyId)
                                if (!currency) return null
                                return (
                                  <div key={item.id} className="border-t border-border/40">
                                    <BudgetItemRow
                                      item={item}
                                      currency={currency}
                                      spent={getSpent(item.envelopeId)}
                                      pending={getPending(item.envelopeId)}
                                      onEdit={handleEdit}
                                      onDeactivate={(id) => deactivateItem.mutate(id)}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                })()}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
