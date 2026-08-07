import { createClient } from '@supabase/supabase-js'
import type { UserProfile, PersonalDebtDirection } from '@/types'
import type { StampedTransaction } from '@/lib/stampMonth'
import { incomeEditBalanceDeltas } from '@/lib/balanceDeltas'
import { statusForOutstanding } from '@/lib/personalDebtTotals'

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
    emergencyFundTarget: data.emergency_fund_target ?? 1000,
    isAdmin: data.is_admin ?? false,
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
    emergencyFundTarget: number
    onboardingDone: boolean
  }>,
) {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.baseCurrencyId !== undefined) dbUpdates.base_currency_id = updates.baseCurrencyId
  if (updates.country !== undefined) dbUpdates.country = updates.country
  if (updates.multiCurrency !== undefined) dbUpdates.multi_currency = updates.multiCurrency
  if (updates.emergencyFundTarget !== undefined) dbUpdates.emergency_fund_target = updates.emergencyFundTarget
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
  spendCategory?: 'supervivencia' | 'flexible' | 'crecimiento' | null
  isSavings?: boolean
  targetAmount?: number | null
  isEmergencyFund?: boolean
  countsAsInvestment?: boolean
  parentId?: string | null
  emoji?: string | null
  notes?: string | null
  sortOrder?: number
}) {
  const { error } = await supabase.from('envelopes').insert({
    user_id: data.userId,
    name: data.name,
    spend_category: data.spendCategory ?? null,
    is_savings: data.isSavings ?? false,
    target_amount: data.targetAmount ?? null,
    is_emergency_fund: data.isEmergencyFund ?? false,
    counts_as_investment: data.countsAsInvestment ?? false,
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
    spendCategory: 'supervivencia' | 'flexible' | 'crecimiento' | null
    isSavings: boolean
    targetAmount: number | null
    isEmergencyFund: boolean
    countsAsInvestment: boolean
    parentId: string | null
    emoji: string | null
    notes: string | null
    sortOrder: number
  }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.spendCategory !== undefined) updates.spend_category = data.spendCategory
  if (data.isSavings !== undefined) updates.is_savings = data.isSavings
  if (data.targetAmount !== undefined) updates.target_amount = data.targetAmount
  if (data.isEmergencyFund !== undefined) updates.is_emergency_fund = data.isEmergencyFund
  if (data.countsAsInvestment !== undefined) updates.counts_as_investment = data.countsAsInvestment
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
  paymentCurrencyId?: string | null
  referenceRate?: number | null
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
  itemType?: 'fixed' | 'allocation'
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
    payment_currency_id: data.paymentCurrencyId ?? null,
    reference_rate: data.referenceRate ?? null,
    frequency: data.frequency,
    item_type: data.itemType ?? 'fixed',
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
    paymentCurrencyId: string | null
    referenceRate: number | null
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
    itemType: 'fixed' | 'allocation'
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
  if (data.paymentCurrencyId !== undefined) updates.payment_currency_id = data.paymentCurrencyId
  if (data.referenceRate !== undefined) updates.reference_rate = data.referenceRate
  if (data.frequency !== undefined) updates.frequency = data.frequency
  if (data.itemType !== undefined) updates.item_type = data.itemType
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
  status: 'apartado' | 'pendiente' | 'pagado'
  envelopeId?: string | null
  walletId?: string | null
  budgetItemId?: string | null
  originCurrencyId: string
  originAmount: number
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate?: number | null
  baseCurrencyId: string
  baseAmount: number
  baseRate?: number | null
  isIndexed?: boolean
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
    budget_item_id: data.budgetItemId ?? null,
    origin_currency_id: data.originCurrencyId,
    origin_amount: data.originAmount,
    payment_currency_id: data.paymentCurrencyId,
    payment_amount: data.paymentAmount,
    conversion_rate: data.conversionRate ?? null,
    base_currency_id: data.baseCurrencyId,
    base_amount: data.baseAmount,
    base_rate: data.baseRate ?? null,
    is_indexed: data.isIndexed ?? false,
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
    status: 'apartado' | 'pendiente' | 'pagado'
    envelopeId?: string | null
    walletId?: string | null
    budgetItemId?: string | null
    originCurrencyId: string
    originAmount: number
    paymentCurrencyId: string
    paymentAmount: number
    conversionRate?: number | null
    baseCurrencyId: string
    baseAmount: number
    baseRate?: number | null
    isIndexed?: boolean
    installmentNumber?: number | null
    installmentTotal?: number | null
    groupId?: string | null
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
    budget_item_id: t.budgetItemId ?? null,
    origin_currency_id: t.originCurrencyId,
    origin_amount: t.originAmount,
    payment_currency_id: t.paymentCurrencyId,
    payment_amount: t.paymentAmount,
    conversion_rate: t.conversionRate ?? null,
    base_currency_id: t.baseCurrencyId,
    base_amount: t.baseAmount,
    base_rate: t.baseRate ?? null,
    is_indexed: t.isIndexed ?? false,
    notes: t.notes ?? null,
    installment_number: t.installmentNumber ?? null,
    installment_total: t.installmentTotal ?? null,
    group_id: t.groupId ?? null,
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
    status: 'apartado' | 'pendiente' | 'pagado' | 'anulado'
    envelopeId: string | null
    walletId: string | null
    budgetItemId: string | null
    originCurrencyId: string
    originAmount: number
    paymentCurrencyId: string
    paymentAmount: number
    conversionRate: number | null
    baseCurrencyId: string
    baseAmount: number
    baseRate: number | null
    isIndexed: boolean
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
  if (data.budgetItemId !== undefined) updates.budget_item_id = data.budgetItemId
  if (data.originCurrencyId !== undefined) updates.origin_currency_id = data.originCurrencyId
  if (data.originAmount !== undefined) updates.origin_amount = data.originAmount
  if (data.paymentCurrencyId !== undefined) updates.payment_currency_id = data.paymentCurrencyId
  if (data.paymentAmount !== undefined) updates.payment_amount = data.paymentAmount
  if (data.conversionRate !== undefined) updates.conversion_rate = data.conversionRate
  if (data.baseCurrencyId !== undefined) updates.base_currency_id = data.baseCurrencyId
  if (data.baseAmount !== undefined) updates.base_amount = data.baseAmount
  if (data.baseRate !== undefined) updates.base_rate = data.baseRate
  if (data.isIndexed !== undefined) updates.is_indexed = data.isIndexed
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

export async function getStampedBudgetItemIds(userId: string, yearMonth: string): Promise<Set<string>> {
  const rows = await getTransactions(userId, yearMonth)
  const ids = new Set<string>()
  for (const row of rows) {
    if (row.status === 'pendiente' && row.budget_item_id) {
      ids.add(row.budget_item_id as string)
    }
  }
  return ids
}

export async function stampMonth(params: {
  userId: string
  baseCurrencyId: string
  transactions: StampedTransaction[]
}) {
  const rows = params.transactions.map((tx) => ({
    user_id: params.userId,
    date: tx.date,
    description: tx.description,
    type: 'expense' as const,
    status: 'pendiente' as const,
    envelope_id: tx.envelopeId,
    wallet_id: tx.walletId ?? null,
    budget_item_id: tx.budgetItemId,
    origin_currency_id: tx.originCurrencyId,
    origin_amount: tx.originAmount,
    payment_currency_id: tx.paymentCurrencyId,
    payment_amount: tx.paymentAmount,
    conversion_rate: tx.conversionRate ?? null,
    base_currency_id: params.baseCurrencyId,
    base_amount: tx.paymentAmount,
    base_rate: null,
    notes: null,
    installment_number: null,
    installment_total: null,
    group_id: null,
  }))
  const { error } = await supabase.from('transactions').insert(rows)
  if (error) throw error
}

async function adjustWalletBalance(walletId: string, delta: number) {
  const { data } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .single()
  if (data) {
    await updateWallet(walletId, { balance: data.balance + delta })
  }
}

// Pays down a credit wallet's balance (amount owed, in the card's own
// currency) from any other wallet, possibly in a different currency at
// today's rate (see docs/plan-sprint-11.md). No new row/table — TDC has no
// per-charge ledger, just a running balance, so this is purely a balance
// move between the two wallets, unlike personal_debts/transactions.
export async function payCreditCardBalance(data: {
  creditWalletId: string
  amount: number
  sourceWalletId: string
  paymentAmount: number
}) {
  await adjustWalletBalance(data.creditWalletId, -data.amount)
  await adjustWalletBalance(data.sourceWalletId, -data.paymentAmount)
}

export async function markTransactionPaid(
  id: string,
  walletId: string | null,
  paymentAmount: number,
) {
  await updateTransaction(id, { status: 'pagado' })
  if (walletId) {
    await adjustWalletBalance(walletId, -paymentAmount)
  }
}

// For is_indexed transactions: the payment currency/amount/rate aren't
// known until the moment of payment (see docs/plan-sprint-10.md), so this
// fixes them on the transaction itself instead of trusting the placeholder
// values set at creation, and moves the wallet by the real paymentAmount
// (not originAmount, which stays the anchor and is left untouched).
export async function markTransactionPaidIndexed(data: {
  id: string
  walletId: string
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: number | null
}) {
  await updateTransaction(data.id, {
    status: 'pagado',
    walletId: data.walletId,
    paymentCurrencyId: data.paymentCurrencyId,
    paymentAmount: data.paymentAmount,
    conversionRate: data.conversionRate,
  })
  await adjustWalletBalance(data.walletId, -data.paymentAmount)
}

export async function markIncomeReceived(
  id: string,
  walletId: string | null,
  paymentAmount: number,
) {
  await updateTransaction(id, { status: 'pagado' })
  if (walletId) {
    await adjustWalletBalance(walletId, paymentAmount)
  }
}

export async function createIncome(
  data: Omit<Parameters<typeof createTransaction>[0], 'type'>,
) {
  await createTransaction({ ...data, type: 'income' })
  if (data.status === 'pagado' && data.walletId) {
    await adjustWalletBalance(data.walletId, data.paymentAmount)
  }
}

export async function updateIncome(
  id: string,
  oldState: { status: string; walletId: string | null; amount: number },
  data: Parameters<typeof updateTransaction>[1] & {
    status: string
    walletId: string | null
    paymentAmount: number
  },
) {
  await updateTransaction(id, data)
  const deltas = incomeEditBalanceDeltas(oldState, {
    status: data.status,
    walletId: data.walletId,
    amount: data.paymentAmount,
  })
  for (const { walletId, delta } of deltas) {
    await adjustWalletBalance(walletId, delta)
  }
}

export async function getEnvelopeAllocations(userId: string, yearMonth?: string) {
  let query = supabase
    .from('envelope_allocations')
    .select('*')
    .eq('user_id', userId)
  if (yearMonth) query = query.eq('year_month', yearMonth)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function upsertEnvelopeAllocations(
  userId: string,
  yearMonth: string,
  allocations: { envelopeId: string; currencyId: string; amount: number; walletId?: string | null }[],
) {
  if (allocations.length === 0) return
  const rows = allocations.map((a) => ({
    user_id: userId,
    envelope_id: a.envelopeId,
    year_month: yearMonth,
    currency_id: a.currencyId,
    amount: a.amount,
    wallet_id: a.walletId ?? null,
  }))
  const { error } = await supabase
    .from('envelope_allocations')
    .upsert(rows, { onConflict: 'user_id,envelope_id,year_month,currency_id' })
  if (error) throw error
}

export async function getTransfers(userId: string, month?: string) {
  let query = supabase
    .from('transfers')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (month) {
    const [y, m] = month.split('-')
    const lastDay = new Date(Number(y), Number(m), 0).getDate()
    query = query.gte('date', `${month}-01`).lte('date', `${month}-${lastDay}`)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function createTransfer(data: {
  userId: string
  date: string
  fromWalletId: string
  toWalletId: string
  fromWalletType?: 'asset' | 'credit'
  toWalletType?: 'asset' | 'credit'
  fromCurrencyId: string
  toCurrencyId: string
  amountSent: number
  commission: number
  amountReceived: number
  fromWalletName: string
  toWalletName: string
  notes?: string | null
}) {
  // The commission expense is a stats-only record: the commission already
  // left the origin wallet as part of amount_sent, so the expense must not
  // debit the balance again.
  let commissionTransactionId: string | null = null
  if (data.commission > 0) {
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: data.userId,
        date: data.date,
        description: `Comisión transferencia ${data.fromWalletName} → ${data.toWalletName}`,
        type: 'expense',
        status: 'pagado',
        envelope_id: null,
        wallet_id: data.fromWalletId,
        budget_item_id: null,
        origin_currency_id: data.fromCurrencyId,
        origin_amount: data.commission,
        payment_currency_id: data.fromCurrencyId,
        payment_amount: data.commission,
        conversion_rate: null,
        base_currency_id: data.fromCurrencyId,
        base_amount: data.commission,
        base_rate: null,
        notes: null,
        installment_number: null,
        installment_total: null,
        group_id: null,
      })
      .select('id')
      .single()
    if (txError) throw txError
    commissionTransactionId = tx.id
  }

  const { error } = await supabase.from('transfers').insert({
    user_id: data.userId,
    date: data.date,
    from_wallet_id: data.fromWalletId,
    to_wallet_id: data.toWalletId,
    from_currency_id: data.fromCurrencyId,
    to_currency_id: data.toCurrencyId,
    amount_sent: data.amountSent,
    commission: data.commission,
    amount_received: data.amountReceived,
    commission_transaction_id: commissionTransactionId,
    notes: data.notes ?? null,
  })
  if (error) throw error

  // Asset wallets hold cash: sending debits, receiving credits. Credit
  // wallets hold debt owed (positive = owed): sending (a cash advance)
  // increases what's owed, receiving (paying the card down) decreases it —
  // the opposite sign, see docs/plan-sprint-11.md.
  await adjustWalletBalance(data.fromWalletId, data.fromWalletType === 'credit' ? data.amountSent : -data.amountSent)
  await adjustWalletBalance(data.toWalletId, data.toWalletType === 'credit' ? -data.amountReceived : data.amountReceived)
}

export async function deleteTransfer(transfer: {
  id: string
  fromWalletId: string
  toWalletId: string
  fromWalletType?: 'asset' | 'credit'
  toWalletType?: 'asset' | 'credit'
  amountSent: number
  amountReceived: number
  commissionTransactionId: string | null
}) {
  const { error } = await supabase.from('transfers').delete().eq('id', transfer.id)
  if (error) throw error

  if (transfer.commissionTransactionId) {
    await deleteTransaction(transfer.commissionTransactionId)
  }

  await adjustWalletBalance(transfer.fromWalletId, transfer.fromWalletType === 'credit' ? -transfer.amountSent : transfer.amountSent)
  await adjustWalletBalance(transfer.toWalletId, transfer.toWalletType === 'credit' ? transfer.amountReceived : -transfer.amountReceived)
}

export async function getLatestExchangeRate(
  fromCurrencyId: string,
  toCurrencyId: string,
): Promise<number | null> {
  const { data } = await supabase
    .from('exchange_rates')
    .select('rate')
    .eq('from_currency_id', fromCurrencyId)
    .eq('to_currency_id', toCurrencyId)
    .order('rate_date', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data?.rate ?? null
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

export async function getDebtors(userId: string) {
  const { data, error } = await supabase
    .from('debtors')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data
}

export async function createDebtor(data: { userId: string; name: string; notes?: string | null }) {
  const { error } = await supabase.from('debtors').insert({
    user_id: data.userId,
    name: data.name,
    notes: data.notes ?? null,
  })
  if (error) throw error
}

export async function updateDebtor(
  id: string,
  data: Partial<{ name: string; notes: string | null }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.notes !== undefined) updates.notes = data.notes

  const { error } = await supabase.from('debtors').update(updates).eq('id', id)
  if (error) throw error
}

export async function deactivateDebtor(id: string) {
  const { error } = await supabase
    .from('debtors')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function getPersonalDebts(userId: string, debtorId?: string) {
  let query = supabase.from('personal_debts').select('*').eq('user_id', userId).order('date', {
    ascending: false,
  })
  if (debtorId) query = query.eq('debtor_id', debtorId)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createPersonalDebt(data: {
  userId: string
  debtorId: string
  direction: PersonalDebtDirection
  description: string
  currencyId: string
  originalAmount: number
  date: string
  isIndexed?: boolean
  indexCurrencyId?: string | null
  notes?: string | null
}) {
  const { error } = await supabase.from('personal_debts').insert({
    user_id: data.userId,
    debtor_id: data.debtorId,
    direction: data.direction,
    description: data.description,
    currency_id: data.currencyId,
    original_amount: data.originalAmount,
    date: data.date,
    status: 'open',
    is_indexed: data.isIndexed ?? false,
    index_currency_id: data.indexCurrencyId ?? null,
    notes: data.notes ?? null,
  })
  if (error) throw error
}

export async function updatePersonalDebt(
  id: string,
  data: Partial<{
    direction: PersonalDebtDirection
    description: string
    currencyId: string
    originalAmount: number
    date: string
    isIndexed: boolean
    indexCurrencyId: string | null
    notes: string | null
  }>,
) {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.direction !== undefined) updates.direction = data.direction
  if (data.description !== undefined) updates.description = data.description
  if (data.currencyId !== undefined) updates.currency_id = data.currencyId
  if (data.originalAmount !== undefined) updates.original_amount = data.originalAmount
  if (data.date !== undefined) updates.date = data.date
  if (data.isIndexed !== undefined) updates.is_indexed = data.isIndexed
  if (data.indexCurrencyId !== undefined) updates.index_currency_id = data.indexCurrencyId
  if (data.notes !== undefined) updates.notes = data.notes

  const { error } = await supabase.from('personal_debts').update(updates).eq('id', id)
  if (error) throw error
}

export async function deletePersonalDebt(id: string) {
  const { error } = await supabase.from('personal_debts').delete().eq('id', id)
  if (error) throw error
}

export async function getPersonalDebtPayments(personalDebtId: string) {
  const { data, error } = await supabase
    .from('personal_debt_payments')
    .select('*')
    .eq('personal_debt_id', personalDebtId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

// All of a user's personal debt payments across every debt, for computing
// net-by-debtor totals and outstanding balances at the page level without
// one query per debt.
export async function getPersonalDebtPaymentsForUser(userId: string) {
  const { data, error } = await supabase
    .from('personal_debt_payments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

// Recomputes and persists a personal_debt's status from the sum of its
// payments (payment + offset rows alike), instead of trusting a value the
// caller might have derived from a stale local snapshot.
async function recalcPersonalDebtStatus(personalDebtId: string, originalAmount: number) {
  const { data: payments, error } = await supabase
    .from('personal_debt_payments')
    .select('amount')
    .eq('personal_debt_id', personalDebtId)
  if (error) throw error

  const paid = (payments ?? []).reduce((sum, p) => sum + p.amount, 0)
  const outstanding = Math.max(0, originalAmount - paid)
  const status = statusForOutstanding(originalAmount, outstanding)

  const { error: updateError } = await supabase
    .from('personal_debts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', personalDebtId)
  if (updateError) throw updateError
}

export async function addPersonalDebtPayment(data: {
  userId: string
  personalDebtId: string
  debtDirection: PersonalDebtDirection
  debtOriginalAmount: number
  walletId: string
  amount: number
  currencyId: string
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: number | null
  date: string
  notes?: string | null
}) {
  const { error } = await supabase.from('personal_debt_payments').insert({
    user_id: data.userId,
    personal_debt_id: data.personalDebtId,
    wallet_id: data.walletId,
    amount: data.amount,
    currency_id: data.currencyId,
    payment_currency_id: data.paymentCurrencyId,
    payment_amount: data.paymentAmount,
    conversion_rate: data.conversionRate,
    date: data.date,
    payment_type: 'payment',
    offset_group_id: null,
    notes: data.notes ?? null,
  })
  if (error) throw error

  // i_owe_them: paying them hands money out of the wallet. they_owe_me:
  // receiving their payment credits the wallet. The wallet moves by
  // paymentAmount (what actually changed hands), not amount (the debt's own
  // currency), since those differ for indexed debts.
  await adjustWalletBalance(
    data.walletId,
    data.debtDirection === 'i_owe_them' ? -data.paymentAmount : data.paymentAmount,
  )
  await recalcPersonalDebtStatus(data.personalDebtId, data.debtOriginalAmount)
}

export async function deletePersonalDebtPayment(payment: {
  id: string
  personalDebtId: string
  debtDirection: PersonalDebtDirection
  debtOriginalAmount: number
  walletId: string
  paymentAmount: number
}) {
  const { error } = await supabase.from('personal_debt_payments').delete().eq('id', payment.id)
  if (error) throw error

  await adjustWalletBalance(
    payment.walletId,
    payment.debtDirection === 'i_owe_them' ? payment.paymentAmount : -payment.paymentAmount,
  )
  await recalcPersonalDebtStatus(payment.personalDebtId, payment.debtOriginalAmount)
}

// Compensates two crossed debts of the same debtor/currency: inserts one
// offset payment row per debt, sharing offsetGroupId, and recalculates both
// statuses. No wallet touched — no money actually moved, see
// docs/plan-sprint-08.md guiding example.
export async function createPersonalDebtOffset(data: {
  userId: string
  debtAId: string
  debtAOriginalAmount: number
  debtBId: string
  debtBOriginalAmount: number
  amount: number
  currencyId: string
  date: string
}) {
  const offsetGroupId = crypto.randomUUID()
  const { error } = await supabase.from('personal_debt_payments').insert([
    {
      user_id: data.userId,
      personal_debt_id: data.debtAId,
      wallet_id: null,
      amount: data.amount,
      currency_id: data.currencyId,
      payment_currency_id: data.currencyId,
      payment_amount: data.amount,
      conversion_rate: null,
      date: data.date,
      payment_type: 'offset',
      offset_group_id: offsetGroupId,
      notes: null,
    },
    {
      user_id: data.userId,
      personal_debt_id: data.debtBId,
      wallet_id: null,
      amount: data.amount,
      currency_id: data.currencyId,
      payment_currency_id: data.currencyId,
      payment_amount: data.amount,
      conversion_rate: null,
      date: data.date,
      payment_type: 'offset',
      offset_group_id: offsetGroupId,
      notes: null,
    },
  ])
  if (error) throw error

  await recalcPersonalDebtStatus(data.debtAId, data.debtAOriginalAmount)
  await recalcPersonalDebtStatus(data.debtBId, data.debtBOriginalAmount)
}

export async function deletePersonalDebtOffset(
  offsetGroupId: string,
  debts: { id: string; originalAmount: number }[],
) {
  const { error } = await supabase
    .from('personal_debt_payments')
    .delete()
    .eq('offset_group_id', offsetGroupId)
  if (error) throw error

  for (const debt of debts) {
    await recalcPersonalDebtStatus(debt.id, debt.originalAmount)
  }
}
