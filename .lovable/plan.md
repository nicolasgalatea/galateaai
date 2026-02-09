

# Plan: Integración de Producción con n8n

## Resumen

Reconfigurar el sistema de orquestación para usar un `projectId` fijo, eliminar todos los timeouts que cortan la conexión, y optimizar la UI para mostrar progreso continuo mientras los 8 agentes procesan.

---

## Cambios Detallados

### 1. `src/hooks/useN8nOrchestration.ts` - Cambios principales

**a) ProjectId fijo:**
- Reemplazar `crypto.randomUUID()` por el UUID fijo: `e8233417-9ddf-4453-8372-c5b6797da8aa`
- Todas las lecturas y suscripciones Realtime usarán este ID

**b) Eliminar timeouts restrictivos:**
- Eliminar `FALLBACK_UI_TIMEOUT_MS` (60s) - ya no hay fallback automático a simulación
- Eliminar `GLOBAL_TIMEOUT_MS` (180s) - ya no hay corte global
- Eliminar `PER_AGENT_TIMEOUT_MS` (45s) - ya no hay warning por inactividad
- Mantener solo el reconexión con backoff exponencial para robustez de canal

**c) Estado "Procesando con IA":**
- Agregar nuevo estado de conexión: `'processing'` al tipo `ConnectionStatus`
- Inmediatamente después de enviar el webhook, cambiar estado a `'processing'` (en lugar de esperar)
- La UI puede mostrar "Procesando con IA..." basándose en este estado

**d) Limpiar lógica post-webhook:**
- Eliminar los `setTimeout` de fallback y global timeout del `startOrchestration`
- El cleanup solo ocurre cuando los 8 agentes llegan o el usuario resetea manualmente

### 2. `src/pages/ClinicalNavigator.tsx` - Cambios de UI

**a) Eliminar timeout de 180s en `waitForPhase1Completion`:**
- Quitar el `setTimeout` de 180000ms que fuerza fallback a simulación (linea ~2321-2327)
- La espera es indefinida hasta que lleguen los 8 agentes

**b) Indicador visual "Procesando con IA":**
- Cuando `connectionStatus === 'processing'`, mostrar un banner/indicador persistente que diga "IA procesando tu investigación..." con los agentes que van llegando
- Cada agente que completa actualiza su card con efecto de typewriter (ya implementado en `AgentExplanationCard`)

**c) Eliminar fallback automático a simulación:**
- Quitar la llamada a `handleFallbackToSimulation()` del timeout
- El fallback solo debería ser manual (botón) o si la conexión falla completamente

---

## Secciones Tecnicas

### Constantes eliminadas
```text
ANTES:
  FALLBACK_UI_TIMEOUT_MS = 60000
  GLOBAL_TIMEOUT_MS = 180000
  PER_AGENT_TIMEOUT_MS = 45000

DESPUES:
  (eliminadas - sin timeouts artificiales)
  RECONNECT_MAX_ATTEMPTS = 5  (aumentado de 3 para mayor robustez)
  RECONNECT_BACKOFF_MS = 2000 (sin cambios)
```

### ConnectionStatus actualizado
```text
ANTES: 'idle' | 'connecting' | 'connected' | 'fallback'
DESPUES: 'idle' | 'connecting' | 'connected' | 'processing' | 'fallback'
```

### Flujo de datos
```text
1. Usuario hace clic "Iniciar Analisis"
2. Frontend suscribe Realtime con projectId fijo
3. POST a n8n webhook (no-cors)
4. Estado cambia a 'processing' --> UI muestra "Procesando con IA"
5. n8n ejecuta 8 agentes secuencialmente con Claude 3.5 Sonnet
6. Cada INSERT en agent_executions dispara actualizacion en UI
7. Cuando receivedAgents.size >= 8 --> Phase 1 completa
8. Sin timeout artificial - espera el tiempo que sea necesario
```

### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `src/hooks/useN8nOrchestration.ts` | ProjectId fijo, eliminar timeouts, agregar estado 'processing' |
| `src/pages/ClinicalNavigator.tsx` | Eliminar timeout 180s, mostrar estado "Procesando con IA" |

