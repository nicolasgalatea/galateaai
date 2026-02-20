/**
 * AgentClinicianNavigator - Single Source of Truth para Research Lab v2
 *
 * Responsabilidades:
 * 1. Orquestacion n8n via useN8nOrchestration
 * 2. Fetch inicial de research_projects para sincronizar fase del Stepper
 * 3. Suscripcion Realtime a research_projects (UPDATE) con toast de exito
 * 4. Exposicion de datos PICO/metodologia para MethodologyDisplay
 * 5. FINER gate: bloquea avance si aprobado === false (fase 4)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useN8nOrchestration } from '@/hooks/useN8nOrchestration';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { N8N_RESEARCH_LAB_V2_WEBHOOK } from '@/config/researchLabAgents';
import {
  getResearchLabAgentByPhase,
  type ResearchLabPhaseNumber,
} from '@/config/researchLabAgents';
import type { ResearchProject, FinerOutput, FinerScores } from '@/types/domain';
import type { OrchestrationConfig, UseN8nOrchestrationReturn, AgentOutput } from '@/hooks/useN8nOrchestration';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type { AgentOutput, OrchestrationConfig, UseN8nOrchestrationReturn };

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface PicoData {
  P: string | null;
  I: string | null;
  C: string | null;
  O: string | null;
  T: string | null;
}

export interface MethodologyData {
  pico_data: PicoData | null;
  pregunta_final: string | null;
  tipo_estudio: string | null;
  modelo_pregunta: string | null;
}

export interface UseAgentClinicianNavigatorReturn extends UseN8nOrchestrationReturn {
  /** Ejecuta Fase 0-1 del Research Lab (Arquitecto) */
  processResearchLabPhase01: (projectId: string, userTopic: string) => Promise<Record<string, unknown> | void>;

  /** Reinicia el flujo: limpia progreso y re-ejecuta Fase 0-1 con un tema ajustado */
  retryPhase01: (userTopic: string) => Promise<void>;

  /** Proyecto completo de research_projects (Single Source of Truth) */
  researchProject: ResearchProject | null;

  /** Fase actual derivada del progreso en Supabase (0-10). Bloqueada en 4 si FINER no aprobado. */
  currentResearchLabPhase: ResearchLabPhaseNumber;

  /** Datos PICO + pregunta_final del Arquitecto (research_question) */
  methodologyData: MethodologyData | null;

  /** Output tipado del Metodólogo (finer_results) */
  finerOutput: FinerOutput | null;

  /** true si el Agente 2 aprobo el test FINER. false bloquea el avance a Fase 7. */
  isFinerApproved: boolean;

  /** Indica si se esta cargando el progreso inicial */
  isLoadingProgress: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

// Doble Cast para tabla no autogenerada
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

/**
 * Deriva la fase actual directamente del campo current_phase.
 * FINER Gate: si phase >= 7 y finer_results existe pero aprobado === false, bloquea en 4.
 */
function deriveCurrentPhase(project: ResearchProject | null): ResearchLabPhaseNumber {
  if (!project) return 0;

  // Number() garantiza conversion segura — Supabase Realtime puede enviar string
  const phase = Math.min(Math.max(Number(project.current_phase) || 0, 0), 10) as ResearchLabPhaseNumber;

  // FINER Gate: si hemos avanzado más allá de fase 7 pero FINER no aprobado, bloquear en 4
  if (phase >= 7 && project.finer_results != null) {
    const finerApproved = resolveFinerApproval(project);
    if (!finerApproved) {
      return 4;
    }
  }

  return phase;
}

/**
 * Resuelve si FINER esta aprobado consultando finer_results.aprobado
 */
function resolveFinerApproval(project: ResearchProject | null): boolean {
  if (!project) return false;

  if (project.finer_results != null) {
    const output = project.finer_results as Record<string, unknown>;
    return output.aprobado === true;
  }

  return false;
}

/**
 * Extrae datos tipados del FINER output (finer_results, Agente 2 - Metodólogo)
 */
function extractFinerOutput(project: ResearchProject | null): FinerOutput | null {
  if (!project?.finer_results) return null;

  const output = project.finer_results as Record<string, unknown>;

  const rawScores = output.finer_scores as Record<string, unknown> | undefined;
  const finer_scores: FinerScores | null = rawScores
    ? {
        feasible: typeof rawScores.feasible === 'number' ? rawScores.feasible : null,
        interesting: typeof rawScores.interesting === 'number' ? rawScores.interesting : null,
        novel: typeof rawScores.novel === 'number' ? rawScores.novel : null,
        ethical: typeof rawScores.ethical === 'number' ? rawScores.ethical : null,
        relevant: typeof rawScores.relevant === 'number' ? rawScores.relevant : null,
      }
    : null;

  return {
    finer_scores,
    aprobado: output.aprobado === true,
    recomendaciones: (output.recomendaciones as string) ?? null,
    hipotesis: (output.hipotesis as string) ?? null,
  };
}

/**
 * Extrae datos PICO y pregunta_final del output de research_question (Arquitecto)
 */
function extractMethodologyData(project: ResearchProject | null): MethodologyData | null {
  if (!project?.research_question) return null;

  const output = project.research_question as Record<string, unknown>;

  const rawPico = output.pico_data as Record<string, unknown> | undefined;
  const pico_data: PicoData = rawPico
    ? {
        P: (rawPico.P as string) ?? (rawPico.population as string) ?? null,
        I: (rawPico.I as string) ?? (rawPico.intervention as string) ?? null,
        C: (rawPico.C as string) ?? (rawPico.comparison as string) ?? null,
        O: (rawPico.O as string) ?? (rawPico.outcome as string) ?? null,
        T: (rawPico.T as string) ?? (rawPico.timeframe as string) ?? null,
      }
    : {
        P: (output.P as string) ?? (output.population as string) ?? null,
        I: (output.I as string) ?? (output.intervention as string) ?? null,
        C: (output.C as string) ?? (output.comparison as string) ?? null,
        O: (output.O as string) ?? (output.outcome as string) ?? null,
        T: (output.T as string) ?? (output.timeframe as string) ?? null,
      };

  return {
    pico_data,
    pregunta_final: (output.pregunta_final as string) ?? (output.pregunta_estructurada as string) ?? null,
    tipo_estudio: (output.tipo_estudio as string) ?? null,
    modelo_pregunta: (output.modelo_pregunta as string) ?? null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function useAgentClinicianNavigator(config: OrchestrationConfig): UseAgentClinicianNavigatorReturn {
  const { toast } = useToast();
  const orchestration = useN8nOrchestration(config);
  const { projectId } = orchestration;

  // ─── Estado local de progreso Research Lab ───
  const [researchProject, setResearchProject] = useState<ResearchProject | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  // ═══════════════════════════════════════════════════════════════════════
  // 1. FETCH — Funcion reutilizable para cargar research_projects
  // ═══════════════════════════════════════════════════════════════════════

  const refetchProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingProgress(true);
    try {
      const { data, error } = await (supabase
        .from('research_projects' as AnyQuery)
        .select('*')
        .eq('id', projectId)
        .maybeSingle() as unknown as Promise<{
          data: unknown;
          error: { message: string } | null;
        }>);

      if (error) {
        console.error('[ClinicalNavigator] Error fetching research_projects:', error.message);
        return;
      }

      if (isMountedRef.current) {
        if (data) {
          const raw = data as Record<string, unknown>;
          setResearchProject({
            ...(raw as unknown as ResearchProject),
            current_phase: Number(raw.current_phase) || 0,
          });
        } else {
          setResearchProject(null);
        }
      }
    } catch (err) {
      console.error('[ClinicalNavigator] Unexpected error fetching progress:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingProgress(false);
      }
    }
  }, [projectId]);

  // Fetch inicial al montar
  useEffect(() => {
    refetchProject();
  }, [refetchProject]);

  // ═══════════════════════════════════════════════════════════════════════
  // 1b. LISTENER — investigator-refetch (disparado por el chat de n8n)
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!projectId) return;

    const handleRefetch = (e: Event) => {
      const detail = (e as CustomEvent).detail as { projectId?: string } | undefined;
      // Si el evento incluye projectId, solo refetch si coincide con el nuestro
      if (detail?.projectId && detail.projectId !== projectId) return;

      console.log('[ClinicalNavigator] investigator-refetch recibido, refetching project', projectId);
      refetchProject();
    };

    window.addEventListener('investigator-refetch', handleRefetch);
    return () => window.removeEventListener('investigator-refetch', handleRefetch);
  }, [projectId, refetchProject]);

  // ═══════════════════════════════════════════════════════════════════════
  // 2. REALTIME — Suscripcion a UPDATE en research_projects
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!projectId) return;

    const channelName = `research_projects_${projectId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'research_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          if (!isMountedRef.current) return;

          const raw = payload.new as Record<string, unknown>;
          // Normalizar current_phase a numero — Realtime puede enviar string
          const updated: ResearchProject = {
            ...(raw as unknown as ResearchProject),
            current_phase: Number(raw.current_phase) || 0,
          };
          setResearchProject(updated);

          // Derivar que fase se acaba de completar
          const phase = deriveCurrentPhase(updated);
          const agent = getResearchLabAgentByPhase(
            Math.max(0, phase - 1) as ResearchLabPhaseNumber
          );
          const agentName = agent?.displayNameEs ?? `Fase ${phase}`;

          toast({
            title: 'IA completada',
            description: `${agentName} ha finalizado. Progreso actualizado.`,
          });

          // Si n8n incluyo metadata.requires_refetch, forzar recarga completa
          const metadata = raw.metadata as Record<string, unknown> | undefined;
          if (metadata?.requires_refetch === true) {
            console.log('[ClinicalNavigator] metadata.requires_refetch detectado en Realtime, refetching');
            refetchProject();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'research_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          if (!isMountedRef.current) return;
          const raw = payload.new as Record<string, unknown>;
          setResearchProject({
            ...(raw as unknown as ResearchProject),
            current_phase: Number(raw.current_phase) || 0,
          });
        }
      );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[ClinicalNavigator] Realtime suscrito a research_projects (${projectId})`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[ClinicalNavigator] Error en canal Realtime research_projects`);
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [projectId, toast, refetchProject]);

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // 3. DERIVADOS — currentPhase, methodologyData, FINER
  // ═══════════════════════════════════════════════════════════════════════

  const currentResearchLabPhase = deriveCurrentPhase(researchProject);
  const methodologyData = extractMethodologyData(researchProject);
  const finerOutput = extractFinerOutput(researchProject);
  const isFinerApproved = resolveFinerApproval(researchProject);

  // ═══════════════════════════════════════════════════════════════════════
  // 4. FASE 0-1 — Arquitecto
  // ═══════════════════════════════════════════════════════════════════════

  const processResearchLabPhase01 = useCallback(
    async (targetProjectId: string, userTopic: string): Promise<Record<string, unknown> | void> => {
      try {
        const response = await fetch(N8N_RESEARCH_LAB_V2_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'START_PHASE_0_1',
            projectId: targetProjectId,
            inputData: { topic: userTopic },
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const statusText = response.statusText || `HTTP ${response.status}`;
          toast({
            variant: 'destructive',
            title: 'Error de conexion con n8n',
            description: `El servicio no respondio correctamente (${statusText}). Compruebe que el workflow Research Lab v2 esta activo.`,
          });
          throw new Error(`n8n responded with ${response.status}: ${statusText}`);
        }

        const result = (await response.json()) as Record<string, unknown>;
        const output = result && typeof result === 'object' && 'output' in result
          ? (result.output as Record<string, unknown>)
          : result;

        // Leer current_phase de la respuesta de n8n, con Number() para seguridad de tipos
        const phaseFromN8n = result.current_phase != null ? Number(result.current_phase) : 1;
        const safePhase = Number.isFinite(phaseFromN8n) ? phaseFromN8n : 1;

        const { error } = await (supabase
          .from('research_projects' as AnyQuery)
          .upsert(
            {
              id: targetProjectId,
              user_id: 'system',
              current_phase: safePhase,
              research_question: (output as Record<string, unknown>) ?? null,
              user_edits_json: {},
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          ) as unknown as Promise<{
            error: { message: string } | null;
          }>);

        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error al guardar el progreso',
            description: error.message,
          });
          throw error;
        }

        // Si n8n indica requires_refetch en metadata, recargar datos completos
        const metadata = result.metadata as Record<string, unknown> | undefined;
        if (metadata?.requires_refetch === true) {
          console.log('[ClinicalNavigator] metadata.requires_refetch en respuesta webhook, refetching');
          refetchProject();
        }

        toast({
          title: `Fase ${safePhase} completada`,
          description: 'La idea ha sido procesada y guardada correctamente.',
        });
        return (output as Record<string, unknown>) ?? undefined;
      } catch (err) {
        if (err instanceof Error && err.message.startsWith('n8n responded with')) throw err;
        console.error('[ClinicalNavigator] Research Lab Phase 0-1:', err);
        toast({
          variant: 'destructive',
          title: 'Error en Research Lab',
          description: 'No se pudo procesar la Fase 0-1. Compruebe su conexion y que el workflow de n8n este en ejecucion.',
        });
      }
    },
    [toast, refetchProject]
  );

  // ═══════════════════════════════════════════════════════════════════════
  // 5. RETRY FASE 0-1 — Limpiar progreso y re-ejecutar con idea ajustada
  // ═══════════════════════════════════════════════════════════════════════

  const retryPhase01 = useCallback(
    async (userTopic: string): Promise<void> => {
      if (!projectId) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No hay un proyecto activo para reiniciar.',
        });
        return;
      }

      try {
        // Limpiar todas las columnas semanticas y resetear a fase 0
        const { error } = await (supabase
          .from('research_projects' as AnyQuery)
          .update({
            current_phase: 0,
            research_question: null,
            finer_results: null,
            search_strategy: null,
            protocol_draft: null,
            manuscript_draft: null,
            statistical_plan: null,
            user_edits_json: {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId) as unknown as Promise<{
            error: { message: string } | null;
          }>);

        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error al reiniciar progreso',
            description: error.message,
          });
          throw error;
        }

        // Actualizar estado local inmediatamente
        setResearchProject((prev) =>
          prev
            ? {
                ...prev,
                current_phase: 0,
                research_question: null,
                finer_results: null,
                search_strategy: null,
                protocol_draft: null,
                manuscript_draft: null,
                statistical_plan: null,
              }
            : prev
        );

        toast({
          title: 'Progreso reiniciado',
          description: 'Re-ejecutando Fase 0-1 con la idea ajustada...',
        });

        // Re-ejecutar Fase 0-1
        await processResearchLabPhase01(projectId, userTopic);
      } catch (err) {
        console.error('[ClinicalNavigator] retryPhase01:', err);
      }
    },
    [projectId, toast, processResearchLabPhase01]
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RETORNO
  // ═══════════════════════════════════════════════════════════════════════

  return {
    ...orchestration,
    processResearchLabPhase01,
    retryPhase01,
    researchProject,
    currentResearchLabPhase,
    methodologyData,
    finerOutput,
    isFinerApproved,
    isLoadingProgress,
  };
}
