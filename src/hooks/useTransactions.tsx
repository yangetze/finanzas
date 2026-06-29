import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransactions,
  getUpcomingTransactions,
  createTransaction,
  createTransactionsBatch,
  updateTransaction,
  deleteTransaction,
} from '@/lib/supabase'
import type { Transaction } from '@/types'

function mapTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    walletId: row.wallet_id as string | null,
    envelopeId: row.envelope_id as string | null,
    date: row.date as string,
    description: row.description as string,
    status: row.status as Transaction['status'],
    type: row.type as Transaction['type'],
    originCurrencyId: row.origin_currency_id as string,
    originAmount: row.origin_amount as number,
    paymentCurrencyId: row.payment_currency_id as string,
    paymentAmount: row.payment_amount as number,
    conversionRate: row.conversion_rate as number | null,
    baseCurrencyId: row.base_currency_id as string,
    baseAmount: row.base_amount as number,
    baseRate: row.base_rate as number | null,
    installmentNumber: row.installment_number as number | null,
    installmentTotal: row.installment_total as number | null,
    groupId: row.group_id as string | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useTransactions(userId: string | undefined, month?: string) {
  return useQuery({
    queryKey: ['transactions', userId, month],
    queryFn: async () => {
      const rows = await getTransactions(userId!, month)
      return rows.map(mapTransaction)
    },
    enabled: !!userId,
  })
}

export function useUpcomingTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ['transactions-upcoming', userId],
    queryFn: async () => {
      const rows = await getUpcomingTransactions(userId!)
      return rows.map(mapTransaction)
    },
    enabled: !!userId,
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useCreateTransactionsBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTransactionsBatch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTransaction>[1] }) =>
      updateTransaction(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
