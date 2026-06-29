# Sprint 03 — Envelopes & Budget Template

**Goal**: A user can create envelopes (groups + sub-envelopes) with priority and emoji,
define a monthly budget template (recurring items), and open a new month to generate
all scheduled transactions as `apartado`.

**Business value**: Envelopes + budget template are the core of the zero-based budgeting
system. Without them the app has no purpose beyond tracking wallets.

---

## Pre-flight Checklist

- [x] Sprint 02 merged and deployed
- [x] `envelopes` table in schema with RLS
- [x] `budget_items` table in schema with RLS
- [x] `Envelope`, `BudgetItem` types in `src/types/index.ts`

---

## Envelopes Feature (TDD)

### DB helpers (`src/lib/supabase.ts`)
- [ ] `getEnvelopes(userId)` — fetch active envelopes ordered by sort_order
- [ ] `createEnvelope(data)` — insert envelope
- [ ] `updateEnvelope(id, data)` — update envelope fields
- [ ] `deactivateEnvelope(id)` — set is_active = false

### Hook (`src/hooks/useEnvelopes.tsx`)
- [ ] TEST: returns envelope list mapped to camelCase
- [ ] TEST: loading state
- [ ] TEST: createEnvelope calls supabase
- [ ] IMPL: `useEnvelopes()`, `useCreateEnvelope()`, `useUpdateEnvelope()`, `useDeactivateEnvelope()`

### Components (`src/components/envelopes/`)
- [ ] TEST: `EnvelopeCard` renders name, priority badge, emoji
- [ ] TEST: `EnvelopeCard` shows sub-envelope count
- [ ] TEST: `EnvelopeForm` validates required name field
- [ ] TEST: `EnvelopeForm` shows parent selector for sub-envelopes
- [ ] IMPL: `EnvelopeCard.tsx`
- [ ] IMPL: `EnvelopeForm.tsx`

### Page (`src/pages/EnvelopesPage.tsx`)
- [ ] IMPL: list envelopes grouped by parent (groups at top, sub-envelopes indented)
- [ ] IMPL: create/edit inline form
- [ ] IMPL: empty state

---

## Budget Template Feature (TDD)

### DB helpers (`src/lib/supabase.ts`)
- [ ] `getBudgetItems(userId)` — fetch active budget items
- [ ] `createBudgetItem(data)` — insert item
- [ ] `updateBudgetItem(id, data)` — update item
- [ ] `deactivateBudgetItem(id)` — set is_active = false

### Hook (`src/hooks/useBudgetItems.tsx`)
- [ ] TEST: returns mapped items
- [ ] TEST: createBudgetItem calls supabase
- [ ] IMPL: `useBudgetItems()`, `useCreateBudgetItem()`, `useUpdateBudgetItem()`, `useDeactivateBudgetItem()`

### Components (`src/components/budget/`)
- [ ] TEST: `BudgetItemRow` renders name, amount, currency, frequency
- [ ] TEST: `BudgetForm` validates required fields
- [ ] TEST: `BudgetForm` shows spending type selector
- [ ] IMPL: `BudgetItemRow.tsx`
- [ ] IMPL: `BudgetForm.tsx`

### Page (`src/pages/BudgetPage.tsx`)
- [ ] IMPL: list items grouped by spending type (supervivencia / flexible / crecimiento)
- [ ] IMPL: total by group in base currency
- [ ] IMPL: create/edit form

---

## Definition of Done

- [ ] All tests pass (`pnpm test:run`)
- [ ] Zero TypeScript errors
- [ ] Envelopes CRUD works end-to-end
- [ ] Budget template CRUD works end-to-end
- [ ] Pushed to `main` and deployed

---

## Notes for Next Sprint (04)

- Transaction registration form (the core daily-use feature)
- Month opener: generates apartado transactions from budget template
- Dashboard: envelope progress bars, upcoming payments
