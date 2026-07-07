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

vi.mock('@/lib/demo', () => ({
  DEMO_PENDING_KEY: 'sobres_demo_pending',
}))

import { AuthProvider, useAuth } from './useAuth'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
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

  it('does not call getUserProfile synchronously inside the auth callback (supabase lock deadlock guard)', async () => {
    const mockSession = { user: { id: 'user-123' } }
    let capturedCallback: ((event: string, session: unknown) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockGetUserProfile.mockResolvedValue({ id: 'user-123' })

    renderHook(() => useAuth(), { wrapper })

    act(() => {
      capturedCallback!('TOKEN_REFRESHED', mockSession)
    })
    expect(mockGetUserProfile).not.toHaveBeenCalled()

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(mockGetUserProfile).toHaveBeenCalledWith('user-123')
  })

  it('skips profile refetch when the same user is already loaded (tab refocus)', async () => {
    const mockSession = { user: { id: 'user-123' } }
    const mockProfile = { id: 'user-123', email: 'test@test.com', onboardingDone: true }

    let capturedCallback: ((event: string, session: unknown) => void) | null = null
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    mockGetSession.mockResolvedValue({ data: { session: mockSession } })
    mockGetUserProfile.mockResolvedValue(mockProfile)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(result.current.user).toEqual(mockProfile)
    expect(mockGetUserProfile).toHaveBeenCalledTimes(1)

    act(() => {
      capturedCallback!('TOKEN_REFRESHED', mockSession)
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(mockGetUserProfile).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.user).toEqual(mockProfile)
  })

  it('overrides onboardingDone to true when demo pending flag is set', async () => {
    const mockSession = { user: { id: 'demo-user' } }
    const mockProfile = {
      id: 'demo-user',
      email: 'sobres@finanzas.com',
      name: null,
      baseCurrencyId: null,
      country: null,
      multiCurrency: false,
      onboardingDone: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    let capturedCallback: ((event: string, session: unknown) => Promise<void>) | null = null
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => Promise<void>) => {
      capturedCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockGetUserProfile.mockResolvedValue(mockProfile)

    localStorage.setItem('sobres_demo_pending', 'true')

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      capturedCallback!('SIGNED_IN', mockSession)
    })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.user?.onboardingDone).toBe(true)
    expect(localStorage.getItem('sobres_demo_pending')).toBeNull()
  })
})
