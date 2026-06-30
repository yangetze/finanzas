import { describe, it, expect } from 'vitest'
import { resolveSender } from './email-config'

describe('resolveSender', () => {
  it('defaults to option A (sandbox sender) when EMAIL_SENDER_OPTION is unset', () => {
    const sender = resolveSender({})
    expect(sender).toEqual({ option: 'A', email: 'onboarding@resend.dev', name: 'Sobres' })
  })

  it('falls back to option A when EMAIL_SENDER_OPTION is not a recognized value', () => {
    const sender = resolveSender({ EMAIL_SENDER_OPTION: 'whatever' })
    expect(sender.option).toBe('A')
  })

  it('returns the custom domain sender when EMAIL_SENDER_OPTION is "B" and an address is configured', () => {
    const sender = resolveSender({
      EMAIL_SENDER_OPTION: 'B',
      EMAIL_SENDER_ADDRESS_B: 'noreply@sobres.app',
    })
    expect(sender).toEqual({ option: 'B', email: 'noreply@sobres.app', name: 'Sobres' })
  })

  it('throws when EMAIL_SENDER_OPTION is "B" but EMAIL_SENDER_ADDRESS_B is missing', () => {
    expect(() => resolveSender({ EMAIL_SENDER_OPTION: 'B' })).toThrow(
      'EMAIL_SENDER_ADDRESS_B must be set when EMAIL_SENDER_OPTION is "B"',
    )
  })
})
