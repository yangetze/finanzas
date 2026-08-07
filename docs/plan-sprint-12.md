# Sprint 12 — Tasas de cambio: admin-only + carga automática diaria

## Goal
Cerrar el módulo de tasas de cambio (`exchange_rates`) que ya existía parcial
desde sprint 06/07: hacerlo estrictamente administrativo (los usuarios solo
consultan) y agregar un proceso diario que carga automáticamente la tasa BCV
y la tasa USDT, sin depender de que un admin entre a la app y pulse un botón.

## Estado previo (lo que ya existía antes de este sprint)
- Tabla `exchange_rates` (from_currency_id, to_currency_id, rate, rate_date,
  source, created_at) — transversal, sin `user_id`, ya correcto.
- `unique (from_currency_id, to_currency_id, rate_date)` — un solo registro
  por par de moneda y día.
- RLS: lectura abierta a todos (`exchange_rates_read_all`), pero escritura
  abierta a **cualquier usuario autenticado** (`exchange_rates_write_authenticated`)
  — hueco de seguridad: `users.is_admin` existía desde sprint 07 pero nunca se
  usó para restringir nada a nivel de base de datos.
- `AppShell.tsx` ya ocultaba el link "Tasas" del nav para no-admins, pero la
  ruta `/tasas` no tenía guard — un no-admin podía navegar directo a la URL.
- `ExchangeRatesPage` con CRUD manual (`RateForm`) y un botón "BCV" que
  llama `fetchBcvRate()` (`lib/bcv.ts`, hits `ve.dolarapi.com`) desde el
  cliente.
- No había tasa USDT ni proceso automático — cada carga era manual.

## Decisiones de diseño (confirmadas con el usuario)
1. **Acceso**: tasas son un módulo de administración. Solo `users.is_admin`
   puede crear/editar/borrar. El resto de la app (Transferencias, pago de
   TDC, Cashea, deudas indexadas) solo *lee* la última tasa vía
   `getLatestExchangeRate` — eso no cambia.
2. **Snapshots intradía (USDT)**: se mantiene el `unique` actual por día. Cada
   corrida del cron hace `upsert` y pisa el registro de "hoy" — no se guarda
   histórico intradía. Igual que ya funciona BCV. Si más adelante se necesita
   ver la variación de USDT durante el día, es un cambio de esquema aparte
   (agregar `rate_time`/tabla de snapshots) — no está en este sprint.
3. **Fuentes de datos**:
   - BCV: `https://ve.dolarapi.com/v1/dolares/oficial` (`promedio`, `fecha`) —
     ya integrado en `lib/bcv.ts`, se reutiliza.
   - USDT: `https://criptoya.com/api/binancep2p/usdt/ves/1` (sin API key,
     responde `{ask, bid, time}`). Se usa `rate = (ask + bid) / 2`, `time`
     (unix seconds) convertido a fecha ISO. Nueva `lib/usdt.ts`.

## Diseño técnico
- **RLS**: se reemplaza la policy `exchange_rates_write_authenticated` (FOR
  ALL, sin restricción) por `exchange_rates_write_admin` (FOR ALL, `USING`/
  `WITH CHECK` contra `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND
  is_admin)`). La policy de lectura (`exchange_rates_read_all`, `USING
  (true)`) no cambia — sigue siendo pública para cualquier usuario logueado.
- **Guard de ruta**: nuevo componente `AdminRoute` (`components/layout/`)
  que redirige a `/dashboard` si `user` no es admin; envuelve `/tasas` en
  `App.tsx`.
- **`lib/usdt.ts`**: misma forma que `lib/bcv.ts` — `fetchUsdtRate(): Promise<{rate:number, date:string}>`.
- **`ExchangeRatesPage`**: segundo botón "USDT" junto al de "BCV", mismo flujo
  (`upsertExchangeRate` con `source: 'USDT'`, par `USDt → VES` usando la
  moneda `USDt` ya existente en `currencies`, no `USD`).
- **Edge Function `fetch-exchange-rates`**: corre en el servidor con el
  service-role key (inyectado automáticamente por Supabase en runtime de
  Edge Functions, `SUPABASE_SERVICE_ROLE_KEY`), así que **bypassa RLS** — no
  depende de que exista una sesión de usuario admin. Llama BCV + USDT,
  resuelve los `currency_id` de `USD`/`USDt`/`VES` desde `currencies`, hace
  upsert de ambos pares. Devuelve un resumen JSON con lo que insertó.
- **Cron**: `pg_cron` + `pg_net` programan una llamada HTTP diaria (13:00 UTC
  ≈ 9:00 VET, después de que el BCV suele publicar) al endpoint de la Edge
  Function, autenticada con el service-role key guardado en **Supabase
  Vault** (no se commitea ningún secreto). El secreto se agrega una sola vez
  a mano en Supabase Studio → Vault (`service_role_key`) antes de que el
  cron funcione en producción; la migración solo referencia el nombre del
  secreto.

## Tasks
- [x] Migración `022_sprint12_exchange_rates_admin.sql` (RLS admin-only)
      validada localmente con `npx supabase db reset` — confirmado con
      `psql`/`curl` que un usuario no-admin recibe 403
      ("new row violates row-level security policy")
- [x] `AdminRoute` + wiring en `App.tsx` (4 tests unitarios)
- [x] `lib/usdt.ts` + test (TDD) — fuente CriptoYa (`binancep2p/usdt/ves/1`)
- [x] Botón "USDT" en `ExchangeRatesPage`
- [x] Edge Function `fetch-exchange-rates` (`supabase/functions/fetch-exchange-rates/`)
      — usa el service-role key inyectado automáticamente, hace upsert de
      BCV y USDT, probada localmente con `supabase functions serve` (200 OK,
      ambos pares guardados)
- [x] Migración `023_sprint12_daily_rates_cron.sql` (`pg_cron` + `pg_net`)
      — probada localmente simulando el mismo `net.http_post` que ejecutará
      el cron (con un secreto de Vault de prueba, no commiteado), respuesta
      200 confirmada en `net._http_response`
- [x] `pnpm test:run` (445/445) y `pnpm typecheck` verdes
- [x] Verificación manual en navegador: admin ve los botones y el fetch de
      USDT trae la tasa real y la guarda; el guard `AdminRoute` en sí está
      cubierto por tests unitarios (no pude probar la redirección de un
      no-admin en vivo por un bug preexistente y no relacionado en el
      usuario demo sembrado — ver "Hallazgos" abajo)

## Hallazgos durante la implementación
- **Bug preexistente en `lib/bcv.ts`**: leía `json.fecha`, pero el endpoint
  `ve.dolarapi.com/v1/dolares/oficial` devuelve `fechaActualizacion` (ISO con
  offset de VET). El botón "BCV" manual llevaba tiempo guardando
  `rate_date: undefined` — no se notaba porque el insert fallaba
  silenciosamente en el `catch`. Corregido en este sprint (bloqueaba
  directamente la carga automática) junto con su test.
- **`auto_expose_new_tables` en `supabase/config.toml`**: el CLI local más
  reciente no auto-expone tablas vía GRANT por defecto (nuevo default de
  Supabase, documentado como deprecado para 2026-10-30). Esto rompía
  `supabase db reset` local para *todas* las tablas (403 hasta en lecturas
  públicas de `currencies`), no solo `exchange_rates` — no lo causó esta
  migración. Se descomentó `auto_expose_new_tables = true` para poder
  verificar en navegador; el proyecto remoto ya tiene los GRANTs heredados
  de antes de este cambio de default, así que no debería afectarlo. Queda
  como decisión a confirmar con el usuario si se mantiene o se revierte.
- **Usuario demo sembrado roto**: `sobres@finanzas.com` (migration
  `002_demo_user.sql`) no permite login por password ni generar magic link
  localmente (`23505 duplicate key value... users_email_partial_key`) — no
  relacionado a este sprint, posible seguimiento aparte.
- **`pg_net` no estaba habilitada en el proyecto remoto**: a diferencia del
  stack local (donde viene por defecto), el proyecto real no tenía la
  extensión, así que `023_sprint12_daily_rates_cron.sql` fallaba con
  `schema "net" does not exist` al probarlo en producción. Se agregó
  `024_sprint12_enable_pg_net.sql` para cubrir ese gap.

## Deploy a producción (hecho en esta sesión, post-merge del PR aún pendiente)
- Migraciones `022`, `023` y `024` aplicadas al proyecto remoto
  (`aimhmbyfrxjamkehibup`) vía `apply_migration`
- Edge Function `fetch-exchange-rates` desplegada vía `deploy_edge_function`
  (`verify_jwt: true` — el cron ya manda un JWT válido de service-role)
- Secreto `service_role_key` agregado a Vault por el usuario directamente en
  el dashboard (no por mí — nunca debo manejar API keys/tokens en texto
  plano, ni siquiera cuando el usuario lo pide explícitamente)
- Verificado extremo a extremo: se disparó manualmente el mismo
  `net.http_post` que ejecutará el cron — HTTP 200, ambos pares
  (`USD→VES` BCV, `USDt→VES` USDT) quedaron escritos en `exchange_rates`
  de la base real
- `get_advisors` (security) revisado: no introduce alertas nuevas más allá
  de las preexistentes del resto del esquema (lectura pública intencional
  de `exchange_rates`, ya era así)

## Out of scope (futuro)
- Histórico intradía de USDT (snapshots múltiples por día)
- Que un usuario no-admin proponga/edite su propia tasa dentro de un módulo
  específico (Transferencias/TDC/Cashea ya permiten editar la tasa *usada en
  esa transacción puntual*, sin tocar `exchange_rates` — eso ya cubre el caso
  de uso real y se mantiene igual)
- Alertas o notificación si el cron falla (por ahora solo logs de la Edge
  Function)
