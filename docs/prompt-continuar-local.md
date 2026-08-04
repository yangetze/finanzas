# Prompt para continuar en local (Sprint 08 — Deudas con personas)

Copia y pega esto en Claude Code corriendo en tu máquina, dentro del repo
`finanzas`, en la rama `claude/debt-mental-model-bed4mj` (o después de
mergear el PR #42 a `main`, según prefieras).

---

Estoy retomando el Sprint 08 (deudas con personas) descrito en
`docs/plan-sprint-08.md`. Ya existe la migración
`supabase/migrations/019_sprint08_personal_debts.sql` (tablas `debtors`,
`personal_debts`, `personal_debt_payments` con RLS) pero **no ha sido
validada ni aplicada** todavía — se escribió en un sandbox remoto sin acceso
a Docker Hub, así que necesito validarla localmente antes de seguir, tal
como indica la regla en `CLAUDE.md` (sección "Database Migrations"): nunca
aplicar una migración al proyecto remoto sin antes probarla contra Supabase
local vía Docker.

Por favor:

1. Corre `npx supabase start` (o `supabase start` si tienes el CLI
   instalado global) y confirma que levanta sin errores.
2. Corre `npx supabase db reset` para aplicar todas las migraciones desde
   cero, incluyendo la 019, y confirma que aplica limpio.
3. Revisa el SQL de `019_sprint08_personal_debts.sql` contra el resto del
   esquema (convenciones: `users(id)` no `auth.users`, `uuid_generate_v4()`,
   RLS `auth.uid() = user_id` por tabla) y avísame si encuentras algo raro.
4. Prueba manualmente el caso guía del plan: crear un `debtor`, dos
   `personal_debts` (uno `they_owe_me` $4, otro `i_owe_them` $5), y simula
   una compensación insertando dos filas en `personal_debt_payments` con el
   mismo `offset_group_id`, `payment_type = 'offset'`, monto $4 cada una.
   Confirma que las FKs/constraints lo permiten y que RLS bloquea el acceso
   desde otro usuario.
5. Si todo pasa: aplica la migración al proyecto remoto de Supabase
   (`npx supabase link` + `npx supabase db push`, o como manejes el deploy
   normalmente) y avísame para continuar con el resto del plan (tipos,
   `lib/personalDebtTotals.ts` con TDD, hooks, componentes UI, tab
   "Personas" en `DebtsPage.tsx`).
6. Si algo falla, dime qué error da `db reset` o qué ajuste hace falta en
   el SQL, y lo corrijo.

Contexto completo del diseño y el resto de las tareas está en
`docs/plan-sprint-08.md`.
