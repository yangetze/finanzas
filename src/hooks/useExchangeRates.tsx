import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getExchangeRates, upsertExchangeRate } from '@/lib/supabase'
import type { ExchangeRate } from '@/types'

function mapRate(row: Record<string, unknown>): ExchangeRate {
  return {
    id: row.id as string,
    fromCurrencyId: row.from_currency_id as string,
    toCurrencyId: row.to_currency_id as string,
    rate: row.rate as number,
    rateDate: row.rate_date as string,
    source: row.source as string | null,
    createdAt: row.created_at as string,
  }
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const rows = await getExchangeRates()
      return (rows ?? []).map(mapRate)
    },
  })
}

export function useUpsertExchangeRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: upsertExchangeRate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exchange-rates'] }),
  })
}
