const BCV_API_URL = 'https://ve.dolarapi.com/v1/dolares/oficial'

export async function fetchBcvRate(): Promise<{ rate: number; date: string }> {
  const res = await fetch(BCV_API_URL)
  if (!res.ok) throw new Error(`BCV API error: ${res.status}`)
  const json = await res.json()
  return { rate: Number(json.promedio), date: json.fecha }
}
