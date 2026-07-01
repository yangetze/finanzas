# Sprint 06 — Budget Revamp + Stamp Month

## Goal
Transform budget_items from a simple per-envelope allocation into a recurring
expense template system. Each item is a named bill with a wallet, payment
currency, and reference rate. At month-start, one button stamps all active
items as pending transactions. The BudgetPage shows budgeted / spent / pending
per envelope group.

## DB changes (migration 007)
- [x] envelopes: add `spend_category` (supervivencia | flexible | crecimiento, nullable)
- [x] budget_items: add `payment_currency_id` FK (nullable), `reference_rate` numeric (nullable)
- [x] transactions: add `budget_item_id` FK (nullable), add 'pendiente' to status enum
- [x] RLS: enable on `currencies` (SELECT for all) and `exchange_rates` (SELECT + write for authenticated)

## Tasks
- [x] Migration 007 applied
- [x] `src/types/index.ts` — add new fields to Envelope, BudgetItem, Transaction; add 'pendiente' to TransactionStatus
- [x] `src/lib/supabase.ts` — update all CRUD helpers for new fields; add stampMonth()
- [x] `src/lib/stampMonth.ts` — pure buildStampedTransactions() with frequency logic
- [x] `src/lib/stampMonth.test.ts` — TDD tests for pure stamp logic
- [x] `src/hooks/useEnvelopePending.tsx` — aggregate pendiente transactions by envelope for current month
- [x] `src/hooks/useEnvelopePending.test.tsx`
- [x] `src/hooks/useStampMonth.tsx` — mutation wrapper
- [x] `src/hooks/useBudgetItems.tsx` — map new fields
- [x] `BudgetItemRow` — add `pending` prop, show budgeted / spent / pending
- [x] `BudgetForm` — add payment_currency_id + reference_rate fields
- [x] `BudgetPage` — "Timbrar mes" button, wire pending metric

## Notes for Sprint 07
- Envelope form: expose spend_category field in UI
- TransactionsPage: filter/show pendiente tab, quick "mark pagado" action
- Wallet balance update when transaction marked pagado
- Multi-currency exchange rate picker at transaction time
