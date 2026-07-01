export type CurrencyType = 'fiat' | 'stable' | 'crypto'

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  type: CurrencyType
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface ExchangeRate {
  id: string
  fromCurrencyId: string
  toCurrencyId: string
  rate: number
  rateDate: string
  source: string | null
  createdAt: string
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  baseCurrencyId: string | null
  country: string | null
  multiCurrency: boolean
  onboardingDone: boolean
  createdAt: string
  updatedAt: string
}

export type WalletType = 'asset' | 'credit'

export interface Wallet {
  id: string
  userId: string
  name: string
  currencyId: string
  type: WalletType
  creditLimit: number | null
  balance: number
  isActive: boolean
  sortOrder: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type EnvelopePriority = 'critico' | 'importante' | 'flexible'

export interface Envelope {
  id: string
  userId: string
  parentId: string | null
  name: string
  category: string
  priority: EnvelopePriority
  spendCategory: SpendingType | null
  emoji: string | null
  isActive: boolean
  sortOrder: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type BudgetFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual'
export type SpendingType = 'supervivencia' | 'flexible' | 'crecimiento'

export interface BudgetItem {
  id: string
  userId: string
  envelopeId: string
  walletId: string | null
  name: string
  baseAmount: number
  currencyId: string
  paymentCurrencyId: string | null
  referenceRate: number | null
  frequency: BudgetFrequency
  paymentDay: number | null
  startMonth: number | null
  spendingType: SpendingType
  isActive: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type TransactionStatus = 'apartado' | 'pendiente' | 'pagado' | 'anulado'
export type TransactionType = 'expense' | 'income'

export interface Transaction {
  id: string
  userId: string
  walletId: string | null
  envelopeId: string | null
  date: string
  description: string
  status: TransactionStatus
  type: TransactionType
  originCurrencyId: string
  originAmount: number
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: number | null
  baseCurrencyId: string
  baseAmount: number
  baseRate: number | null
  installmentNumber: number | null
  installmentTotal: number | null
  budgetItemId: string | null
  groupId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  session: import('@supabase/supabase-js').Session | null
  user: UserProfile | null
  loading: boolean
}
