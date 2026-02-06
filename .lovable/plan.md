

# Reescritura Industrial de `useN8nOrchestration.ts`

## Objetivo
Reescribir completamente el hook con robustez de grado produccion: deduplicacion, reconexion automatica, fallback no-bloqueante, logs detallados, y eficiencia de renders.

## Archivo unico afectado
`src/hooks/useN8nOrchestration.ts` -- reescritura completa, misma interfaz publica.

## Cambios clave

### 1. Nuevas constantes de configuracion
```text
RECONNECT_MAX_ATTEMPTS = 3
RECONNECT_BACKOFF_MS   = 2000  (2s, 4s, 8s exponencial)
FALLBACK_UI_TIMEOUT_MS = 60000 (60s - activa onFallback visual)
GLOBAL_TIMEOUT_MS      = 180000 (180s - timeout maximo total)
PER_AGENT_TIMEOUT_MS   = 45000 (45s - warning entre agentes)
```

### 2. Nuevos refs internos
- `processedIdsRef: Set<number>` -- deduplicacion entre fetch inicial y Realtime
- `receivedAgentsRef: Set<number>` -- lectura sincrona para logica interna (evita stale closures)
- `reconnectAttemptsRef: number` -- contador de reintentos
- `perAgentTimeoutRef` -- timeout entre agentes individuales
- `fallbackUITimeoutRef` -- timeout de 60s para fallback visual (separado del global)
- `globalTimeoutRef` -- timeout de 180s global

### 3. Deduplicacion critica
Cada registro procesado (tanto de fetch como de Realtime) se registra por su `id` en `processedIdsRef`. Si el ID ya existe, se ignora con un log `[n8n-Realtime] SKIP duplicate id=X`.

### 4. Funcion `processRecord(record)` centralizada
Un unico punto de entrada para procesar cualquier `AgentOutput`:
- Verifica deduplicacion
- Mapea agent_name a agentId
- Actualiza `receivedAgentsRef` (sincrono) y `setReceivedAgents` (estado React)
- Llama `onAgentOutput`
- Resetea `perAgentTimeoutRef`
- Log: `[n8n-Realtime] PROCESSED agent=X id=Y status=Z`

### 5. Suscripcion Realtime mejorada
- Handler de estado con switch para: `SUBSCRIBED`, `CHANNEL_ERROR`, `TIMED_OUT`, `CLOSED`
- En `CHANNEL_ERROR` y `CLOSED`: llama `attemptReconnect()` si intentos < 3
- Log detallado: `[n8n-Realtime] Subscription status: X`

### 6. Reconexion automatica
Funcion `attemptReconnect(projectId)`:
- Incrementa `reconnectAttemptsRef`
- Espera `RECONNECT_BACKOFF_MS * 2^(attempt-1)` ms
- Reintenta suscripcion
- Log: `[n8n-Realtime] Reconnect attempt X/3 after Yms`
- Si falla 3 veces: `setConnectionStatus('fallback')`, log error final

### 7. Flujo de timeouts (no-bloqueante)

```text
t=0s   ─── startOrchestration() ───────────────────────────
       │
       ├─ Suscripcion Realtime
       ├─ fetchExistingOutputs()
       ├─ POST webhook n8n
       │
t=60s  ─── fallbackUITimeoutRef dispara ──────────────────
       │   onFallback() se llama (UI muestra datos simulados)
       │   connectionStatus → 'fallback'
       │   PERO la suscripcion Realtime SIGUE ACTIVA
       │   Si llega output real despues → onAgentOutput() se llama
       │
t=180s ─── globalTimeoutRef dispara ──────────────────────
       │   cleanup() completo
       │   Log: [n8n-Realtime] Global timeout - closing connection
```

### 8. Todos los logs con prefijo `[n8n-Realtime]`
Renombrar todos los `[n8n]` existentes a `[n8n-Realtime]`. Cada log incluye timestamp relativo y contexto:
- `[n8n-Realtime] SUBSCRIBE status=SUBSCRIBED channel=agent_outputs_UUID`
- `[n8n-Realtime] INSERT agent=PICOT Builder id=42 status=success`
- `[n8n-Realtime] FETCH found 3 existing outputs`
- `[n8n-Realtime] FALLBACK triggered after 60s - UI switching to demo`
- `[n8n-Realtime] RECONNECT attempt 2/3 backoff=4000ms`

### 9. Cleanup mejorado
- Remueve canal Realtime
- Limpia TODOS los timeouts (fallbackUI, global, perAgent)
- Resetea `processedIdsRef`, `receivedAgentsRef`, `reconnectAttemptsRef`
- Resetea estado React

### 10. Interfaz publica -- SIN CAMBIOS
El return del hook es identico al actual:
```text
startOrchestration, fetchExistingOutputs, projectId,
connectionStatus, setConnectionStatus, isLoading, cleanup,
isPhase1Complete, getReceivedAgentsCount, receivedAgents,
AGENT_NAME_TO_ID
```
No se requieren cambios en `ClinicalNavigator.tsx`.

## Seccion tecnica -- Pseudocodigo del flujo principal

```text
startOrchestration(title, question):
  cleanup()
  projectId = UUID
  reconnectAttemptsRef = 0
  processedIdsRef.clear()

  subscribe(projectId):
    channel.on('INSERT', payload => processRecord(payload.new))
    channel.subscribe(status => {
      switch(status):
        SUBSCRIBED: resolve, setConnected
        CHANNEL_ERROR: attemptReconnect(projectId)
        TIMED_OUT: reject
        CLOSED: attemptReconnect(projectId)
    })

  await subscribe
  await fetchExistingOutputs(projectId)  // usa processRecord internamente
  await POST webhook

  fallbackUITimeoutRef = setTimeout(onFallback, 60000)
  globalTimeoutRef = setTimeout(cleanup, 180000)
```

