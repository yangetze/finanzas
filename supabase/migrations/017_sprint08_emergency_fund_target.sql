-- Migration: 017_sprint08_emergency_fund_target
-- Sprint: 08 — Configurable Baby Step 1 goal
-- Adds emergency_fund_target to users so the $1,000 Baby Step 1 goal
-- (previously hardcoded) can be adjusted per user's own reality.
-- Defaults to 1000 (Dave Ramsey's starter emergency fund) for existing rows.
-- Affected tables: users

alter table users
  add column if not exists emergency_fund_target numeric(20,2) not null default 1000;
