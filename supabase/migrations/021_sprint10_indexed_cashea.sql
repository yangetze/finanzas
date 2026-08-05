-- Migration: 021_sprint10_indexed_cashea
-- Sprint: 10 — Cashea indexado
-- Extends the sprint 09 "indexed" concept (amount anchored in one currency,
-- paid in another at the rate valid on the day of payment) to transactions,
-- primarily Cashea installments. transactions already has the
-- origin/payment/base currency + rate columns this relies on (see
-- 001_initial_schema.sql) — only the flag itself is new.
-- Affected tables: transactions (new column is_indexed)

alter table transactions add column is_indexed boolean not null default false;
