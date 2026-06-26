import { createClient } from '@supabase/supabase-js'
import type { UserProfile } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    baseCurrencyId: data.base_currency_id,
    country: data.country,
    multiCurrency: data.multi_currency,
    onboardingDone: data.onboarding_done,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string
    baseCurrencyId: string
    country: string
    multiCurrency: boolean
    onboardingDone: boolean
  }>,
) {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.baseCurrencyId !== undefined) dbUpdates.base_currency_id = updates.baseCurrencyId
  if (updates.country !== undefined) dbUpdates.country = updates.country
  if (updates.multiCurrency !== undefined) dbUpdates.multi_currency = updates.multiCurrency
  if (updates.onboardingDone !== undefined) dbUpdates.onboarding_done = updates.onboardingDone

  return supabase.from('users').update(dbUpdates).eq('id', userId)
}

export async function getCurrencies() {
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data
}
