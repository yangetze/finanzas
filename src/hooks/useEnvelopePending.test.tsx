import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useEnvelopePending } from './useEnvelopePending'

const mockGetTransactions = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase', () => ({ getTransactions: mockGetTransactions }))

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: qc }, children)
}

describe('useEnvelopePending', () => {
  it('aggregates pendiente expense amounts by envelope', async () => {
    mockGetTransactions.mockResolvedValueOnce([
      { id: 't1', envelope_id: 'e1', payment_amount: 15, status: 'pendiente', type: 'expense' },
      { id: 't2', envelope_id: 'e1', payment_amount: 10, status: 'pendiente', type: 'expense' },
      { id: 't3', envelope_id: 'e2', payment_amount: 50, status: 'pendiente', type: 'expense' },
      { id: 't4', envelope_id: 'e1', payment_amount: 5,  status: 'pagado',    type: 'expense' },
      { id: 't5', envelope_id: 'e1', payment_amount: 20, status: 'pendiente', type: 'income' },
    ])

    const { result } = renderHook(() => useEnvelopePending('u1', '2026-07'), { wrapper })

    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.data).toEqual(
      expect.arrayContaining([
        { envelopeId: 'e1', pending: 25 },
        { envelopeId: 'e2', pending: 50 },
      ]),
    )
    expect(result.current.data).toHaveLength(2)
  })

  it('returns empty array when no pendiente expenses', async () => {
    mockGetTransactions.mockResolvedValueOnce([])
    const { result } = renderHook(() => useEnvelopePending('u1', '2026-07'), { wrapper })
    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(result.current.data).toEqual([])
  })

  it('is disabled when userId is undefined', () => {
    const { result } = renderHook(() => useEnvelopePending(undefined, '2026-07'), { wrapper })
    expect(result.current.data).toBeUndefined()
    expect(result.current.fetchStatus).toBe('idle')
  })
})
