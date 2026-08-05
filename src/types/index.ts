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
  emergencyFundTarget: number
  isAdmin: boolean
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

export interface Envelope {
  id: string
  userId: string
  parentId: string | null
  name: string
  spendCategory: SpendingType | null
  isSavings: boolean
  targetAmount: number | null
  isEmergencyFund: boolean
  countsAsInvestment: boolean
  emoji: string | null
  isActive: boolean
  sortOrder: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type BudgetFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'
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
  itemType: 'fixed' | 'allocation'
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

export interface Transfer {
  id: string
  userId: string
  date: string
  fromWalletId: string
  toWalletId: string
  fromCurrencyId: string
  toCurrencyId: string
  amountSent: number
  commission: number
  amountReceived: number
  commissionTransactionId: string | null
  notes: string | null
  createdAt: string
}

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
  isIndexed: boolean
  installmentNumber: number | null
  installmentTotal: number | null
  budgetItemId: string | null
  groupId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type PersonalDebtDirection = 'they_owe_me' | 'i_owe_them'
export type PersonalDebtStatus = 'open' | 'partial' | 'paid'
export type PersonalDebtPaymentType = 'payment' | 'offset'

export interface Debtor {
  id: string
  userId: string
  name: string
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PersonalDebt {
  id: string
  userId: string
  debtorId: string
  direction: PersonalDebtDirection
  description: string
  currencyId: string
  originalAmount: number
  date: string
  status: PersonalDebtStatus
  isIndexed: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface PersonalDebtPayment {
  id: string
  userId: string
  personalDebtId: string
  walletId: string | null
  amount: number
  currencyId: string
  paymentCurrencyId: string
  paymentAmount: number
  conversionRate: number | null
  date: string
  paymentType: PersonalDebtPaymentType
  offsetGroupId: string | null
  notes: string | null
  createdAt: string
}

export interface AuthState {
  session: import('@supabase/supabase-js').Session | null
  user: UserProfile | null
  loading: boolean
}
