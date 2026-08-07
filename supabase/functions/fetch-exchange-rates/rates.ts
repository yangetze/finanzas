const BCV_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial'
const USDT_API_URL = 'https://criptoya.com/api/binancep2p/usdt/ves/1'

export interface RateResult {
  rate: number
  date: string
}

export async function fetchBcvRate(fetchImpl: typeof fetch = fetch): Promise<RateResult> {
  const res = await fetchImpl(BCV_API_URL)
  if (!res.ok) throw new Error(`BCV API error: ${res.status}`)
  const json = await res.json()
  return { rate: Number(json.promedio), date: String(json.fechaActualizacion).slice(0, 10) }
}

export async function fetchUsdtRate(fetchImpl: typeof fetch = fetch): Promise<RateResult> {
  const res = await fetchImpl(USDT_API_URL)
  if (!res.ok) throw new Error(`USDT API error: ${res.status}`)
  const json = await res.json()
  const rate = (Number(json.ask) + Number(json.bid)) / 2
  const date = new Date(Number(json.time) * 1000).toISOString().slice(0, 10)
  return { rate, date }
}
