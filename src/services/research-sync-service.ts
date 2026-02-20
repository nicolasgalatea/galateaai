/**
 * ============================================================================
 * RESEARCH SYNC SERVICE — Galatea AIOps v2.0
 *
 * API unificada para sincronizar los agentes de n8n con la UI de Lovable.
 * Fusiona el patron "Doble Cast" con el orquestador de Deep Merge.
 *
 * Exporta dos APIs:
 *   1. researchSyncService   → Objeto con metodos directos para n8n/UI
 *   2. Funciones individuales → syncPhaseUpdate, saveUserEdits, etc.
 *
 * Tabla: research_projects
 *   Columnas semanticas: research_question, finer_results, search_strategy,
 *                        protocol_draft, manuscript_draft, statistical_plan
 * ============================================================================
 */

import { supabase } from '@/integrations/supabase/client';
import {
  orchestrateGalateaData,
  getPhaseKey,
  validatePreviousPhasesComplete,
  OrchestratorError,
  PHASE_KEYS,
  type PhaseKey,
  type PhasePayload,
  type OrchestratorInput,
  type OrchestratorOutput,
} from './galatea-orchestrator';
import type { ResearchProject } from '@/types/domain';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TIPOS
// ============================================================================

export interface SyncPhaseUpdateParams {
  projectId: string;
  currentPhase: number;
  /** Output nuevo del agente de IA (n8n). Se inyecta en la PhaseKey correspondiente. */
  aiOutput: PhasePayload;
  /** Ediciones del investigador. Si no se proporcionan, se intenta leer de Supabase. */
  userEdits?: Partial<Record<PhaseKey, PhasePayload | null>>;
}

export interface SyncResult {
  success: boolean;
  output: OrchestratorOutput | null;
  error: string | null;
  mergeSummary: MergeSummary | null;
}

interface MergeSummary {
  projectId: string;
  phase: number;
  phaseKey: PhaseKey;
  mergeSource: 'ai_only' | 'user_override' | 'merged';
  isUserValidated: boolean;
  timestamp: string;
}

// Doble Cast — resuelve TS2307/TS2352 para tablas no autogeneradas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

// ============================================================================
// LOGGING
// ============================================================================

const LOG_PREFIX = '[ResearchSync]';

function logStep(step: string, data?: Record<string, unknown>): void {
  console.log(
    `${LOG_PREFIX} ${step}`,
    data ? JSON.stringify(data, null, 2) : '',
    `(${new Date().toISOString()})`,
  );
}

function logMergeSummary(summary: MergeSummary): void {
  const tags: Record<string, string> = {
    merged: '[MERGE]',
    user_override: '[USER]',
    ai_only: '[AI]',
  };
  console.log(
    [
      `${LOG_PREFIX} ===================================================`,
      `${LOG_PREFIX} ${tags[summary.mergeSource] ?? '[?]'} SYNC COMPLETADO`,
      `${LOG_PREFIX}   Proyecto:       ${summary.projectId}`,
      `${LOG_PREFIX}   Fase:           ${summary.phase} -> ${summary.phaseKey}`,
      `${LOG_PREFIX}   Merge Source:    ${summary.mergeSource}`,
      `${LOG_PREFIX}   User Validated:  ${summary.isUserValidated}`,
      `${LOG_PREFIX}   Timestamp:       ${summary.timestamp}`,
      `${LOG_PREFIX} ===================================================`,
    ].join('\n'),
  );
}

// ============================================================================
// SUPABASE HELPERS (Doble Cast)
// ============================================================================

async function fetchCurrentProgress(
  projectId: string,
): Promise<ResearchProject | null> {
  logStep('FETCH', { projectId });

  const { data, error } = await (supabase
    .from('research_projects' as AnyQuery)
    .select('*')
    .eq('id', projectId)
    .maybeSingle() as unknown as Promise<{
      data: unknown;
      error: { message: string } | null;
    }>);

  if (error) {
    throw new SyncError(
      'FETCH_FAILED',
      `Error al leer research_projects para ${projectId}: ${error.message}`,
    );
  }

  if (!data) {
    logStep('FETCH — No existe registro previo, se creara uno nuevo');
    return null;
  }

  return data as ResearchProject;
}

function buildOrchestratorInput(
  existing: ResearchProject | null,
  params: SyncPhaseUpdateParams,
): OrchestratorInput {
  const phaseKey = getPhaseKey(params.currentPhase);

  // Reconstruir phase_data desde las columnas semanticas en Supabase
  const phase_data: Partial<Record<PhaseKey, PhasePayload | null>> = {};
  if (existing) {
    for (const key of PHASE_KEYS) {
      const val = (existing as unknown as Record<string, unknown>)[key];
      if (val && typeof val === 'object') {
        phase_data[key] = val as PhasePayload;
      }
    }
  }

  // Inyectar el nuevo output de IA en la fase correspondiente
  phase_data[phaseKey] = {
    ...(phase_data[phaseKey] ?? {}),
    ...params.aiOutput,
  };

  // user_edits: usar las proporcionadas o intentar extraer de Supabase
  let user_edits: Partial<Record<PhaseKey, PhasePayload | null>> = {};
  if (params.userEdits) {
    user_edits = params.userEdits;
  } else if (existing) {
    const raw = (existing as unknown as Record<string, unknown>).user_edits_json;
    if (raw && typeof raw === 'object') {
      user_edits = raw as Partial<Record<PhaseKey, PhasePayload | null>>;
    }
  }

  logStep('BUILD', {
    phaseKey,
    hasExistingData: !!existing,
    aiOutputFields: Object.keys(params.aiOutput),
    userEditKeys: Object.keys(user_edits),
  });

  return {
    project_id: params.projectId,
    current_phase: params.currentPhase,
    phase_data,
    user_edits,
  };
}

async function persistOrchestrated(
  projectId: string,
  output: OrchestratorOutput,
  existing: ResearchProject | null,
): Promise<void> {
  const updatePayload: Record<string, unknown> = {
    current_phase: output.fase_actual,
    updated_at: new Date().toISOString(),
  };

  for (const key of PHASE_KEYS) {
    const phaseData = output.phases[key];
    if (phaseData) {
      const { _last_sync, _is_user_validated, _merge_source, ...cleanData } = phaseData;
      updatePayload[key] = Object.keys(cleanData).length > 0 ? cleanData : null;
    } else {
      const existingVal = existing
        ? (existing as unknown as Record<string, unknown>)[key]
        : null;
      if (!existingVal) {
        updatePayload[key] = null;
      }
    }
  }

  logStep('UPDATE', { projectId, columnsUpdated: Object.keys(updatePayload) });

  if (existing) {
    const { error } = await (supabase
      .from('research_projects' as AnyQuery)
      .update(updatePayload)
      .eq('id', projectId) as unknown as Promise<{
        error: { message: string } | null;
      }>);

    if (error) {
      throw new SyncError('UPDATE_FAILED', `Error al actualizar: ${error.message}`);
    }
  } else {
    // Proyecto nuevo: inicializar user_edits_json como {} vacio
    const { error } = await (supabase
      .from('research_projects' as AnyQuery)
      .insert({
        id: projectId,
        user_id: 'system',
        user_edits_json: {},
        ...updatePayload,
      }) as unknown as Promise<{
        error: { message: string } | null;
      }>);

    if (error) {
      throw new SyncError('INSERT_FAILED', `Error al insertar: ${error.message}`);
    }
  }
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Sincroniza una actualizacion de fase: Fetch → Orchestrate → Update.
 * Si el FETCH falla, la actualizacion NO procede.
 */
export async function syncPhaseUpdate(params: SyncPhaseUpdateParams): Promise<SyncResult> {
  const { projectId, currentPhase } = params;
  logStep('=== INICIO syncPhaseUpdate ===', { projectId, currentPhase });

  try {
    const existing = await fetchCurrentProgress(projectId);
    const orchestratorInput = buildOrchestratorInput(existing, params);
    const output = orchestrateGalateaData(orchestratorInput);

    const phaseKey = getPhaseKey(currentPhase);
    const currentPhaseData = output.phases[phaseKey];
    const mergeSummary: MergeSummary = {
      projectId,
      phase: currentPhase,
      phaseKey,
      mergeSource: (currentPhaseData?._merge_source ?? 'ai_only') as MergeSummary['mergeSource'],
      isUserValidated: !!currentPhaseData?._is_user_validated,
      timestamp: output._generated_at,
    };

    logMergeSummary(mergeSummary);
    await persistOrchestrated(projectId, output, existing);
    logStep('=== FIN syncPhaseUpdate — SUCCESS ===');

    return { success: true, output, error: null, mergeSummary };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    const code = err instanceof SyncError ? err.code
      : err instanceof OrchestratorError ? err.code : 'UNKNOWN';
    console.error(`${LOG_PREFIX} ERROR [${code}]: ${message}`);
    return { success: false, output: null, error: `[${code}] ${message}`, mergeSummary: null };
  }
}

/**
 * Guarda ediciones del usuario para una fase usando jsonb_set atomico.
 *
 * Estrategia:
 *   1. Intentar RPC `set_research_project_user_edits` (atomico, usa jsonb_set en PL/pgSQL).
 *      Solo toca la clave de la fase activa — las demas fases quedan intactas.
 *   2. Si el RPC no existe (migracion no aplicada), fallback a read-merge-write
 *      con el spread manual (backwards compatible).
 */
export async function saveUserEdits(
  projectId: string,
  phaseNumber: number,
  edits: PhasePayload,
): Promise<{ success: boolean; error: string | null }> {
  const phaseKey = getPhaseKey(phaseNumber);
  logStep('SAVE_USER_EDITS', { projectId, phaseKey, fields: Object.keys(edits) });

  try {
    // ── Estrategia 1: RPC atomico con jsonb_set ──
    const rpcResult = await saveUserEditsViaRPC(projectId, phaseKey, edits);
    if (rpcResult.success) {
      logStep('SAVE_USER_EDITS — SUCCESS (RPC atomico)', { phaseKey });
      return rpcResult;
    }

    // Si el RPC fallo por no existir la funcion, usar fallback
    logStep('SAVE_USER_EDITS — RPC no disponible, usando fallback read-merge-write');

    // ── Estrategia 2: Fallback read-merge-write ──
    return await saveUserEditsViaReadMergeWrite(projectId, phaseKey, edits);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`${LOG_PREFIX} SAVE_USER_EDITS ERROR: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * RPC atomico: llama a set_research_project_user_edits en Supabase.
 * Solo modifica la clave de la fase activa dentro de user_edits_json.
 */
async function saveUserEditsViaRPC(
  projectId: string,
  phaseKey: PhaseKey,
  edits: PhasePayload,
): Promise<{ success: boolean; error: string | null }> {
  const rpcCall = (supabase as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{
      data: unknown;
      error: { message: string; code?: string } | null;
    }>;
  }).rpc('set_research_project_user_edits', {
    p_project_id: projectId,
    p_phase_key: phaseKey,
    p_edits: edits,
  });
  const { data, error } = await rpcCall;

  if (error) {
    // 42883 = function does not exist (migracion no aplicada)
    if (error.code === '42883' || error.message.includes('does not exist')) {
      return { success: false, error: 'RPC_NOT_FOUND' };
    }
    return { success: false, error: error.message };
  }

  logStep('RPC set_research_project_user_edits — resultado', {
    phaseKey,
    resultKeys: data && typeof data === 'object' ? Object.keys(data as Record<string, unknown>) : [],
  });

  return { success: true, error: null };
}

/**
 * Fallback: lee user_edits_json completo, hace merge en JS, escribe de vuelta.
 * Menos atomico que el RPC pero compatible sin migracion.
 */
async function saveUserEditsViaReadMergeWrite(
  projectId: string,
  phaseKey: PhaseKey,
  edits: PhasePayload,
): Promise<{ success: boolean; error: string | null }> {
  // 1. Leer registro actual
  const { data, error: fetchError } = await (supabase
    .from('research_projects' as AnyQuery)
    .select('user_edits_json')
    .eq('id', projectId)
    .maybeSingle() as unknown as Promise<{
      data: unknown;
      error: { message: string } | null;
    }>);

  if (fetchError) throw new SyncError('FETCH_EDITS_FAILED', fetchError.message);

  // 2. Si no existe registro, crear uno con user_edits_json inicializado
  if (!data) {
    const initialEdits = { [phaseKey]: { ...edits, _processed: false } };
    const { error: insertError } = await (supabase
      .from('research_projects' as AnyQuery)
      .upsert(
        {
          id: projectId,
          user_id: 'system',
          current_phase: 0,
          user_edits_json: initialEdits,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      ) as unknown as Promise<{
        error: { message: string } | null;
      }>);

    if (insertError) throw new SyncError('UPSERT_EDITS_FAILED', insertError.message);

    logStep('SAVE_USER_EDITS — SUCCESS (upsert nuevo registro)', { phaseKey });
    return { success: true, error: null };
  }

  // 3. Merge solo la fase activa, preservar las demas
  const row = data as Record<string, unknown>;
  const existingEdits = (row.user_edits_json ?? {}) as
    Partial<Record<PhaseKey, PhasePayload | null>>;

  const updatedEdits = {
    ...existingEdits,
    [phaseKey]: {
      ...(existingEdits[phaseKey] ?? {}),
      ...edits,
      _processed: false,
    },
  };

  // 4. Escribir de vuelta
  const { error: updateError } = await (supabase
    .from('research_projects' as AnyQuery)
    .update({ user_edits_json: updatedEdits, updated_at: new Date().toISOString() })
    .eq('id', projectId) as unknown as Promise<{
      error: { message: string } | null;
    }>);

  if (updateError) throw new SyncError('SAVE_EDITS_FAILED', updateError.message);

  logStep('SAVE_USER_EDITS — SUCCESS (read-merge-write)', { phaseKey });
  return { success: true, error: null };
}

/**
 * Preview dry-run: retorna el merge sin tocar Supabase.
 */
export async function previewMergedPhase(
  projectId: string,
  currentPhase: number,
  aiOutput: PhasePayload,
  userEdits?: Partial<Record<PhaseKey, PhasePayload | null>>,
): Promise<SyncResult> {
  logStep('PREVIEW (dry-run)', { projectId, currentPhase });
  try {
    const existing = await fetchCurrentProgress(projectId);
    const input = buildOrchestratorInput(existing, { projectId, currentPhase, aiOutput, userEdits });
    const output = orchestrateGalateaData(input);
    const phaseKey = getPhaseKey(currentPhase);
    const phaseData = output.phases[phaseKey];

    return {
      success: true,
      output,
      error: null,
      mergeSummary: {
        projectId,
        phase: currentPhase,
        phaseKey,
        mergeSource: (phaseData?._merge_source ?? 'ai_only') as MergeSummary['mergeSource'],
        isUserValidated: !!phaseData?._is_user_validated,
        timestamp: output._generated_at,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, output: null, error: message, mergeSummary: null };
  }
}

/**
 * Valida que un proyecto puede avanzar a la siguiente fase.
 */
export async function canAdvanceToPhase(
  projectId: string,
  targetPhase: number,
): Promise<{ canAdvance: boolean; missingPhases: PhaseKey[]; error: string | null }> {
  try {
    const existing = await fetchCurrentProgress(projectId);
    if (!existing) {
      return { canAdvance: false, missingPhases: [], error: 'No existe registro de progreso' };
    }
    const input = buildOrchestratorInput(existing, { projectId, currentPhase: targetPhase, aiOutput: {} });
    const output = orchestrateGalateaData(input);
    const { valid, missing } = validatePreviousPhasesComplete(output);
    return { canAdvance: valid, missingPhases: missing, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return { canAdvance: false, missingPhases: [], error: message };
  }
}

// ============================================================================
// researchSyncService — API de objeto para n8n y UI de Lovable
// ============================================================================

export const researchSyncService = {
  async updatePhaseData(
    projectId: string,
    phase: number,
    data: PhasePayload,
  ): Promise<SyncResult> {
    return syncPhaseUpdate({
      projectId,
      currentPhase: phase,
      aiOutput: data,
    });
  },

  async updatePhaseDataWithPause(
    projectId: string,
    phase: number,
    data: PhasePayload,
  ): Promise<SyncResult> {
    const result = await syncPhaseUpdate({
      projectId,
      currentPhase: phase,
      aiOutput: {
        ...data,
        _review_status: 'paused',
        _requires_human_review: true,
      },
    });

    if (result.success) {
      await (supabase
        .from('research_projects' as AnyQuery)
        .update({
          status: 'paused',
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId) as unknown as Promise<{
          error: { message: string } | null;
        }>);
    }

    return result;
  },

  async saveEdits(
    projectId: string,
    phase: number,
    edits: PhasePayload,
  ): Promise<{ success: boolean; error: string | null }> {
    return saveUserEdits(projectId, phase, edits);
  },

  subscribeToChanges(
    projectId: string,
    callback: (payload: ResearchProject) => void,
  ): RealtimeChannel {
    return supabase
      .channel(`research_sync_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'research_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => callback(payload.new as ResearchProject),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'research_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => callback(payload.new as ResearchProject),
      )
      .subscribe();
  },

  async preview(
    projectId: string,
    phase: number,
    aiOutput: PhasePayload,
  ): Promise<SyncResult> {
    return previewMergedPhase(projectId, phase, aiOutput);
  },

  async canAdvance(
    projectId: string,
    targetPhase: number,
  ): Promise<{ canAdvance: boolean; missingPhases: PhaseKey[]; error: string | null }> {
    return canAdvanceToPhase(projectId, targetPhase);
  },
};

// ============================================================================
// ERRORES
// ============================================================================

export class SyncError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'SyncError';
  }
}
