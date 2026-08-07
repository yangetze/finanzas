-- Migration: 025_sprint13_personal_debt_index_currency
-- Sprint: 13 — Moneda de indexación en deudas personales
-- personal_debts.is_indexed previously had no way to record WHICH currency
-- the debt is indexed to — currency_id was overloaded as both the currency
-- the debt is recorded/paid in and (implicitly) the peg. Adds an explicit
-- index_currency_id. It may equal currency_id (a debt fixed and indexed in
-- the same currency, e.g. "$18.56, indexed", payable in anything else at
-- the day's rate) or differ from it (e.g. a debt recorded in VES but
-- indexed to USD). Required when is_indexed is true; must stay null
-- otherwise.
-- Affected tables: personal_debts (new column index_currency_id)

alter table personal_debts add column index_currency_id uuid references currencies(id);

-- Backfill existing indexed debts: before this column existed, currency_id
-- doubled as the implicit peg, so that's the correct index currency for them.
update personal_debts
set index_currency_id = currency_id
where is_indexed = true and index_currency_id is null;

alter table personal_debts add constraint personal_debts_index_currency_check
  check (
    (is_indexed = false and index_currency_id is null)
    or (is_indexed = true and index_currency_id is not null)
  );
