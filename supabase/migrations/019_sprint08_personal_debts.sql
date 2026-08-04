-- Migration: 019_sprint08_personal_debts
-- Sprint: 08 — Deudas con personas
-- Adds tracking for person-to-person debts (distinct from institutional debt
-- on credit wallets): who owes whom, partial payments, and offsetting two
-- crossed debts with the same debtor (e.g. I owe them $5, they owe me $4 ->
-- offset $4, leaving $1 owed by me).
-- Affected tables: debtors, personal_debts, personal_debt_payments (all new)

create table debtors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_debtors_user on debtors(user_id);

alter table debtors enable row level security;
create policy "debtors_own" on debtors for all using (auth.uid() = user_id);

create table personal_debts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  debtor_id uuid not null references debtors(id) on delete cascade,
  direction text not null check (direction in ('they_owe_me', 'i_owe_them')),
  description text not null,
  currency_id uuid not null references currencies(id),
  original_amount numeric(20,2) not null,
  date date not null,
  status text not null default 'open' check (status in ('open', 'partial', 'paid')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_personal_debts_user on personal_debts(user_id);
create index idx_personal_debts_debtor on personal_debts(debtor_id);

alter table personal_debts enable row level security;
create policy "personal_debts_own" on personal_debts for all using (auth.uid() = user_id);

create table personal_debt_payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  personal_debt_id uuid not null references personal_debts(id) on delete cascade,
  wallet_id uuid references wallets(id),
  amount numeric(20,2) not null,
  currency_id uuid not null references currencies(id),
  date date not null,
  payment_type text not null default 'payment' check (payment_type in ('payment', 'offset')),
  offset_group_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  constraint personal_debt_payments_wallet_matches_type check (
    (payment_type = 'payment' and wallet_id is not null)
    or (payment_type = 'offset' and wallet_id is null)
  )
);

create index idx_personal_debt_payments_debt on personal_debt_payments(personal_debt_id);
create index idx_personal_debt_payments_offset_group on personal_debt_payments(offset_group_id);

alter table personal_debt_payments enable row level security;
create policy "personal_debt_payments_own" on personal_debt_payments for all using (auth.uid() = user_id);
