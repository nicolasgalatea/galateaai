/**
 * The Research Lab v2 — Sistema de 10 fases con 4 agentes especializados
 * Migración desde 6 agentes a arquitectura de 4 agentes semánticos.
 */

import {
  Layout,
  Scale,
  Library,
  PenLine,
  type LucideIcon,
} from 'lucide-react';
import type { ResearchProjectKey } from '@/types/domain';

export type ResearchLabPhaseNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type ResearchLabProjectPhase =
  | 'FASE_0_3_ARQUITECTO'
  | 'FASE_4_6_METODOLOGO'
  | 'FASE_7_EVIDENCIA'
  | 'FASE_8_10_REDACTOR'
  | 'AWAITING_FINER'
  | 'COMPLETED';

export interface ResearchLabAgent {
  id: number; // 1-4
  name: string;
  displayName: string;
  displayNameEs: string;
  phases: [ResearchLabPhaseNumber, ResearchLabPhaseNumber]; // ej. [0, 3]
  description: string;
  descriptionEs: string;
  icon: LucideIcon;
  outputFields: string[];
  semanticKeys: ResearchProjectKey[];
  estimatedDuration: string;
  isBlocking: boolean;
}

// Webhook centralizado para Research Lab v2
export const N8N_RESEARCH_LAB_V2_WEBHOOK =
  'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-research-lab-v2';

/** 4 agentes especializados del Research Lab v2 */
export const RESEARCH_LAB_AGENTS: ResearchLabAgent[] = [
  {
    id: 1,
    name: 'arquitecto',
    displayName: 'Arquitecto',
    displayNameEs: 'Arquitecto',
    phases: [0, 3],
    description: 'Validates research rules, detects clinical problem, selects study design, structures research question (Phases 0-3)',
    descriptionEs: 'Valida reglas de investigación, detecta problema clínico, selecciona diseño de estudio y estructura la pregunta (Fases 0-3)',
    icon: Layout,
    outputFields: ['idea_general', 'contexto_regional', 'vacios_literatura', 'reglas_validadas', 'tipo_estudio', 'modelo_pregunta', 'pregunta_estructurada'],
    semanticKeys: ['research_question'],
    estimatedDuration: '2m',
    isBlocking: false,
  },
  {
    id: 2,
    name: 'metodologo',
    displayName: 'Metodólogo',
    displayNameEs: 'Metodólogo',
    phases: [4, 6],
    description: 'FINER test, hypothesis formulation, and folder structure (Phases 4-6)',
    descriptionEs: 'Test FINER, formulación de hipótesis y estructura de carpetas (Fases 4-6)',
    icon: Scale,
    outputFields: ['finer_scores', 'aprobado', 'recomendaciones', 'hipotesis', 'estructura_carpetas'],
    semanticKeys: ['finer_results'],
    estimatedDuration: '1m',
    isBlocking: true, // Checkpoint FINER
  },
  {
    id: 3,
    name: 'evidencia',
    displayName: 'Evidencia',
    displayNameEs: 'Evidencia',
    phases: [7, 7],
    description: 'Search strategy with descriptors, boolean equations, and database selection (Phase 7)',
    descriptionEs: 'Estrategia de búsqueda con descriptores, ecuaciones booleanas y selección de bases de datos (Fase 7)',
    icon: Library,
    outputFields: ['descriptores', 'ecuacion_booleana', 'bases_datos'],
    semanticKeys: ['search_strategy'],
    estimatedDuration: '2m',
    isBlocking: false,
  },
  {
    id: 4,
    name: 'redactor',
    displayName: 'Redactor',
    displayNameEs: 'Redactor',
    phases: [8, 10],
    description: 'Protocol structure, EQUATOR guide, IMRyD structure, and statistical advice (Phases 8-10)',
    descriptionEs: 'Estructura del protocolo, guía EQUATOR, estructura IMRyD y asesoría estadística (Fases 8-10)',
    icon: PenLine,
    outputFields: ['indice_protocolo', 'guia_equator', 'checklist_items', 'guia_introduccion', 'guia_metodos', 'pruebas_estadisticas', 'checklist_etica'],
    semanticKeys: ['protocol_draft', 'manuscript_draft', 'statistical_plan'],
    estimatedDuration: '3m',
    isBlocking: false,
  },
];

/** Mapeo fase numérica (0-10) a estado del proyecto */
export const RESEARCH_LAB_PHASE_TO_STATE: Record<ResearchLabPhaseNumber, ResearchLabProjectPhase> = {
  0: 'FASE_0_3_ARQUITECTO',
  1: 'FASE_0_3_ARQUITECTO',
  2: 'FASE_0_3_ARQUITECTO',
  3: 'FASE_0_3_ARQUITECTO',
  4: 'FASE_4_6_METODOLOGO',
  5: 'FASE_4_6_METODOLOGO',
  6: 'FASE_4_6_METODOLOGO',
  7: 'FASE_7_EVIDENCIA',
  8: 'FASE_8_10_REDACTOR',
  9: 'FASE_8_10_REDACTOR',
  10: 'FASE_8_10_REDACTOR',
};

/** Mapeo de agente a sus columnas semánticas */
export const AGENT_TO_SEMANTIC_KEYS: Record<number, ResearchProjectKey[]> = {
  1: ['research_question'],
  2: ['finer_results'],
  3: ['search_strategy'],
  4: ['protocol_draft', 'manuscript_draft', 'statistical_plan'],
};

/** Obtener agente por ID (1-4) */
export const getResearchLabAgentById = (id: number): ResearchLabAgent | undefined =>
  RESEARCH_LAB_AGENTS.find((a) => a.id === id);

/** Obtener agente por número de fase (0-10) → agente 1-4 */
export const getResearchLabAgentByPhase = (phase: ResearchLabPhaseNumber): ResearchLabAgent | undefined =>
  RESEARCH_LAB_AGENTS.find((a) => phase >= a.phases[0] && phase <= a.phases[1]);

/** Paso actual (1-4) desde fase 0-10 */
export const getResearchLabStepFromPhase = (phase: ResearchLabPhaseNumber): number => {
  const agent = getResearchLabAgentByPhase(phase);
  return agent?.id ?? 1;
};

/** ¿La fase es checkpoint FINER? (fase 4) */
export const isResearchLabFinerCheckpoint = (phase: ResearchLabPhaseNumber): boolean => phase === 4;
