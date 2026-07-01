import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEnvelopes, useCreateEnvelope, useUpdateEnvelope, useDeactivateEnvelope } from '@/hooks/useEnvelopes'
import { EnvelopeCard } from '@/components/envelopes/EnvelopeCard'
import { EnvelopeForm } from '@/components/envelopes/EnvelopeForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { Envelope } from '@/types'

export function EnvelopesPage() {
  const { user } = useAuth()
  const { data: envelopes, isLoading } = useEnvelopes(user?.id)
  const createEnvelope = useCreateEnvelope()
  const updateEnvelope = useUpdateEnvelope()
  const deactivateEnvelope = useDeactivateEnvelope()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Envelope | null>(null)

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
        {groups.map((group) => (
          <div key={group.id} className="flex flex-col gap-1.5">
            <EnvelopeCard
              envelope={group}
              subCount={subCount(group.id)}
              onEdit={handleEdit}
              onDeactivate={(id) => deactivateEnvelope.mutate(id)}
            />
            {subs
              .filter((s) => s.parentId === group.id)
              .map((sub) => (
                <EnvelopeCard
                  key={sub.id}
                  envelope={sub}
                  subCount={0}
                  onEdit={handleEdit}
                  onDeactivate={(id) => deactivateEnvelope.mutate(id)}
                />
              ))}
          </div>
        ))}
        {subs
          .filter((s) => !groups.find((g) => g.id === s.parentId))
          .map((orphan) => (
            <EnvelopeCard
              key={orphan.id}
              envelope={orphan}
              subCount={0}
              onEdit={handleEdit}
              onDeactivate={(id) => deactivateEnvelope.mutate(id)}
            />
          ))}
      </div>
    </div>
  )
}
