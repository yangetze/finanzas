const USDT_API_URL = 'https://criptoya.com/api/binancep2p/usdt/ves/1'

export async function fetchUsdtRate(): Promise<{ rate: number; date: string }> {
  const res = await fetch(USDT_API_URL)
  if (!res.ok) throw new Error(`USDT API error: ${res.status}`)
  const json = await res.json()
  const rate = (Number(json.ask) + Number(json.bid)) / 2
  const date = new Date(Number(json.time) * 1000).toISOString().slice(0, 10)
  return { rate, date }
}
