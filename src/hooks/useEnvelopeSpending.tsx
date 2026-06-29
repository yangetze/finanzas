import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/lib/supabase'

export interface EnvelopeSpending {
  envelopeId: string
  spent: number
}

export function useEnvelopeSpending(userId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['envelope-spending', userId, month],
    queryFn: async () => {
      const rows = await getTransactions(userId!, month)
      const map = new Map<string, number>()
      for (const row of rows) {
        if (row.status !== 'pagado' || row.type !== 'expense' || !row.envelope_id) continue
        const prev = map.get(row.envelope_id as string) ?? 0
        map.set(row.envelope_id as string, prev + (row.payment_amount as number))
      }
      return Array.from(map.entries()).map(([envelopeId, spent]) => ({ envelopeId, spent }))
    },
    enabled: !!userId,
  })
}
