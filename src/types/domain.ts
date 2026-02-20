// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE DOMINIO - Sincronizados con Supabase Schema
// ═══════════════════════════════════════════════════════════════════════════

export type ProjectPhase =
  | 'PROTOCOL_GENERATION'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING_REVIEW'
  | 'COMPLETED';

export type AgentExecutionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface Project {
  id: string;
  title: string;
  description: string | null;
  research_question: string | null;
  phase: ProjectPhase;
  current_agent_step: number;
  created_at: string;
}

/**
 * AgentOutput - Representa una ejecucion de agente en agent_executions
 * Sincronizado con el schema SQL de la guia
 */
export interface AgentOutput {
  id: string;
  project_id: string;
  agent_number: number;
  agent_name: string;
  phase: number | null;
  status: AgentExecutionStatus;
  input_payload: Record<string, unknown> | null;
  output_result: Record<string, unknown> | null;
  output_markdown: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  retry_count: number | null;
  created_at: string;
}

/**
 * FinerScores - Puntuaciones individuales del test FINER (Agente 2, Fases 4-6)
 * Cada criterio se puntua de 0 a 10.
 */
export interface FinerScores {
  feasible: number | null;
  interesting: number | null;
  novel: number | null;
  ethical: number | null;
  relevant: number | null;
}

/**
 * FinerOutput - Output tipado del Metodólogo (Agente 2)
 * Sincronizado con outputFields de researchLabAgents.ts
 */
export interface FinerOutput {
  finer_scores: FinerScores | null;
  aprobado: boolean;
  recomendaciones: string | null;
  hipotesis: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESEARCH PROJECTS — Arquitectura de 4 agentes
// ═══════════════════════════════════════════════════════════════════════════

/** Claves semánticas de columnas en research_projects */
export type ResearchProjectKey =
  | 'research_question'
  | 'finer_results'
  | 'search_strategy'
  | 'protocol_draft'
  | 'manuscript_draft'
  | 'statistical_plan';

/** Datos tipados para research_question (Agent 1 — Arquitecto) */
export interface ResearchQuestionData {
  idea_general?: string;
  contexto_regional?: string;
  vacios_literatura?: string;
  reglas_validadas?: string;
  tipo_estudio?: string;
  modelo_pregunta?: string;
  pregunta_estructurada?: string;
  pico_data?: {
    P?: string;
    I?: string;
    C?: string;
    O?: string;
    T?: string;
  };
  [key: string]: unknown;
}

/** Datos tipados para finer_results (Agent 2 — Metodólogo) */
export interface FinerResultsData {
  finer_scores?: FinerScores;
  aprobado?: boolean;
  recomendaciones?: string;
  hipotesis?: string;
  [key: string]: unknown;
}

/** Datos tipados para search_strategy (Agent 3 — Evidencia) */
export interface SearchStrategyData {
  estructura_carpetas?: string;
  descriptores?: string[];
  ecuacion_booleana?: string;
  bases_datos?: string[];
  mesh_terms?: string[];
  [key: string]: unknown;
}

/** Datos tipados para protocol_draft (Agent 4 — Redactor) */
export interface ProtocolDraftData {
  indice_protocolo?: string;
  guia_equator?: string;
  checklist_items?: string[];
  url_guia?: string;
  guia_introduccion?: string;
  guia_metodos?: string;
  pruebas_estadisticas?: string;
  checklist_etica?: string;
  [key: string]: unknown;
}

/** Datos tipados del manuscrito (Agent 4, Fases 8-10) */
export interface ManuscriptDraftData {
  introduccion?: string;
  metodos?: string;
  discusion?: string;
  [key: string]: unknown;
}

/** Referencia bibliografica asociada a un proyecto */
export interface ProjectReference {
  id: string;
  project_id: string;
  title: string;
  authors: string | null;
  journal: string | null;
  year: number | null;
  doi: string | null;
  pmid: string | null;
  url: string | null;
  abstract: string | null;
  citation_key: number;
  created_at: string;
}

/**
 * ResearchProject — Mapea 1:1 a la tabla research_projects
 * Sincronizado con la migracion 20260217000001_create_research_projects.sql
 */
export interface ResearchProject {
  id: string;
  user_id: string;
  title: string;
  current_phase: number;

  // Agent 1 — Arquitecto (Fases 0-3)
  study_design: string | null;
  research_question: Record<string, unknown> | null;

  // Agent 2 — Metodólogo (Fases 4-6)
  finer_results: Record<string, unknown> | null;
  hypothesis: string | null;
  folder_path: string | null;

  // Agent 3 — Evidencia (Fase 7)
  search_strategy: Record<string, unknown> | null;

  // Agent 4 — Redactor (Fases 8-10)
  protocol_draft: Record<string, unknown> | null;
  manuscript_draft: Record<string, unknown> | null;
  statistical_plan: Record<string, unknown> | null;

  // Shared
  user_edits_json: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY — @deprecated Usar ResearchProject en su lugar
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Migrado a ResearchProject. Tabla research_lab_progress ya no se usa.
 */
export interface ResearchLabProgress {
  id: string;
  project_id: string;
  fase_actual: number;
  fase_0_1_output: Record<string, unknown> | null;
  fase_2_3_output: Record<string, unknown> | null;
  fase_4_5_output: Record<string, unknown> | null;
  fase_6_7_output: Record<string, unknown> | null;
  fase_8_9_output: Record<string, unknown> | null;
  fase_10_output: Record<string, unknown> | null;
  finer_approved: boolean | null;
  created_at: string;
  updated_at: string;
}
