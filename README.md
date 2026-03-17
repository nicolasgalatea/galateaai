# GalateaAI — Asistente de Investigacion Cientifica

## Proyecto

Plataforma de investigacion medica con orquestacion de agentes Claude para generacion de protocolos y manuscritos IMRyD.

## Stack

- Frontend: HTML + Tailwind CSS (demo/index.html)
- Backend: Vercel Serverless Functions (Node.js)
- API: Claude (Anthropic)
- DB: Supabase

## Arquitectura

### Producto Primario: Demo (`demo/index.html`)

El demo es la **aplicacion de produccion**. Es un archivo HTML monolitico (~963KB) que implementa el flujo completo de investigacion multi-etapa con agentes Claude reales. Todo desarrollo de features debe apuntar a este archivo primero.

- **URL:** https://galatea-v2-prod.vercel.app/demo/index.html
- **Clientes piloto:** Fundacion Santa Fe de Bogota (FSFB), Bayer
- **Multi-tenant:** Selector de institucion al inicio, branding y flujos adaptativos

### React SPA (`src/`) — v2 en desarrollo

La aplicacion React/Vite en `src/` es un **rewrite v2 en progreso**. NO es el producto de produccion. No intentar fusionar demo y SPA en este momento. La SPA reemplazara al demo una vez logre paridad de features.

### Backend (`api/`)

16 agentes Claude con endpoints serverless en Vercel. Incluye integraciones reales con PubMed, Cochrane, LILACS, ClinicalTrials.gov, MeSH/DeCS, y REDCap.

## Deploy

Desplegado en Vercel. Push a `main` activa deploy automatico.

## Desarrollo local

```sh
git clone https://github.com/nicolasgalatea/galateaai.git
cd galateaai
# El frontend principal esta en demo/index.html
# Las funciones API estan en api/
# Los prompts de agentes estan en prompts/system-prompts.js
```
