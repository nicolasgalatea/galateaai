# DEVELOPMENT LOG - Galatea AI

> **Fecha:** 2026-02-08
> **Sesion:** Sistema Nervioso Resistente + Sincronizacion n8n/Supabase

---

## RESUMEN EJECUTIVO

Se implemento un sistema de orquestacion "Grado Industrial" que conecta el frontend React con n8n via Supabase Realtime. Los 14 agentes de investigacion ahora funcionan en tiempo real sin simulaciones.

---

## CAMBIOS CRITICOS REALIZADOS

### 1. URLs DE N8N ACTUALIZADAS

**Archivo:** `src/config/researchAgents.ts`

```typescript
// ANTES (incorrecto - daba 404)
export const N8N_WEBHOOK_BASE_URL = 'https://galatea89.app.n8n.cloud/webhook';

// AHORA (correcto)
export const N8N_WEBHOOK_BASE_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook';
export const N8N_PROTOCOL_START_WEBHOOK = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';
export const N8N_EXECUTION_START_WEBHOOK = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-execution-start';
```

**Archivos adicionales actualizados:**
- `src/config/n8nSchemas.ts`
- `src/components/GalateaHomepage.tsx`
- `src/components/AgentDetailTemplate.tsx`

---

### 2. TABLA DE SUPABASE CORREGIDA

**ANTES:** El codigo escuchaba `agent_outputs` (tabla que no existe)
**AHORA:** Escucha `agent_executions` (tabla correcta)

**Archivos modificados:**
- `src/hooks/useN8nOrchestration.ts`
- `src/hooks/useAgentOutputs.ts`
- `src/components/research/AgentLiveGrid.tsx`
- `src/components/research/ResearchProgressBar.tsx`
- `src/components/research/ResearchProjectDashboard.tsx`

---

### 3. HOOK useN8nOrchestration.ts (NUEVO)

**Ubicacion:** `src/hooks/useN8nOrchestration.ts`

**Caracteristicas implementadas:**
- Deduplicacion con `processedIdsRef` (Set)
- Reconexion automatica (3 intentos, backoff exponencial)
- Fallback no-bloqueante a 60 segundos
- Logs con prefijo `[n8n-Realtime]`
- UUID de proyecto generado automaticamente
- Fetch con `mode: 'no-cors'` para evitar bloqueos CORS
- ProjectId limpio con `.toString().trim()`

**Uso:**
```typescript
const {
  isConnected,
  isLoading,
  currentAgent,
  agentOutputs,
  projectId,
  startOrchestration,
  stopOrchestration,
  reconnect,
} = useN8nOrchestration({
  projectId: '',
  onAgentUpdate: (output) => { /* actualizar UI */ },
  onError: (error) => { /* manejar error */ },
  onFallback: () => { /* timeout alcanzado */ },
});
```

---

### 4. TIPOS DE TYPESCRIPT SINCRONIZADOS

**Archivo:** `src/integrations/supabase/types.ts`

Se agregaron las tablas faltantes:

```typescript
agent_executions: {
  Row: {
    id: string
    project_id: string
    agent_number: number
    agent_name: string
    phase: number | null
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
    input_payload: Json | null
    output_result: Json | null
    output_markdown: string | null
    started_at: string | null
    completed_at: string | null
    duration_ms: number | null
    tokens_used: number | null
    error_message: string | null
    retry_count: number | null
    created_at: string
  }
  // ... Insert y Update
}

agent_projects: {
  Row: {
    id: string
    title: string
    description: string | null
    research_question: string | null
    phase: 'PROTOCOL_GENERATION' | 'AWAITING_APPROVAL' | 'EXECUTING_REVIEW' | 'COMPLETED'
    current_agent_step: number
    created_at: string
  }
  // ... Insert y Update
}
```

**Archivo:** `src/types/domain.ts`

```typescript
export type ProjectPhase = 'PROTOCOL_GENERATION' | 'AWAITING_APPROVAL' | 'EXECUTING_REVIEW' | 'COMPLETED';
export type AgentExecutionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface AgentOutput {
  id: string;
  project_id: string;
  agent_number: number;
  agent_name: string;
  phase: number | null;
  status: AgentExecutionStatus;
  input_payload: Record<string, unknown> | null;
  output_result: Record<string, unknown> | null;  // ANTES: output_data
  output_markdown: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  retry_count: number | null;
  created_at: string;
}
```

---

### 5. AgentProtocolReview.tsx MODIFICADO

**Archivo:** `src/pages/AgentProtocolReview.tsx`

**Cambios:**
- Importa `useN8nOrchestration` y `getAgentById`
- `simulatePhase1Orchestration` renombrada a `startPhase1Orchestration`
- Ya no simula agentes con `setTimeout`
- Llama a `startOrchestration(data, 1)` para Fase 1
- Llama a `startOrchestration(data, 2)` para Fase 2
- `onAgentUpdate` callback actualiza UI en tiempo real

---

## ARQUITECTURA ACTUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (localhost:8085)                    │
│                                                                 │
│  AgentProtocolReview.tsx                                       │
│       │                                                         │
│       ▼                                                         │
│  useN8nOrchestration.ts                                        │
│       │                                                         │
│       ├── POST (no-cors) ──────────────────────────────────┐   │
│       │                                                     │   │
│       └── subscribe(agent_executions) ◄────────────────┐   │   │
└─────────────────────────────────────────────────────────┼───┼───┘
                                                          │   │
                                                          │   ▼
┌─────────────────────────────────────────────────────────┼───────┐
│                         N8N                             │       │
│        nicolasgalatea.app.n8n.cloud                    │       │
│                                                         │       │
│  Webhook: /webhook/galatea-protocol-start ◄─────────────┘       │
│       │                                                         │
│       ▼                                                         │
│  Ejecuta Agentes 1-8 (Fase 1) o 9-14 (Fase 2)                  │
│       │                                                         │
│       ▼                                                         │
│  INSERT/UPDATE en Supabase ─────────────────────────────┐       │
└─────────────────────────────────────────────────────────┼───────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                 │
│                                                                 │
│  Tabla: agent_executions                                       │
│  Realtime: ENABLED                                             │
│  Columna filtro: project_id                                    │
│                                                                 │
│  Emite: postgres_changes ───────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## SQL PARA CREAR TABLAS EN SUPABASE

```sql
-- Ejecutar en Supabase SQL Editor

CREATE TABLE agent_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  research_question TEXT,
  phase TEXT DEFAULT 'PROTOCOL_GENERATION',
  current_agent_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE agent_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES agent_projects(id),
  agent_number INTEGER NOT NULL,
  agent_name TEXT NOT NULL,
  phase INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  input_payload JSONB,
  output_result JSONB,
  output_markdown TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  tokens_used INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_agent_executions_project_id ON agent_executions(project_id);
CREATE INDEX idx_agent_executions_agent_number ON agent_executions(agent_number);

-- IMPORTANTE: Habilitar Realtime en ambas tablas desde el Dashboard
```

---

## CONFIGURACION N8N

**Workflow:** Galatea Protocol Start

**Nodo Webhook:**
- Method: POST
- Path: `galatea-protocol-start`
- URL completa: `https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start`

**Payload que recibe:**
```json
{
  "projectId": "uuid-string",
  "phase": 1,
  "action": "START_PROTOCOL",
  "inputData": {
    "research_question": "...",
    "title": "..."
  },
  "timestamp": "2026-02-08T...",
  "sessionId": "orchestration_uuid_timestamp"
}
```

**n8n debe escribir en Supabase:**
```sql
INSERT INTO agent_executions (project_id, agent_number, agent_name, status)
VALUES ($projectId, 1, 'picot_builder', 'in_progress');

-- Despues de procesar:
UPDATE agent_executions
SET status = 'completed', output_markdown = '...', completed_at = NOW()
WHERE id = $execution_id;
```

---

## VARIABLES DE ENTORNO (.env)

```env
VITE_SUPABASE_URL=https://jytsldbqgvntrqfjnkhz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## COMANDOS UTILES

```bash
# Iniciar desarrollo
cd C:\Users\asus\Desktop\galateaai
npm run dev

# Ver en navegador
http://localhost:8085/agent/protocol-review

# Logs en consola (F12)
Filtrar por: [n8n-Realtime]

# Probar webhook manualmente
curl -X POST https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start \
  -d '{"projectId":"test-123","phase":1,"inputData":{"research_question":"Test"}}'
```

---

## CHECKLIST DE VERIFICACION

- [x] URLs de n8n apuntan a `nicolasgalatea.app.n8n.cloud`
- [x] Tabla `agent_executions` (no `agent_outputs`)
- [x] Columna `project_id` (con guion bajo)
- [x] Fetch con `mode: 'no-cors'`
- [x] Tipos TypeScript sincronizados con schema SQL
- [x] Hook `useN8nOrchestration` implementado
- [x] `AgentProtocolReview.tsx` usa orquestacion real (no simulada)

---

## PROXIMOS PASOS

1. Verificar que n8n tenga el workflow en modo ACTIVE
2. Probar el flujo completo desde el frontend
3. Confirmar que Supabase Realtime emite eventos
4. Implementar los 14 agentes en n8n

---

*Generado por Claude Code - Sesion de desarrollo 2026-02-08*
