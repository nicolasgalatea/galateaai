// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE DOMINIO - Sincronizados con Supabase Schema (kwmfnysjxeqhgcdperkf)
// Tabla: agent_executions / agent_projects
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

export interface AgentProject {
  id: string;
  title: string;
  description: string | null;
  research_question: string | null;
  phase: ProjectPhase;
  current_agent_step: number;
  created_at: string;
}

/**
 * AgentExecution — una fila de la tabla `agent_executions`
 * en el Supabase externo (kwmfnysjxeqhgcdperkf).
 */
export interface AgentExecution {
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
