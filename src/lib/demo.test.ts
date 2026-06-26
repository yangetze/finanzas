import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSignInWithPassword, mockSignUp, mockFrom } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
    from: mockFrom,
  },
}))

import { signInAsDemo, DEMO_EMAIL } from './demo'

const mockChain = {
  update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
  select: vi.fn(() => ({
    eq: vi.fn(() => ({
      limit: vi.fn(() => Promise.resolve({ data: [{ id: 'existing' }], error: null })),
    })),
    in: vi.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}

describe('signInAsDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFrom.mockReturnValue(mockChain)
  })

  it('calls signInWithPassword with demo credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'demo-id' } } },
      error: null,
    })

    await signInAsDemo()

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: DEMO_EMAIL,
      password: expect.any(String),
    })
  })

  it('returns error: null on successful sign-in', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'demo-id' } } },
      error: null,
    })

    const { error } = await signInAsDemo()

    expect(error).toBeNull()
  })

  it('tries signUp then signIn again when first signIn fails', async () => {
    const authError = new Error('Invalid login credentials')
    mockSignInWithPassword
      .mockResolvedValueOnce({ data: { session: null }, error: authError })
      .mockResolvedValueOnce({
        data: { session: { user: { id: 'demo-id' } } },
        error: null,
      })
    mockSignUp.mockResolvedValue({ data: {}, error: null })

    const { error } = await signInAsDemo()

    expect(mockSignUp).toHaveBeenCalledWith({
      email: DEMO_EMAIL,
      password: expect.any(String),
    })
    expect(mockSignInWithPassword).toHaveBeenCalledTimes(2)
    expect(error).toBeNull()
  })

  it('returns error when all auth attempts fail', async () => {
    const authError = new Error('Auth failed')
    mockSignInWithPassword.mockResolvedValue({ data: { session: null }, error: authError })
    mockSignUp.mockResolvedValue({ data: {}, error: new Error('Signup not allowed') })

    const { error } = await signInAsDemo()

    expect(error).toBeTruthy()
  })
})
