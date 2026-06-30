export type SenderOption = 'A' | 'B'

export interface EmailSenderEnv {
  EMAIL_SENDER_OPTION?: string
  EMAIL_SENDER_ADDRESS_B?: string
}

export interface ResolvedSender {
  option: SenderOption
  email: string
  name: string
}

const SANDBOX_SENDER_EMAIL = 'onboarding@resend.dev'
const SENDER_NAME = 'Sobres'

export function resolveSender(env: EmailSenderEnv): ResolvedSender {
  if (env.EMAIL_SENDER_OPTION === 'B') {
    if (!env.EMAIL_SENDER_ADDRESS_B) {
      throw new Error('EMAIL_SENDER_ADDRESS_B must be set when EMAIL_SENDER_OPTION is "B"')
    }
    return { option: 'B', email: env.EMAIL_SENDER_ADDRESS_B, name: SENDER_NAME }
  }

  return { option: 'A', email: SANDBOX_SENDER_EMAIL, name: SENDER_NAME }
}
