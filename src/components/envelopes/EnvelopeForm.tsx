import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Envelope, EnvelopePriority, SpendingType } from '@/types'

interface EnvelopeFormValues {
  name: string
  category: string
  priority: EnvelopePriority
  spendCategory: SpendingType | null
  parentId: string | null
  emoji: string | null
  notes: string | null
}

interface EnvelopeFormInitial {
  name: string
  category: string
  priority: EnvelopePriority
  spendCategory?: SpendingType | null
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

const PRIORITY_OPTIONS = [
  { value: 'critico', label: 'Crítico — no puede omitirse' },
  { value: 'importante', label: 'Importante — ajustable' },
  { value: 'flexible', label: 'Flexible — puede reducirse' },
]

const SPEND_CATEGORY_OPTIONS = [
  { value: '', label: 'Sin categoría' },
  { value: 'supervivencia', label: 'Supervivencia — necesidades básicas' },
  { value: 'flexible', label: 'Flexible — estilo de vida' },
  { value: 'crecimiento', label: 'Crecimiento — inversión y ahorro' },
]

const NO_PARENT = '__none__'

export function EnvelopeForm({ envelopes, initialValues, onSubmit, onCancel, loading }: EnvelopeFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [category, setCategory] = useState(initialValues?.category ?? '')
  const [priority, setPriority] = useState<EnvelopePriority>(initialValues?.priority ?? 'critico')
  const [spendCategory, setSpendCategory] = useState<SpendingType | null>(initialValues?.spendCategory ?? null)
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
      category: category.trim() || name.trim(),
      priority,
      spendCategory,
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
        label="Prioridad"
        options={PRIORITY_OPTIONS}
        value={priority}
        onChange={(e) => setPriority(e.target.value as EnvelopePriority)}
      />

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

      <Input
        label="Categoría"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Igual al nombre si no se especifica"
      />

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
