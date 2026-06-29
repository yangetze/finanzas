import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))
vi.stubGlobal('fetch', mockFetch)

import { fetchBcvRate } from './bcv'

describe('fetchBcvRate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns parsed rate and date on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ promedio: 55.20, fecha: '2026-06-29' }),
    })

    const result = await fetchBcvRate()

    expect(result.rate).toBe(55.20)
    expect(result.date).toBe('2026-06-29')
  })

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 })

    await expect(fetchBcvRate()).rejects.toThrow()
  })

  it('throws on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(fetchBcvRate()).rejects.toThrow('Network error')
  })
})
