# Sprint 01 — Auth, Shell & User Setup

**Goal**: A user can sign up, receive a magic link, log in, complete onboarding,
and see the empty app shell. Session lasts 30 days.

**Business value**: Enables the owner to start using the app and validates
the auth flow before building any finance features.

---

## Pre-flight Checklist

Before writing any code, confirm:
- [x] Legacy files moved to `/legacy/`
- [x] `CLAUDE.md` created
- [x] `docs/business-context.md` created
- [x] `README.md` created
- [x] Supabase project connected (`.env` configured)
- [x] Schema applied in Supabase SQL Editor
- [ ] In Supabase → Authentication → Settings:
  - JWT expiry: `2592000` (30 days)
  - Site URL: `http://localhost:5173`
  - Redirect URLs: `http://localhost:5173/auth/callback`

---

## Setup Tasks

- [x] `pnpm create vite@latest . -- --template react-ts`
- [x] Configure Tailwind CSS v3 + postcss
- [x] Add `@/` path alias in `vite.config.ts` and `tsconfig.json`
- [x] Install: `@supabase/supabase-js react-router-dom @tanstack/react-query lucide-react clsx date-fns`
- [x] Install dev: `vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`
- [x] Configure `vitest.config.ts` with jsdom environment
- [x] Add test scripts to `package.json`: `test` (watch), `test:run` (CI)
- [x] Create `src/lib/supabase.ts`
- [x] Create `src/types/index.ts` with all interfaces
- [x] Create `.env.example`
- [x] Create `vercel.json` for SPA routing
- [x] Add Google Fonts import (Fraunces + DM Mono) to `index.html`
- [x] Configure `tailwind.config.js` with custom design tokens

---

## Auth Tasks (TDD)

### Tests first (`src/lib/supabase.test.ts`)
- [x] TEST: `signInWithMagicLink('test@test.com')` calls `supabase.auth.signInWithOtp`
       with correct email and redirect URL
- [x] TEST: `signOut()` calls `supabase.auth.signOut()`

### Tests first (`src/hooks/useAuth.test.tsx`)
- [x] TEST: `useAuth` returns `{ session: null, user: null, loading: true }` initially
- [x] TEST: `useAuth` returns user data when session exists
- [x] TEST: `useAuth` returns `loading: false` after session check completes

### Implementation
- [x] IMPL: `signInWithMagicLink(email)` in `src/lib/supabase.ts`
- [x] IMPL: `signOut()` in `src/lib/supabase.ts`
- [x] IMPL: `AuthContext` + `AuthProvider` + `useAuth` in `src/hooks/useAuth.tsx`
- [x] IMPL: `src/pages/LoginPage.tsx`
- [x] IMPL: `src/pages/AuthCallbackPage.tsx`

---

## Routing Tasks

### Tests first (`src/components/layout/RequireAuth.test.tsx`)
- [x] TEST: Redirects to `/login` when no session
- [x] TEST: Redirects to `/onboarding` when session exists but `onboarding_done = false`
- [x] TEST: Renders children when session exists and `onboarding_done = true`

### Implementation
- [x] IMPL: `RequireAuth` component
- [x] IMPL: `src/App.tsx` with all routes

---

## Onboarding Tasks (TDD)

### Tests first (`src/pages/OnboardingPage.test.tsx`)
- [x] TEST: Shows Step 1 (name) on load
- [x] TEST: Next button disabled when required field empty (Step 2 currency required)
- [x] TEST: On final submit, calls `supabase.from('users').update(...)` with correct data
- [x] TEST: On success, redirects to `/dashboard`

### Implementation
- [x] IMPL: `src/pages/OnboardingPage.tsx` (3-step wizard)

---

## App Shell Tasks (TDD)

### Tests first (`src/components/layout/AppShell.test.tsx`)
- [x] TEST: Renders sidebar on desktop (>768px)
- [x] TEST: Renders bottom nav on mobile (<768px)
- [x] TEST: Active route is highlighted in nav
- [x] TEST: Sign out button calls `signOut()`

### Implementation
- [x] IMPL: `src/components/layout/AppShell.tsx`

---

## User Settings Tasks (TDD)

### Tests first (`src/pages/SettingsPage.test.tsx`)
- [x] TEST: Loads and displays current user name and currency
- [x] TEST: Saving updated name calls `supabase.from('users').update(...)`
- [x] TEST: Shows success toast on save

### Implementation
- [x] IMPL: `src/pages/SettingsPage.tsx`

---

## Placeholder Pages

- [x] IMPL: Empty states for all protected routes not built yet

---

## Base UI Components

- [x] `Button` — variants: primary, ghost, danger; sizes: sm, md, lg
- [x] `Input` — with label, error state, helper text
- [x] `Select` — styled dropdown
- [x] `Toggle` — on/off switch
- [x] `Card` — base card container
- [x] `Toast` — success/error notifications
- [x] `Spinner` — loading indicator
- [x] `StepIndicator` — for onboarding steps

---

## Definition of Done

- [x] All tests pass (`pnpm test:run`)
- [x] Zero TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Auth flow works end-to-end (requires live Supabase + email)
- [x] Responsive on 375px and 1280px
- [ ] Pushed to `main` and auto-deployed to Vercel
- [x] `docs/plan-sprint-01.md` updated with all tasks checked

---

## Notes for Next Sprint

After Sprint 01 is done, create `docs/plan-sprint-02.md` covering:
- Wallets CRUD (create, edit, deactivate)
- Exchange rates: view, add, update manually
- Fetch BCV rate suggestion from DolarVzla API
- The multi-currency conditional UI (only show if user.multi_currency = true)
