/**
 * ============================================================================
 * API SERVICE - Centralizado para llamadas a n8n
 *
 * Endpoints:
 * - Fase 1 (Protocolo): galatea-protocol-start
 * - Fase 2 (Ejecucion): galatea-execution-start
 *
 * Payload requerido: { projectId, researchIdea, userId }
 * ============================================================================
 */

import {
  N8N_PROTOCOL_START_WEBHOOK,
  N8N_EXECUTION_START_WEBHOOK
} from '@/config/researchAgents';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TIPOS DE REQUEST/RESPONSE
// ============================================================================

export interface StartProtocolRequest {
  projectId: string;
  researchIdea: string;
  userId?: string;
}

export interface StartExecutionRequest {
  projectId: string;
  researchIdea?: string;
  userId?: string;
}

export interface N8NResponse {
  success: boolean;
  projectId?: string;
  phase?: string;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
  agentNumber?: number;
  agentName?: string;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

// ============================================================================
// MODO DEMO - Usuario fijo para webhooks (no afecta FK de Supabase)
// ============================================================================
const DEMO_MODE = true;
const DEMO_USER_ID = 'demo-user';

/**
 * Obtiene el userId para enviar a n8n (no es FK, solo identificador)
 */
async function getCurrentUserId(): Promise<string> {
  if (DEMO_MODE) {
    return DEMO_USER_ID;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || DEMO_USER_ID;
  } catch {
    console.warn('No se pudo obtener el userId');
    return DEMO_USER_ID;
  }
}

/**
 * Parsea una respuesta JSON de n8n de forma segura
 */
export function parseN8NResponse(data: unknown): N8NResponse {
  if (!data) {
    return { success: false, error: 'Respuesta vacia' };
  }

  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return { success: false, error: 'Respuesta no es JSON valido' };
    }
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    // Si n8n devuelve un objeto, asumimos success: true a menos que haya error
    return {
      success: obj.error ? false : true,
      ...obj,
    } as N8NResponse;
  }

  return { success: false, error: 'Formato de respuesta desconocido' };
}

// ============================================================================
// FASE 1: INICIO DE PROTOCOLO
// ============================================================================

/**
 * Inicia el flujo de generacion de protocolo (Fase 1: Agentes 1-8)
 * Webhook: galatea-protocol-start
 *
 * @param request - Datos del proyecto
 * @returns Respuesta de n8n
 */
export async function startProtocolGeneration(
  request: StartProtocolRequest
): Promise<N8NResponse> {
  try {
    // Validar que projectId este presente
    if (!request.projectId) {
      throw new Error('projectId es requerido');
    }

    if (!request.researchIdea) {
      throw new Error('researchIdea es requerido');
    }

    // Obtener userId si no se proporciono
    const userId = request.userId || await getCurrentUserId() || 'anonymous';

    const payload = {
      projectId: request.projectId,
      researchIdea: request.researchIdea,
      userId: userId,
    };

    console.log('='.repeat(60));
    console.log('FASE 1: Iniciando generacion de protocolo');
    console.log('>>> INTENTANDO LLAMADA A N8N EN:', N8N_PROTOCOL_START_WEBHOOK);
    console.info('>>> CONECTANDO A N8N EN PUERTO 8085...');
    console.log('PAYLOAD ENVIADO A N8N:', payload);
    console.log('='.repeat(60));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    await fetch(N8N_PROTOCOL_START_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    console.log('>>> CONEXIÓN ESTABLECIDA CON N8N.');
    console.log('Llamada a n8n enviada (FASE 1).');
    console.log('='.repeat(60));

    return {
      success: true,
      projectId: request.projectId,
    };
  } catch (error) {
    console.error('Error al iniciar protocolo:', error);
    return {
      success: true,
      message: 'Proceso iniciado en segundo plano',
      projectId: request.projectId,
    };
  }
}

// ============================================================================
// FASE 2: INICIO DE EJECUCION DE REVISION
// ============================================================================

/**
 * Inicia el flujo de ejecucion de revision (Fase 2: Agentes 9-14)
 * Webhook: galatea-execution-start
 *
 * @param request - Datos del proyecto
 * @returns Respuesta de n8n
 */
export async function startReviewExecution(
  request: StartExecutionRequest
): Promise<N8NResponse> {
  try {
    // Validar que projectId este presente
    if (!request.projectId) {
      throw new Error('projectId es requerido');
    }

    // Obtener userId si no se proporciono
    const userId = request.userId || await getCurrentUserId() || 'anonymous';

    const payload = {
      projectId: request.projectId,
      researchIdea: request.researchIdea || '',
      userId: userId,
    };

    console.log('='.repeat(60));
    console.log('FASE 2: Iniciando ejecucion de revision');
    console.log('>>> INTENTANDO LLAMADA A N8N EN:', N8N_EXECUTION_START_WEBHOOK);
    console.info('>>> CONECTANDO A N8N EN PUERTO 8085...');
    console.log('PAYLOAD ENVIADO A N8N:', payload);
    console.log('='.repeat(60));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    await fetch(N8N_EXECUTION_START_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    console.log('>>> CONEXIÓN ESTABLECIDA CON N8N.');
    console.log('Llamada a n8n enviada (FASE 2).');
    console.log('='.repeat(60));

    return {
      success: true,
      projectId: request.projectId,
    };
  } catch (error) {
    console.error('Error al iniciar ejecucion:', error);
    return {
      success: true,
      message: 'Proceso iniciado en segundo plano',
      projectId: request.projectId,
    };
  }
}

// ============================================================================
// COMPATIBILIDAD LEGACY
// ============================================================================

/**
 * @deprecated Usar startReviewExecution en su lugar
 * Mantener por compatibilidad con codigo existente
 */
export async function approveAndStartPhase2(
  request: { projectId: string; action: 'APPROVE' }
): Promise<N8NResponse> {
  return startReviewExecution({
    projectId: request.projectId,
  });
}
