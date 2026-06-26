import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

const { mockGetSession, mockOnAuthStateChange, mockGetUserProfile } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockGetUserProfile: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
  getUserProfile: mockGetUserProfile,
}))

import { AuthProvider, useAuth } from './useAuth'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('returns loading: true initially before session resolves', () => {
    mockGetSession.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.loading).toBe(true)
    expect(result.current.session).toBe(null)
    expect(result.current.user).toBe(null)
  })

  it('returns loading: false and null user when no session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.session).toBe(null)
    expect(result.current.user).toBe(null)
  })

  it('returns user data when session exists', async () => {
    const mockSession = { user: { id: 'user-123' } }
    const mockProfile = {
      id: 'user-123',
      email: 'test@test.com',
      name: 'Test User',
      baseCurrencyId: null,
      country: null,
      multiCurrency: false,
      onboardingDone: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    mockGetSession.mockResolvedValue({ data: { session: mockSession } })
    mockGetUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockProfile)
  })

  it('returns loading: false after session check completes', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.loading).toBe(false)
  })
})
