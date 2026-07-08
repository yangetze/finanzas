# Sobres — Finanzas Personales

Sistema de presupuesto digital por sobres (Budget Zero). Multi-moneda, diseñado
para la realidad venezolana pero usable en cualquier país.

## ¿Qué es Sobres?

Sobres es una app de finanzas personales basada en el método Budget Zero:
cada peso/dólar/bolívar que entra tiene un propósito antes de gastarse.
La organizas en "sobres" (categorías) y controlas cuánto usas de cada uno.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel |
| Auth | Magic link (sin contraseña) |
| Testing | Vitest + React Testing Library |

## Estructura del repo

```
finanzas/
├── docs/
│   ├── business-context.md    ← Contexto completo del negocio
│   ├── plan-sprint-01.md      ← Sprint actual
│   └── plan-sprint-XX.md      ← Sprints futuros
├── legacy/                    ← App HTML original + Google Apps Script
├── src/
│   ├── components/
│   │   ├── ui/                ← Componentes base
│   │   ├── layout/            ← AppShell, Sidebar, MobileNav
│   │   ├── envelopes/         ← Sobres y grupos
│   │   ├── transactions/      ← Registro de gastos e ingresos
│   │   ├── budget/            ← Plantilla mensual
│   │   ├── wallets/           ← Billeteras y transferencias
│   │   ├── debts/             ← TDC y Cashea
│   │   └── babysteps/         ← Metas financieras
│   ├── hooks/                 ← Custom hooks
│   ├── lib/                   ← Supabase client, utils
│   ├── pages/                 ← Páginas/rutas
│   └── types/                 ← TypeScript types
├── supabase/
│   └── migrations/            ← Schema SQL
├── CLAUDE.md                  ← Instrucciones para Claude Code
└── .env.example
```

## Setup local

```bash
# 1. Clonar
git clone https://github.com/yangetze/finanzas.git
cd finanzas

# 2. Instalar dependencias
pnpm install

# 3. Configurar entorno
cp .env.example .env
# Editar .env con credenciales de Supabase

# 4. Aplicar schema (Supabase → SQL Editor)
# Pegar contenido de supabase/migrations/001_initial_schema.sql

# 5. Configurar Auth en Supabase
# Authentication → Settings → JWT expiry: 2592000 (30 días)
# Authentication → URL Configuration → Site URL: http://localhost:5173

# 6. Correr
pnpm dev
```

## Funcionalidades

| Sección | Qué hace |
|---------|----------|
| Dashboard | Resumen del mes |
| Billeteras | Cuentas (asset) y tarjetas (credit), transferencias entre billeteras con comisión e historial |
| Sobres | Sobres con jerarquía grupo → sub-sobre, colapsables |
| Gastos | Registro de gastos multi-moneda, estados apartado/pendiente/pagado, compras Cashea en cuotas |
| Ingresos | Registro de ingresos con estados Pendiente (esperado) y Recibido; al recibir acredita la billetera |
| Presupuesto | Plantilla mensual de partidas agrupadas por sobre, totales por moneda, "Abrir mes" genera los gastos pendientes y asignaciones del mes |
| Deudas | Dashboard de TDC (límite, usado, disponible) y grupos Cashea |
| Metas | BabySteps con progreso |
| Tasas | Tasas de cambio (solo admin) |

### Transferencias entre billeteras

Mover dinero de una billetera a otra (ej. Binance → Zinli), con soporte para:
- **Comisión opcional**: si es mayor a cero se registra automáticamente como
  gasto en Gastos ("Comisión transferencia A → B") — así sabes cuánto gastas
  en comisiones (total por moneda visible en Billeteras)
- **Cambio de moneda**: el monto recibido puede estar en otra moneda; la tasa
  queda implícita entre enviado y recibido (entre stablecoins/USD se autocalcula 1:1)
- **Historial completo**: toda transferencia queda registrada, con o sin comisión
- **Eliminar revierte todo**: balances restaurados y gasto de comisión anulado
  (no hay edición: eliminar y crear de nuevo es el camino de corrección)

## Monedas soportadas

| Código | Nombre | Tipo | Nota |
|--------|--------|------|------|
| USDC | USD Coin | stable | Moneda base por defecto |
| USDt | Tether | stable | 1:1 con USDC |
| USD | Dólar americano | fiat | 1:1 con USDC |
| DOC | Dollar on Chain | stable | 1:1 con USDC |
| VES | Bolívar venezolano | fiat | Requiere tasa BCV o P2P |
| EUR | Euro | fiat | Requiere tasa BCV |
| BTC | Bitcoin | crypto | Para tracking de inversiones |

## Modelo de datos

```
currencies       → Catálogo global de monedas
exchange_rates   → Tasas de cambio por fecha (global)
users            → Perfil + configuración del usuario
wallets          → Cuentas (asset) y tarjetas (credit)
envelopes        → Sobres con jerarquía padre/hijo
budget_items     → Plantilla mensual de gastos (partidas)
transactions     → Gastos e ingresos (type: expense | income)
transfers        → Movimientos entre billeteras (con comisión enlazada
                   a un gasto vía commission_transaction_id)
```

## Convenciones

- UI siempre en **español**
- Código, DB, comentarios siempre en **inglés**
- DB: `snake_case` | TypeScript: `camelCase`
- TDD: test primero, implementación después
- Un sprint = un conjunto pequeño de features shippeables

## Legacy

La versión anterior (Google Sheets + HTML app) está en `/legacy`.
Sigue funcionando de forma independiente.
