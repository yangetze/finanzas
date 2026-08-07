import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))
vi.stubGlobal('fetch', mockFetch)

import { fetchUsdtRate } from './usdt'

describe('fetchUsdtRate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the average of ask/bid and the date from the unix timestamp', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ask: 852.569, bid: 860, time: 1786068234 }),
    })

    const result = await fetchUsdtRate()

    expect(result.rate).toBeCloseTo(856.2845, 4)
    expect(result.date).toBe(new Date(1786068234 * 1000).toISOString().slice(0, 10))
  })

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 })

    await expect(fetchUsdtRate()).rejects.toThrow()
  })

  it('throws on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    await expect(fetchUsdtRate()).rejects.toThrow('Network error')
  })
})
