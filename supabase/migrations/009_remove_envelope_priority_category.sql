-- Migration: 009_remove_envelope_priority_category
-- Removes redundant priority and category fields from envelopes
-- spend_category (supervivencia / flexible / crecimiento) replaces priority
-- category was a free-text label that was never surfaced in the UI
-- Affected tables: envelopes

ALTER TABLE envelopes DROP COLUMN IF EXISTS priority;
ALTER TABLE envelopes DROP COLUMN IF EXISTS category;
