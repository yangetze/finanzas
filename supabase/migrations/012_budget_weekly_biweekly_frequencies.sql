-- Migration: 012_budget_weekly_biweekly_frequencies
-- Adds weekly (Semanal) and biweekly (Quincenal) to the allowed budget
-- item frequencies. Weekly items stamp every 7 days and biweekly every
-- 15 days within the month, starting at payment_day.
-- Affected tables: budget_items (frequency check constraint)

alter table budget_items
  drop constraint if exists budget_frequency_check;
alter table budget_items
  drop constraint if exists budget_items_frequency_check;
alter table budget_items
  add constraint budget_items_frequency_check
  check (frequency in ('weekly','biweekly','monthly','quarterly','semiannual','annual'));
