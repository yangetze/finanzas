# Sprint 04 — Transaction Registration & Month Opener

## Goals
- Transaction CRUD (the core daily-use feature)
- Month opener: generate apartado transactions from budget template
- Dashboard: upcoming payments (apartado in next 30 days)

## Tasks

### 1. Supabase helpers for transactions
- [x] `getTransactions(userId, month?)` — filtered by YYYY-MM, excludes anulado
- [x] `createTransaction(data)` — single insert
- [x] `createTransactionsBatch(rows)` — bulk insert for month opener
- [x] `updateTransaction(id, data)` — partial update
- [x] `deleteTransaction(id)` — sets status = 'anulado'
- [x] `getUpcomingTransactions(userId)` — apartado in next 30 days

### 2. Month opener utility (pure functions)
- [x] `getApplicableItems(items, month)` — filter budget items by frequency/startMonth
- [x] `buildTransactionFromItem(item, userId, year, month, baseCurrencyId)` — create payload

### 3. useTransactions hook
- [x] `mapTransaction(row)` — snake→camelCase
- [x] `useTransactions(userId, month?)` — query
- [x] `useUpcomingTransactions(userId)` — query for dashboard
- [x] `useCreateTransaction()` — mutation
- [x] `useUpdateTransaction()` — mutation
- [x] `useDeleteTransaction()` — mutation (sets anulado)
- [x] `useCreateTransactionsBatch()` — mutation for month opener

### 4. TransactionRow component
- [x] Shows date, description, envelope name, amount with currency symbol
- [x] Status badge: Apartado (amber) / Pagado (sage) 
- [x] Actions: mark paid, edit, anular

### 5. TransactionForm component
- [x] Fields: date, description, type, envelope, wallet, currency, amount, status, notes
- [x] Validation: description required, amount > 0
- [x] Defaults: today's date, expense, pagado

### 6. TransactionsPage (updated)
- [x] Month selector (current month default)
- [x] List of transactions grouped/sorted by date
- [x] Inline form for create/edit
- [x] MonthOpener button

### 7. MonthOpener component
- [x] "Abrir mes" button
- [x] Confirmation dialog with item count
- [x] Creates batch of apartado transactions

### 8. DashboardPage (updated)
- [x] Upcoming payments section (apartado in next 30 days)

## Definition of Done
- [ ] All tests pass
- [ ] Zero TypeScript errors
- [ ] Transactions CRUD works end-to-end
- [ ] Month opener generates correct transactions
- [ ] Upcoming payments visible on dashboard

## Notes for Next Sprint (05)
- Multi-currency transaction support (exchange rate selection in form)
- Cashea installment flow (group_id, installment_number, installment_total)
- Debt dashboard (TDC cards with limit/used/available)
- Income registration flow
