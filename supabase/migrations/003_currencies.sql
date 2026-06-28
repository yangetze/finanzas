-- Upsert all supported currencies.
-- Safe to re-run: conflicts on code are ignored.

INSERT INTO currencies (code, name, symbol, type, sort_order) VALUES
  ('USDC', 'USD Coin',            '$',  'stable', 1),
  ('USDt', 'Tether USD',          '$',  'stable', 2),
  ('USD',  'Dólar americano',     '$',  'fiat',   3),
  ('DOC',  'Dollar on Chain',     '$',  'stable', 4),
  ('VES',  'Bolívar venezolano',  'Bs.','fiat',   5),
  ('EUR',  'Euro',                '€',  'fiat',   6),
  ('BTC',  'Bitcoin',             '₿',  'crypto', 7)
ON CONFLICT (code) DO UPDATE SET
  name       = EXCLUDED.name,
  symbol     = EXCLUDED.symbol,
  type       = EXCLUDED.type,
  sort_order = EXCLUDED.sort_order,
  is_active  = true;
