-- Migration: 013_allocations_and_savings
-- Foundation for variable budgets and savings envelopes:
--  1. envelopes.is_savings — savings envelopes accumulate their balance
--     across months (allocated - spent, all time) instead of resetting.
--  2. budget_items.item_type — 'fixed' items stamp payable pendiente
--     transactions (bills); 'allocation' items define the envelope's
--     budget for the month without creating a fake payable.
--  3. envelope_allocations — the monthly allocation record per envelope,
--     written by Timbrar mes / Abrir mes. Enables "Disponible X de Y"
--     (month) and savings accumulation (all time), plus budget-vs-actual
--     comparison per month.
-- Affected tables: envelopes, budget_items, envelope_allocations (new)

alter table envelopes
  add column if not exists is_savings boolean not null default false;

alter table budget_items
  add column if not exists item_type text not null default 'fixed'
  check (item_type in ('fixed','allocation'));

create table envelope_allocations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  envelope_id uuid not null references envelopes(id) on delete cascade,
  year_month text not null,
  currency_id uuid not null references currencies(id),
  amount numeric(20,2) not null,
  created_at timestamptz not null default now(),
  unique (user_id, envelope_id, year_month, currency_id)
);

create index idx_envelope_allocations_user_month on envelope_allocations(user_id, year_month);

alter table envelope_allocations enable row level security;

create policy "envelope_allocations_own" on envelope_allocations for all using (auth.uid() = user_id);
