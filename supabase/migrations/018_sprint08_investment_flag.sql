-- Migration: 018_sprint08_investment_flag
-- Sprint: 08 — Baby Step 4 (invertir el 15% del ingreso)
-- Adds counts_as_investment to envelopes so specific savings envelopes
-- (e.g. RetoBitcoin365, future brokerage envelopes) can be flagged as
-- retirement/long-term investment contributions, the same way
-- is_emergency_fund flags envelopes for Baby Step 1/3. Needed because
-- envelope name/parent grouping is unreliable (see migration 016).
-- Affected tables: envelopes

alter table envelopes
  add column if not exists counts_as_investment boolean not null default false;
