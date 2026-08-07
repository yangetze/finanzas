-- Migration: 022_sprint12_exchange_rates_admin
-- Sprint: 12 — Tasas de cambio: admin-only + carga automática diaria
-- Restricts exchange_rates writes (insert/update/delete) to users.is_admin.
-- Reads stay open to any authenticated user via the existing
-- exchange_rates_read_all policy. Previously any authenticated user could
-- write, which was a gap left over from sprint 07 (is_admin existed but was
-- never enforced on this table).
-- Affected tables: exchange_rates (policies only, no schema change)

DROP POLICY IF EXISTS "exchange_rates_write_authenticated" ON exchange_rates;

CREATE POLICY "exchange_rates_write_admin"
  ON exchange_rates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));
