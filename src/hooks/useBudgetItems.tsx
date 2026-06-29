import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBudgetItems, createBudgetItem, updateBudgetItem, deactivateBudgetItem } from '@/lib/supabase'
import type { BudgetItem } from '@/types'

function mapBudgetItem(row: Record<string, unknown>): BudgetItem {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    envelopeId: row.envelope_id as string,
    walletId: row.wallet_id as string | null,
    name: row.name as string,
    baseAmount: row.base_amount as number,
    currencyId: row.currency_id as string,
    frequency: row.frequency as BudgetItem['frequency'],
    paymentDay: row.payment_day as number | null,
    startMonth: row.start_month as number | null,
    spendingType: row.spending_type as BudgetItem['spendingType'],
    isActive: row.is_active as boolean,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useBudgetItems(userId: string | undefined) {
  return useQuery({
    queryKey: ['budget-items', userId],
    queryFn: async () => {
      const rows = await getBudgetItems(userId!)
      return (rows ?? []).map(mapBudgetItem)
    },
    enabled: !!userId,
  })
}

export function useCreateBudgetItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBudgetItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget-items'] }),
  })
}

export function useUpdateBudgetItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateBudgetItem>[1] }) =>
      updateBudgetItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget-items'] }),
  })
}

export function useDeactivateBudgetItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateBudgetItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget-items'] }),
  })
}
