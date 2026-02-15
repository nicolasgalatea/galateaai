import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ── Constants ──
const N8N_WEBHOOK_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';
const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

// ── Phase configuration ──
export const PHASE_CONFIG = [
  { id: 1, name: 'Idea', description: 'Definición del problema clínico', agents: [1] },
  { id: 2, name: 'PICOT', description: 'Pregunta estructurada PICOT', agents: [1] },
  { id: 3, name: 'Validación', description: 'Validación FINER y gap analysis', agents: [2, 3] },
  { id: 4, name: 'Criterios', description: 'Criterios de inclusión/exclusión', agents: [4] },
  { id: 5, name: 'Registro', description: 'Verificación PROSPERO y sesgos', agents: [5, 6] },
  { id: 6, name: 'Búsqueda', description: 'Estrategia de búsqueda MeSH', agents: [7] },
  { id: 7, name: 'Protocolo', description: 'Protocolo PRISMA-P completo', agents: [8] },
  { id: 8, name: 'Ejecución', description: 'PRISMA flow y extracción de datos', agents: [9, 10] },
  { id: 9, name: 'Calidad', description: 'Auditoría de calidad y meta-análisis', agents: [11, 12] },
  { id: 10, name: 'Manuscrito', description: 'GRADE y dossier final', agents: [13, 14] },
] as const;

export const AGENT_NAMES: Record<number, string> = {
  1: 'PICOT Builder',
  2: 'FINER Validator',
  3: 'Literature Scout',
  4: 'Criteria Designer',
  5: 'PROSPERO Checker',
  6: 'Bias Assessor',
  7: 'Yadav Strategist',
  8: 'Protocol Architect',
  9: 'PRISMA Navigator',
  10: 'Data Extractor',
  11: 'Quality Auditor',
  12: 'Meta-Analyst',
  13: 'Evidence Grader',
  14: 'Report Generator',
};

export interface ResearchProject {
  id: string;
  project_id: string;
  title: string;
  research_question: string | null;
  current_phase: number;
  status: string;
  phase_data: Record<string, unknown>;
  user_edits: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'idle' | 'executing' | 'paused' | 'completed' | 'error';

export function useResearchProject() {
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [status, setStatus] = useState<ProjectStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Derive status from DB record ──
  const deriveStatus = useCallback((record: ResearchProject) => {
    const s = record.status;
    if (s === 'executing') setStatus('executing');
    else if (s === 'completed') setStatus('completed');
    else if (s === 'error') setStatus('error');
    else if (s === 'paused') setStatus('paused');
    else if (record.current_phase > 1) setStatus('paused');
    else setStatus('idle');
  }, []);

  // ── Subscribe to realtime changes ──
  const subscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    channelRef.current = supabase
      .channel('research_projects_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_projects',
          filter: `project_id=eq.${FIXED_PROJECT_ID}`,
        },
        (payload) => {
          console.log('[ResearchProject] Realtime event:', payload.eventType);
          const record = payload.new as ResearchProject;
          if (record) {
            setProject(record);
            deriveStatus(record);
          }
        }
      )
      .subscribe((st) => {
        console.log('[ResearchProject] Subscription status:', st);
      });
  }, [deriveStatus]);

  // ── Fetch existing project ──
  const fetchProject = useCallback(async () => {
    // Use raw query since types may not be updated yet
    const { data, error } = await (supabase as any)
      .from('research_projects')
      .select('*')
      .eq('project_id', FIXED_PROJECT_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[ResearchProject] Fetch error:', error.message);
      return;
    }
    if (data) {
      setProject(data as ResearchProject);
      deriveStatus(data as ResearchProject);
    }
  }, [deriveStatus]);

  // ── Create new project ──
  const createProject = async (title: string, researchQuestion: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('research_projects')
        .insert({
          project_id: FIXED_PROJECT_ID,
          title,
          research_question: researchQuestion,
          current_phase: 1,
          status: 'executing',
          phase_data: {},
          user_edits: {},
        })
        .select()
        .single();

      if (error) throw error;
      setProject(data as ResearchProject);
      setStatus('executing');

      // Fire webhook to n8n
      await triggerWebhook(data.id, 1, 'START');

      return data as ResearchProject;
    } catch (err: any) {
      console.error('[ResearchProject] Create error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Save user edit (JSON merge) ──
  const saveUserEdit = async (phaseKey: string, field: string, value: unknown) => {
    if (!project) return;
    setIsSaving(true);

    try {
      // Deep merge: preserve existing edits
      const currentEdits = (project.user_edits || {}) as Record<string, any>;
      const phaseEdits = currentEdits[phaseKey] || {};
      const mergedEdits = {
        ...currentEdits,
        [phaseKey]: {
          ...phaseEdits,
          [field]: value,
          _updated_at: new Date().toISOString(),
        },
      };

      const { error } = await (supabase as any)
        .from('research_projects')
        .update({ user_edits: mergedEdits })
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? { ...prev, user_edits: mergedEdits } : prev);

      toast({ title: 'Guardado', description: `Campo "${field}" actualizado en fase ${phaseKey}.` });
    } catch (err: any) {
      console.error('[ResearchProject] Save edit error:', err);
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Trigger n8n webhook ──
  const triggerWebhook = async (projectRowId: string, currentPhase: number, action = 'APPROVE') => {
    try {
      const payload = {
        action,
        projectId: FIXED_PROJECT_ID,
        rowId: projectRowId,
        current_phase: currentPhase,
        user_edits: project?.user_edits || {},
      };

      console.log('[ResearchProject] Webhook payload:', payload);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[ResearchProject] Webhook response:', response.status);
    } catch (err) {
      console.error('[ResearchProject] Webhook error:', err);
    }
  };

  // ── Sync with IA (the action button) ──
  const syncWithAI = async () => {
    if (!project) return;
    setStatus('executing');

    try {
      // Update status in DB
      await (supabase as any)
        .from('research_projects')
        .update({ status: 'executing' })
        .eq('id', project.id);

      // Fire webhook
      await triggerWebhook(project.id, project.current_phase, 'APPROVE');

      toast({
        title: 'Sincronización iniciada',
        description: `Enviando datos de la Fase ${project.current_phase} a la IA...`,
      });
    } catch (err: any) {
      console.error('[ResearchProject] Sync error:', err);
      setStatus('error');
    }
  };

  // ── Get phase data for a specific phase ──
  const getPhaseData = (phaseNumber: number): Record<string, unknown> | null => {
    if (!project?.phase_data) return null;
    const key = `fase_${phaseNumber}`;
    return (project.phase_data[key] as Record<string, unknown>) || null;
  };

  // ── Get user edits for a specific phase ──
  const getPhaseEdits = (phaseNumber: number): Record<string, unknown> => {
    if (!project?.user_edits) return {};
    const key = `fase_${phaseNumber}`;
    return (project.user_edits[key] as Record<string, unknown>) || {};
  };

  // ── Cleanup ──
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    subscribe();
    fetchProject();
    return cleanup;
  }, [subscribe, fetchProject, cleanup]);

  return {
    project,
    status,
    isLoading,
    isSaving,
    createProject,
    saveUserEdit,
    syncWithAI,
    getPhaseData,
    getPhaseEdits,
    fetchProject,
    cleanup,
    PHASE_CONFIG,
  };
}
