-- Migration: 011_transfers
-- Adds transfers table: money moved between wallets, with optional
-- commission (recorded as a linked expense transaction) and possible
-- currency change between origin and destination.
-- Needed for the wallet-to-wallet transfer feature: keeps an audit
-- trail of movements and enables per-currency commission totals
-- without polluting income/expense stats.
-- Affected tables: transfers (new)

create table transfers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  from_wallet_id uuid not null references wallets(id),
  to_wallet_id uuid not null references wallets(id),
  from_currency_id uuid not null references currencies(id),
  to_currency_id uuid not null references currencies(id),
  amount_sent numeric(20,2) not null,
  commission numeric(20,2) not null default 0,
  amount_received numeric(20,2) not null,
  commission_transaction_id uuid references transactions(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_transfers_user_date on transfers(user_id, date);

alter table transfers enable row level security;

create policy "transfers_own" on transfers for all using (auth.uid() = user_id);
