import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface DebtorFormValues {
  name: string
  notes: string | null
}

interface DebtorFormInitial {
  name: string
  notes: string | null
}

interface DebtorFormProps {
  initialValues?: DebtorFormInitial
  onSubmit: (values: DebtorFormValues) => void
  onCancel: () => void
  loading?: boolean
}

export function DebtorForm({ initialValues, onSubmit, onCancel, loading }: DebtorFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [nameError, setNameError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('El nombre es requerido')
      return
    }
    setNameError('')
    onSubmit({ name: name.trim(), notes: notes.trim() || null })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError}
        placeholder="Ej. María, Juan"
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
