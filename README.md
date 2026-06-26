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
│   │   ├── transactions/      ← Registro de gastos
│   │   ├── budget/            ← Plantilla mensual
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

## Sprints

| Sprint | Contenido | Estado |
|--------|-----------|--------|
| 01 | Auth (magic link), shell, onboarding, configuración de usuario | ✅ Completado |
| 02 | Wallets y tasas de cambio | ⬜ Pendiente |
| 03 | Sobres — grupos, sub-sobres, prioridades | ⬜ Pendiente |
| 04 | Presupuesto — plantilla mensual | ⬜ Pendiente |
| 05 | Gastos — registro multi-moneda | ⬜ Pendiente |
| 06 | Cashea — cuotas automáticas | ⬜ Pendiente |
| 07 | Dashboard principal | ⬜ Pendiente |
| 08 | Deudas — TDC dashboard | ⬜ Pendiente |
| 09 | Metas — BabySteps | ⬜ Pendiente |
| 10 | Apertura de mes | ⬜ Pendiente |

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
budget           → Plantilla mensual de gastos
transactions     → Todos los movimientos de dinero
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
