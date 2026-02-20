/**
 * @deprecated Legacy Research Agents config — migrado a researchLabAgents.ts
 *
 * Este archivo se mantiene por compatibilidad con componentes que aun importan desde aqui.
 * Los 14 agentes legacy y webhooks de 2 fases han sido eliminados.
 * Usar researchLabAgents.ts para la nueva arquitectura de 4 agentes.
 */

import type { AgentExecutionStatus as DomainAgentExecutionStatus } from '@/types/domain';

// Re-export del tipo desde domain.ts para compatibilidad
export type AgentExecutionStatus = DomainAgentExecutionStatus;

export type ResearchProjectPhase =
  | 'PROTOCOL_GENERATION'
  | 'AWAITING_APPROVAL'
  | 'EXECUTING_REVIEW'
  | 'COMPLETED';

// ════════════════════════════════════════════════════════════════════
// WEBHOOKS — Deprecados, usar N8N_RESEARCH_LAB_V2_WEBHOOK de researchLabAgents.ts
// ════════════════════════════════════════════════════════════════════

export const N8N_WEBHOOK_BASE_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook';

/** @deprecated Usar N8N_RESEARCH_LAB_V2_WEBHOOK de researchLabAgents.ts */
export const N8N_PROTOCOL_START_WEBHOOK = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';

/** @deprecated Usar N8N_RESEARCH_LAB_V2_WEBHOOK de researchLabAgents.ts */
export const N8N_EXECUTION_START_WEBHOOK = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-execution-start';

/** @deprecated Movido a researchLabAgents.ts */
export const N8N_RESEARCH_LAB_V2_WEBHOOK =
  'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-research-lab-v2';

/** @deprecated Usar N8N_RESEARCH_LAB_V2_WEBHOOK */
export const N8N_RESEARCH_FLOW_WEBHOOK = N8N_PROTOCOL_START_WEBHOOK;

// ════════════════════════════════════════════════════════════════════
// LEGACY AGENT INTERFACE — Mantener para compatibilidad de tipos
// ════════════════════════════════════════════════════════════════════

export interface ResearchAgent {
  id: number;
  name: string;
  displayName: string;
  displayNameEs: string;
  phase: 1 | 2;
  description: string;
  descriptionEs: string;
  icon: unknown;
  webhookEndpoint: string;
  inputFields: string[];
  outputFields: string[];
  estimatedDuration: string;
  isBlocking: boolean;
}

/** @deprecated Array vacio — los 14 agentes legacy han sido eliminados */
export const RESEARCH_AGENTS: ResearchAgent[] = [];

/** @deprecated */
export const PHASE_1_AGENTS: ResearchAgent[] = [];

/** @deprecated */
export const PHASE_2_AGENTS: ResearchAgent[] = [];

/** @deprecated Retorna undefined — agentes legacy eliminados */
export const getAgentById = (id: number): ResearchAgent | undefined => undefined;

/** @deprecated Retorna undefined — agentes legacy eliminados */
export const getAgentByName = (name: string): ResearchAgent | undefined => undefined;

/** @deprecated Siempre retorna false */
export const isBlockingStep = (step: number): boolean => false;

/** @deprecated Siempre retorna 1 */
export const getPhaseFromStep = (step: number): 1 | 2 => 1;

/** @deprecated */
export const PHASE_TO_PROJECT_STATE: Record<number, ResearchProjectPhase> = {
  1: 'PROTOCOL_GENERATION',
  2: 'EXECUTING_REVIEW',
};
