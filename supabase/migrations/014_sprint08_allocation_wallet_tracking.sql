-- Migration: 014_sprint08_allocation_wallet_tracking
-- Sprint: 08 — Wallet traceability for savings envelopes
-- Adds wallet_id to envelope_allocations so "Abrir mes" records which wallet
-- each allocation belongs to. Previously budget_items.wallet_id was captured
-- at item creation but discarded when allocation-type items were stamped,
-- so savings envelopes (is_savings=true) had no link to the physical wallet
-- holding the money — "¿dónde está guardado mi ahorro?" was unanswerable.
-- Affected tables: envelope_allocations

alter table envelope_allocations
  add column if not exists wallet_id uuid references wallets(id) on delete set null;
