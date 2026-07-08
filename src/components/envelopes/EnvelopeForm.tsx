import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Envelope, SpendingType } from '@/types'

interface EnvelopeFormValues {
  name: string
  spendCategory: SpendingType | null
  isSavings: boolean
  parentId: string | null
  emoji: string | null
  notes: string | null
}

interface EnvelopeFormInitial {
  name: string
  spendCategory?: SpendingType | null
  isSavings?: boolean
  parentId: string | null
  emoji: string | null
  notes: string | null
}

interface EnvelopeFormProps {
  envelopes: Envelope[]
  initialValues?: EnvelopeFormInitial
  onSubmit: (values: EnvelopeFormValues) => void
  onCancel: () => void
  loading?: boolean
}

const SPEND_CATEGORY_OPTIONS = [
  { value: '', label: 'Sin categoría' },
  { value: 'supervivencia', label: 'Supervivencia — necesidades básicas' },
  { value: 'flexible', label: 'Flexible — estilo de vida' },
  { value: 'crecimiento', label: 'Crecimiento — inversión y ahorro' },
]

const NO_PARENT = '__none__'

export function EnvelopeForm({ envelopes, initialValues, onSubmit, onCancel, loading }: EnvelopeFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [spendCategory, setSpendCategory] = useState<SpendingType | null>(initialValues?.spendCategory ?? null)
  const [isSavings, setIsSavings] = useState(initialValues?.isSavings ?? false)
  const [parentId, setParentId] = useState(initialValues?.parentId ?? NO_PARENT)
  const [emoji, setEmoji] = useState(initialValues?.emoji ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [nameError, setNameError] = useState('')

  const parentOptions = [
    { value: NO_PARENT, label: 'Ninguno (sobre principal)' },
    ...envelopes
      .filter((e) => e.parentId === null)
      .map((e) => ({ value: e.id, label: `${e.emoji ? e.emoji + ' ' : ''}${e.name}` })),
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('El nombre es requerido')
      return
    }
    setNameError('')
    onSubmit({
      name: name.trim(),
      spendCategory,
      isSavings,
      parentId: parentId === NO_PARENT ? null : parentId,
      emoji: emoji.trim() || null,
      notes: notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="w-16">
          <Input
            label="Emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🏠"
            maxLength={2}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            placeholder="Ej. Hogar, Netflix, Inter"
          />
        </div>
      </div>

      <Select
        label="Categoría de gasto"
        options={SPEND_CATEGORY_OPTIONS}
        value={spendCategory ?? ''}
        onChange={(e) => setSpendCategory((e.target.value as SpendingType) || null)}
      />

      <Select
        label="Sobre padre"
        options={parentOptions}
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
      />

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isSavings}
          onChange={(e) => setIsSavings(e.target.checked)}
          className="w-4 h-4 rounded border-border bg-canvas-soft accent-gold"
        />
        <span className="text-sm font-ui text-ink">Sobre de ahorro</span>
        <span className="text-xs font-ui text-ink-faint">— acumula mes a mes en vez de reiniciarse</span>
      </label>

      <Input
        label="Notas"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Opcional"
      />

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading} className="flex-1">
          Guardar
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
