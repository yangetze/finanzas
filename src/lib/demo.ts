import { supabase } from '@/lib/supabase'

export const DEMO_EMAIL = 'sobres@finanzas.com'
export const DEMO_PASSWORD = 'sobres-demo-2025'
export const DEMO_PENDING_KEY = 'sobres_demo_pending'

export async function signInAsDemo(): Promise<{ error: Error | null }> {
  let { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  })

  if (error) {
    const { error: signUpError } = await supabase.auth.signUp({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
    if (!signUpError) {
      const result = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      data = result.data
      error = result.error
    }
  }

  if (!error && data.session) {
    setupDemoAccount(data.session.user.id).catch(() => {})
  }

  return { error: error as Error | null }
}

async function setupDemoAccount(userId: string): Promise<void> {
  await supabase
    .from('users')
    .update({ onboarding_done: true })
    .eq('id', userId)

  const { data: existing } = await supabase
    .from('envelopes')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) return

  const { data: hogar } = await supabase
    .from('envelopes')
    .insert({ user_id: userId, name: 'Hogar', category: 'hogar', priority: 'critico', emoji: '🏠', sort_order: 1 })
    .select()
    .single()

  if (hogar) {
    await supabase.from('envelopes').insert([
      { user_id: userId, parent_id: hogar.id, name: 'Internet', category: 'hogar', priority: 'critico', emoji: '📡', sort_order: 1 },
      { user_id: userId, parent_id: hogar.id, name: 'Condominio', category: 'hogar', priority: 'critico', emoji: '🏢', sort_order: 2 },
    ])
  }

  const { data: comida } = await supabase
    .from('envelopes')
    .insert({ user_id: userId, name: 'Comida', category: 'alimentacion', priority: 'critico', emoji: '🍕', sort_order: 2 })
    .select()
    .single()

  if (comida) {
    await supabase.from('envelopes').insert([
      { user_id: userId, parent_id: comida.id, name: 'Mercado', category: 'alimentacion', priority: 'critico', emoji: '🛒', sort_order: 1 },
      { user_id: userId, parent_id: comida.id, name: 'Comer afuera', category: 'alimentacion', priority: 'flexible', emoji: '🍽️', sort_order: 2 },
    ])
  }

  const { data: currencies } = await supabase
    .from('currencies')
    .select('id, code')
    .in('code', ['USDC', 'USD', 'VES'])

  if (!currencies) return

  const usdcId = currencies.find((c: { code: string }) => c.code === 'USDC')?.id
  const usdId = currencies.find((c: { code: string }) => c.code === 'USD')?.id
  const vesId = currencies.find((c: { code: string }) => c.code === 'VES')?.id

  const wallets = [
    ...(usdcId ? [{ user_id: userId, name: 'Binance', currency_id: usdcId, type: 'asset', balance: 150.00, sort_order: 1 }] : []),
    ...(usdId ? [{ user_id: userId, name: 'Zinli', currency_id: usdId, type: 'asset', balance: 80.00, sort_order: 2 }] : []),
    ...(vesId ? [{ user_id: userId, name: 'Banesco', currency_id: vesId, type: 'asset', balance: 450000, sort_order: 3 }] : []),
  ]

  if (wallets.length > 0) {
    await supabase.from('wallets').insert(wallets)
  }
}
