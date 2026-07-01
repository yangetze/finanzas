-- envelopes: add spend_category
ALTER TABLE envelopes
  ADD COLUMN IF NOT EXISTS spend_category text
  CHECK (spend_category IS NULL OR spend_category = ANY (ARRAY['supervivencia','flexible','crecimiento']));

-- budget_items: add payment currency + reference rate
ALTER TABLE budget_items
  ADD COLUMN IF NOT EXISTS payment_currency_id uuid REFERENCES currencies(id),
  ADD COLUMN IF NOT EXISTS reference_rate numeric;

-- transactions: add budget_item_id
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS budget_item_id uuid REFERENCES budget_items(id);

-- transactions: add pendiente to status enum
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions
  ADD CONSTRAINT transactions_status_check
  CHECK (status = ANY (ARRAY['apartado','pendiente','pagado','anulado']));

-- RLS: currencies (read-only for everyone)
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "currencies_read_all" ON currencies;
CREATE POLICY "currencies_read_all" ON currencies FOR SELECT USING (true);

-- RLS: exchange_rates (read for all, write for authenticated)
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exchange_rates_read_all" ON exchange_rates;
CREATE POLICY "exchange_rates_read_all" ON exchange_rates FOR SELECT USING (true);
DROP POLICY IF EXISTS "exchange_rates_write_authenticated" ON exchange_rates;
CREATE POLICY "exchange_rates_write_authenticated"
  ON exchange_rates FOR ALL TO authenticated USING (true) WITH CHECK (true);
