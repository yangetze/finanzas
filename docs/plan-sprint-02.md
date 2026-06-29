# Sprint 02 — Wallets & Exchange Rates

**Goal**: A user can manage their wallets (the physical places where money lives),
view and add exchange rates manually, and optionally fetch the live BCV rate
from the DolarVzla API. Multi-currency features are gated behind `user.multi_currency`.

**Business value**: Before any transactions can be recorded, the user needs wallets
configured. Exchange rates are needed to register VES expenses. These two features
unblock all future sprint work.

---

## Pre-flight Checklist

- [x] Sprint 01 merged and deployed
- [x] `currencies` table seeded (migration 003)
- [x] `wallets` table in schema with RLS
- [x] `exchange_rates` table in schema with RLS
- [ ] Supabase Dashboard: enable RLS policies for exchange_rates (verify)
- [ ] Supabase Dashboard: Auth → Site URL set to Vercel production URL

---

## Wallets Feature (TDD)

### Types (already in `src/types/index.ts`)
- [x] `Wallet`, `WalletType` interfaces defined

### DB helpers (`src/lib/supabase.ts`)
- [ ] `getWallets(userId)` — fetch active wallets ordered by sort_order
- [ ] `createWallet(data)` — insert wallet
- [ ] `updateWallet(id, data)` — update wallet fields
- [ ] `deactivateWallet(id)` — set is_active = false

### Hook (`src/hooks/useWallets.tsx`)
- [ ] TEST: returns wallet list from query
- [ ] TEST: loading state while fetching
- [ ] TEST: createWallet calls supabase correctly
- [ ] IMPL: `useWallets()` with TanStack Query
- [ ] IMPL: `useCreateWallet()` mutation
- [ ] IMPL: `useUpdateWallet()` mutation
- [ ] IMPL: `useDeactivateWallet()` mutation

### Components (`src/components/wallets/`)
- [ ] TEST: `WalletCard` renders name, balance, currency symbol
- [ ] TEST: `WalletCard` shows credit limit row for credit type
- [ ] TEST: `WalletForm` validates required fields (name, currency, type)
- [ ] TEST: `WalletForm` shows credit limit field only when type = credit
- [ ] IMPL: `WalletCard.tsx` — shows name, balance, currency, edit button
- [ ] IMPL: `WalletForm.tsx` — create/edit modal (name, currency, type, credit_limit, notes)

### Page (`src/pages/WalletsPage.tsx`)
- [ ] TEST: renders "Agregar billetera" button
- [ ] TEST: empty state when no wallets
- [ ] TEST: lists wallets grouped by type (asset / credit)
- [ ] IMPL: `WalletsPage.tsx` — list + FAB to create
- [ ] Wire into `src/App.tsx` route `/wallets`

---

## Exchange Rates Feature (TDD)

Only shown when `user.multi_currency = true`.

### DB helpers (`src/lib/supabase.ts`)
- [ ] `getExchangeRates(userId)` — fetch rates for today ordered by date desc
- [ ] `upsertExchangeRate(data)` — insert or update rate for (from, to, date)

### BCV API helper (`src/lib/bcv.ts`)
- [ ] `fetchBcvRate()` — calls `https://ve.dolarapi.com/v1/dolares/oficial`
       returns `{ rate: number, date: string }` or throws
- [ ] TEST: returns parsed rate on success
- [ ] TEST: throws on network error / non-200

### Hook (`src/hooks/useExchangeRates.tsx`)
- [ ] TEST: returns rate list
- [ ] TEST: upsertRate invalidates query cache
- [ ] IMPL: `useExchangeRates()` with TanStack Query
- [ ] IMPL: `useUpsertRate()` mutation

### Components (`src/components/exchange-rates/`)
- [ ] TEST: `RateCard` renders from/to currencies and rate value
- [ ] TEST: `RateForm` shows "Obtener tasa BCV" button when currencies include VES
- [ ] TEST: `RateForm` populates rate field on successful BCV fetch
- [ ] IMPL: `RateCard.tsx`
- [ ] IMPL: `RateForm.tsx` — from_currency, to_currency, rate, date, source

### Page (`src/pages/ExchangeRatesPage.tsx`)
- [ ] TEST: shows empty state for single-currency user (multi_currency = false)
- [ ] TEST: shows rate list for multi-currency user
- [ ] TEST: "Agregar tasa" button opens RateForm
- [ ] IMPL: Replace placeholder with real implementation

---

## Dashboard — Wallet Summary

Show wallet balances on the dashboard so the user can see their money at a glance.

- [ ] IMPL: `DashboardPage.tsx` — wallet list section with total in base currency
- [ ] Multi-currency total: sum all wallet balances converted to base currency
  (stablecoins 1:1, others use latest exchange rate)

---

## Definition of Done

- [ ] All tests pass (`pnpm test:run`)
- [ ] Zero TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Wallets CRUD works end-to-end in browser
- [ ] Exchange rates: add manually + BCV fetch works
- [ ] Multi-currency features hidden for single-currency users
- [ ] Responsive on 375px and 1280px
- [ ] Pushed to `main` and deployed to Vercel
- [ ] `docs/plan-sprint-02.md` updated with all tasks checked

---

## Notes for Next Sprint (03)

After Sprint 02:
- Envelope CRUD (groups + sub-envelopes, priority, emoji)
- Budget template (recurring items, month opener)
- Onboarding step 2: create first envelope + wallet to complete setup
