-- Add missing notes column to envelopes
ALTER TABLE envelopes ADD COLUMN IF NOT EXISTS notes text;

-- Rename budget table to budget_items (code expects budget_items)
ALTER TABLE budget RENAME TO budget_items;

-- Rename the RLS policy to match new table name
ALTER POLICY "budget_own" ON budget_items RENAME TO "budget_items_own";
