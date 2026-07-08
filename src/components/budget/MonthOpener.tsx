import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getApplicableItems, buildTransactionsFromItem } from '@/lib/monthOpener'
import { buildAllocations, type EnvelopeAllocationInput } from '@/lib/stampMonth'
import type { BudgetItem } from '@/types'

interface MonthOpenerProps {
  items: BudgetItem[]
  userId: string
  year: number
  month: number
  baseCurrencyId: string
  onOpen: (
    transactions: ReturnType<typeof buildTransactionsFromItem>,
    allocations: EnvelopeAllocationInput[],
  ) => void
  loading: boolean
}

export function MonthOpener({ items, userId, year, month, baseCurrencyId, onOpen, loading }: MonthOpenerProps) {
  const applicable = getApplicableItems(items, month)

  function handleOpen() {
    const transactions = applicable
      .filter((item) => item.itemType !== 'allocation')
      .flatMap((item) => buildTransactionsFromItem(item, userId, year, month, baseCurrencyId))
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`
    onOpen(transactions, buildAllocations(items, yearMonth))
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-ui text-ink-faint">
        {applicable.length} {applicable.length === 1 ? 'partida' : 'partidas'} para este mes
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleOpen}
        disabled={applicable.length === 0 || loading}
        loading={loading}
      >
        <CalendarPlus size={14} />
        Abrir mes
      </Button>
    </div>
  )
}
