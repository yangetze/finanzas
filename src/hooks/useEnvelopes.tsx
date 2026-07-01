import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEnvelopes, createEnvelope, updateEnvelope, deactivateEnvelope } from '@/lib/supabase'
import type { Envelope } from '@/types'

function mapEnvelope(row: Record<string, unknown>): Envelope {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    parentId: row.parent_id as string | null,
    name: row.name as string,
    category: row.category as string,
    priority: row.priority as Envelope['priority'],
    spendCategory: (row.spend_category as Envelope['spendCategory']) ?? null,
    emoji: row.emoji as string | null,
    isActive: row.is_active as boolean,
    sortOrder: row.sort_order as number,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useEnvelopes(userId: string | undefined) {
  return useQuery({
    queryKey: ['envelopes', userId],
    queryFn: async () => {
      const rows = await getEnvelopes(userId!)
      return (rows ?? []).map(mapEnvelope)
    },
    enabled: !!userId,
  })
}

export function useCreateEnvelope() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createEnvelope,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['envelopes'] }),
  })
}

export function useUpdateEnvelope() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateEnvelope>[1] }) =>
      updateEnvelope(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['envelopes'] }),
  })
}

export function useDeactivateEnvelope() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateEnvelope,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['envelopes'] }),
  })
}
