import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPersonalDebts, createPersonalDebt, updatePersonalDebt, deletePersonalDebt } from '@/lib/supabase'
import type { PersonalDebt } from '@/types'

function mapPersonalDebt(row: Record<string, unknown>): PersonalDebt {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    debtorId: row.debtor_id as string,
    direction: row.direction as PersonalDebt['direction'],
    description: row.description as string,
    currencyId: row.currency_id as string,
    originalAmount: row.original_amount as number,
    date: row.date as string,
    status: row.status as PersonalDebt['status'],
    isIndexed: row.is_indexed as boolean,
    indexCurrencyId: (row.index_currency_id as string | null) ?? null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function usePersonalDebts(userId: string | undefined, debtorId?: string) {
  return useQuery({
    queryKey: ['personalDebts', userId, debtorId],
    queryFn: async () => {
      const rows = await getPersonalDebts(userId!, debtorId)
      return (rows ?? []).map(mapPersonalDebt)
    },
    enabled: !!userId,
  })
}

export function useCreatePersonalDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPersonalDebt,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personalDebts'] }),
  })
}

export function useUpdatePersonalDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePersonalDebt>[1] }) =>
      updatePersonalDebt(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personalDebts'] }),
  })
}

export function useDeletePersonalDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePersonalDebt,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personalDebts'] }),
  })
}
