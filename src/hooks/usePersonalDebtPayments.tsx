import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPersonalDebtPayments,
  getPersonalDebtPaymentsForUser,
  addPersonalDebtPayment,
  deletePersonalDebtPayment,
  createPersonalDebtOffset,
  deletePersonalDebtOffset,
} from '@/lib/supabase'
import type { PersonalDebtPayment } from '@/types'

function mapPersonalDebtPayment(row: Record<string, unknown>): PersonalDebtPayment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    personalDebtId: row.personal_debt_id as string,
    walletId: row.wallet_id as string | null,
    amount: row.amount as number,
    currencyId: row.currency_id as string,
    paymentCurrencyId: row.payment_currency_id as string,
    paymentAmount: row.payment_amount as number,
    conversionRate: row.conversion_rate as number | null,
    date: row.date as string,
    paymentType: row.payment_type as PersonalDebtPayment['paymentType'],
    offsetGroupId: row.offset_group_id as string | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  }
}

export function usePersonalDebtPayments(personalDebtId: string | undefined) {
  return useQuery({
    queryKey: ['personalDebtPayments', personalDebtId],
    queryFn: async () => {
      const rows = await getPersonalDebtPayments(personalDebtId!)
      return (rows ?? []).map(mapPersonalDebtPayment)
    },
    enabled: !!personalDebtId,
  })
}

export function usePersonalDebtPaymentsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['personalDebtPayments', 'byUser', userId],
    queryFn: async () => {
      const rows = await getPersonalDebtPaymentsForUser(userId!)
      return (rows ?? []).map(mapPersonalDebtPayment)
    },
    enabled: !!userId,
  })
}

function invalidatePaymentQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['personalDebtPayments'] })
  qc.invalidateQueries({ queryKey: ['personalDebts'] })
  qc.invalidateQueries({ queryKey: ['wallets'] })
}

export function useAddPersonalDebtPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: addPersonalDebtPayment,
    onSuccess: () => invalidatePaymentQueries(qc),
  })
}

export function useDeletePersonalDebtPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deletePersonalDebtPayment,
    onSuccess: () => invalidatePaymentQueries(qc),
  })
}

export function useCreatePersonalDebtOffset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPersonalDebtOffset,
    onSuccess: () => invalidatePaymentQueries(qc),
  })
}

export function useDeletePersonalDebtOffset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      offsetGroupId,
      debts,
    }: {
      offsetGroupId: string
      debts: Parameters<typeof deletePersonalDebtOffset>[1]
    }) => deletePersonalDebtOffset(offsetGroupId, debts),
    onSuccess: () => invalidatePaymentQueries(qc),
  })
}
