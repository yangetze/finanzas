import { useState } from 'react'
import { CheckCircle2, Pencil, ShieldAlert, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { EmergencyFundResult } from '@/lib/emergencyFund'

interface EmergencyFundStepCardProps {
  result: EmergencyFundResult
  target: number
  currencies: { id: string; code: string }[]
  onSaveTarget: (amount: number) => void
}

function fmt(amount: number) {
  return `$ ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function EmergencyFundStepCard({ result, target, currencies, onSaveTarget }: EmergencyFundStepCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(target))
  const isComplete = result.total !== null && result.total >= target

  function startEdit() {
    setDraft(String(target))
    setEditing(true)
  }

  function handleSave() {
    const amount = Number(draft)
    if (!isNaN(amount) && amount > 0) onSaveTarget(amount)
    setEditing(false)
  }

  return (
    <Card padding="sm" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-gold shrink-0" />
          <span className="text-sm font-ui font-semibold text-ink">Paso 1 · Fondo de emergencia</span>
        </div>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={startEdit} aria-label="Editar meta">
            <Pencil size={13} />
          </Button>
        )}
      </div>

      {editing && (
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Meta del fondo de emergencia"
              type="number"
              step="0.01"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleSave}>
            Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
      )}

      {result.total !== null ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-mono font-semibold text-ink">
              {fmt(result.total)} de {fmt(target)}
            </span>
            {isComplete && (
              <span className="flex items-center gap-1 text-xs font-ui text-sage">
                <CheckCircle2 size={13} />
                Completado
              </span>
            )}
          </div>
          <ProgressBar value={result.total} max={target} className="mx-0" />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm font-ui text-coral">
          <TriangleAlert size={16} className="shrink-0" />
          <span>
            Falta cargar la tasa de cambio para consolidar:{' '}
            {result.missingCurrencyIds
              .map((id) => currencies.find((c) => c.id === id)?.code ?? id)
              .join(', ')}
          </span>
        </div>
      )}
    </Card>
  )
}
