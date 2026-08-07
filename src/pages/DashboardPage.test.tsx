import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const {
  mockGetWallets,
  mockGetCurrencies,
  mockGetUpcomingTransactions,
  mockGetEnvelopes,
  mockGetEnvelopeAllocations,
  mockGetTransactions,
  mockGetPersonalDebts,
  mockGetPersonalDebtPaymentsForUser,
} = vi.hoisted(() => ({
  mockGetWallets: vi.fn(),
  mockGetCurrencies: vi.fn(),
  mockGetUpcomingTransactions: vi.fn(),
  mockGetEnvelopes: vi.fn(),
  mockGetEnvelopeAllocations: vi.fn(),
  mockGetTransactions: vi.fn(),
  mockGetPersonalDebts: vi.fn(),
  mockGetPersonalDebtPaymentsForUser: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getWallets: mockGetWallets,
  getCurrencies: mockGetCurrencies,
  getUpcomingTransactions: mockGetUpcomingTransactions,
  getEnvelopes: mockGetEnvelopes,
  getEnvelopeAllocations: mockGetEnvelopeAllocations,
  getTransactions: mockGetTransactions,
  getPersonalDebts: mockGetPersonalDebts,
  getPersonalDebtPaymentsForUser: mockGetPersonalDebtPaymentsForUser,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'a@a.com' }, loading: false }),
}))

import { DashboardPage } from './DashboardPage'

const USD = { id: 'cur-usd', code: 'USD', name: 'Dólar', symbol: '$', type: 'fiat', sort_order: 1 }
const VES = { id: 'cur-ves', code: 'VES', name: 'Bolívar', symbol: 'Bs', type: 'fiat', sort_order: 2 }

function today() {
  return new Date().toISOString().split('T')[0]
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function renderDashboard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrencies.mockResolvedValue([USD, VES])
    mockGetWallets.mockResolvedValue([
      {
        id: 'w-asset',
        user_id: 'user-1',
        name: 'Efectivo',
        currency_id: USD.id,
        type: 'asset',
        credit_limit: null,
        balance: 1000,
        is_active: true,
        sort_order: 1,
        notes: null,
        created_at: today(),
        updated_at: today(),
      },
      {
        id: 'w-credit',
        user_id: 'user-1',
        name: 'TDC',
        currency_id: VES.id,
        type: 'credit',
        credit_limit: 1000,
        balance: 300,
        is_active: true,
        sort_order: 2,
        notes: null,
        created_at: today(),
        updated_at: today(),
      },
    ])
    mockGetUpcomingTransactions.mockResolvedValue([
      {
        id: 'tx-upcoming',
        user_id: 'user-1',
        wallet_id: null,
        envelope_id: 'env-food',
        date: today(),
        description: 'Internet',
        status: 'pendiente',
        type: 'expense',
        origin_currency_id: USD.id,
        origin_amount: 20,
        payment_currency_id: USD.id,
        payment_amount: 20,
        conversion_rate: null,
        base_currency_id: USD.id,
        base_amount: 20,
        base_rate: null,
        is_indexed: false,
        budget_item_id: null,
        installment_number: null,
        installment_total: null,
        group_id: null,
        notes: null,
        created_at: today(),
        updated_at: today(),
      },
    ])
    mockGetEnvelopes.mockResolvedValue([
      {
        id: 'env-food',
        user_id: 'user-1',
        parent_id: null,
        name: 'Comida',
        spend_category: 'flexible',
        is_savings: false,
        target_amount: null,
        is_emergency_fund: false,
        counts_as_investment: false,
        emoji: '🍔',
        is_active: true,
        sort_order: 1,
        notes: null,
        created_at: today(),
        updated_at: today(),
      },
    ])
    mockGetEnvelopeAllocations.mockResolvedValue([
      { envelope_id: 'env-food', year_month: currentMonth(), currency_id: USD.id, amount: 200, wallet_id: null },
    ])
    mockGetTransactions.mockResolvedValue([
      {
        id: 'tx-paid',
        user_id: 'user-1',
        wallet_id: 'w-asset',
        envelope_id: 'env-food',
        date: today(),
        description: 'Supermercado',
        status: 'pagado',
        type: 'expense',
        origin_currency_id: USD.id,
        origin_amount: 80,
        payment_currency_id: USD.id,
        payment_amount: 80,
        conversion_rate: null,
        base_currency_id: USD.id,
        base_amount: 80,
        base_rate: null,
        is_indexed: false,
        budget_item_id: null,
        installment_number: null,
        installment_total: null,
        group_id: null,
        notes: null,
        created_at: today(),
        updated_at: today(),
      },
    ])
    mockGetPersonalDebts.mockResolvedValue([
      {
        id: 'debt-1',
        user_id: 'user-1',
        debtor_id: 'debtor-1',
        direction: 'they_owe_me',
        description: 'Préstamo',
        currency_id: USD.id,
        original_amount: 50,
        date: today(),
        status: 'open',
        is_indexed: false,
        notes: null,
        created_at: today(),
        updated_at: today(),
      },
    ])
    mockGetPersonalDebtPaymentsForUser.mockResolvedValue([])
  })

  it('renders net worth, month budget, personal debts and upcoming payments without crashing', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Patrimonio')).toBeInTheDocument()
    })

    expect(screen.getByText('Este mes')).toBeInTheDocument()
    expect(screen.getByText('Deudas personales')).toBeInTheDocument()
    expect(screen.getByText('Próximos pagos')).toBeInTheDocument()
    expect(screen.getByText('Billeteras')).toBeInTheDocument()

    // Net worth: 1000 USD assets, 0 USD debts -> net 1000; VES: 0 assets - 300 debts -> -300
    expect(screen.getAllByText('$1.000,00').length).toBeGreaterThan(0)

    // Este mes: 80 of 200 budgeted spent
    expect(screen.getByText('$80,00 de $200,00')).toBeInTheDocument()

    // Personal debts: they owe me 50 USD
    expect(screen.getByText('$50,00 USD')).toBeInTheDocument()
  })

  it('shows an empty state when there are no wallets', async () => {
    mockGetWallets.mockResolvedValue([])
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Aún no tienes billeteras.')).toBeInTheDocument()
    })
  })
})
