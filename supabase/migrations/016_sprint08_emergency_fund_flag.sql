-- Migration: 016_sprint08_emergency_fund_flag
-- Sprint: 08 — Baby Step 1 (fondo de emergencia)
-- Adds is_emergency_fund to envelopes so specific savings envelopes can be
-- flagged as contributing to Baby Step 1, independent of which parent group
-- they sit under — the user's real data has "Fondo Emergencia USD" and
-- "Fondo Emergencia Bs" / "Fondo de emergencia DOC" split across two
-- different parent groups, so a name- or parent-based lookup is unreliable.
-- Affected tables: envelopes

alter table envelopes
  add column if not exists is_emergency_fund boolean not null default false;
