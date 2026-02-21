/**
 * useN8nOrchestration.ts - Sistema Nervioso Resistente (Grado Industrial)
 *
 * Hook para orquestar la comunicacion con n8n via Supabase Realtime.
 *
 * Caracteristicas:
 * - Deduplicacion de eventos con processedIdsRef
 * - Reconexion automatica (3 intentos con backoff exponencial)
 * - Fallback no-bloqueante a los 60 segundos
 * - Logs de diagnostico con prefijo [n8n-Realtime]
 * - Identidad de proyecto con UUID
 *
 * v2.0: Siempre usa N8N_RESEARCH_LAB_V2_WEBHOOK (eliminado legacy phase 1/2)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { N8N_RESEARCH_LAB_V2_WEBHOOK } from '@/config/researchLabAgents';
import type { AgentExecutionStatus } from '@/types/domain';
import type { ResearchLabPhaseNumber } from '@/config/researchLabAgents';

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentOutput {
  id: string;
  project_id: string;
  agent_number: number;
  agent_name: string;
  status: AgentExecutionStatus;
  output_markdown: string | null;
  output_result: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface OrchestrationConfig {
  projectId?: string;
  onAgentUpdate?: (output: AgentOutput) => void;
  onAgentOutput?: (agentName: string, output: string, status: string) => void;
  onError?: (error: Error) => void;
  onFallback?: () => void;
  onConnectionChange?: (connected: boolean) => void;
  fallbackTimeoutMs?: number;
  maxReconnectAttempts?: number;
}

export interface OrchestrationState {
  isConnected: boolean;
  isLoading: boolean;
  currentAgent: number | null;
  agentOutputs: Map<number, AgentOutput>;
  error: string | null;
  reconnectAttempt: number;
  fallbackTriggered: boolean;
}

export interface UseN8nOrchestrationReturn {
  // Estado
  isConnected: boolean;
  isLoading: boolean;
  currentAgent: number | null;
  agentOutputs: AgentOutput[];
  error: string | null;
  projectId: string;
  fallbackTriggered: boolean;
  connectionStatus: ConnectionStatus;

  // Acciones
  startOrchestration: (
    inputData: Record<string, unknown> | string,
    options?: { faseActual?: ResearchLabPhaseNumber; projectIdOverride?: string } | string
  ) => Promise<any>;
  stopOrchestration: () => void;
  reconnect: () => void;
  getAgentOutput: (agentNumber: number) => AgentOutput | undefined;
  setConnectionStatus: (status: ConnectionStatus) => void;
  cleanup: () => void;
  getReceivedAgentsCount: () => number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const LOG_PREFIX = '[n8n-Realtime]';
const DEFAULT_FALLBACK_TIMEOUT_MS = 60000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 3;
const BASE_RECONNECT_DELAY_MS = 1000;

// Agent name → ID mapping used by ClinicalNavigator
export const AGENT_NAME_TO_ID: Record<string, number> = {
  'PICOT Builder': 1,
  'MeSH Strategist': 2,
  'Literature Scout': 3,
  'FINER Validator': 4,
  'Study Designer': 5,
  'Objectives Generator': 6,
  'Criteria Definer': 7,
  'Protocol Synthesizer': 8,
  'PRISMA Navigator': 9,
  'Data Extractor': 10,
  'Quality Auditor': 11,
  'Meta-Analyst': 12,
  'Evidence Grader': 13,
  'Report Generator': 14,
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'processing' | 'fallback' | 'error';

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genera un UUID v4 compatible con RFC 4122
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antiguos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Calcula el delay con backoff exponencial
 */
function calculateBackoffDelay(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30 segundos
}

/**
 * Logger con prefijo estandarizado
 */
const logger = {
  subscribe: (message: string, data?: unknown) => {
    console.log(`${LOG_PREFIX} [subscribe] ${message}`, data ?? '');
  },
  insert: (message: string, data?: unknown) => {
    console.log(`${LOG_PREFIX} [insert] ${message}`, data ?? '');
  },
  error: (message: string, error?: unknown) => {
    console.error(`${LOG_PREFIX} [error] ${message}`, error ?? '');
  },
  cleanup: (message: string, data?: unknown) => {
    console.log(`${LOG_PREFIX} [cleanup] ${message}`, data ?? '');
  },
  reconnect: (message: string, data?: unknown) => {
    console.log(`${LOG_PREFIX} [reconnect] ${message}`, data ?? '');
  },
  fallback: (message: string, data?: unknown) => {
    console.warn(`${LOG_PREFIX} [fallback] ${message}`, data ?? '');
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function useN8nOrchestration(config: OrchestrationConfig): UseN8nOrchestrationReturn {
  const {
    projectId: externalProjectId,
    onAgentUpdate,
    onError,
    onFallback,
    onConnectionChange,
    fallbackTimeoutMs = DEFAULT_FALLBACK_TIMEOUT_MS,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  } = config;

  // ═══════════════════════════════════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════════════════════════════════

  const [state, setState] = useState<OrchestrationState>({
    isConnected: false,
    isLoading: false,
    currentAgent: null,
    agentOutputs: new Map(),
    error: null,
    reconnectAttempt: 0,
    fallbackTriggered: false,
  });
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // ═══════════════════════════════════════════════════════════════════════
  // REFS (Persistentes entre renders)
  // ═══════════════════════════════════════════════════════════════════════

  const processedIdsRef = useRef<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const projectIdRef = useRef<string>(externalProjectId || '');

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED PROJECT ID
  // ═══════════════════════════════════════════════════════════════════════

  const projectId = useMemo(() => {
    if (externalProjectId) {
      projectIdRef.current = externalProjectId;
      return externalProjectId;
    }
    return projectIdRef.current;
  }, [externalProjectId]);

  // ═══════════════════════════════════════════════════════════════════════
  // CLEANUP DE RECURSOS
  // ═══════════════════════════════════════════════════════════════════════

  const cleanupResources = useCallback(() => {
    logger.cleanup('Limpiando recursos...');

    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
      logger.cleanup('Timeout de fallback cancelado');
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
      logger.cleanup('Timeout de reconexion cancelado');
    }

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      logger.cleanup('Canal de Supabase removido');
    }

    processedIdsRef.current.clear();
    logger.cleanup('Set de IDs procesados limpiado');
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // MANEJO DE EVENTOS REALTIME
  // ═══════════════════════════════════════════════════════════════════════

  const handleRealtimeInsert = useCallback((
    payload: RealtimePostgresInsertPayload<AgentOutput>
  ) => {
    const record = payload.new as AgentOutput;

    if (processedIdsRef.current.has(record.id)) {
      logger.insert(`ID ${record.id} ya procesado, ignorando duplicado`);
      return;
    }

    processedIdsRef.current.add(record.id);
    logger.insert(`Nuevo output recibido para agente ${record.agent_number}`, {
      id: record.id,
      agent_name: record.agent_name,
      status: record.status,
    });

    if (isMountedRef.current) {
      setState(prev => {
        const newOutputs = new Map(prev.agentOutputs);
        newOutputs.set(record.agent_number, record);

        return {
          ...prev,
          agentOutputs: newOutputs,
          currentAgent: record.agent_number,
          isLoading: record.status === 'in_progress',
          error: record.status === 'failed' ? record.error_message : prev.error,
        };
      });
    }

    onAgentUpdate?.(record);

    if (record.status === 'completed') {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
        logger.insert('Fallback timeout cancelado - agente completado exitosamente');
      }
    }
  }, [onAgentUpdate]);

  // ═══════════════════════════════════════════════════════════════════════
  // SUSCRIPCION A REALTIME
  // ═══════════════════════════════════════════════════════════════════════

  const subscribeToRealtime = useCallback(async () => {
    if (!projectId) {
      logger.error('No se puede suscribir sin projectId');
      return;
    }

    logger.subscribe(`Iniciando suscripcion para proyecto ${projectId}`);

    try {
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channelName = `agent_executions:${projectId}`;
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_executions',
            filter: `project_id=eq.${projectId}`,
          },
          handleRealtimeInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'agent_executions',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            handleRealtimeInsert(payload as unknown as RealtimePostgresInsertPayload<AgentOutput>);
          }
        );

      channel.subscribe((status) => {
        logger.subscribe(`Estado de suscripcion: ${status}`);

        if (status === 'SUBSCRIBED') {
          if (isMountedRef.current) {
            setState(prev => ({
              ...prev,
              isConnected: true,
              reconnectAttempt: 0,
            }));
            onConnectionChange?.(true);
          }
          logger.subscribe('Suscripcion exitosa');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          if (isMountedRef.current) {
            setState(prev => ({ ...prev, isConnected: false }));
            onConnectionChange?.(false);
          }

          attemptReconnect();
        }
      });

      channelRef.current = channel;

      await fetchExistingOutputs();

    } catch (error) {
      logger.error('Error al suscribir a Realtime', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
      attemptReconnect();
    }
  }, [projectId, handleRealtimeInsert, onConnectionChange, onError]);

  // ═══════════════════════════════════════════════════════════════════════
  // FETCH INICIAL DE OUTPUTS EXISTENTES
  // ═══════════════════════════════════════════════════════════════════════

  const fetchExistingOutputs = useCallback(async () => {
    if (!projectId) return;

    logger.subscribe(`Fetching outputs existentes para proyecto ${projectId}`);

    try {
      const { data, error } = await (supabase as any)
        .from('agent_executions')
        .select('*')
        .eq('project_id', projectId)
        .order('agent_number', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        logger.subscribe(`Encontrados ${data.length} outputs existentes`);

        const outputsMap = new Map<number, AgentOutput>();

        for (const record of data) {
          processedIdsRef.current.add(record.id);
          outputsMap.set(record.agent_number, record as unknown as AgentOutput);
        }

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            agentOutputs: outputsMap,
            currentAgent: (data[data.length - 1] as any).agent_number,
          }));
        }
      }
    } catch (error) {
      logger.error('Error al fetch outputs existentes', error);
    }
  }, [projectId]);

  // ═══════════════════════════════════════════════════════════════════════
  // RECONEXION CON BACKOFF EXPONENCIAL
  // ═══════════════════════════════════════════════════════════════════════

  const attemptReconnect = useCallback(() => {
    setState(prev => {
      if (prev.reconnectAttempt >= maxReconnectAttempts) {
        logger.reconnect(`Maximo de intentos alcanzado (${maxReconnectAttempts})`);
        onError?.(new Error(`Reconexion fallida despues de ${maxReconnectAttempts} intentos`));
        return prev;
      }

      const nextAttempt = prev.reconnectAttempt + 1;
      const delay = calculateBackoffDelay(nextAttempt, BASE_RECONNECT_DELAY_MS);

      logger.reconnect(`Intento ${nextAttempt}/${maxReconnectAttempts} en ${delay}ms`);

      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          subscribeToRealtime();
        }
      }, delay);

      return {
        ...prev,
        reconnectAttempt: nextAttempt,
        isConnected: false,
      };
    });
  }, [maxReconnectAttempts, subscribeToRealtime, onError]);

  // ═══════════════════════════════════════════════════════════════════════
  // RECONEXION MANUAL
  // ═══════════════════════════════════════════════════════════════════════

  const reconnect = useCallback(() => {
    logger.reconnect('Reconexion manual iniciada');
    setState(prev => ({ ...prev, reconnectAttempt: 0 }));
    cleanupResources();
    subscribeToRealtime();
  }, [cleanupResources, subscribeToRealtime]);

  // ═══════════════════════════════════════════════════════════════════════
  // FALLBACK NO-BLOQUEANTE
  // ═══════════════════════════════════════════════════════════════════════

  const setupFallbackTimeout = useCallback(() => {
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
    }

    logger.fallback(`Configurando fallback timeout: ${fallbackTimeoutMs}ms`);

    fallbackTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      logger.fallback('Timeout alcanzado - ejecutando fallback');

      setState(prev => ({
        ...prev,
        fallbackTriggered: true,
      }));

      onFallback?.();

      logger.fallback('Fallback ejecutado - suscripcion sigue activa');

    }, fallbackTimeoutMs);
  }, [fallbackTimeoutMs, onFallback]);

  // ═══════════════════════════════════════════════════════════════════════
  // INICIAR ORQUESTACION
  // ═══════════════════════════════════════════════════════════════════════

  const startOrchestration = useCallback(async (
    inputData: Record<string, unknown>,
    options?: { faseActual?: ResearchLabPhaseNumber; projectIdOverride?: string }
  ) => {
    const effectiveProjectId = options?.projectIdOverride || projectId;
    if (options?.projectIdOverride) {
      projectIdRef.current = options.projectIdOverride;
    }

    if (!effectiveProjectId) {
      const msg = 'No se puede iniciar orquestacion sin un projectId valido. Crea el proyecto en Supabase primero.';
      logger.error(msg);
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false, error: msg }));
      }
      onError?.(new Error(msg));
      return;
    }

    const faseActual = options?.faseActual ?? 0;

    logger.subscribe(`Iniciando Research Lab v2 fase ${faseActual} con projectId: ${effectiveProjectId}`);

    // Resetear estado
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      fallbackTriggered: false,
      agentOutputs: new Map(),
    }));

    processedIdsRef.current.clear();

    try {
      await subscribeToRealtime();
      setupFallbackTimeout();

      const cleanProjectId = effectiveProjectId.toString().trim();
      const payload = {
        projectId: cleanProjectId,
        fase_actual: faseActual,
        action: 'START_RESEARCH_LAB',
        inputData,
        timestamp: new Date().toISOString(),
        sessionId: `research_lab_${cleanProjectId}_${Date.now()}`,
      };

      logger.subscribe(`Enviando payload a n8n: ${N8N_RESEARCH_LAB_V2_WEBHOOK}`, payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        await fetch(N8N_RESEARCH_LAB_V2_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        logger.subscribe('Senal enviada a n8n - escuchando Realtime');
      } catch (error) {
        clearTimeout(timeoutId);
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
          logger.error('Error de red al enviar señal a n8n. Verificar conectividad.', error);
          if (isMountedRef.current) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error: 'Error de red al comunicarse con n8n. Por favor, revisa tu conexión a internet.',
            }));
          }
          onError?.(error instanceof Error ? error : new Error(errorMessage));
        } else {
          logger.error('Error inesperado al enviar señal a n8n.', error);
          logger.subscribe('Señal pudo haber sido enviada a n8n a pesar del error. Escuchando Realtime.');
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error al iniciar orquestacion', error);

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [projectId, subscribeToRealtime, setupFallbackTimeout, onError]);

  // ═══════════════════════════════════════════════════════════════════════
  // DETENER ORQUESTACION
  // ═══════════════════════════════════════════════════════════════════════

  const stopOrchestration = useCallback(() => {
    logger.cleanup('Deteniendo orquestacion');

    cleanupResources();

    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isConnected: false,
      }));
    }
  }, [cleanupResources]);

  // ═══════════════════════════════════════════════════════════════════════
  // OBTENER OUTPUT DE AGENTE ESPECIFICO
  // ═══════════════════════════════════════════════════════════════════════

  const getAgentOutput = useCallback((agentNumber: number): AgentOutput | undefined => {
    return state.agentOutputs.get(agentNumber);
  }, [state.agentOutputs]);

  // ═══════════════════════════════════════════════════════════════════════
  // EFECTOS
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cleanupResources();
      logger.cleanup('Componente desmontado');
    };
  }, [cleanupResources]);

  useEffect(() => {
    logger.subscribe(`ProjectId activo: ${projectId}`);
  }, [projectId]);

  // ═══════════════════════════════════════════════════════════════════════
  // RETORNO DEL HOOK
  // ═══════════════════════════════════════════════════════════════════════

  

  const cleanup = useCallback(() => {
    cleanupResources();
  }, [cleanupResources]);

  const getReceivedAgentsCount = useCallback(() => {
    return state.agentOutputs.size;
  }, [state.agentOutputs]);

  return {
    // Estado
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    currentAgent: state.currentAgent,
    agentOutputs: Array.from(state.agentOutputs.values()),
    error: state.error,
    projectId,
    fallbackTriggered: state.fallbackTriggered,
    connectionStatus,

    // Acciones
    startOrchestration,
    stopOrchestration,
    reconnect,
    getAgentOutput,
    setConnectionStatus,
    cleanup,
    getReceivedAgentsCount,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS ADICIONALES PARA COMPATIBILIDAD
// ═══════════════════════════════════════════════════════════════════════════

export { generateUUID, logger as n8nLogger };

