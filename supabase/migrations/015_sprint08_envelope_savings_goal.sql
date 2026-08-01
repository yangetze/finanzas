-- Migration: 015_sprint08_envelope_savings_goal
-- Sprint: 08 — Meta de ahorro (savings goal) per envelope
-- Adds target_amount to envelopes so savings envelopes (is_savings=true) can
-- show "Acumulado $X de $Y" instead of just a running total with no target.
-- Nullable — most envelopes (non-savings) never set it, and savings
-- envelopes may accumulate indefinitely without a fixed goal.
-- Affected tables: envelopes

alter table envelopes
  add column if not exists target_amount numeric(20,2);
