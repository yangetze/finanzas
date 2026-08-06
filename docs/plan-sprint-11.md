# Sprint 11 — Pago indexado de tarjetas de crédito (TDC)

## Goal
Permitir pagar el balance de una tarjeta de crédito (`wallets.type='credit'`)
desde una wallet en otra moneda, a la tasa vigente el día del pago — mismo
concepto que sprints 09/10, aplicado a TDC.

## Por qué el diseño es distinto a sprint 09/10
TDC no tiene hoy ningún flujo de pago: `wallet.balance` es el monto usado,
editado a mano vía `WalletForm`. No hay una fila por cargo (a diferencia de
`personal_debts`/`transactions`), así que no hay un flag `is_indexed` que
prender — cada pago de tarjeta puede ser en cualquier moneda por defecto.
Por eso **no hace falta migración**: es un movimiento de saldo entre dos
wallets (se resta de la TDC, se resta de la wallet de origen), no una fila
nueva en ninguna tabla.

## Bug relacionado encontrado (fuera de alcance, no se toca en este sprint)
La feature de Transferencias ya permite elegir una wallet de crédito como
destino, pero `createTransfer` hace `adjustWalletBalance(toWalletId,
+amountReceived)` — sumar al balance de una TDC *aumentaría* la deuda en
vez de reducirla si alguien la usara para "pagar" la tarjeta. No se corrige
aquí porque son features separadas (transferencia entre wallets vs. pago de
tarjeta) y el usuario no lo pidió; se deja anotado para un sprint aparte.

## Diseño
- `PayCreditCardForm.tsx` (nuevo): recibe wallets tipo `asset` (excluye
  otras tarjetas de crédito como origen), la moneda y el balance (`used`)
  de la TDC. Cualquier wallet como origen; si su moneda difiere de la de la
  TDC, muestra monto a pagar en esa moneda + tasa (autocompletada vía
  `getLatestExchangeRate`, editable) + preview del monto equivalente que se
  abona a la tarjeta. Si es la misma moneda, un solo campo de monto
  (prellenado con el balance total, editable para pagos parciales).
- `lib/supabase.ts`: `payCreditCardBalance(data)` — resta `amount` del
  balance de la TDC y `paymentAmount` del balance de la wallet de origen.
  Sin tabla nueva, sin migración.
- `TDCCard.tsx`: botón "Pagar" (solo si `balance > 0`), abre el formulario.
- `DebtsPage.tsx`: wiring del formulario inline en la tab TDC.

## Tasks
- [x] `PayCreditCardForm.tsx` (+ test, TDD)
- [x] `lib/supabase.ts`: `payCreditCardBalance`
- [x] `hooks/useWallets.tsx`: `usePayCreditCardBalance`
- [x] `TDCCard.tsx`: botón "Pagar" (+ test)
- [x] `DebtsPage.tsx`: wiring
- [x] Verificación manual en navegador contra Supabase local: creé tarjeta
      "Visa Platinum" USD, límite 200, usado 90, wallet "Efectivo Bs" en
      VES, tasa admin 200 VES/USD. Pagué parcialmente 8.000 Bs (preview
      "≈ $40,00") — Usado bajó a $50, wallet origen se debitó los 8.000 Bs
      reales (no $40). Pagué el resto (10.000 Bs autocompletados) — Usado
      quedó en $0,00 y el botón "Pagar" desapareció correctamente.
      433/433 tests unitarios verdes, `tsc --noEmit` limpio. Sin migración
      (no hay cambios de esquema).

## Out of scope (futuro)
- Arreglar el signo de Transferencias hacia wallets de crédito
- Registrar cargos individuales a la TDC (requeriría modelarlos como
  Cashea, cambio mucho más grande — descartado explícitamente por el
  usuario en este sprint)
