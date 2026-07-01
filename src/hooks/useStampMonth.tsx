import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getStampedBudgetItemIds, stampMonth } from '@/lib/supabase'
import { buildStampedTransactions } from '@/lib/stampMonth'
import type { BudgetItemStampInput } from '@/lib/stampMonth'

export function useStampMonth() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      userId: string
      baseCurrencyId: string
      yearMonth: string
      items: BudgetItemStampInput[]
    }) => {
      const alreadyStamped = await getStampedBudgetItemIds(params.userId, params.yearMonth)
      const toStamp = buildStampedTransactions(
        params.items,
        alreadyStamped,
        params.yearMonth,
        params.baseCurrencyId,
      )
      if (toStamp.length === 0) return
      await stampMonth({ userId: params.userId, baseCurrencyId: params.baseCurrencyId, transactions: toStamp })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['envelope-spending'] })
      qc.invalidateQueries({ queryKey: ['envelope-pending'] })
    },
  })
}
