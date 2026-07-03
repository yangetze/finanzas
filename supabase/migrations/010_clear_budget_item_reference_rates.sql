-- Migration: 010_clear_budget_item_reference_rates
-- Reference rate was removed from the budget item form: the exchange
-- rate applies when the spend happens, not when planning it. Existing
-- stored rates are cleared so stamped transactions no longer prefill
-- a conversion from stale planning-time rates.
-- Affected tables: budget_items (data only, reference_rate set to null)

UPDATE budget_items SET reference_rate = NULL WHERE reference_rate IS NOT NULL;
