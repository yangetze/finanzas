import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { fetchBcvRate, fetchUsdtRate, type RateResult } from './rates.ts'

interface RateOutcome {
  pair: string
  status: 'ok' | 'error'
  rate?: number
  rateDate?: string
  error?: string
}

async function upsertRate(
  supabase: ReturnType<typeof createClient>,
  fromCode: string,
  toCode: string,
  source: string,
  result: RateResult,
) {
  const { data: currencies, error: currenciesError } = await supabase
    .from('currencies')
    .select('id, code')
    .in('code', [fromCode, toCode])
  if (currenciesError) throw currenciesError

  const from = currencies?.find((c) => c.code === fromCode)
  const to = currencies?.find((c) => c.code === toCode)
  if (!from || !to) throw new Error(`Currency ${fromCode} or ${toCode} not found`)

  const { error } = await supabase.from('exchange_rates').upsert(
    {
      from_currency_id: from.id,
      to_currency_id: to.id,
      rate: result.rate,
      rate_date: result.date,
      source,
    },
    { onConflict: 'from_currency_id,to_currency_id,rate_date' },
  )
  if (error) throw error
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Supabase env vars are not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const outcomes: RateOutcome[] = []

  try {
    const bcv = await fetchBcvRate()
    await upsertRate(supabase, 'USD', 'VES', 'BCV', bcv)
    outcomes.push({ pair: 'USD→VES', status: 'ok', rate: bcv.rate, rateDate: bcv.date })
  } catch (err) {
    outcomes.push({ pair: 'USD→VES', status: 'error', error: (err as Error).message })
  }

  try {
    const usdt = await fetchUsdtRate()
    await upsertRate(supabase, 'USDt', 'VES', 'USDT', usdt)
    outcomes.push({ pair: 'USDt→VES', status: 'ok', rate: usdt.rate, rateDate: usdt.date })
  } catch (err) {
    outcomes.push({ pair: 'USDt→VES', status: 'error', error: (err as Error).message })
  }

  const hasError = outcomes.some((o) => o.status === 'error')

  return new Response(JSON.stringify({ outcomes }), {
    status: hasError ? 207 : 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
