# Sobres — Business Context

## What is Sobres?

Sobres is a personal finance web app based on the **Budget Zero** (zero-based budgeting)
methodology, implemented as a digital envelope system.

The core idea: every dollar you earn gets assigned a "job" before you spend it.
You create envelopes (categories) and allocate your income across them.
As you spend, envelopes track what's been used and what's left.

---

## Origin Story

Built initially as a personal tool by a Venezuelan user who:
- Manages finances across multiple countries (Venezuela, Panama, Puerto Rico)
- Deals with multiple currencies simultaneously (USDC, USDt, VES, USD, EUR, DOC)
- Was maintaining a complex 16-tab Google Sheet that became hard to use
- Spends no more than 10 minutes per day on financial management
- Wants to spend less time wondering "where is my money?" and more time
  knowing exactly what each dollar is doing

The goal: consolidate into a single, simple, fast app that works on phone or computer.

---

## Primary User (today)

A Venezuelan professional who:
- Earns income primarily in **USDC** (base currency)
- Pays for services in **VES** (bolívares) using either BCV rate or P2P USDt rate
- Has international subscriptions paid in **USD** via Zinli/Facebank/Wally (Panama accounts)
- Invests through crypto wallets (Binance, Bitget, Belo) and Venezuelan brokerage houses
- Manages savings goals (emergency fund in multiple currencies, Europe trip, Bitcoin)
- Tracks credit card debt (TDC) and installment purchases (Cashea — Venezuela's buy-now-pay-later)
- Registers expenses maximum once a day, in under 10 minutes

---

## The Currency Problem (Venezuela-specific, but generalizable)

This is the most complex part of the system. Understanding it is essential.

### The User's Reality

Income arrives in USDC. But expenses exist in 3 worlds:

**World 1 — International (simple)**
Netflix $15 USD → paid with Zinli card → 1:1 with USDC, no conversion needed.

**World 2 — Venezuela USD-to-VES (complex)**
Internet service costs $40 USD but must be paid in bolívares.
The user sells USDC at today's rate (e.g., 55.20 VES/USD via P2P USDt market)
→ Pays 2,208 VES to the provider.
→ The expense is recorded as: origin $40 USD, payment 2,208 VES, rate 55.20, equivalent $40 USDC.

**World 3 — Direct VES (medium)**
Buying groceries at a local market for 1,400 VES directly from Banesco account.
→ origin 1,400 VES, payment 1,400 VES, rate from BCV that day (e.g., 55.20) → $25.36 USDC equivalent.

### Two Rates May Exist
- **BCV (Banco Central de Venezuela)**: official government rate — used for services priced in USD but billed in VES
- **USDt P2P**: market rate — used when converting crypto to cash — slightly higher than BCV

The user may sell USDC at 9am for 55.20 and again at 2pm for 55.85. Rates are NOT fixed.

### Stablecoin Parity Rule
**USDC = USDt = DOC = 1:1 with USD** for accounting purposes.
The real difference ($0.002 or $0.03) is noise and not worth tracking.
This simplifies registration: no conversion needed between stablecoins.

### For Non-Venezuelan Users
A user in Colombia only uses COP. They see none of this complexity.
Their base currency is COP, every expense is in COP, no exchange rates needed.
The system must be fully usable in single-currency mode with zero friction.

---

## The Envelope System

Envelopes are organized in a **two-level hierarchy**:

```
Group Envelope (no transactions directly)
  └── Sub-envelope (receives transactions)
  └── Sub-envelope
  └── Sub-envelope

Individual Envelope (no children — receives transactions directly)
```

### Real Envelope Structure

**🏠 Hogar** (Group)
- Inter (internet, $40/mo → VES BCV)
- Condominio ($65/mo → VES BCV)
- Corpoelec ($5/mo → VES BCV)
- Aseo ($5/mo → VES BCV)
- CANTV ABA ($25/mo → VES BCV)
- CANTV Teléfono ($5/mo → VES BCV)
- Movistar YG, YL, JG ($10/mo each → VES BCV)
- Digitel YG ($2/mo → VES BCV)
- Gastos corrientes VZ ($170/mo → VES BCV)

**🍽️ Comida** (Group)
- Mercado ($400/mo → VES BCV, tracked as budget with partial entries)
- Comer afuera ($30/mo → VES BCV)

**📱 Suscripciones digitales** (Group)
- Netflix ($15), HBO ($5.99), Disney+ ($5.99, currently inactive),
  Claude AI ($20), Google One ($19.99), Amazon Prime ($7.99), Zinli sub ($0.99)
- All USD direct, paid via Zinli or Facebank

**📅 Suscripciones anuales** (Group → Bitget Earn USDt)
Reserves monthly toward annual payments:
- Canva ($2/mo → $24/yr), Proton VPN ($8.99/mo → $107.88/yr),
  Platzi ($5/mo → $60/yr), Impuestos casa ($7/mo → $84/yr)

**💆 Cuidado personal** (Group)
- Entrenamientos ($50/mo USDt)
- English course ($160/mo USDt)
- Dermatologo ($100/mo VES BCV, occasional)
- Manicure ($30/mo USDt)

**💰 Fondo de Emergencia** (Group)
- Emergencia USD → Facebank ($20/mo)
- Emergencia DOC → Belo ($50/mo)
- Emergencia USDC → Bitget Earn USDC ($20/mo)
(shown consolidated in dashboard: total in USDC equivalent)

**📈 Bitcoin** (Group)
- Reto Bitcoin 365 Binance ($31/mo USDC)
- Reto Bitcoin 365 Belo ($31/mo USDC)
- Ahorro BTC (occasional, variable amount)

**📈 Inversiones VZ** (Group → Casa de bolsa)
- PerCapital ($25/mo → VES BCV) — Venezuelan brokerage
- Mercosur ($25/mo → VES BCV) — Venezuelan brokerage
- Rendivalores ($25/mo → VES BCV) — Venezuelan brokerage

**📋 Obligaciones** (Group)
- IVSS ($1/mo → VES BCV) — social security
- ISLR ($5/mo → VES BCV) — income tax (variable)
- Abono TDC Visa ($30/mo → VES BCV)
- Abono TDC Master ($30/mo → VES BCV)
- Facebank mantenimiento ($6.67/mo → $20 quarterly → USD)

**🎁 Familia** (Individual)
- Diezmo ($170/mo → VES BCV)

**👤 Gastos personales** (Individual, Presupuesto type)
- Fixed monthly budget $100, spending tracked as partial entries throughout month

---

## Envelope Priority System

Every envelope has a priority that determines spending order when income is tight:

| Priority | Label | Meaning |
|----------|-------|---------|
| 🔴 Crítico | Supervivencia | Cannot be skipped. Hogar, Obligaciones, Diezmo |
| 🟡 Importante | Flexible | Important but adjustable. Savings, subscriptions, education |
| 🟢 Flexible | Crecimiento | Deprioritize if needed. Investments, personal expenses, trips |

The budget template classifies each item as `supervivencia`, `flexible`, or `crecimiento`.
This classification only lives in budget — it does NOT copy to transactions.

---

## The Budget Template

The user maintains a monthly template (think: master list of recurring expenses).

**At the start of each month**, one button press generates all recurring transactions
as `apartado` (reserved) status with their scheduled dates.

**Budget item properties:**
- Name, envelope, wallet, amount, currency
- Frequency: monthly | quarterly | semiannual | annual
- Payment day (1-31)
- Spending type: supervivencia | flexible | crecimiento
- Active/inactive toggle (e.g., Disney+ is currently inactive)

**Variable/presupuesto items** (Mercado, Comer afuera, Gastos personales):
These load as a budget with available balance, not as fixed transactions.
User adds partial entries throughout the month and sees remaining balance.

---

## Wallet System

A wallet is any place where money physically lives.

| Wallet | Platform | Currency | Type |
|--------|----------|----------|------|
| Earn USDC | Binance | USDC | asset |
| Earn USDt | Binance | USDt | asset |
| Spot USDC | Binance | USDC | asset |
| Earn USDC | Bitget | USDC | asset |
| Earn USDt | Bitget | USDt | asset |
| Belo | Belo | DOC | asset |
| Banesco | Banesco VZ | VES | asset |
| Zinli | Zinli | USD | asset |
| Wally | Wally | USD | asset |
| Facebank | Facebank PR | USD | asset |
| TDC Visa Banesco | Banesco VZ | VES | credit |
| TDC Master Banesco | Banesco VZ | VES | credit |
| TDC BNC | BNC VZ | VES | credit |
| Cashea Cotidiana | Cashea | VES | credit |
| Cashea Normal | Cashea | VES | credit |
| PerCapital | PerCapital | VES | asset |
| Mercosur | Mercosur | VES | asset |
| Rendivalores | Rendivalores | VES | asset |

**Credit wallets** have: credit limit, used balance, available balance.
TDC payments are regular expense transactions that reduce the used balance.
**Cashea** works exactly like TDC but payments are every 15 days, zero interest.

---

## Income (Ingresos)

Income is recorded on its own page (`/ingresos`), separate from expenses.
Income transactions reuse the `transactions` table with `type = 'income'`.

Two states:
- **Pendiente** — expected income (e.g. the salary that arrives on the 30th),
  useful for planning the month before the money lands
- **Recibido** — money in hand (stored as status `pagado`; same enum as expenses)

Wallet symmetry: receiving income **credits** the wallet balance, the mirror
of how paying an expense **debits** it. A pending income has a "Recibir"
action, just like a pending expense has a pay action.

Income has no envelope — envelopes track spending. In Budget Zero terms,
income is the pool that gets *assigned* to envelopes; recording it enables
the dashboard metric "income vs assigned vs free (unassigned)".

---

## Transfers Between Wallets

Money often moves between wallets (e.g. Binance USDC → Zinli USD, or selling
USDC to load a VES bank account). A transfer is **not income and not an
expense** — it's the user's own money changing pockets. Recording it as
income+expense would inflate monthly stats.

Each transfer records: date, origin wallet, destination wallet,
**amount sent**, **commission**, **amount received**. The destination amount
may be in another currency — the exchange rate is implicit between sent and
received (no rate input needed; between USD/stablecoins the received amount
auto-derives as sent − commission thanks to the 1:1 parity rule).

Balance mechanics:
- Origin wallet is debited by amount sent
- Destination wallet is credited by amount received

Commission handling (the only real money lost in a transfer):
- **Commission > 0** → one linked expense is created in Gastos
  ("Comisión transferencia A → B", status pagado, origin wallet). The link is
  stored in `transfers.commission_transaction_id`. This expense must NOT touch
  wallet balances — the commission already left as part of amount sent
  (avoiding a double-debit). Commission reports (how much do I spend on
  commissions?) are computed from the transfers table, per currency.
- **Commission = 0** → transfer record only, no transaction is created.

Corrections: transfers support **create and delete only** — deleting reverses
both wallet balances and voids the linked commission expense. To fix a
mistake, delete and re-create. No editing by design (simpler, less error-prone).

---

## Cashea (Venezuela's BNPL)

Cashea is a buy-now-pay-later service. When a purchase is made:
- User enters: description, date, initial payment, installment amount, number of installments, envelope, wallet
- System generates: 1 initial transaction + N installment transactions spaced 15 days apart
- All generated as `apartado` status
- They appear in the upcoming payments view and can be marked as paid individually
- All are linked via a `group_id` so they can be viewed together

---

## Debt Dashboard

**TDC (Credit Cards):**
- Shows: limit, used, available, minimum payment
- Payments are regular expense transactions to the TDC wallet
- No separate "debt payment" flow — just register as expense in Obligaciones envelope

**Cashea:**
- Shows active purchase groups with remaining installments
- Click into a group to see individual installment dates and status

---

## Transaction Flow

Every expense has:
1. **Origin**: what the invoice says (currency + amount)
2. **Payment**: what actually left the wallet (currency + amount)
3. **Conversion rate**: from origin to payment (null if same currency)
4. **Base equivalent**: how much this cost in USDC (or user's base currency)
5. **Base rate**: from payment currency to base currency (null if same)

**Key insight**: "monto_pago" IS the amount in the payment currency.
For VES payments, this IS the bolívar amount. No separate VES field needed.
Reporting "total VES spent this year" = filter transactions where payment_currency = VES, sum payment_amount.

**Exchange rate selection when registering a transaction:**
- Option A: Pick from saved rates (pre-loaded from BCV or entered manually)
- Option B: Enter a custom rate just for this transaction (not saved)
This respects the reality that rates change multiple times per day.

---

## BabySteps Integration

The user follows Dave Ramsey's Baby Steps as a financial philosophy:

| Step | Goal | Status |
|------|------|--------|
| 1 | Save $1,000 emergency fund | ✅ Done |
| 2 | Pay off all debt | 🟡 In progress |
| 3 | Save 3-6 months expenses | 🟡 In progress |
| 4 | Invest 15% | 🟡 In progress |
| 5 | Travel Europe | 🟡 In progress |
| 6 | Buy house | ⬜ Pending |
| 7 | Build wealth and give | ⬜ Pending |

This is a **separate view** from the envelope system.
Each step links to relevant envelope(s) or shows a manual progress tracker.
The user wants to see numeric progress (e.g., "Step 3: $1,125 / $4,000").

---

## Dashboard Requirements

What the user needs to see at a glance:
1. **Monthly totals**: income, assigned, paid, reserved, free (unassigned)
2. **Envelope status**: each envelope card with progress bar, paid vs assigned
3. **Upcoming payments**: next 30 days, ordered by date, with days remaining
4. **Budget by spending type**: % of income going to supervivencia / flexible / crecimiento
5. **Emergency fund**: consolidated total across all three currencies
6. **Annual subscriptions**: each one with accumulated amount vs annual target
7. **Alerts**: only when OVER budget (not when at 100% — that's fine), pending apartados

---

## Multi-Currency Architecture Principles

1. **Base currency is user-configurable** — never hardcode USDC
2. **Stablecoins (USDC, USDt, DOC) are 1:1 with USD** — no conversion between them
3. **All reporting uses `base_amount`** — calculated at registration time and stored
4. **VES always needs a rate** — never allow VES payment without a conversion rate
5. **Rates are suggestions, not locks** — user can always override with a custom rate
6. **Single-currency users see none of this** — the multi-currency UI only appears when `user.multi_currency = true`

---

## What the User Does NOT Want

- Complex category hierarchies to navigate when registering an expense
- Having to configure a lot before starting
- Difficulty seeing debts quickly
- Any friction that adds more than 10 minutes per day to financial management
- App that requires internet connection to review past expenses (PWA consideration for future)

---

## Future Roadmap (post-launch)

1. PWA / offline mode
2. Push notifications for upcoming payments
3. CSV export for tax purposes
4. Bank statement import
5. Multi-user (partner view — same budget, different phones)
6. Public SaaS with magic link auth for other users
7. Analytics: spending trends, month-over-month comparison

---

## Monetization Direction

The plan is to open the app to other users and eventually monetize.
Initial strategy: freemium (free tier with limits, paid tier for full features).
First validate with personal use, then open to beta users (friends/family),
then launch publicly.
The architecture must support multi-tenancy from day one (already designed with user_id on all tables + RLS).

---

## Non-functional Requirements

- **Performance**: page load < 2s on mobile, < 1s on desktop
- **Responsive**: mobile-first, works on 375px (iPhone SE) through 1440px (desktop)
- **Auth**: magic link only (no passwords), session duration 30 days
- **Hosting**: Vercel (frontend) + Supabase (backend) — both free tier initially
- **Offline**: basic read access (future — not Sprint 01)
- **Languages**: UI in Spanish, code/DB in English
