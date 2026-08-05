# Sprint 10 — Cashea indexado

## Goal
Extender el mismo concepto del sprint 09 (deudas personales indexadas) a las
compras en cuotas Cashea: el monto de cada cuota queda anclado en una moneda
(ej. USD), pero se puede pagar en otra (ej. VES) a la tasa vigente el día
en que se marca "pagado" — no una tasa fijada al crear la compra.

A diferencia de `personal_debt_payments`, la tabla `transactions` ya tiene
las columnas `origin_currency_id`/`origin_amount`,
`payment_currency_id`/`payment_amount`, `conversion_rate`,
`base_currency_id`/`base_amount`/`base_rate` desde el inicio (es el mismo
patrón de donde se copió el diseño de sprint 09). Por eso la migración es
mínima: solo falta el flag `is_indexed`.

## Bug encontrado de paso (se arregla en este sprint)
`createTransactionsBatch` (`lib/supabase.ts`) ignora `installment_number`,
`installment_total` y `group_id` — los hardcodea a `null` sin importar lo
que `CasheaForm` calcule. Las cuotas Cashea nunca guardan su agrupación en
la base de datos. Se corrige como parte de este cambio porque toca
exactamente esa función.

## Diseño
- `transactions.is_indexed boolean not null default false` (nueva columna,
  migración `021`).
- `CasheaForm.tsx`: toggle "Compra indexada", igual que en
  `PersonalDebtForm`. Al crear las cuotas, cada una lleva `is_indexed` pero
  `payment_currency_id`/`payment_amount` siguen siendo un placeholder en la
  moneda de origen (igual que hoy) — el pago real, con su moneda y tasa, se
  fija recién cuando se marca "pagado".
- Flujo "marcar pagado" (`TransactionRow` → `TransactionsPage`):
  - transacción NO indexada: comportamiento actual sin cambios (un clic,
    usa `paymentAmount` ya guardado).
  - transacción indexada: el botón "Pagar" abre un formulario
    (`TransactionPayForm.tsx`, mismo patrón que la rama indexada de
    `PersonalDebtPaymentForm`) — cualquier wallet, monto en la moneda de esa
    wallet + tasa autocompletada vía `getLatestExchangeRate` (editable),
    preview del monto equivalente en la moneda de origen. Al confirmar,
    `markTransactionPaidIndexed` actualiza `payment_currency_id`/
    `payment_amount`/`conversion_rate`/`wallet_id` y ajusta el saldo de la
    wallet por el monto real pagado (no por `origin_amount`).
- `origin_amount`/`base_amount` no cambian al pagar — siguen siendo el
  ancla fijada al crear la cuota (misma lógica que `amount` en
  `personal_debts` durante sprint 09).

## Tasks

### 1. Migración (validar en Docker local primero — ver regla en CLAUDE.md)
- [x] `npx supabase start`
- [x] `021_sprint10_indexed_cashea.sql`: `alter table transactions add column is_indexed boolean not null default false`
- [x] `npx supabase db reset` — confirmar que aplica limpio con 001-020
- [x] Aplicar al remoto vía `apply_migration` (mismo procedimiento que
      sprints 08/09)

### 2. Tipos
- [x] `Transaction`: agregar `isIndexed: boolean`

### 3. Supabase helpers
- [x] `createTransaction`/`createTransactionsBatch`/`updateTransaction`:
      agregar `isIndexed`
- [x] `createTransactionsBatch`: corregir el bug de
      `installment_number`/`installment_total`/`group_id`
- [x] `markTransactionPaidIndexed(data)`: actualiza status/wallet/payment
      currency/payment amount/conversion rate y ajusta el saldo de wallet
      por el monto real

### 4. Hooks
- [x] `useTransactions` mapping: incluir `isIndexed`
- [x] `useMarkTransactionPaidIndexed`

### 5. UI
- [x] `CasheaForm.tsx`: `Toggle` "Compra indexada"
- [x] `TransactionPayForm.tsx` (nuevo, + test): mismo patrón que la rama
      indexada de `PersonalDebtPaymentForm.tsx`
- [x] `TransactionRow.tsx`: botón "Pagar" abre el formulario cuando
      `isIndexed`, comportamiento actual si no
- [x] `TransactionsPage.tsx`: wiring del formulario inline + nuevo hook
- [x] Verificado manualmente en navegador contra Supabase local (Docker):
      wallet "Efectivo Bs" en VES (saldo inicial 5.000), tasa admin
      200 VES/USD. Creé compra Cashea indexada "iPhone 15" $90 USD en 1
      cuota — apareció con badge "Indexada". Al pagar: la tasa se
      autocompletó en 200 y el monto a pagar en 18.000 (=90×200), preview
      "≈ $90,00". Al confirmar, la transacción quedó "Pagado", la wallet se
      debitó los 18.000 Bs reales (5.000 → −13.000, matemáticamente
      correcto para el escenario de prueba) y en la fila de la tabla:
      `origin_amount` se mantuvo en 90 (el ancla, sin tocar),
      `payment_amount`=18000, `conversion_rate`=200,
      `installment_number`/`installment_total`/`group_id` quedaron
      guardados correctamente (confirma el fix del bug de agrupación).
      422/422 tests unitarios verdes, `tsc --noEmit` limpio.

## Out of scope (futuro)
- Indexación para TDC (wallets `type='credit'`)
- Indexación para transacciones regulares fuera de Cashea (el toggle solo
  vive en `CasheaForm`, aunque el flag es genérico a nivel de tabla)
