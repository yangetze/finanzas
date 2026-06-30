# Resend + Vercel + Supabase SMTP Setup

## Goal
Replace Supabase's built-in SMTP relay (limited to ~4 emails/hour/project,
shared across all auth email types) with Resend as custom SMTP, so magic
link logins don't hit 429 "email rate limit exceeded" under normal use.

## Current status

> Update this section as you progress — it's the single source of truth for
> which sender option is active.

- **Active option:** `A — Resend sandbox domain (onboarding@resend.dev)`
- **Custom domain owned:** No
- **Resend account created:** No
- **Vercel Marketplace integration added:** No
- **Supabase custom SMTP configured:** No
- **`send-email` Edge Function deployed:** No

## The two sender options

This setup supports two interchangeable sender configurations. Only the
**sender email** field in Supabase's SMTP settings changes between them —
everything else (host, port, username, password) stays the same. You can
start on Option A today and flip to Option B later in under a minute, no
code changes required.

### Option A — Resend sandbox domain (use now)
- Sender: `onboarding@resend.dev`
- No DNS setup required, works immediately after creating a Resend account
- Good enough for development/testing and for a small number of real users
- Downside: less deliverability trust (more likely to land in spam), can't
  customize the "from" address to match the app (e.g. `noreply@sobres.app`)

### Option B — Custom domain (use once you own a domain)
- Sender: `noreply@yourdomain.com` (or similar) on a domain you control
- Requires adding the domain in Resend and publishing SPF/DKIM/DMARC DNS
  records wherever that domain's DNS is managed
- Verification typically takes minutes to a few hours depending on the DNS
  host
- Better deliverability, branded sender address — recommended once the app
  has a real domain

## Implementation steps

### 1. Create a Resend account (your manual step)
Sign up at resend.com. This is the one step that has to happen outside of
this session — accounts can't be created on your behalf.

### 2. Add the Resend integration from Vercel Marketplace
- Vercel dashboard → `finanzas` project → **Integrations** → **Browse
  Marketplace** → search "Resend" → **Add Integration**
- Connect it to the `finanzas` project
- This auto-creates a `RESEND_API_KEY` environment variable on the project
  (Production + Preview + Development) — no manual key copying into Vercel
  needed

### 3. Pick your sender per the "Current status" section above
- **If Option A (now):** nothing to do in Resend beyond having the account —
  `onboarding@resend.dev` works out of the box
- **If Option B (later, once you own a domain):**
  1. Resend dashboard → **Domains** → **Add Domain**
  2. Add the SPF/DKIM/DMARC DNS records Resend provides to your domain's DNS
  3. Wait for Resend to mark the domain as verified

### 4. Configure Supabase Auth custom SMTP
- Supabase dashboard → project `aimhmbyfrxjamkehibup` → **Project Settings →
  Authentication → SMTP Settings** → enable "Custom SMTP"
- Fill in:
  | Field | Value |
  |---|---|
  | Host | `smtp.resend.com` |
  | Port | `465` (SSL) or `587` (STARTTLS) |
  | Username | `resend` |
  | Password | your Resend API key (`re_...`, from Resend dashboard → API Keys) |
  | Sender email | `onboarding@resend.dev` (Option A) or `noreply@yourdomain.com` (Option B) |
  | Sender name | `Sobres` |
- Save

### 5. Test
- Request a magic link from `/login` and confirm delivery, and that the
  previous 429 no longer triggers under normal use

## Switching from Option A to Option B later
1. Verify your domain in Resend (step 3, Option B)
2. Go back to Supabase SMTP Settings and change the **Sender email** field
   to the new address on your verified domain
3. Update the "Current status" section at the top of this doc
4. No Vercel or app code changes needed — the API key and SMTP
   host/port/username stay identical

## `send-email` Edge Function (custom transactional emails)

Steps 1-5 above cover Supabase Auth emails (magic links), which Supabase
sends internally once custom SMTP is configured — no app code involved.

For any email the app itself needs to trigger (e.g. a future welcome email
or notification), this repo includes a Supabase Edge Function at
`supabase/functions/send-email` that calls the Resend API directly. It
shares the same Option A/B sender choice as the SMTP setup, controlled by
Edge Function secrets rather than the Supabase dashboard SMTP form.

### Sender resolution
`supabase/functions/send-email/email-config.ts` exports `resolveSender()`,
a pure function (unit tested in `email-config.test.ts`) that decides the
"from" address:
- `EMAIL_SENDER_OPTION` unset or anything other than `"B"` → Option A,
  `onboarding@resend.dev`
- `EMAIL_SENDER_OPTION=B` → Option B, using `EMAIL_SENDER_ADDRESS_B`
  (throws if that var isn't set)

### Deploying and configuring secrets
1. Set secrets on the Supabase project (these are Edge Function secrets,
   separate from the Vercel `RESEND_API_KEY` env var from step 2):
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxx --project-ref aimhmbyfrxjamkehibup
   # Only needed once you're on Option B:
   supabase secrets set EMAIL_SENDER_OPTION=B EMAIL_SENDER_ADDRESS_B=noreply@yourdomain.com --project-ref aimhmbyfrxjamkehibup
   ```
2. Deploy: `supabase functions deploy send-email --project-ref aimhmbyfrxjamkehibup`
3. Mark "Edge Function deployed" as Yes in the "Current status" section
   above

### Calling it from the app
```ts
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Hola', html: '<p>...</p>' },
})
```
The function requires a valid Supabase session JWT (`verify_jwt: true`),
so it can only be called from an authenticated client — it is not a public
webhook.
