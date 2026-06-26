-- Initial schema for Sobres personal finance app
-- Apply this in Supabase → SQL Editor

create extension if not exists "uuid-ossp";

create table currencies (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  symbol text not null,
  type text not null check (type in ('fiat', 'stable', 'crypto')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into currencies (code, name, symbol, type, sort_order) values
  ('USDC','USD Coin','$','stable',1),('USDt','Tether USD','$','stable',2),
  ('USD','Dólar americano','$','fiat',3),('DOC','Dollar on Chain','$','stable',4),
  ('VES','Bolívar venezolano','Bs.','fiat',5),('EUR','Euro','€','fiat',6),
  ('BTC','Bitcoin','₿','crypto',7);

create table exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency_id uuid not null references currencies(id),
  to_currency_id uuid not null references currencies(id),
  rate numeric(20,8) not null,
  rate_date date not null,
  source text,
  created_at timestamptz not null default now(),
  unique (from_currency_id, to_currency_id, rate_date)
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  base_currency_id uuid references currencies(id),
  country text,
  multi_currency boolean not null default false,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger as $$
begin insert into users (id, email) values (new.id, new.email); return new; end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure handle_new_user();

create table wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  currency_id uuid not null references currencies(id),
  type text not null default 'asset' check (type in ('asset','credit')),
  credit_limit numeric(20,2),
  balance numeric(20,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table envelopes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  parent_id uuid references envelopes(id) on delete cascade,
  name text not null,
  category text not null,
  priority text not null default 'flexible'
    check (priority in ('critico','importante','flexible')),
  emoji text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table budget (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  envelope_id uuid not null references envelopes(id) on delete cascade,
  wallet_id uuid references wallets(id) on delete set null,
  name text not null,
  base_amount numeric(20,2) not null,
  currency_id uuid not null references currencies(id),
  frequency text not null default 'monthly'
    check (frequency in ('monthly','quarterly','semiannual','annual')),
  payment_day integer check (payment_day between 1 and 31),
  start_month integer check (start_month between 1 and 12),
  spending_type text not null default 'flexible'
    check (spending_type in ('supervivencia','flexible','crecimiento')),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  wallet_id uuid references wallets(id) on delete set null,
  envelope_id uuid references envelopes(id) on delete set null,
  date date not null,
  description text not null,
  status text not null default 'apartado'
    check (status in ('apartado','pagado','anulado')),
  type text not null default 'expense' check (type in ('expense','income')),
  origin_currency_id uuid not null references currencies(id),
  origin_amount numeric(20,2) not null,
  payment_currency_id uuid not null references currencies(id),
  payment_amount numeric(20,2) not null,
  conversion_rate numeric(20,8),
  base_currency_id uuid not null references currencies(id),
  base_amount numeric(20,2) not null,
  base_rate numeric(20,8),
  installment_number integer,
  installment_total integer,
  group_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_wallets_user on wallets(user_id);
create index idx_envelopes_user on envelopes(user_id);
create index idx_envelopes_parent on envelopes(parent_id);
create index idx_budget_user on budget(user_id);
create index idx_transactions_user on transactions(user_id);
create index idx_transactions_date on transactions(date desc);
create index idx_transactions_status on transactions(status);
create index idx_transactions_group on transactions(group_id);

alter table users enable row level security;
alter table wallets enable row level security;
alter table envelopes enable row level security;
alter table budget enable row level security;
alter table transactions enable row level security;

create policy "users_own" on users for all using (auth.uid() = id);
create policy "wallets_own" on wallets for all using (auth.uid() = user_id);
create policy "envelopes_own" on envelopes for all using (auth.uid() = user_id);
create policy "budget_own" on budget for all using (auth.uid() = user_id);
create policy "transactions_own" on transactions for all using (auth.uid() = user_id);
