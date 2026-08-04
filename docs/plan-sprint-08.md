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
- [x] `npx supabase start` — levantar stack local
- [x] Escribir migración `019_sprint08_personal_debts.sql`:
  - tabla `debtors` (id, user_id, name, notes, is_active, timestamps)
  - tabla `personal_debts` (id, user_id, debtor_id, direction, description,
    currency_id, original_amount, date, status, notes, timestamps)
  - tabla `personal_debt_payments` (id, user_id, personal_debt_id, wallet_id
    nullable, amount, currency_id, date, payment_type, offset_group_id
    nullable, notes, created_at)
  - RLS policies (select/insert/update/delete `user_id = auth.uid()`) en las
    tres tablas, con `with check` que valida propiedad cruzada
    (`debtor_id`/`personal_debt_id`/`wallet_id` deben pertenecer al mismo
    usuario, no solo `user_id` de la fila)
  - check constraints: `direction in ('they_owe_me','i_owe_them')`,
    `status in ('open','partial','paid')`,
    `payment_type in ('payment','offset')`
- [x] `npx supabase db reset` contra el stack local — confirma que la
      migración aplica limpio desde cero junto con las migraciones existentes
- [x] Probar manualmente en local: insertar debtor + 2 personal_debts +
      simular la compensación del ejemplo guía, confirmar RLS bloquea acceso
      cross-user (lectura y, tras el fix del `with check`, también inserción
      cruzada)
- [x] Aplicado al proyecto remoto (`aimhmbyfrxjamkehibup`) vía DDL dirigido,
      no `db push` — el historial de migraciones remoto usa nombres de
      archivo distintos a los locales 001-018 (ya aplicados ahí bajo otros
      timestamps); ver [PR #42](https://github.com/yangetze/finanzas/pull/42)

### 2. Tipos (TDD: test primero donde aplique)
- [x] `src/types/index.ts`: agregar `Debtor`, `PersonalDebt`,
      `PersonalDebtPayment`, `PersonalDebtDirection`, `PersonalDebtStatus`,
      `PersonalDebtPaymentType`

### 3. Lógica pura (lib) — TDD
- [x] `lib/personalDebtTotals.test.ts` — tests primero, usando el ejemplo
      guía (neto por deudor/moneda, saldo pendiente por debt, resultado de
      una compensación, casos de error por dirección/moneda inválida)
- [x] `lib/personalDebtTotals.ts` — implementado:
      `outstandingAmount(debt, payments)`,
      `netByDebtor(debts, payments)` (agrupado por currency),
      `computeOffset(debtA, debtB, paymentsA, paymentsB)` → montos y status
      resultantes (14/14 tests verdes)

### 4. Supabase helpers
- [x] `lib/supabase.ts`: CRUD de `debtors` (`getDebtors`, `createDebtor`,
      `updateDebtor`, `deactivateDebtor`) y `personal_debts` (`getPersonalDebts`,
      `createPersonalDebt`, `updatePersonalDebt`, `deletePersonalDebt`);
      `addPersonalDebtPayment`/`deletePersonalDebtPayment` (ajustan wallet
      según dirección de la deuda y recalculan status);
      `createPersonalDebtOffset` (inserta las 2 filas con mismo
      `offset_group_id`, sin tocar wallets, recalcula status de ambas deudas),
      `deletePersonalDebtOffset` (borra ambas filas por `offset_group_id`,
      recalcula status de vuelta a `open`/`open` si no quedan otros pagos).
      Status recalculado siempre desde la suma real de pagos en DB
      (`statusForOutstanding` de `lib/personalDebtTotals.ts`), no confiando en
      estado local del cliente.

### 5. Hooks
- [x] `hooks/useDebtors.tsx` (+ test) — `useDebtors`, `useCreateDebtor`,
      `useUpdateDebtor`, `useDeactivateDebtor`
- [x] `hooks/usePersonalDebts.tsx` (+ test) — `usePersonalDebts` (con
      `debtorId` opcional), `useCreatePersonalDebt`, `useUpdatePersonalDebt`,
      `useDeletePersonalDebt`
- [x] `hooks/usePersonalDebtPayments.tsx` (+ test) — `usePersonalDebtPayments`,
      `useAddPersonalDebtPayment`, `useDeletePersonalDebtPayment`,
      `useCreatePersonalDebtOffset`, `useDeletePersonalDebtOffset`; las
      mutaciones de pagos/offsets invalidan `personalDebtPayments`,
      `personalDebts` y `wallets` (los balances cambian junto con el status)

### 6. UI
- [x] `components/personal-debts/DebtorCard.tsx` (+ test) — muestra neto por
      moneda (`Me debe`/`Le debo`), expande a sus `personal_debts`, botón
      "Compensar" visible solo cuando hay deudas cruzadas sin pagar
- [x] `components/personal-debts/PersonalDebtRow.tsx` (+ test) — saldo,
      status badge, historial de pagos (distingue `payment` vs `offset`)
- [x] `components/personal-debts/DebtorForm.tsx` (+ test)
- [x] `components/personal-debts/PersonalDebtForm.tsx` (+ test)
- [x] `components/personal-debts/PersonalDebtPaymentForm.tsx` (+ test)
- [x] `components/personal-debts/PersonalDebtOffsetForm.tsx` (+ test) —
      selecciona debt A / debt B del mismo deudor y moneda, muestra preview
      del resultado antes de confirmar
- [x] Nueva tab "Personas" en `DebtsPage.tsx`, junto a TDC
- [x] `AppShell.tsx`: sin cambios de nav (vive dentro de /deudas existente)
- [x] Verificado manualmente en navegador contra Supabase local (Docker):
      login, crear deudor "María", crear deuda they_owe_me $4 ("Uber") y
      i_owe_them $5 ("Cena del viernes"), compensar (preview y resultado
      exactos al ejemplo guía: $4 compensados, Uber pagada, Cena parcial en
      $1), registrar pago de $1 contra una wallet y confirmar que la wallet
      se debitó correctamente ($50 → $49) y la deuda quedó pagada

## Out of scope (futuro)
- Recordatorios/notificaciones de deudas vencidas
- Adjuntar comprobantes/fotos a los pagos
- Deudas entre más de 2 partes (grupales)
