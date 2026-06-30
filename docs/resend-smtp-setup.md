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
