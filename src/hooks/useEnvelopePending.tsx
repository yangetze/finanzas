import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/lib/supabase'

export interface EnvelopePending {
  envelopeId: string
  pending: number
}

export function useEnvelopePending(userId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['envelope-pending', userId, month],
    queryFn: async () => {
      const rows = await getTransactions(userId!, month)
      const map = new Map<string, number>()
      for (const row of rows) {
        if (row.status !== 'pendiente' || row.type !== 'expense' || !row.envelope_id) continue
        const prev = map.get(row.envelope_id as string) ?? 0
        map.set(row.envelope_id as string, prev + (row.payment_amount as number))
      }
      return Array.from(map.entries()).map(([envelopeId, pending]) => ({ envelopeId, pending }))
    },
    enabled: !!userId,
  })
}
