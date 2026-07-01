# Sprint 07 — Admin Exchange Rates & UX Polish

## Goal
Add admin-only exchange rate management (yangetze+ro@gmail.com), restrict /tasas route to admins, add pending transactions tab with mark-as-paid + wallet deduction, add multi-currency rate picker in transaction form, and add spend_category to envelope form.

## Tasks

- [x] Update CLAUDE.md with migration documentation rule
- [x] Create and apply migration 008: add is_admin to users, set admin for yangetze+ro@gmail.com
- [x] Update types: add isAdmin to UserProfile
- [x] Update supabase.ts: map is_admin in getUserProfile; add markTransactionPaid; add getLatestExchangeRate
- [x] Add useMarkTransactionPaid hook to useTransactions.tsx
- [x] AppShell: hide /tasas nav item for non-admin users
- [x] TransactionsPage: add "Pendientes" tab filter + mark-as-paid with wallet deduction
- [x] TransactionForm: add exchange rate field when multiCurrency=true and fiat currency selected
- [x] EnvelopeForm: add spend_category selector (supervivencia / flexible / crecimiento, nullable)
- [x] EnvelopesPage: pass spendCategory through handleSubmit

## Exchange Rate Design (Option 2)
- Rates are global, managed by admin only (via /tasas page)
- At transaction time, latest rate is pre-filled but user can override
- No per-user rates; rate stored per-transaction as conversionRate

## Admin User
- Email: yangetze+ro@gmail.com
- is_admin = true set via migration
- Non-admin users cannot see /tasas in nav
