import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSignInWithOtp, mockSignOut } = vi.hoisted(() => ({
  mockSignInWithOtp: vi.fn(),
  mockSignOut: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(),
  })),
}))

import { signInWithMagicLink, signOut } from './supabase'

describe('signInWithMagicLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInWithOtp.mockResolvedValue({ data: {}, error: null })
  })

  it('calls supabase.auth.signInWithOtp with correct email and redirect URL', async () => {
    await signInWithMagicLink('test@test.com')

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@test.com',
      options: {
        emailRedirectTo: expect.stringContaining('/auth/callback'),
      },
    })
  })

  it('returns the result from signInWithOtp', async () => {
    const result = await signInWithMagicLink('test@test.com')
    expect(result).toEqual({ data: {}, error: null })
  })
})

describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue({ error: null })
  })

  it('calls supabase.auth.signOut()', async () => {
    await signOut()
    expect(mockSignOut).toHaveBeenCalled()
  })
})
