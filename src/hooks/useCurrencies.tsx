import { useQuery } from '@tanstack/react-query'
import { getCurrencies } from '@/lib/supabase'
import type { Currency } from '@/types'

function mapCurrency(row: Record<string, unknown>): Currency {
  return {
    id: row.id as string,
    code: row.code as string,
    name: row.name as string,
    symbol: row.symbol as string,
    type: row.type as Currency['type'],
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
  }
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const rows = await getCurrencies()
      return (rows ?? []).map(mapCurrency)
    },
  })
}
