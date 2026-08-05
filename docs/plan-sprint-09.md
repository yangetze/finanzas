# Sprint 09 — Deudas personales indexadas

## Goal
Permitir marcar una `personal_debt` como "indexada": el monto ancla queda en
la moneda de la deuda (ej. USD), pero el pago puede hacerse en otra moneda
(ej. VES/Bs) a la tasa vigente el día del pago — no una tasa fijada al crear
la deuda. Reutiliza el mismo patrón `origin`/`payment` currency + `conversion_rate`
que ya usa `transactions` (ver `TransactionForm.tsx`), no una convención nueva.

Fuera de alcance para este sprint (según respuesta del usuario): Cashea. Se
hará en un sprint aparte reusando el mismo patrón de columnas.

## Decisiones de diseño (confirmadas con el usuario)
- Flag explícito `is_indexed` en `personal_debts`, seteado al crear/editar la
  deuda — no se infiere implícitamente de la moneda de la wallet elegida.
- La tasa se autocompleta desde `exchange_rates` (última tasa admin para el
  par) al elegir la wallet de pago, pero el campo queda editable — el usuario
  puede pagar a tasa paralela u otra distinta a la oficial.
- `personal_debt_payments.amount`/`currency_id` (ya existentes) siguen
  representando el monto en la moneda de la deuda — sin cambios en
  `lib/personalDebtTotals.ts` (outstanding/status/offset no se tocan).
- Nuevas columnas `payment_currency_id`, `payment_amount`, `conversion_rate`
  representan lo que realmente salió/entró de la wallet. Cuando no hay
  conversión (deuda no indexada, o pagada en su propia moneda),
  `payment_currency_id = currency_id`, `payment_amount = amount`,
  `conversion_rate = null` — compatible con las filas existentes.
- Dirección de la tasa: igual que `TransactionForm`
  (`getLatestExchangeRate(paymentCurrencyId, debtCurrencyId)`,
  `amount = paymentAmount / rate`, vía `calcBaseAmount` de `lib/utils.ts`).

## Bug latente que esto corrige
Hoy `PersonalDebtPaymentForm` recibe TODAS las wallets del usuario sin
filtrar por moneda, y `addPersonalDebtPayment` debita/acredita la wallet
usando `amount` (moneda de la deuda) directamente — si alguien paga una
deuda en USD con una wallet en VES, hoy se resta el número de USD tal cual
del saldo en VES, sin convertir. Este sprint también arregla eso: para
deudas NO indexadas, el selector de wallet se filtra a la moneda de la
deuda (comportamiento implícito de hoy, ahora explícito); para indexadas, se
permite cualquier wallet y se convierte correctamente.

## Tasks

### 1. Migración (validar en Docker local primero — ver regla en CLAUDE.md)
- [x] `npx supabase start` — levantar stack local
- [x] Escribir migración `020_sprint09_indexed_personal_debts.sql`:
  - `alter table personal_debts add column is_indexed boolean not null default false`
  - `alter table personal_debt_payments add column payment_currency_id uuid references currencies(id)`
  - `alter table personal_debt_payments add column payment_amount numeric(20,2)`
  - `alter table personal_debt_payments add column conversion_rate numeric(20,8)`
  - Backfill filas existentes: `payment_currency_id = currency_id`,
    `payment_amount = amount`
  - `alter column ... set not null` para `payment_currency_id`/`payment_amount`
    después del backfill
  - Check constraint: `conversion_rate is null` cuando
    `payment_currency_id = currency_id`, `is not null` cuando difieren
- [x] `npx supabase db reset` — confirmar que aplica limpio junto con 001-019
- [x] Probar manualmente: crear debt indexada, pagar con wallet en otra
      moneda, confirmar que el constraint y el cálculo cuadran
- [x] Aplicar migración al proyecto remoto (mismo procedimiento que sprint 08:
      DDL dirigido vía `apply_migration`, no `db push`, por el mismo
      desfase de historial de migraciones)

### 2. Tipos
- [x] `PersonalDebt`: agregar `isIndexed: boolean`
- [x] `PersonalDebtPayment`: agregar `paymentCurrencyId: string`,
      `paymentAmount: number`, `conversionRate: number | null`

### 3. Supabase helpers
- [x] `createPersonalDebt`/`updatePersonalDebt`: agregar `isIndexed`
- [x] `addPersonalDebtPayment`: nuevos parámetros `paymentCurrencyId`,
      `paymentAmount`, `conversionRate`; ajustar wallet usando `paymentAmount`
      (no `amount`)
- [x] `deletePersonalDebtPayment`: revertir wallet usando `paymentAmount`

### 4. Hooks
- [x] `useDebtors`/`usePersonalDebts` mapping: incluir `isIndexed`
- [x] `usePersonalDebtPayments` mapping: incluir los 3 campos nuevos

### 5. UI
- [x] `PersonalDebtForm.tsx`: `Toggle` "Deuda indexada" (pagar en otra
      moneda a la tasa del día)
- [x] `PersonalDebtPaymentForm.tsx`:
      - deuda no indexada: comportamiento actual, wallets filtradas a la
        moneda de la deuda
      - deuda indexada: todas las wallets; si la wallet elegida está en otra
        moneda, mostrar monto a pagar en esa moneda + tasa (autocompletada
        vía `getLatestExchangeRate`, editable) + preview del monto
        equivalente en la moneda de la deuda
- [x] `DebtsPage.tsx`: pasar `isIndexed`/`currencies` a los formularios y los
      nuevos campos al armar el payload de `addPersonalDebtPayment`
- [x] Verificado manualmente en navegador contra Supabase local (Docker):
      creé deudor "Pedro", deuda indexada $10 i_owe_them, wallet "Efectivo Bs"
      en VES, tasa admin 150 VES/USD. Al pagar: la wallet solo aparece como
      opción (único caso porque es indexada), la tasa se autocompletó en 150,
      pagué 600 Bs → preview mostró correctamente "≈ $4,00", al confirmar la
      deuda bajó a "Parcial $6,00 de $10,00" y la wallet se debitó en
      **600 Bs reales** (2.000 → 1.400), no en $4 — que era exactamente el
      bug latente que este sprint corrige. Borrar el pago revirtió ambos
      (deuda a "Abierta $10,00", wallet de vuelta a 2.000 Bs).
      412/412 tests unitarios verdes, `tsc --noEmit` limpio.

## Out of scope (futuro)
- Mismo patrón para cuotas Cashea (`transactions`)
- Indexación para TDC (wallets `type='credit'`)
