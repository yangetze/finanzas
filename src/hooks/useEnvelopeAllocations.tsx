import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEnvelopeAllocations, upsertEnvelopeAllocations } from '@/lib/supabase'

export interface EnvelopeAllocation {
  envelopeId: string
  yearMonth: string
  currencyId: string
  amount: number
}

function mapAllocation(row: Record<string, unknown>): EnvelopeAllocation {
  return {
    envelopeId: row.envelope_id as string,
    yearMonth: row.year_month as string,
    currencyId: row.currency_id as string,
    amount: row.amount as number,
  }
}

// Without month: every allocation ever written (needed to accumulate savings).
export function useEnvelopeAllocations(userId: string | undefined, yearMonth?: string) {
  return useQuery({
    queryKey: ['envelope-allocations', userId, yearMonth ?? 'all'],
    queryFn: async () => {
      const rows = await getEnvelopeAllocations(userId!, yearMonth)
      return rows.map(mapAllocation)
    },
    enabled: !!userId,
  })
}

export function useUpsertEnvelopeAllocations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      yearMonth,
      allocations,
    }: {
      userId: string
      yearMonth: string
      allocations: { envelopeId: string; currencyId: string; amount: number }[]
    }) => upsertEnvelopeAllocations(userId, yearMonth, allocations),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['envelope-allocations'] }),
  })
}
