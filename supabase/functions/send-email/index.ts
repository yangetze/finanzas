import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { resolveSender } from './email-config.ts'

interface SendEmailRequest {
  to: string
  subject: string
  html: string
}

function isSendEmailRequest(body: unknown): body is SendEmailRequest {
  if (typeof body !== 'object' || body === null) return false
  const { to, subject, html } = body as Record<string, unknown>
  return typeof to === 'string' && typeof subject === 'string' && typeof html === 'string'
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await req.json().catch(() => null)
  if (!isSendEmailRequest(body)) {
    return new Response(
      JSON.stringify({ error: 'Request body must include "to", "subject" and "html" strings' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let sender
  try {
    sender = resolveSender({
      EMAIL_SENDER_OPTION: Deno.env.get('EMAIL_SENDER_OPTION'),
      EMAIL_SENDER_ADDRESS_B: Deno.env.get('EMAIL_SENDER_ADDRESS_B'),
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${sender.name} <${sender.email}>`,
      to: body.to,
      subject: body.subject,
      html: body.html,
    }),
  })

  const resendBody = await resendResponse.json()

  return new Response(JSON.stringify(resendBody), {
    status: resendResponse.status,
    headers: { 'Content-Type': 'application/json' },
  })
})
