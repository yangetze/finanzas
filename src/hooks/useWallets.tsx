import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWallets, createWallet, updateWallet, deactivateWallet } from '@/lib/supabase'
import type { Wallet } from '@/types'

function mapWallet(row: Record<string, unknown>): Wallet {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    currencyId: row.currency_id as string,
    type: row.type as Wallet['type'],
    creditLimit: row.credit_limit as number | null,
    balance: row.balance as number,
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useWallets(userId: string | undefined) {
  return useQuery({
    queryKey: ['wallets', userId],
    queryFn: async () => {
      const rows = await getWallets(userId!)
      return (rows ?? []).map(mapWallet)
    },
    enabled: !!userId,
  })
}

export function useCreateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}

export function useUpdateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateWallet>[1] }) =>
      updateWallet(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}

export function useDeactivateWallet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateWallet,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
