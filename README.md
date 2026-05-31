# 💰 Finanzas — Sobres Digitales

Sistema personal de presupuesto por sobres digitales con soporte para múltiples monedas (USD, USDC, USDt, DOC, VES), tasas de cambio BCV y conexión con Google Sheets.

## Estructura

```
finanzas-sobres/
├── index.html          # App principal (abre en el navegador)
├── sobres_setup.gs     # Google Apps Script para crear el Sheet
├── .gitignore
└── README.md
```

## Configuración

### 1. Google Sheet
1. Crea un Google Sheet nuevo en blanco
2. Ve a **Extensiones → Apps Script**
3. Pega el contenido de `sobres_setup.gs`
4. Ejecuta la función `setupCompleto`
5. Copia el **Sheet ID** de la URL de tu Sheet

### 2. Google API Key
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un proyecto → habilita **Google Sheets API**
3. Crea una **API Key**
4. En **Restricciones de la API Key**:
   - Restricción de aplicación: **Sitios web HTTP**
   - Agrega tu dominio de GitHub Pages: `https://TU_USUARIO.github.io`
   - Restricción de API: solo **Google Sheets API**

### 3. App
1. Abre `index.html` en Chrome
2. En el setup screen ingresa tu **Sheet ID** y **API Key**
3. Listo — los datos se guardan en tu Sheet

## Seguridad

- La API Key **nunca** está hardcodeada en el código
- Se guarda en `localStorage` del navegador (solo en tu dispositivo)
- La key está restringida a tu dominio en Google Cloud Console
- El repositorio es **privado**

## GitHub Pages

Para acceder desde cualquier dispositivo:
1. Ve a **Settings → Pages** en tu repo
2. Source: `Deploy from a branch` → `main` → `/root`
3. Tu app estará en `https://TU_USUARIO.github.io/finanzas-sobres`

## Monedas soportadas

| Moneda | Tratamiento |
|--------|-------------|
| USDC | Base de contabilidad (1:1 USD) |
| USDt | 1:1 con USD |
| DOC | 1:1 con USD |
| USD | 1:1 con USDC |
| VES | Conversión con tasa BCV o USDt P2P |
| EUR | Conversión con tasa BCV |
