import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDebtors, createDebtor, updateDebtor, deactivateDebtor } from '@/lib/supabase'
import type { Debtor } from '@/types'

function mapDebtor(row: Record<string, unknown>): Debtor {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    notes: row.notes as string | null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useDebtors(userId: string | undefined) {
  return useQuery({
    queryKey: ['debtors', userId],
    queryFn: async () => {
      const rows = await getDebtors(userId!)
      return (rows ?? []).map(mapDebtor)
    },
    enabled: !!userId,
  })
}

export function useCreateDebtor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDebtor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors'] }),
  })
}

export function useUpdateDebtor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateDebtor>[1] }) =>
      updateDebtor(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors'] }),
  })
}

export function useDeactivateDebtor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateDebtor,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debtors'] }),
  })
}
