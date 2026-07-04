import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTransfers, createTransfer, deleteTransfer } from '@/lib/supabase'
import type { Transfer } from '@/types'

function mapTransfer(row: Record<string, unknown>): Transfer {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    fromWalletId: row.from_wallet_id as string,
    toWalletId: row.to_wallet_id as string,
    fromCurrencyId: row.from_currency_id as string,
    toCurrencyId: row.to_currency_id as string,
    amountSent: row.amount_sent as number,
    commission: row.commission as number,
    amountReceived: row.amount_received as number,
    commissionTransactionId: row.commission_transaction_id as string | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  }
}

export function useTransfers(userId: string | undefined, month?: string) {
  return useQuery({
    queryKey: ['transfers', userId, month],
    queryFn: async () => {
      const rows = await getTransfers(userId!, month)
      return rows.map(mapTransfer)
    },
    enabled: !!userId,
  })
}

export function useCreateTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteTransfer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transfers'] })
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
