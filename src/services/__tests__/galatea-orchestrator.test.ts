/**
 * ============================================================================
 * GALATEA ORCHESTRATOR v2.0 — Test Suite
 *
 * 5 escenarios criticos:
 *   1. User Overwrite        — user_edits sobreescribe phase_data
 *   2. Deep Preservation     — edicion parcial preserva campos no editados
 *   3. Validation Error      — datos no serializables lanzan OrchestratorError
 *   4. Sequential Integrity  — no se puede saltar fases vacias
 *   5. Audit Metadata        — metadatos de trazabilidad presentes
 *
 * v2.0: Claves semanticas (research_question, finer_results, search_strategy,
 *        protocol_draft, manuscript_draft, statistical_plan)
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  orchestrateGalateaData,
  extractCurrentPhaseData,
  validatePreviousPhasesComplete,
  getPhaseKey,
  OrchestratorError,
  type OrchestratorInput,
  type OrchestratorOutput,
} from '../galatea-orchestrator';

// ============================================================================
// HELPERS
// ============================================================================

function makeInput(overrides: Partial<OrchestratorInput> = {}): OrchestratorInput {
  return {
    project_id: 'proj_test_001',
    current_phase: 1,
    phase_data: {},
    user_edits: {},
    ...overrides,
  };
}

// ============================================================================
// 1. USER OVERWRITE
// ============================================================================

describe('User Overwrite — user_edits tiene prioridad absoluta sobre phase_data', () => {
  it('sobreescribe un campo string generado por IA', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 1,
        phase_data: {
          research_question: {
            pregunta: 'Pregunta generada por IA',
            picot_population: 'Adultos mayores',
          },
        },
        user_edits: {
          research_question: {
            pregunta: 'Mi pregunta corregida por el investigador',
          },
        },
      }),
    );

    const phase = result.phases.research_question!;
    expect(phase.pregunta).toBe('Mi pregunta corregida por el investigador');
  });

  it('sobreescribe un numero generado por IA', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        phase_data: {
          finer_results: {
            finer_feasible: 7,
            finer_interesting: 8,
          },
        },
        user_edits: {
          finer_results: {
            finer_feasible: 3,
          },
        },
      }),
    );

    const phase = result.phases.finer_results!;
    expect(phase.finer_feasible).toBe(3);
    expect(phase.finer_interesting).toBe(8);
  });

  it('sobreescribe un array generado por IA', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 2,
        phase_data: {
          research_question: {
            existing_reviews: ['Review A', 'Review B'],
          },
        },
        user_edits: {
          research_question: {
            existing_reviews: ['Review A', 'Review B', 'Review C manual'],
          },
        },
      }),
    );

    const phase = result.phases.research_question!;
    expect(phase.existing_reviews).toEqual(['Review A', 'Review B', 'Review C manual']);
  });

  it('permite al usuario eliminar un campo con null explicito', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 0,
        phase_data: {
          research_question: {
            campo_a_eliminar: 'valor de IA',
            campo_preservado: 'intacto',
          },
        },
        user_edits: {
          research_question: {
            campo_a_eliminar: null,
          },
        },
      }),
    );

    const phase = result.phases.research_question!;
    expect(phase).not.toHaveProperty('campo_a_eliminar');
    expect(phase.campo_preservado).toBe('intacto');
  });
});

// ============================================================================
// 2. DEEP PRESERVATION
// ============================================================================

describe('Deep Preservation — edicion parcial preserva campos no editados', () => {
  it('editar solo P de PICOT preserva I, C, O, T intactos', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 1,
        phase_data: {
          research_question: {
            picot: {
              population: 'Adultos con diabetes tipo 2',
              intervention: 'Metformina 500mg',
              comparison: 'Placebo',
              outcome: 'HbA1c a 12 semanas',
              timeframe: '12 semanas',
            },
          },
        },
        user_edits: {
          research_question: {
            picot: {
              population: 'Ninos con diabetes tipo 1',
            },
          },
        },
      }),
    );

    const picot = result.phases.research_question!.picot as Record<string, string>;

    // El campo editado cambia
    expect(picot.population).toBe('Ninos con diabetes tipo 1');

    // Los demas campos de IA permanecen intactos
    expect(picot.intervention).toBe('Metformina 500mg');
    expect(picot.comparison).toBe('Placebo');
    expect(picot.outcome).toBe('HbA1c a 12 semanas');
    expect(picot.timeframe).toBe('12 semanas');
  });

  it('preserva campos de nivel superior no incluidos en user_edits', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 7,
        phase_data: {
          search_strategy: {
            search_strategy_pubmed: '(diabetes) AND (metformin)',
            search_strategy_cochrane: '(diabetes) AND (metformin) cochrane',
            search_strategy_embase: '(diabetes) AND (metformin) embase',
          },
        },
        user_edits: {
          search_strategy: {
            search_strategy_pubmed: '(T1DM OR T2DM) AND (metformin)',
          },
        },
      }),
    );

    const phase = result.phases.search_strategy!;
    expect(phase.search_strategy_pubmed).toBe('(T1DM OR T2DM) AND (metformin)');
    expect(phase.search_strategy_cochrane).toBe('(diabetes) AND (metformin) cochrane');
    expect(phase.search_strategy_embase).toBe('(diabetes) AND (metformin) embase');
  });

  it('deep merge a 3 niveles de profundidad', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 8,
        phase_data: {
          protocol_draft: {
            results: {
              database_a: {
                total: 150,
                included: 45,
                quality_score: 7.2,
              },
              database_b: {
                total: 200,
                included: 60,
                quality_score: 8.1,
              },
            },
          },
        },
        user_edits: {
          protocol_draft: {
            results: {
              database_a: {
                included: 42,
              },
            },
          },
        },
      }),
    );

    const results = result.phases.protocol_draft!.results as Record<string, Record<string, number>>;
    // Editado
    expect(results.database_a.included).toBe(42);
    // Preservados
    expect(results.database_a.total).toBe(150);
    expect(results.database_a.quality_score).toBe(7.2);
    expect(results.database_b.total).toBe(200);
    expect(results.database_b.included).toBe(60);
  });
});

// ============================================================================
// 3. VALIDATION ERROR
// ============================================================================

describe('Validation Error — datos invalidos lanzan OrchestratorError', () => {
  it('lanza OrchestratorError si project_id esta vacio', () => {
    expect(() =>
      orchestrateGalateaData(makeInput({ project_id: '' })),
    ).toThrow(OrchestratorError);
  });

  it('lanza OrchestratorError si current_phase esta fuera de rango (negativo)', () => {
    expect(() =>
      orchestrateGalateaData(makeInput({ current_phase: -1 })),
    ).toThrow(OrchestratorError);

    try {
      orchestrateGalateaData(makeInput({ current_phase: -1 }));
    } catch (e) {
      expect((e as OrchestratorError).code).toBe('INVALID_PHASE');
    }
  });

  it('lanza OrchestratorError si current_phase esta fuera de rango (>10)', () => {
    expect(() =>
      orchestrateGalateaData(makeInput({ current_phase: 11 })),
    ).toThrow(OrchestratorError);
  });

  it('lanza OrchestratorError si current_phase es decimal', () => {
    expect(() =>
      orchestrateGalateaData(makeInput({ current_phase: 2.5 })),
    ).toThrow(OrchestratorError);
  });

  it('maneja datos con BigInt (no serializable) lanzando OrchestratorError', () => {
    // BigInt no es serializable a JSON
    expect(() =>
      orchestrateGalateaData(
        makeInput({
          phase_data: {
            research_question: {
              bad_value: BigInt(9007199254740991),
            } as any,
          },
        }),
      ),
    ).toThrow();
  });
});

// ============================================================================
// 4. SEQUENTIAL INTEGRITY
// ============================================================================

describe('Sequential Integrity — no se pueden saltar fases vacias', () => {
  it('detecta fases previas faltantes', () => {
    // Fase actual = 4 (finer_results), pero research_question esta null
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        phase_data: {
          finer_results: { study_type: 'Meta-analisis' },
        },
      }),
    );

    const validation = validatePreviousPhasesComplete(result);

    expect(validation.valid).toBe(false);
    expect(validation.missing).toContain('research_question');
    expect(validation.missing).not.toContain('finer_results');
  });

  it('pasa validacion cuando todas las fases previas estan completas', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        phase_data: {
          research_question: { pregunta: 'Pregunta definida' },
          finer_results: { study_type: 'Meta-analisis' },
        },
      }),
    );

    const validation = validatePreviousPhasesComplete(result);

    expect(validation.valid).toBe(true);
    expect(validation.missing).toHaveLength(0);
  });

  it('fase 0 no tiene fases previas — siempre es valida', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 0,
        phase_data: {
          research_question: { idea: 'Primera idea' },
        },
      }),
    );

    const validation = validatePreviousPhasesComplete(result);
    expect(validation.valid).toBe(true);
  });

  it('detecta gap en el medio de la secuencia', () => {
    // research_question completa, finer_results VACIA, intentando search_strategy
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 7,
        phase_data: {
          research_question: { pregunta: 'ok' },
          // finer_results: falta!
          search_strategy: { strategy: 'Yadav' },
        },
      }),
    );

    const validation = validatePreviousPhasesComplete(result);
    expect(validation.valid).toBe(false);
    expect(validation.missing).toEqual(['finer_results']);
  });
});

// ============================================================================
// 5. AUDIT METADATA
// ============================================================================

describe('Audit Metadata — metadatos de trazabilidad en el output', () => {
  let result: OrchestratorOutput;

  beforeEach(() => {
    result = orchestrateGalateaData(
      makeInput({
        current_phase: 1,
        phase_data: {
          research_question: { pregunta: 'IA generada' },
        },
        user_edits: {
          research_question: { pregunta: 'Corregida por usuario' },
        },
      }),
    );
  });

  it('incluye _last_sync como ISO string valido', () => {
    const phase = result.phases.research_question!;
    expect(phase._last_sync).toBeDefined();
    expect(new Date(phase._last_sync as string).toISOString()).toBe(phase._last_sync);
  });

  it('marca _is_user_validated como true cuando hay user_edits', () => {
    expect(result.phases.research_question!._is_user_validated).toBe(true);
  });

  it('marca _is_user_validated como false cuando solo hay datos de IA', () => {
    const aiOnly = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        phase_data: {
          finer_results: { existing_reviews: ['A'] },
        },
      }),
    );
    expect(aiOnly.phases.finer_results!._is_user_validated).toBe(false);
  });

  it('_merge_source es "merged" cuando hay IA + user_edits', () => {
    expect(result.phases.research_question!._merge_source).toBe('merged');
  });

  it('_merge_source es "ai_only" cuando solo hay phase_data', () => {
    const aiOnly = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        phase_data: {
          finer_results: { reviews: ['A'] },
        },
      }),
    );
    expect(aiOnly.phases.finer_results!._merge_source).toBe('ai_only');
  });

  it('_merge_source es "user_override" cuando solo hay user_edits sin IA', () => {
    const userOnly = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        user_edits: {
          finer_results: { manual_entry: 'escrito a mano' },
        },
      }),
    );
    expect(userOnly.phases.finer_results!._merge_source).toBe('user_override');
  });

  it('incluye _orchestrator_version y _generated_at en el output raiz', () => {
    expect(result._orchestrator_version).toBe('2.0.0');
    expect(result._generated_at).toBeDefined();
    expect(new Date(result._generated_at).toISOString()).toBe(result._generated_at);
  });

  it('project_id y fase_actual se reflejan correctamente', () => {
    expect(result.project_id).toBe('proj_test_001');
    expect(result.fase_actual).toBe(1);
  });
});

// ============================================================================
// 6. HELPERS — extractCurrentPhaseData & getPhaseKey
// ============================================================================

describe('Helpers', () => {
  it('extractCurrentPhaseData devuelve solo la fase actual', () => {
    const result = orchestrateGalateaData(
      makeInput({
        current_phase: 4,
        phase_data: {
          research_question: { q: 'pregunta' },
          finer_results: { finer_feasible: 9 },
        },
      }),
    );

    const current = extractCurrentPhaseData(result);
    expect(current).not.toBeNull();
    expect(current!.finer_feasible).toBe(9);
    expect(current).not.toHaveProperty('q');
  });

  it('getPhaseKey mapea numeros a claves correctas', () => {
    expect(getPhaseKey(0)).toBe('research_question');
    expect(getPhaseKey(1)).toBe('research_question');
    expect(getPhaseKey(2)).toBe('research_question');
    expect(getPhaseKey(3)).toBe('research_question');
    expect(getPhaseKey(4)).toBe('finer_results');
    expect(getPhaseKey(5)).toBe('finer_results');
    expect(getPhaseKey(6)).toBe('finer_results');
    expect(getPhaseKey(7)).toBe('search_strategy');
    expect(getPhaseKey(8)).toBe('protocol_draft');
    expect(getPhaseKey(9)).toBe('protocol_draft');
    expect(getPhaseKey(10)).toBe('protocol_draft');
  });

  it('getPhaseKey lanza error para fase invalida', () => {
    expect(() => getPhaseKey(11)).toThrow(OrchestratorError);
    expect(() => getPhaseKey(-1)).toThrow(OrchestratorError);
  });
});
