import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBudgetItems, useCreateBudgetItem, useUpdateBudgetItem, useDeactivateBudgetItem } from '@/hooks/useBudgetItems'
import { useEnvelopes } from '@/hooks/useEnvelopes'
import { useCurrencies } from '@/hooks/useCurrencies'
import { BudgetItemRow } from '@/components/budget/BudgetItemRow'
import { BudgetForm } from '@/components/budget/BudgetForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { BudgetItem } from '@/types'

const SPENDING_TYPE_LABELS: Record<BudgetItem['spendingType'], string> = {
  supervivencia: '🔴 Supervivencia',
  flexible: '🟡 Flexible',
  crecimiento: '🟢 Crecimiento',
}

export function BudgetPage() {
  const { user } = useAuth()
  const { data: items, isLoading: itemsLoading } = useBudgetItems(user?.id)
  const { data: envelopes, isLoading: envsLoading } = useEnvelopes(user?.id)
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies()
  const createItem = useCreateBudgetItem()
  const updateItem = useUpdateBudgetItem()
  const deactivateItem = useDeactivateBudgetItem()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BudgetItem | null>(null)

  const isLoading = itemsLoading || envsLoading || currenciesLoading

  function getCurrency(currencyId: string) {
    return currencies?.find((c) => c.id === currencyId)
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
    frequency: BudgetItem['frequency']
    spendingType: BudgetItem['spendingType']
    paymentDay: number | null
    notes: string | null
  }) {
    if (editing) {
      updateItem.mutate({ id: editing.id, data: values }, { onSuccess: handleClose })
    } else {
      createItem.mutate({ userId: user!.id, ...values }, { onSuccess: handleClose })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const spendingTypes: BudgetItem['spendingType'][] = ['supervivencia', 'flexible', 'crecimiento']

  function groupTotal(type: BudgetItem['spendingType']) {
    return (items ?? [])
      .filter((i) => i.spendingType === type)
      .reduce((sum, i) => sum + i.baseAmount, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-ui font-semibold text-ink">Presupuesto</h1>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={!envelopes?.length}>
          <Plus size={16} />
          Nuevo
        </Button>
      </div>

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
            initialValues={
              editing
                ? {
                    name: editing.name,
                    envelopeId: editing.envelopeId,
                    currencyId: editing.currencyId,
                    baseAmount: editing.baseAmount,
                    frequency: editing.frequency,
                    spendingType: editing.spendingType,
                    paymentDay: editing.paymentDay,
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
          const total = groupTotal(type)

          return (
            <section key={type} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-ui font-semibold text-ink-muted uppercase tracking-wide">
                  {SPENDING_TYPE_LABELS[type]}
                </h2>
                <span className="text-sm font-mono text-ink-muted">
                  {total.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-canvas-soft border border-border rounded-xl overflow-hidden">
                {typeItems.map((item, idx) => {
                  const currency = getCurrency(item.currencyId)
                  if (!currency) return null
                  return (
                    <div key={item.id} className={idx > 0 ? 'border-t border-border' : ''}>
                      <BudgetItemRow
                        item={item}
                        currency={currency}
                        onEdit={handleEdit}
                        onDeactivate={(id) => deactivateItem.mutate(id)}
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
