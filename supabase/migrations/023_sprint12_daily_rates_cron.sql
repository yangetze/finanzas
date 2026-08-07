-- Migration: 023_sprint12_daily_rates_cron
-- Sprint: 12 — Tasas de cambio: admin-only + carga automática diaria
-- Schedules a daily call to the fetch-exchange-rates Edge Function (BCV +
-- USDT) via pg_cron + pg_net. The Edge Function runs with the service-role
-- key (auto-injected by Supabase at runtime), so it bypasses RLS on its own
-- — the cron job just needs to invoke it. Authorization uses a service-role
-- JWT stored in Supabase Vault as the secret "service_role_key"; that secret
-- is NOT part of this migration (no secret value is committed) and must be
-- added once, manually, via Supabase Studio → Project Settings → Vault (or
-- `select vault.create_secret('<service_role_key>', 'service_role_key')`)
-- before the schedule below can authenticate successfully. Until that
-- secret exists, the cron job will fail its HTTP call — the app is
-- unaffected either way, since rates can still be loaded manually from
-- /tasas by an admin.
-- Affected: extensions (pg_cron), cron.job (new scheduled job)

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'fetch-daily-exchange-rates',
  '0 13 * * *', -- 13:00 UTC ≈ 09:00 VET, after BCV usually publishes
  $$
  SELECT net.http_post(
    url := 'https://aimhmbyfrxjamkehibup.supabase.co/functions/v1/fetch-exchange-rates',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'service_role_key'
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
