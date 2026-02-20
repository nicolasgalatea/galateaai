/**
 * ============================================================================
 * GALATEA ORCHESTRATOR v2.0 — "The Single Source of Truth"
 *
 * Fusiona la salida de IA (phase_data) con las ediciones del investigador
 * (user_edits) usando Deep Merge con prioridad absoluta del usuario.
 *
 * Regla de oro: user_edits SIEMPRE sobreescribe phase_data.
 *
 * v2.0: Migrado de columnas pareadas (fase_X_Y_output) a columnas semánticas
 *       (research_question, finer_results, search_strategy, protocol_draft, etc.)
 * ============================================================================
 */

import type { ResearchProjectKey } from '@/types/domain';

// ============================================================================
// TIPOS
// ============================================================================

/** Re-export de ResearchProjectKey como PhaseKey para compatibilidad */
export type PhaseKey = ResearchProjectKey;

export const PHASE_KEYS: PhaseKey[] = [
  'research_question',
  'finer_results',
  'search_strategy',
  'protocol_draft',
  'manuscript_draft',
  'statistical_plan',
];

/** Mapa de numero de fase a clave semantica */
const PHASE_NUMBER_TO_KEY: Record<number, PhaseKey> = {
  0: 'research_question',
  1: 'research_question',
  2: 'research_question',
  3: 'research_question',
  4: 'finer_results',
  5: 'finer_results',
  6: 'finer_results',
  7: 'search_strategy',
  8: 'protocol_draft',
  9: 'protocol_draft',
  10: 'protocol_draft',
};

/** Datos arbitrarios de una fase (JSON generico) */
export type PhasePayload = Record<string, unknown>;

/** Input que recibe el orquestador */
export interface OrchestratorInput {
  /** Datos generados por los agentes de IA */
  phase_data: Partial<Record<PhaseKey, PhasePayload | null>>;
  /** Ediciones manuales del investigador */
  user_edits: Partial<Record<PhaseKey, PhasePayload | null>>;
  /** Numero de fase actual (0-10) */
  current_phase: number;
  /** ID del proyecto */
  project_id: string;
}

/** Metadatos de sincronizacion inyectados en cada fase */
interface SyncMeta {
  _last_sync: string;
  _is_user_validated: boolean;
  _merge_source: 'ai_only' | 'user_override' | 'merged';
}

/** Output final del orquestador */
export interface OrchestratorOutput {
  project_id: string;
  fase_actual: number;
  phases: Record<PhaseKey, (PhasePayload & SyncMeta) | null>;
  _orchestrator_version: string;
  _generated_at: string;
}

// ============================================================================
// DEEP MERGE
// ============================================================================

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep merge recursivo. `override` tiene prioridad absoluta sobre `base`.
 * - Objetos anidados se fusionan recursivamente.
 * - Arrays y primitivos del override reemplazan al base.
 * - Campos con valor `null` en override eliminan el campo del base.
 */
export function deepMerge(
  base: PhasePayload,
  override: PhasePayload,
): PhasePayload {
  const result: PhasePayload = { ...base };

  for (const key of Object.keys(override)) {
    const overrideVal = override[key];
    const baseVal = result[key];

    if (overrideVal === null) {
      // null explicito del usuario elimina el campo
      delete result[key];
    } else if (isPlainObject(overrideVal) && isPlainObject(baseVal)) {
      result[key] = deepMerge(baseVal, overrideVal);
    } else {
      result[key] = overrideVal;
    }
  }

  return result;
}

// ============================================================================
// VALIDACION
// ============================================================================

/**
 * Valida que el payload sea JSON estricto serializable.
 * Elimina `undefined`, funciones y referencias circulares.
 */
export function sanitizeToStrictJSON<T>(data: T): T {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    throw new OrchestratorError(
      'INVALID_JSON',
      'El output contiene datos no serializables a JSON',
    );
  }
}

/**
 * Valida que el numero de fase este en rango.
 */
function validatePhaseNumber(phase: number): void {
  if (!Number.isInteger(phase) || phase < 0 || phase > 10) {
    throw new OrchestratorError(
      'INVALID_PHASE',
      `Fase ${phase} fuera de rango. Debe ser un entero entre 0 y 10.`,
    );
  }
}

// ============================================================================
// ERRORES
// ============================================================================

export class OrchestratorError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

// ============================================================================
// ORQUESTADOR PRINCIPAL
// ============================================================================

const ORCHESTRATOR_VERSION = '2.0.0';

/**
 * Orquesta la fusion de datos de IA con ediciones del usuario.
 *
 * Prioridad: user_edits > phase_data (deep merge recursivo).
 *
 * @param input - Datos de IA, ediciones del usuario, fase actual y project_id
 * @returns Objeto de Verdad Unico listo para persistir y pasar al siguiente agente
 *
 * @example
 * ```ts
 * const result = orchestrateGalateaData({
 *   phase_data: {
 *     research_question: { pregunta: 'AI generada', pico_data: { P: 'Adultos' } }
 *   },
 *   user_edits: {
 *     research_question: { pregunta: 'Mi pregunta corregida' }
 *   },
 *   current_phase: 1,
 *   project_id: 'proj_abc123',
 * });
 * // result.phases.research_question.pregunta === 'Mi pregunta corregida'
 * // result.phases.research_question.pico_data.P === 'Adultos' (preservado de IA)
 * ```
 */
export function orchestrateGalateaData(input: OrchestratorInput): OrchestratorOutput {
  const { phase_data, user_edits, current_phase, project_id } = input;

  // — Validaciones de entrada —
  if (!project_id) {
    throw new OrchestratorError('MISSING_PROJECT_ID', 'project_id es requerido');
  }
  validatePhaseNumber(current_phase);

  const now = new Date().toISOString();

  // — Construir el mapa de fases fusionadas —
  const phases = {} as Record<PhaseKey, (PhasePayload & SyncMeta) | null>;

  for (const key of PHASE_KEYS) {
    const aiData = phase_data[key] ?? null;
    const editData = user_edits[key] ?? null;

    // Si ambos son null, la fase queda null
    if (!aiData && !editData) {
      phases[key] = null;
      continue;
    }

    const base = aiData ?? {};
    const overrides = editData ?? {};
    const hasEdits = editData !== null && Object.keys(overrides).length > 0;
    const hasAI = aiData !== null && Object.keys(base).length > 0;

    // Deep merge con prioridad del usuario
    const merged = hasEdits ? deepMerge(base, overrides) : { ...base };

    // Determinar origen del merge
    let mergeSource: SyncMeta['_merge_source'] = 'ai_only';
    if (hasEdits && hasAI) mergeSource = 'merged';
    else if (hasEdits && !hasAI) mergeSource = 'user_override';

    phases[key] = {
      ...merged,
      _last_sync: now,
      _is_user_validated: hasEdits,
      _merge_source: mergeSource,
    };
  }

  // — Ensamblar output final —
  const output: OrchestratorOutput = {
    project_id,
    fase_actual: current_phase,
    phases,
    _orchestrator_version: ORCHESTRATOR_VERSION,
    _generated_at: now,
  };

  // — Limpieza: garantizar JSON estricto —
  return sanitizeToStrictJSON(output);
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene la PhaseKey correspondiente a un numero de fase.
 */
export function getPhaseKey(phaseNumber: number): PhaseKey {
  validatePhaseNumber(phaseNumber);
  return PHASE_NUMBER_TO_KEY[phaseNumber];
}

/**
 * Extrae solo los datos de la fase actual del output orquestado.
 * Util para pasar como input al siguiente agente de la cadena.
 */
export function extractCurrentPhaseData(
  output: OrchestratorOutput,
): (PhasePayload & SyncMeta) | null {
  const key = getPhaseKey(output.fase_actual);
  return output.phases[key];
}

/**
 * Valida que todas las fases previas a la actual esten completas
 * (no sean null). Util antes de avanzar de fase.
 */
export function validatePreviousPhasesComplete(
  output: OrchestratorOutput,
): { valid: boolean; missing: PhaseKey[] } {
  const currentKey = getPhaseKey(output.fase_actual);
  const currentIdx = PHASE_KEYS.indexOf(currentKey);
  const missing: PhaseKey[] = [];

  for (let i = 0; i < currentIdx; i++) {
    if (output.phases[PHASE_KEYS[i]] === null) {
      missing.push(PHASE_KEYS[i]);
    }
  }

  return { valid: missing.length === 0, missing };
}
