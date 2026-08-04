# Sprint 08 — Deudas con Personas

## Goal
Registrar deudas entre el usuario y personas específicas (no institucionales,
distinto de las wallets `type='credit'` de TDC/Cashea), con dirección
(`they_owe_me` / `i_owe_them`), pagos/abonos parciales, y compensación entre
deudas cruzadas del mismo deudor.

## Ejemplo guía (usar en tests)
Deudor "María":
- Deuda A: `i_owe_them`, $5, "Cena del viernes"
- Deuda B: `they_owe_me`, $4, "Uber que pagué por ella"

Compensar A y B → `offsetAmount = min(5, 4) = 4`
- Deuda A: pago offset de $4 → saldo pendiente $1, status `partial`
- Deuda B: pago offset de $4 → saldo pendiente $0, status `paid`
- Neto mostrado en `DebtorCard`: "Le debes $1" (5 − 4)
- Ambos registros de pago comparten el mismo `offset_group_id`
- Si el usuario elimina la compensación, se borran ambas filas del
  `offset_group_id` juntas y los status vuelven a `open` / `open`

## Tasks

### 1. Migración (validar en Docker local primero — ver regla en CLAUDE.md)
- [ ] `npx supabase start` — levantar stack local
- [ ] Escribir migración `019_sprint08_personal_debts.sql`:
  - tabla `debtors` (id, user_id, name, notes, is_active, timestamps)
  - tabla `personal_debts` (id, user_id, debtor_id, direction, description,
    currency_id, original_amount, date, status, notes, timestamps)
  - tabla `personal_debt_payments` (id, user_id, personal_debt_id, wallet_id
    nullable, amount, currency_id, date, payment_type, offset_group_id
    nullable, notes, created_at)
  - RLS policies (select/insert/update/delete `user_id = auth.uid()`) en las
    tres tablas
  - check constraints: `direction in ('they_owe_me','i_owe_them')`,
    `status in ('open','partial','paid')`,
    `payment_type in ('payment','offset')`
- [ ] `npx supabase db reset` contra el stack local — confirmar que la
      migración aplica limpio desde cero junto con las migraciones existentes
- [ ] Probar manualmente en local: insertar debtor + 2 personal_debts +
      simular la compensación del ejemplo guía, confirmar RLS bloquea acceso
      cross-user
- [ ] Solo después de validar en local: aplicar migración al proyecto remoto

### 2. Tipos (TDD: test primero donde aplique)
- [ ] `src/types/index.ts`: agregar `Debtor`, `PersonalDebt`,
      `PersonalDebtPayment`, `PersonalDebtDirection`, `PersonalDebtStatus`,
      `PersonalDebtPaymentType`

### 3. Lógica pura (lib) — TDD
- [ ] `lib/personalDebtTotals.test.ts` — escribir tests primero, usando el
      ejemplo guía (neto por deudor/moneda, saldo pendiente por debt,
      resultado de una compensación)
- [ ] `lib/personalDebtTotals.ts` — implementar:
      `outstandingAmount(debt, payments)`,
      `netByDebtor(debts, payments)` (agrupado por currency),
      `computeOffset(debtA, debtB, paymentsA, paymentsB)` → montos y status
      resultantes

### 4. Supabase helpers
- [ ] `lib/supabase.ts`: CRUD de `debtors` y `personal_debts`,
      `addPersonalDebtPayment`, `createOffset` (inserta las 2 filas con mismo
      `offset_group_id`, recalcula status), `deleteOffset` (borra ambas filas)

### 5. Hooks
- [ ] `hooks/useDebtors.ts`
- [ ] `hooks/usePersonalDebts.ts`
- [ ] `hooks/usePersonalDebtPayments.ts`

### 6. UI
- [ ] `components/personal-debts/DebtorCard.tsx` (+ test) — muestra neto por
      moneda, expande a sus `personal_debts`
- [ ] `components/personal-debts/PersonalDebtRow.tsx` (+ test) — saldo,
      status badge, historial de pagos (distingue `payment` vs `offset`)
- [ ] `components/personal-debts/DebtorForm.tsx` (+ test)
- [ ] `components/personal-debts/PersonalDebtForm.tsx` (+ test)
- [ ] `components/personal-debts/PersonalDebtPaymentForm.tsx` (+ test)
- [ ] `components/personal-debts/PersonalDebtOffsetForm.tsx` (+ test) —
      selecciona debt A / debt B del mismo deudor y moneda, muestra preview
      del resultado antes de confirmar
- [ ] Nueva tab "Personas" en `DebtsPage.tsx`, junto a TDC/Cashea
- [ ] `AppShell.tsx`: sin cambios de nav (vive dentro de /deudas existente)

## Out of scope (futuro)
- Recordatorios/notificaciones de deudas vencidas
- Adjuntar comprobantes/fotos a los pagos
- Deudas entre más de 2 partes (grupales)
