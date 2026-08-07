-- Migration: 024_sprint12_enable_pg_net
-- Sprint: 12 — Tasas de cambio: admin-only + carga automática diaria
-- Enables pg_net, required by the cron.schedule job added in
-- 023_sprint12_daily_rates_cron.sql (net.http_post). It was already present
-- on the local Docker stack by default, so its absence on the remote
-- project wasn't caught until applying 023 there and testing the actual
-- scheduled call — a gap in that migration's assumptions, not something
-- Docker-local validation could have caught given the local default differs
-- from a fresh remote project.
-- Affected: extensions (pg_net)

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
