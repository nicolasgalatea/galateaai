/**
 * ════════════════════════════════════════════════════════════════════════════
 * ESQUEMAS JSON PARA N8N - Galatea Research Flow
 *
 * Este archivo define los esquemas de entrada y salida esperados
 * para cada uno de los 14 agentes del flujo de investigación.
 *
 * Webhook centralizado: https://nicolasgalatea.app.n8n.cloud/webhook/galatea-research-flow
 * ════════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════
// PAYLOAD DE ENTRADA AL WEBHOOK
// ════════════════════════════════════════════════════════════════════════════

export interface N8NWebhookInput {
  projectId: string;
  action: 'START' | 'APPROVE' | 'EXECUTE_AGENT';
  idea?: string;              // Solo para action: START
  agentNumber?: number;       // Solo para action: EXECUTE_AGENT
  agentName?: string;
  inputData?: Record<string, unknown>;
  previousResults?: Record<string, unknown>;
}

// ════════════════════════════════════════════════════════════════════════════
// RESPUESTA BASE DE N8N
// ════════════════════════════════════════════════════════════════════════════

export interface N8NBaseResponse {
  success: boolean;
  message: string;
  projectId: string;
  agentNumber: number;
  agentName: string;
  output: string;              // Markdown formateado para mostrar en UI
  structured_data: Record<string, unknown>;  // Datos estructurados para guardar en DB
  nextAgent?: number;          // Próximo agente a ejecutar (si aplica)
  phase?: 'PROTOCOL_GENERATION' | 'AWAITING_APPROVAL' | 'EXECUTING_REVIEW' | 'COMPLETED' | 'ERROR';
}

// ════════════════════════════════════════════════════════════════════════════
// FASE 1: AGENTES 1-8 (Generación de Protocolo)
// ════════════════════════════════════════════════════════════════════════════

/**
 * AGENTE 1: PICOT Builder
 * Construye la pregunta de investigación estructurada
 */
export interface Agent1_PICOTBuilder_Input {
  projectId: string;
  idea: string;  // Pregunta de investigación en lenguaje natural
}

export interface Agent1_PICOTBuilder_Output {
  success: boolean;
  agentNumber: 1;
  agentName: 'picot_builder';
  output: string;  // Markdown con análisis PICOT
  structured_data: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
}

/**
 * AGENTE 2: FINER Validator
 * Evalúa viabilidad del proyecto
 */
export interface Agent2_FINERValidator_Input {
  projectId: string;
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
}

export interface Agent2_FINERValidator_Output {
  success: boolean;
  agentNumber: 2;
  agentName: 'finer_validator';
  output: string;  // Markdown con evaluación FINER
  structured_data: {
    feasible: number;      // 0-10
    interesting: number;   // 0-10
    novel: number;         // 0-10
    ethical: number;       // 0-10
    relevant: number;      // 0-10
    total_score: number;   // 0-50
    recommendation: 'proceed' | 'revise' | 'reject';
    comments: string;
  };
}

/**
 * AGENTE 3: Literature Scout
 * Busca revisiones sistemáticas existentes en PubMed
 */
export interface Agent3_LiteratureScout_Input {
  projectId: string;
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
}

export interface Agent3_LiteratureScout_Output {
  success: boolean;
  agentNumber: 3;
  agentName: 'literature_scout';
  output: string;  // Markdown con resumen de revisiones encontradas
  structured_data: {
    existing_reviews: Array<{
      title: string;
      authors: string[];
      publication_year: number;
      journal: string;
      doi?: string;
      pmid?: string;
      review_type: 'systematic_review' | 'meta_analysis' | 'scoping_review' | 'cochrane_review';
      relevance_score: number;       // 0-100
      overlap_percentage: number;    // 0-100
      identified_gaps: string[];
      abstract?: string;
      key_findings?: string;
      source_database: string;
      recommendation: 'proceed_new_review' | 'update_existing' | 'no_new_review_needed' | 'narrow_scope';
    }>;
    total_found: number;
    overall_recommendation: string;
  };
}

/**
 * AGENTE 4: Study Designer
 * Define el tipo de estudio óptimo
 */
export interface Agent4_StudyDesigner_Input {
  projectId: string;
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
  finer_score: number;
  existing_reviews_count: number;
}

export interface Agent4_StudyDesigner_Output {
  success: boolean;
  agentNumber: 4;
  agentName: 'study_designer';
  output: string;
  structured_data: {
    study_type: 'systematic_review' | 'meta_analysis' | 'rct' | 'cohort' | 'case_control' | 'cross_sectional' | 'qualitative';
    rationale: string;
    expected_sample_size?: number;
    statistical_approach?: string;
  };
}

/**
 * AGENTE 5: Objectives Generator
 * Genera objetivos ICMJE
 */
export interface Agent5_ObjectivesGenerator_Input {
  projectId: string;
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
  study_type: string;
}

export interface Agent5_ObjectivesGenerator_Output {
  success: boolean;
  agentNumber: 5;
  agentName: 'objectives_generator';
  output: string;
  structured_data: {
    primary: string;
    secondary: string[];
  };
}

/**
 * AGENTE 6: Criteria Definer
 * Define criterios de inclusión/exclusión
 */
export interface Agent6_CriteriaDefiner_Input {
  projectId: string;
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
  study_type: string;
  objectives: {
    primary: string;
    secondary: string[];
  };
}

export interface Agent6_CriteriaDefiner_Output {
  success: boolean;
  agentNumber: 6;
  agentName: 'criteria_definer';
  output: string;
  structured_data: {
    criteria: Array<{
      criteria_type: 'inclusion' | 'exclusion';
      category: 'population' | 'intervention' | 'comparator' | 'outcome' | 'study_design' | 'timeframe' | 'language' | 'publication_type' | 'other';
      description: string;
      rationale?: string;
      operationalization?: string;
      priority: number;  // 1-5
    }>;
  };
}

/**
 * AGENTE 7: Yadav Search Strategist
 * Genera strings de búsqueda optimizados
 */
export interface Agent7_YadavStrategist_Input {
  projectId: string;
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
  criteria: Array<{
    criteria_type: string;
    category: string;
    description: string;
  }>;
}

export interface Agent7_YadavStrategist_Output {
  success: boolean;
  agentNumber: 7;
  agentName: 'yadav_strategist';
  output: string;
  structured_data: {
    pubmed: string;
    cochrane: string;
    embase: string;
    web_of_science?: string;
    scopus?: string;
    other?: Record<string, string>;
  };
}

/**
 * AGENTE 8: Protocol Synthesizer
 * Genera el protocolo PDF completo
 * ⚠️ BLOQUEO: Después de este agente, se requiere aprobación del usuario
 */
export interface Agent8_ProtocolSynthesizer_Input {
  projectId: string;
  // Recibe TODO el contexto de agentes 1-7
  picot: {
    population: string;
    intervention: string;
    comparison: string;
    outcome: string;
    timeframe: string;
  };
  finer: {
    feasible: number;
    interesting: number;
    novel: number;
    ethical: number;
    relevant: number;
    total_score: number;
  };
  existing_reviews: Array<{
    title: string;
    authors: string[];
    publication_year: number;
    relevance_score: number;
    identified_gaps: string[];
  }>;
  study_type: string;
  objectives: {
    primary: string;
    secondary: string[];
  };
  criteria: Array<{
    criteria_type: string;
    category: string;
    description: string;
  }>;
  search_strategies: {
    pubmed: string;
    cochrane: string;
    embase: string;
  };
}

export interface Agent8_ProtocolSynthesizer_Output {
  success: boolean;
  agentNumber: 8;
  agentName: 'protocol_synthesizer';
  output: string;  // Resumen del protocolo en Markdown
  structured_data: {
    pdf_url: string;           // URL del PDF generado
    page_count: number;        // Número de páginas (~40)
    sections: string[];        // Lista de secciones incluidas
    prospero_ready: boolean;   // ¿Listo para registro en PROSPERO?
  };
  // ⚠️ Cambiar fase a AWAITING_APPROVAL después de este agente
  phase: 'AWAITING_APPROVAL';
}

// ════════════════════════════════════════════════════════════════════════════
// FASE 2: AGENTES 9-14 (Ejecución de Revisión)
// Solo se ejecutan después de que el usuario aprueba el protocolo
// ════════════════════════════════════════════════════════════════════════════

/**
 * AGENTE 9: Search Executor
 * Ejecuta búsquedas en las 5 bases de datos
 */
export interface Agent9_SearchExecutor_Input {
  projectId: string;
  search_strategies: {
    pubmed: string;
    cochrane: string;
    embase: string;
    web_of_science?: string;
    scopus?: string;
  };
}

export interface Agent9_SearchExecutor_Output {
  success: boolean;
  agentNumber: 9;
  agentName: 'search_executor';
  output: string;
  structured_data: {
    prisma_records: {
      identified: {
        pubmed: number;
        cochrane: number;
        embase: number;
        web_of_science: number;
        scopus: number;
        total: number;
      };
    };
    records: Array<{
      external_id: string;
      source_database: string;
      title: string;
      authors: string[];
      publication_year: number;
      doi?: string;
      pmid?: string;
      abstract?: string;
    }>;
  };
}

/**
 * AGENTE 10: Duplicate Remover
 * Elimina duplicados entre bases de datos
 */
export interface Agent10_DuplicateRemover_Output {
  success: boolean;
  agentNumber: 10;
  agentName: 'duplicate_remover';
  output: string;
  structured_data: {
    prisma_records: {
      identified: number;
      duplicates_removed: number;
      after_duplicates: number;
    };
    duplicate_pairs: Array<{
      kept_id: string;
      removed_ids: string[];
      reason: string;
    }>;
  };
}

/**
 * AGENTE 11: PRISMA Updater
 * Actualiza el flujograma PRISMA
 */
export interface Agent11_PRISMAUpdater_Output {
  success: boolean;
  agentNumber: 11;
  agentName: 'prisma_updater';
  output: string;  // PRISMA flowchart en ASCII o Markdown
  structured_data: {
    prisma_data: {
      identification: {
        databases: number;
        registers: number;
        total_identified: number;
      };
      screening: {
        after_duplicates: number;
        screened: number;
        excluded_screening: number;
      };
      eligibility: {
        sought_retrieval: number;
        not_retrieved: number;
        assessed: number;
        excluded_eligibility: number;
        exclusion_reasons: Record<string, number>;
      };
      included: {
        qualitative: number;
        quantitative: number;
      };
    };
  };
}

/**
 * AGENTE 12: Paper Evaluator
 * Evalúa títulos y abstracts
 */
export interface Agent12_PaperEvaluator_Output {
  success: boolean;
  agentNumber: 12;
  agentName: 'paper_evaluator';
  output: string;
  structured_data: {
    evaluations: Array<{
      record_id: string;
      title_abstract_decision: 'include' | 'exclude' | 'uncertain';
      reason?: string;
      confidence: number;  // 0-100
    }>;
    summary: {
      total_evaluated: number;
      included: number;
      excluded: number;
      uncertain: number;
    };
  };
}

/**
 * AGENTE 13: Data Extractor
 * Extrae datos de estudios incluidos
 */
export interface Agent13_DataExtractor_Output {
  success: boolean;
  agentNumber: 13;
  agentName: 'data_extractor';
  output: string;
  structured_data: {
    extracted_data_url: string;  // URL del archivo Excel/JSON
    extraction_summary: {
      total_studies: number;
      variables_extracted: string[];
      quality_assessment: {
        tool_used: string;  // e.g., "ROB-2", "Newcastle-Ottawa"
        high_quality: number;
        moderate_quality: number;
        low_quality: number;
      };
    };
  };
}

/**
 * AGENTE 14: Synthesis Writer
 * Genera el reporte final con meta-análisis
 */
export interface Agent14_SynthesisWriter_Output {
  success: boolean;
  agentNumber: 14;
  agentName: 'synthesis_writer';
  output: string;  // Reporte completo en Markdown con estadísticas
  structured_data: {
    final_report_url: string;  // URL del PDF/Word final
    meta_analysis: {
      primary_outcome: {
        effect_measure: 'RR' | 'OR' | 'HR' | 'MD' | 'SMD';
        estimate: number;
        ci_lower: number;
        ci_upper: number;
        p_value: number;
        i_squared: number;  // Heterogeneidad
        studies_included: number;
      };
      secondary_outcomes?: Array<{
        name: string;
        effect_measure: string;
        estimate: number;
        ci_lower: number;
        ci_upper: number;
        p_value: number;
      }>;
      forest_plot_url?: string;
      funnel_plot_url?: string;
    };
    conclusions: {
      main_finding: string;
      clinical_implications: string;
      research_implications: string;
      certainty_of_evidence: 'high' | 'moderate' | 'low' | 'very_low';
    };
  };
  // ⚠️ Cambiar fase a COMPLETED después de este agente
  phase: 'COMPLETED';
}

// ════════════════════════════════════════════════════════════════════════════
// RESPUESTA DE ERROR
// ════════════════════════════════════════════════════════════════════════════

export interface N8NErrorResponse {
  success: false;
  error: true;
  message: string;
  projectId: string;
  agentNumber: number;
  agentName: string;
  error_code: string;
  error_details?: string;
  // ⚠️ Cambiar fase a ERROR
  phase: 'ERROR';
}

// ════════════════════════════════════════════════════════════════════════════
// EJEMPLO DE USO EN N8N
// ════════════════════════════════════════════════════════════════════════════

/*
CONFIGURACIÓN DEL WEBHOOK EN N8N:

1. Nodo Webhook:
   - Method: POST
   - Path: galatea-research-flow
   - Response Mode: Last Node

2. Nodo Switch (basado en action):
   - START → Ejecutar Fase 1 (Agentes 1-8)
   - APPROVE → Ejecutar Fase 2 (Agentes 9-14)
   - EXECUTE_AGENT → Ejecutar agente específico

3. Después de cada agente, actualizar Supabase:
   - Usar nodo HTTP Request o Supabase
   - Endpoint: PATCH /rest/v1/agent_projects?id=eq.{projectId}
   - Body: { current_agent_step: X, ...structured_data }

4. Después del Agente 8:
   - Actualizar phase a 'AWAITING_APPROVAL'
   - NO continuar automáticamente

5. Después del Agente 14:
   - Actualizar phase a 'COMPLETED'

6. En caso de error:
   - Actualizar phase a 'ERROR'
   - Guardar error_message en el proyecto
*/
