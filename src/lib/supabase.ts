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

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
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

export async function getWallets(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

export async function createWallet(data: {
  userId: string
  name: string
  currencyId: string
  type: 'asset' | 'credit'
  creditLimit?: number | null
  balance?: number
  notes?: string | null
  sortOrder?: number
}) {
  const { error } = await supabase.from('wallets').insert({
    user_id: data.userId,
    name: data.name,
    currency_id: data.currencyId,
    type: data.type,
    credit_limit: data.creditLimit ?? null,
    balance: data.balance ?? 0,
    notes: data.notes ?? null,
    sort_order: data.sortOrder ?? 0,
  })
  if (error) throw error
}

export async function updateWallet(
  id: string,
  data: Partial<{
    name: string
    currencyId: string
    type: 'asset' | 'credit'
    creditLimit: number | null
    balance: number
    notes: string | null
    sortOrder: number
  }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.currencyId !== undefined) updates.currency_id = data.currencyId
  if (data.type !== undefined) updates.type = data.type
  if (data.creditLimit !== undefined) updates.credit_limit = data.creditLimit
  if (data.balance !== undefined) updates.balance = data.balance
  if (data.notes !== undefined) updates.notes = data.notes
  if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder

  const { error } = await supabase.from('wallets').update(updates).eq('id', id)
  if (error) throw error
}

export async function deactivateWallet(id: string) {
  const { error } = await supabase
    .from('wallets')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getEnvelopes(userId: string) {
  const { data, error } = await supabase
    .from('envelopes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data
}

export async function createEnvelope(data: {
  userId: string
  name: string
  category: string
  priority: 'critico' | 'importante' | 'flexible'
  parentId?: string | null
  emoji?: string | null
  notes?: string | null
  sortOrder?: number
}) {
  const { error } = await supabase.from('envelopes').insert({
    user_id: data.userId,
    name: data.name,
    category: data.category,
    priority: data.priority,
    parent_id: data.parentId ?? null,
    emoji: data.emoji ?? null,
    notes: data.notes ?? null,
    sort_order: data.sortOrder ?? 0,
  })
  if (error) throw error
}

export async function updateEnvelope(
  id: string,
  data: Partial<{
    name: string
    category: string
    priority: 'critico' | 'importante' | 'flexible'
    parentId: string | null
    emoji: string | null
    notes: string | null
    sortOrder: number
  }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.category !== undefined) updates.category = data.category
  if (data.priority !== undefined) updates.priority = data.priority
  if (data.parentId !== undefined) updates.parent_id = data.parentId
  if (data.emoji !== undefined) updates.emoji = data.emoji
  if (data.notes !== undefined) updates.notes = data.notes
  if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder

  const { error } = await supabase.from('envelopes').update(updates).eq('id', id)
  if (error) throw error
}

export async function deactivateEnvelope(id: string) {
  const { error } = await supabase
    .from('envelopes')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getBudgetItems(userId: string) {
  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at')

  if (error) throw error
  return data
}

export async function createBudgetItem(data: {
  userId: string
  envelopeId: string
  name: string
  baseAmount: number
  currencyId: string
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  spendingType: 'supervivencia' | 'flexible' | 'crecimiento'
  walletId?: string | null
  paymentDay?: number | null
  startMonth?: number | null
  notes?: string | null
}) {
  const { error } = await supabase.from('budget_items').insert({
    user_id: data.userId,
    envelope_id: data.envelopeId,
    name: data.name,
    base_amount: data.baseAmount,
    currency_id: data.currencyId,
    frequency: data.frequency,
    spending_type: data.spendingType,
    wallet_id: data.walletId ?? null,
    payment_day: data.paymentDay ?? null,
    start_month: data.startMonth ?? null,
    notes: data.notes ?? null,
  })
  if (error) throw error
}

export async function updateBudgetItem(
  id: string,
  data: Partial<{
    envelopeId: string
    name: string
    baseAmount: number
    currencyId: string
    frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual'
    spendingType: 'supervivencia' | 'flexible' | 'crecimiento'
    walletId: string | null
    paymentDay: number | null
    startMonth: number | null
    notes: string | null
  }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.envelopeId !== undefined) updates.envelope_id = data.envelopeId
  if (data.name !== undefined) updates.name = data.name
  if (data.baseAmount !== undefined) updates.base_amount = data.baseAmount
  if (data.currencyId !== undefined) updates.currency_id = data.currencyId
  if (data.frequency !== undefined) updates.frequency = data.frequency
  if (data.spendingType !== undefined) updates.spending_type = data.spendingType
  if (data.walletId !== undefined) updates.wallet_id = data.walletId
  if (data.paymentDay !== undefined) updates.payment_day = data.paymentDay
  if (data.startMonth !== undefined) updates.start_month = data.startMonth
  if (data.notes !== undefined) updates.notes = data.notes

  const { error } = await supabase.from('budget_items').update(updates).eq('id', id)
  if (error) throw error
}

export async function deactivateBudgetItem(id: string) {
  const { error } = await supabase
    .from('budget_items')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getTransactions(userId: string, month?: string) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'anulado')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (month) {
    const [y, m] = month.split('-')
    const lastDay = new Date(Number(y), Number(m), 0).getDate()
    query = query.gte('date', `${month}-01`).lte('date', `${month}-${lastDay}`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getUpcomingTransactions(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'apartado')
    .gte('date', today)
    .lte('date', future)
    .order('date')
  if (error) throw error
  return data
}

export async function createTransaction(data: {
  userId: string
  date: string
  description: string
  type: 'expense' | 'income'
  status: 'apartado' | 'pagado'
  envelopeId?: string | null
  walletId?: string | null
  originCurrencyId: string
  originAmount: number
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate?: number | null
  baseCurrencyId: string
  baseAmount: number
  baseRate?: number | null
  notes?: string | null
}) {
  const { error } = await supabase.from('transactions').insert({
    user_id: data.userId,
    date: data.date,
    description: data.description,
    type: data.type,
    status: data.status,
    envelope_id: data.envelopeId ?? null,
    wallet_id: data.walletId ?? null,
    origin_currency_id: data.originCurrencyId,
    origin_amount: data.originAmount,
    payment_currency_id: data.paymentCurrencyId,
    payment_amount: data.paymentAmount,
    conversion_rate: data.conversionRate ?? null,
    base_currency_id: data.baseCurrencyId,
    base_amount: data.baseAmount,
    base_rate: data.baseRate ?? null,
    notes: data.notes ?? null,
    installment_number: null,
    installment_total: null,
    group_id: null,
  })
  if (error) throw error
}

export async function createTransactionsBatch(
  transactions: Array<{
    userId: string
    date: string
    description: string
    type: 'expense' | 'income'
    status: 'apartado' | 'pagado'
    envelopeId?: string | null
    walletId?: string | null
    originCurrencyId: string
    originAmount: number
    paymentCurrencyId: string
    paymentAmount: number
    conversionRate?: number | null
    baseCurrencyId: string
    baseAmount: number
    baseRate?: number | null
    notes?: string | null
  }>,
) {
  const rows = transactions.map((t) => ({
    user_id: t.userId,
    date: t.date,
    description: t.description,
    type: t.type,
    status: t.status,
    envelope_id: t.envelopeId ?? null,
    wallet_id: t.walletId ?? null,
    origin_currency_id: t.originCurrencyId,
    origin_amount: t.originAmount,
    payment_currency_id: t.paymentCurrencyId,
    payment_amount: t.paymentAmount,
    conversion_rate: t.conversionRate ?? null,
    base_currency_id: t.baseCurrencyId,
    base_amount: t.baseAmount,
    base_rate: t.baseRate ?? null,
    notes: t.notes ?? null,
    installment_number: null,
    installment_total: null,
    group_id: null,
  }))
  const { error } = await supabase.from('transactions').insert(rows)
  if (error) throw error
}

export async function updateTransaction(
  id: string,
  data: Partial<{
    date: string
    description: string
    type: 'expense' | 'income'
    status: 'apartado' | 'pagado' | 'anulado'
    envelopeId: string | null
    walletId: string | null
    originCurrencyId: string
    originAmount: number
    paymentCurrencyId: string
    paymentAmount: number
    conversionRate: number | null
    baseCurrencyId: string
    baseAmount: number
    baseRate: number | null
    notes: string | null
  }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.date !== undefined) updates.date = data.date
  if (data.description !== undefined) updates.description = data.description
  if (data.type !== undefined) updates.type = data.type
  if (data.status !== undefined) updates.status = data.status
  if (data.envelopeId !== undefined) updates.envelope_id = data.envelopeId
  if (data.walletId !== undefined) updates.wallet_id = data.walletId
  if (data.originCurrencyId !== undefined) updates.origin_currency_id = data.originCurrencyId
  if (data.originAmount !== undefined) updates.origin_amount = data.originAmount
  if (data.paymentCurrencyId !== undefined) updates.payment_currency_id = data.paymentCurrencyId
  if (data.paymentAmount !== undefined) updates.payment_amount = data.paymentAmount
  if (data.conversionRate !== undefined) updates.conversion_rate = data.conversionRate
  if (data.baseCurrencyId !== undefined) updates.base_currency_id = data.baseCurrencyId
  if (data.baseAmount !== undefined) updates.base_amount = data.baseAmount
  if (data.baseRate !== undefined) updates.base_rate = data.baseRate
  if (data.notes !== undefined) updates.notes = data.notes
  const { error } = await supabase.from('transactions').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .update({ status: 'anulado', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getExchangeRates() {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .order('rate_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function upsertExchangeRate(data: {
  fromCurrencyId: string
  toCurrencyId: string
  rate: number
  rateDate: string
  source?: string | null
}) {
  const { error } = await supabase.from('exchange_rates').upsert(
    {
      from_currency_id: data.fromCurrencyId,
      to_currency_id: data.toCurrencyId,
      rate: data.rate,
      rate_date: data.rateDate,
      source: data.source ?? null,
    },
    { onConflict: 'from_currency_id,to_currency_id,rate_date' },
  )
  if (error) throw error
}
