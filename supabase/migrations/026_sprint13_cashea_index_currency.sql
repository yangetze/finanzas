-- Migration: 026_sprint13_cashea_index_currency
-- Sprint: 13 — Moneda de indexación en deudas personales
-- Mirrors 025_sprint13_personal_debt_index_currency for transactions.
-- is_indexed (added in 021_sprint10_indexed_cashea, used by Cashea
-- installments) had no way to record WHICH currency the installment is
-- indexed to — origin_currency_id was overloaded as both the recorded
-- currency and the implicit peg. Adds an explicit index_currency_id so
-- e.g. an installment recorded in VES can declare it is indexed to USD.
-- Required and distinct from origin_currency_id when is_indexed is true;
-- must stay null otherwise.
-- Affected tables: transactions (new column index_currency_id)

alter table transactions add column index_currency_id uuid references currencies(id);

alter table transactions add constraint transactions_index_currency_check
  check (
    (is_indexed = false and index_currency_id is null)
    or (is_indexed = true and index_currency_id is not null and index_currency_id <> origin_currency_id)
  );
