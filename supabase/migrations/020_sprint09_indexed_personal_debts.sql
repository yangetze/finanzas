-- Migration: 020_sprint09_indexed_personal_debts
-- Sprint: 09 — Deudas personales indexadas
-- Adds support for personal debts anchored in one currency (e.g. USD) but
-- paid in a different currency (e.g. VES) at the exchange rate valid on the
-- day of payment, instead of a rate fixed when the debt was created. Reuses
-- the origin/payment-currency + conversion_rate pattern already used by
-- transactions (see 001_initial_schema.sql).
-- Affected tables: personal_debts (new column is_indexed),
-- personal_debt_payments (new columns payment_currency_id, payment_amount,
-- conversion_rate)

alter table personal_debts add column is_indexed boolean not null default false;

alter table personal_debt_payments add column payment_currency_id uuid references currencies(id);
alter table personal_debt_payments add column payment_amount numeric(20,2);
alter table personal_debt_payments add column conversion_rate numeric(20,8);

-- Backfill existing rows: payment happened in the debt's own currency, no
-- conversion involved.
update personal_debt_payments
set payment_currency_id = currency_id, payment_amount = amount
where payment_currency_id is null;

alter table personal_debt_payments alter column payment_currency_id set not null;
alter table personal_debt_payments alter column payment_amount set not null;

alter table personal_debt_payments add constraint personal_debt_payments_conversion_rate_check
  check (
    (payment_currency_id = currency_id and conversion_rate is null)
    or (payment_currency_id <> currency_id and conversion_rate is not null)
  );
