import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const {
  mockGetPersonalDebtPayments,
  mockGetPersonalDebtPaymentsForUser,
  mockAddPersonalDebtPayment,
  mockDeletePersonalDebtPayment,
  mockCreatePersonalDebtOffset,
  mockDeletePersonalDebtOffset,
} = vi.hoisted(() => ({
  mockGetPersonalDebtPayments: vi.fn(),
  mockGetPersonalDebtPaymentsForUser: vi.fn(),
  mockAddPersonalDebtPayment: vi.fn(),
  mockDeletePersonalDebtPayment: vi.fn(),
  mockCreatePersonalDebtOffset: vi.fn(),
  mockDeletePersonalDebtOffset: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getPersonalDebtPayments: mockGetPersonalDebtPayments,
  getPersonalDebtPaymentsForUser: mockGetPersonalDebtPaymentsForUser,
  addPersonalDebtPayment: mockAddPersonalDebtPayment,
  deletePersonalDebtPayment: mockDeletePersonalDebtPayment,
  createPersonalDebtOffset: mockCreatePersonalDebtOffset,
  deletePersonalDebtOffset: mockDeletePersonalDebtOffset,
}))

import {
  usePersonalDebtPayments,
  usePersonalDebtPaymentsForUser,
  useAddPersonalDebtPayment,
  useDeletePersonalDebtPayment,
  useCreatePersonalDebtOffset,
  useDeletePersonalDebtOffset,
} from './usePersonalDebtPayments'

const MOCK_PAYMENT_ROW = {
  id: 'pay1',
  user_id: 'u1',
  personal_debt_id: 'pd1',
  wallet_id: 'w1',
  amount: 4,
  currency_id: 'usd',
  date: '2026-08-04',
  payment_type: 'payment',
  offset_group_id: null,
  notes: null,
  created_at: '2026-08-04',
}

const MOCK_PAYMENT = {
  id: 'pay1',
  userId: 'u1',
  personalDebtId: 'pd1',
  walletId: 'w1',
  amount: 4,
  currencyId: 'usd',
  date: '2026-08-04',
  paymentType: 'payment',
  offsetGroupId: null,
  notes: null,
  createdAt: '2026-08-04',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('usePersonalDebtPayments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns payment list after fetch', async () => {
    mockGetPersonalDebtPayments.mockResolvedValue([MOCK_PAYMENT_ROW])

    const { result } = renderHook(() => usePersonalDebtPayments('pd1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_PAYMENT])
  })

  it('is disabled without a personalDebtId', () => {
    const { result } = renderHook(() => usePersonalDebtPayments(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('usePersonalDebtPaymentsForUser', () => {
  it('returns all of a user payments after fetch', async () => {
    mockGetPersonalDebtPaymentsForUser.mockResolvedValue([MOCK_PAYMENT_ROW])

    const { result } = renderHook(() => usePersonalDebtPaymentsForUser('u1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([MOCK_PAYMENT])
  })

  it('is disabled without a userId', () => {
    const { result } = renderHook(() => usePersonalDebtPaymentsForUser(undefined), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useAddPersonalDebtPayment', () => {
  it('calls addPersonalDebtPayment', async () => {
    mockAddPersonalDebtPayment.mockResolvedValue(undefined)

    const { result } = renderHook(() => useAddPersonalDebtPayment(), { wrapper })
    result.current.mutate({
      userId: 'u1',
      personalDebtId: 'pd1',
      debtDirection: 'i_owe_them',
      debtOriginalAmount: 5,
      walletId: 'w1',
      amount: 4,
      currencyId: 'usd',
      date: '2026-08-04',
    })

    await waitFor(() => expect(mockAddPersonalDebtPayment).toHaveBeenCalledTimes(1))
  })
})

describe('useDeletePersonalDebtPayment', () => {
  it('calls deletePersonalDebtPayment', async () => {
    mockDeletePersonalDebtPayment.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeletePersonalDebtPayment(), { wrapper })
    const payment = {
      id: 'pay1',
      personalDebtId: 'pd1',
      debtDirection: 'i_owe_them' as const,
      debtOriginalAmount: 5,
      walletId: 'w1',
      amount: 4,
    }
    result.current.mutate(payment)

    await waitFor(() => {
      expect(mockDeletePersonalDebtPayment).toHaveBeenCalledTimes(1)
      expect(mockDeletePersonalDebtPayment.mock.calls[0][0]).toEqual(payment)
    })
  })
})

describe('useCreatePersonalDebtOffset', () => {
  it('calls createPersonalDebtOffset', async () => {
    mockCreatePersonalDebtOffset.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCreatePersonalDebtOffset(), { wrapper })
    result.current.mutate({
      userId: 'u1',
      debtAId: 'pd1',
      debtAOriginalAmount: 5,
      debtBId: 'pd2',
      debtBOriginalAmount: 4,
      amount: 4,
      currencyId: 'usd',
      date: '2026-08-04',
    })

    await waitFor(() => expect(mockCreatePersonalDebtOffset).toHaveBeenCalledTimes(1))
  })
})

describe('useDeletePersonalDebtOffset', () => {
  it('calls deletePersonalDebtOffset with offsetGroupId and debts', async () => {
    mockDeletePersonalDebtOffset.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeletePersonalDebtOffset(), { wrapper })
    const debts = [
      { id: 'pd1', originalAmount: 5 },
      { id: 'pd2', originalAmount: 4 },
    ]
    result.current.mutate({ offsetGroupId: 'og1', debts })

    await waitFor(() => expect(mockDeletePersonalDebtOffset).toHaveBeenCalledWith('og1', debts))
  })
})
