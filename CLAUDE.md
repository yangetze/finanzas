# CLAUDE.md — Sobres Finance App

## What This Is
Personal finance app using Budget Zero (envelope budgeting).
Multi-currency, Venezuela-first, globally usable.
See `docs/business-context.md` for full product context.

## Stack
- Frontend: React 18 + TypeScript + Vite + pnpm
- Styling: Tailwind CSS v3
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Hosting: Vercel
- Router: React Router v6
- Data fetching: TanStack Query v5
- Testing: Vitest + React Testing Library
- Icons: Lucide React

## Key Rules
- UI text → Spanish
- Code, DB columns, comments → English
- DB naming → snake_case
- TypeScript naming → camelCase
- Components → PascalCase.tsx
- Hooks → useCamelCase.tsx
- Path alias: `@/` maps to `./src/`
- No `any` in TypeScript
- Every new Supabase table MUST have RLS policies
- Never hardcode currency names — always fetch from `currencies` table
- Never assume base currency is USDC — use `user.base_currency_id`
- Stablecoins (USDC, USDt, DOC) are 1:1 with USD — no conversion between them
- Multi-currency UI only appears when `user.multi_currency = true`

## Testing (TDD)
Write the test FIRST. Watch it fail. Then implement.
- Unit tests: pure functions, hooks
- Component tests: user interactions with React Testing Library
- `pnpm test` → watch mode
- `pnpm test:run` → CI/single run

## Sprint Workflow
1. Read `docs/plan-sprint-XX.md` before starting any sprint
2. Work through tasks in order
3. Mark tasks `[x]` as completed
4. Commit after each completed task group
5. Create next sprint plan before ending current one

## Commit Style
```
feat: add magic link login flow
test: add useAuth hook tests
fix: correct VES conversion rate calculation
chore: move legacy files to /legacy folder
```

## File Structure
```
src/
  components/
    ui/            ← Button, Input, Modal, Badge, Card, ProgressBar
    layout/        ← AppShell, Sidebar, MobileNav, Header
    envelopes/     ← EnvelopeCard, EnvelopeGroup, SubEnvelope
    transactions/  ← TransactionList, TransactionForm, CasheaModal
    budget/        ← BudgetList, BudgetForm, MonthOpener
    debts/         ← DebtDashboard, TDCCard, CasheaGroup
    babysteps/     ← StepCard, GoalProgress
    exchange-rates/← RateCard, RateForm
  hooks/
  lib/
    supabase.ts    ← client, auth helpers, DB helpers
    utils.ts       ← formatCurrency, formatDate, calcBaseAmount
  pages/
  types/
    index.ts       ← All TypeScript interfaces
```

## Design Tokens (Tailwind)
Background: canvas (#0F0E0C), canvas-soft (#1A1917), canvas-muted (#242320)
Border: #2E2D2A
Text: ink (#E8E4D8), ink-muted (#8A8778), ink-faint (#5A5850)
Accent: gold (#C8B97A), sage (#7AB89E), coral (#C87A7A), amber-fin (#C8A07A)
Fonts: Fraunces (display/brand, italic), DM Mono (body), Inter (UI labels)

## Hosting
Vercel auto-deploys from `main` branch.
Required env vars in Vercel dashboard:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
