# Sprint 05 — Debt Dashboard, Envelope Progress & Cashea

## Goals
- Debt dashboard: credit wallet cards with limit/used/available
- Envelope spending progress: spent vs. budgeted per envelope
- Cashea installment flow: register a purchase in N installments

## Tasks

### 1. Debt Dashboard (DebtsPage)
- [ ] Supabase: `getCreditWallets(userId)` — wallets where type = 'credit'
- [ ] Component `TDCCard`: shows name, currency, used amount, limit, available, progress bar
- [ ] `DebtsPage`: list TDC cards + empty state + link to create credit wallet

### 2. Envelope Progress (BudgetPage / new hook)
- [ ] Supabase: `getEnvelopeSpending(userId, month)` — sum of pagado transactions per envelope_id
- [ ] Hook `useEnvelopeSpending(userId, month)` — returns `{ envelopeId, spent }[]`
- [ ] `BudgetItemRow`: show progress bar (spent / baseAmount), color green→amber→coral
- [ ] `BudgetPage`: pass spending data down; show current month selector

### 3. Cashea Installment Flow
- [ ] Supabase: `createCasheaGroup(transactions[])` — inserts N transactions with same group_id, installment_number 1..N, installment_total N
- [ ] Hook `useCreateCasheaGroup()`
- [ ] Component `CasheaForm`: description, total amount, installments (2–24), start month/day, envelope, wallet, currency
- [ ] `CasheaModal`: modal wrapper for the form
- [ ] `TransactionsPage`: "Cashea" button opens modal

## Definition of Done
- [ ] All tests pass
- [ ] Zero TypeScript errors
- [ ] TDC cards visible on Debts page
- [ ] Envelope progress bars visible on Budget page
- [ ] Cashea installments create correctly grouped transactions

## Notes for Next Sprint (06)
- Wallet balance tracking: deduct from wallet when transaction marked pagado
- Multi-currency transactions (exchange rate picker)
- Income flow refinements
