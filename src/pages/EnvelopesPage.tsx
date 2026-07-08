import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEnvelopes, useCreateEnvelope, useUpdateEnvelope, useDeactivateEnvelope } from '@/hooks/useEnvelopes'
import { useEnvelopeAllocations } from '@/hooks/useEnvelopeAllocations'
import { useEnvelopeSpending } from '@/hooks/useEnvelopeSpending'
import { useCurrencies } from '@/hooks/useCurrencies'
import { EnvelopeCard, type EnvelopeStats } from '@/components/envelopes/EnvelopeCard'
import { EnvelopeForm } from '@/components/envelopes/EnvelopeForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ScrollAnchor } from '@/components/ui/ScrollAnchor'
import type { Envelope } from '@/types'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function EnvelopesPage() {
  const { user } = useAuth()
  const month = currentMonth()
  const { data: envelopes, isLoading } = useEnvelopes(user?.id)
  const { data: monthAllocations } = useEnvelopeAllocations(user?.id, month)
  const { data: allAllocations } = useEnvelopeAllocations(user?.id)
  const { data: monthSpending } = useEnvelopeSpending(user?.id, month)
  const { data: allSpending } = useEnvelopeSpending(user?.id)
  const { data: currencies } = useCurrencies()
  const createEnvelope = useCreateEnvelope()
  const updateEnvelope = useUpdateEnvelope()
  const deactivateEnvelope = useDeactivateEnvelope()

  function statsFor(envelope: Envelope): EnvelopeStats | undefined {
    const symbolOf = (currencyId: string | undefined) =>
      currencies?.find((c) => c.id === currencyId)?.symbol ?? ''

    if (envelope.isSavings) {
      const allocs = (allAllocations ?? []).filter((a) => a.envelopeId === envelope.id)
      const spent = allSpending?.find((s) => s.envelopeId === envelope.id)?.spent ?? 0
      if (allocs.length === 0 && spent === 0) return undefined
      const allocated = allocs.reduce((sum, a) => sum + a.amount, 0)
      const monthAllocated = (monthAllocations ?? [])
        .filter((a) => a.envelopeId === envelope.id)
        .reduce((sum, a) => sum + a.amount, 0)
      return {
        kind: 'savings',
        accumulated: allocated - spent,
        monthAllocated,
        symbol: symbolOf(allocs[0]?.currencyId),
      }
    }

    const allocs = (monthAllocations ?? []).filter((a) => a.envelopeId === envelope.id)
    if (allocs.length === 0) return undefined
    const budget = allocs.reduce((sum, a) => sum + a.amount, 0)
    const spent = monthSpending?.find((s) => s.envelopeId === envelope.id)?.spent ?? 0
    return { kind: 'monthly', available: budget - spent, budget, symbol: symbolOf(allocs[0]?.currencyId) }
  }

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Envelope | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleEdit(envelope: Envelope) {
    setEditing(envelope)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditing(null)
  }

  function handleSubmit(values: {
    name: string
    spendCategory: Envelope['spendCategory']
    isSavings: boolean
    parentId: string | null
    emoji: string | null
    notes: string | null
  }) {
    if (editing) {
      updateEnvelope.mutate({ id: editing.id, data: values }, { onSuccess: handleClose })
    } else {
      createEnvelope.mutate({ userId: user!.id, ...values }, { onSuccess: handleClose })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner />
      </div>
    )
  }

  const groups = envelopes?.filter((e) => e.parentId === null) ?? []
  const subs = envelopes?.filter((e) => e.parentId !== null) ?? []

  function subCount(groupId: string) {
    return subs.filter((s) => s.parentId === groupId).length
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-ui font-semibold text-ink">Sobres</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nuevo
        </Button>
      </div>

      {showForm && envelopes && (
        <div className="bg-canvas-soft border border-border rounded-xl p-4 md:p-5">
          <ScrollAnchor />
          <h2 className="text-base font-ui font-semibold text-ink mb-4">
            {editing ? 'Editar sobre' : 'Nuevo sobre'}
          </h2>
          <EnvelopeForm
            envelopes={envelopes}
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={createEnvelope.isPending || updateEnvelope.isPending}
          />
        </div>
      )}

      {envelopes && envelopes.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center min-h-48 text-center gap-2">
          <p className="text-3xl">✉️</p>
          <p className="text-ink-muted font-ui">Aún no tienes sobres configurados</p>
          <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
            Crear primer sobre
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {groups.map((group) => {
          const count = subCount(group.id)
          const expanded = expandedGroups.has(group.id)
          return (
            <div key={group.id} className="flex flex-col gap-1.5">
              <EnvelopeCard
                envelope={group}
                subCount={count}
                isExpanded={expanded}
                onToggle={() => toggleGroup(group.id)}
                stats={statsFor(group)}
                onEdit={handleEdit}
                onDeactivate={(id) => deactivateEnvelope.mutate(id)}
              />
              {expanded &&
                subs
                  .filter((s) => s.parentId === group.id)
                  .map((sub) => (
                    <EnvelopeCard
                      key={sub.id}
                      envelope={sub}
                      subCount={0}
                      stats={statsFor(sub)}
                      onEdit={handleEdit}
                      onDeactivate={(id) => deactivateEnvelope.mutate(id)}
                    />
                  ))}
            </div>
          )
        })}
        {subs
          .filter((s) => !groups.find((g) => g.id === s.parentId))
          .map((orphan) => (
            <EnvelopeCard
              key={orphan.id}
              envelope={orphan}
              subCount={0}
              stats={statsFor(orphan)}
              onEdit={handleEdit}
              onDeactivate={(id) => deactivateEnvelope.mutate(id)}
            />
          ))}
      </div>
    </div>
  )
}
