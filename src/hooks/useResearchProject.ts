import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createProject as createProjectService, fetchProjectById, triggerN8N } from '@/services/apiService';
import type { Project, ResearchProject as ResearchProjectType } from '@/types/domain';
import type { ApiErrorDetail } from '@/services/apiService';

// Re-export for consumers (ResearchDashboard.tsx)
export type ResearchProject = ResearchProjectType;

// ═══════════════════════════════════════════════════════════════
// PHASE_CONFIG — Configuracion de las 11 fases (0-10)
// ═══════════════════════════════════════════════════════════════
export interface PhaseConfigEntry {
  id: number;
  name: string;
  description: string;
  agents: string[];
}

export const PHASE_CONFIG: PhaseConfigEntry[] = [
  { id: 0, name: 'Inicio', description: 'Idea general de investigacion', agents: ['arquitecto'] },
  { id: 1, name: 'Planteamiento', description: 'Definir pregunta de investigacion', agents: ['arquitecto'] },
  { id: 2, name: 'Contexto Regional', description: 'Analisis de contexto y vacios', agents: ['arquitecto'] },
  { id: 3, name: 'PICOT', description: 'Estructurar pregunta PICOT', agents: ['arquitecto'] },
  { id: 4, name: 'Test FINER', description: 'Evaluar viabilidad y relevancia', agents: ['metodologo'] },
  { id: 5, name: 'Hipotesis', description: 'Generar hipotesis de trabajo', agents: ['metodologo'] },
  { id: 6, name: 'Estructura', description: 'Definir estructura y carpetas', agents: ['metodologo'] },
  { id: 7, name: 'Ecuacion Booleana', description: 'Estrategia de busqueda sistematica', agents: ['evidencia'] },
  { id: 8, name: 'Protocolo', description: 'Redactar protocolo de investigacion', agents: ['redactor'] },
  { id: 9, name: 'Manuscrito', description: 'Redactar manuscrito cientifico', agents: ['redactor'] },
  { id: 10, name: 'Completado', description: 'Revision y validacion final', agents: ['redactor'] },
];

// ═══════════════════════════════════════════════════════════════
// AGENT_NAMES — Nombres legibles de los agentes
// ═══════════════════════════════════════════════════════════════
export const AGENT_NAMES: Record<string, string> = {
  arquitecto: 'Arquitecto',
  metodologo: 'Metodologo',
  evidencia: 'Evidencia',
  redactor: 'Redactor',
};

export interface CreateProjectData {
  title: string;
  research_question: string;
}

export interface UpdateProjectData {
  [key: string]: unknown;
}

const RESEARCH_PROJECT_COLUMNS =
  'id,title,description,research_question,phase,current_agent_step,created_at';

const filterProjectUpdates = (updates: UpdateProjectData): UpdateProjectData => {
  const allowedKeys = new Set([
    'title',
    'description',
    'research_question',
    'phase',
    'current_agent_step',
  ]);
  return Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedKeys.has(key))
  );
};

export interface CreateProjectResult {
  project: Project | null;
  error: ApiErrorDetail | null;
}

export function useResearchProject(projectId?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cargar proyecto existente
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await fetchProjectById(id);
      if (fetchError) throw fetchError;
      setProject(data);
    } catch (err: unknown) {
      const fetchError = err as ApiErrorDetail;
      if (fetchError?.status === 400) {
        console.warn('Supabase 400 on loadProject, returning empty result:', fetchError);
        setProject(null);
        return;
      }
      if (fetchError?.status === 406 || fetchError?.code === 'PGRST116') {
        navigate('/research/new', { replace: true });
        return;
      }
      const message = fetchError?.message || 'Error al cargar proyecto';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, navigate]);

  // Crear nuevo proyecto
  const createProject = useCallback(async (data: CreateProjectData): Promise<CreateProjectResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: createdProject, error: insertError } = await createProjectService({
        title: data.title,
        research_question: data.research_question,
      });

      if (insertError || !createdProject) {
        return { project: null, error: insertError };
      }

      setProject(createdProject as Project);
      navigate(`/research/${createdProject.id}`, { replace: true });
      toast({
        title: 'Proyecto creado',
        description: 'Tu proyecto de investigacion ha sido creado exitosamente.',
      });

      return { project: createdProject as Project, error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear proyecto';
      setError(message);
      return { project: null, error: { message } };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Actualizar proyecto
  const updateProject = useCallback(async (updates: UpdateProjectData): Promise<boolean> => {
    if (!project) return false;

    setIsLoading(true);
    setError(null);

    try {
      const filteredUpdates = filterProjectUpdates(updates);
      const { data: updatedProject, error: updateError } = await (supabase as any)
        .from('agent_projects')
        .update(filteredUpdates)
        .eq('id', project.id)
        .select(RESEARCH_PROJECT_COLUMNS)
        .single();

      if (updateError) throw updateError;

      setProject(updatedProject as Project);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar proyecto';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [project, toast]);

  // Avanzar al siguiente agente
  const advanceToNextAgent = useCallback(async (): Promise<boolean> => {
    if (!project) return false;

    const nextStep = project.current_agent_step + 1;

    // Si completamos el agente 8, cambiar a AWAITING_APPROVAL
    if (project.current_agent_step === 8 && project.phase === 'PROTOCOL_GENERATION') {
      return updateProject({
        current_agent_step: nextStep,
        phase: 'AWAITING_APPROVAL',
      });
    }

    // Si completamos el agente 14, cambiar a COMPLETED
    if (nextStep > 14) {
      return updateProject({
        phase: 'COMPLETED',
      });
    }

    // Just update local state for step tracking
    return updateProject({ current_agent_step: nextStep });
  }, [project, updateProject]);

  // Aprobar protocolo y desbloquear Fase 2
  const approveProtocol = useCallback(async (notes?: string): Promise<boolean> => {
    if (!project || project.phase !== 'AWAITING_APPROVAL') {
      toast({
        title: 'Error',
        description: 'El proyecto debe estar en estado de espera de aprobacion.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // 1. Actualizar estado del proyecto
      const success = await updateProject({
        phase: 'EXECUTING_REVIEW',
        current_agent_step: 9,
      });

      if (!success) {
        throw new Error('Error al actualizar el proyecto');
      }

      // 2. Llamar al webhook de n8n para iniciar Fase 2
      try {
        const response = await triggerN8N({
          phase: 'review',
          projectId: project.id,
          title: project.title,
          research_question: project.research_question || '',
        });

        if (!response.success) {
          console.warn('Webhook de n8n no respondio correctamente:', response.error);
        } else {
          console.log('Webhook de Fase 2 llamado exitosamente');
          // El estado se sincronizara automaticamente mediante la suscripcion en tiempo real
        }
      } catch (webhookError) {
        console.warn('Error al llamar webhook de n8n (no critico):', webhookError);
        // No fallar la aprobacion si el webhook falla
      }

      toast({
        title: 'Protocolo aprobado',
        description: 'Fase 2 desbloqueada. Iniciando ejecucion de la revision sistematica.',
      });

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al aprobar protocolo';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  }, [project, updateProject, toast]);

  // Suscripcion en tiempo real a cambios del proyecto (sincronización con n8n)
  useEffect(() => {
    if (!projectId) return;

    loadProject(projectId);

    const channel = supabase
      .channel(`research_project_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Cambio detectado en proyecto (sincronizacion desde n8n):', payload.eventType);
          if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as Project;
            const oldPhase = project?.phase;
            setProject(updatedProject);
            console.log('Proyecto actualizado:', {
              phase: updatedProject.phase,
              current_agent_step: updatedProject.current_agent_step,
              status_changed: oldPhase !== updatedProject.phase,
            });

            // Si el status cambio a AWAITING_APPROVAL, el modal se mostrara automaticamente
            // mediante el useEffect en ResearchProjectDashboard
          } else if (payload.eventType === 'DELETE') {
            setProject(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, loadProject]);

  // ── Stubs consumed by ResearchDashboard.tsx ──
  const status = project?.phase ?? 'idle';
  const isSaving = false;

  const saveUserEdit = useCallback(async (_phaseKey: string, _field: string, _value: unknown): Promise<void> => {
    // Stub — autosave handled by research-sync-service in the v2 flow
  }, []);

  const approvePhase = useCallback(async (_phaseId?: number): Promise<void> => {
    await approveProtocol();
  }, [approveProtocol]);

  const syncWithAI = useCallback(async () => {
    // Stub — sync triggered by n8n webhooks in v2 flow
  }, []);

  const getPhaseData = useCallback((_phaseId: number): Record<string, unknown> | null => {
    return null;
  }, []);

  const getPhaseEdits = useCallback((_phaseId: number): Record<string, unknown> => {
    return {};
  }, []);

  const fetchProject = loadProject;

  return {
    project,
    isLoading,
    error,
    status,
    isSaving,
    createProject,
    updateProject,
    advanceToNextAgent,
    approveProtocol,
    approvePhase,
    saveUserEdit,
    syncWithAI,
    getPhaseData,
    getPhaseEdits,
    fetchProject,
    loadProject,
  };
}
