import { describe, it, expect, vi } from 'vitest'
import { fetchBcvRate, fetchUsdtRate } from './rates'

describe('fetchBcvRate', () => {
  it('returns parsed rate and date on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ promedio: 755.9, fechaActualizacion: '2026-08-06T00:00:00-04:00' }),
    })

    const result = await fetchBcvRate(mockFetch as unknown as typeof fetch)

    expect(result.rate).toBe(755.9)
    expect(result.date).toBe('2026-08-06')
  })

  it('throws on non-OK response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    await expect(fetchBcvRate(mockFetch as unknown as typeof fetch)).rejects.toThrow()
  })
})

describe('fetchUsdtRate', () => {
  it('returns the average of ask/bid and the date from the unix timestamp', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ask: 852.569, bid: 860, time: 1786068234 }),
    })

    const result = await fetchUsdtRate(mockFetch as unknown as typeof fetch)

    expect(result.rate).toBeCloseTo(856.2845, 4)
    expect(result.date).toBe(new Date(1786068234 * 1000).toISOString().slice(0, 10))
  })

  it('throws on non-OK response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    await expect(fetchUsdtRate(mockFetch as unknown as typeof fetch)).rejects.toThrow()
  })
})
