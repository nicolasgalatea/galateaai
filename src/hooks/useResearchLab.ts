import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ── Constants ──
const N8N_WEBHOOK_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';
const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

// ── 10 Phases ──
export const LAB_PHASES = [
  { id: 1, name: 'Ideación', description: 'Análisis del problema clínico', outputKey: 'fase_0_1_output' },
  { id: 2, name: 'Análisis Clínico', description: 'Contexto y literatura', outputKey: 'fase_0_1_output' },
  { id: 3, name: 'PICOT', description: 'Pregunta estructurada PICOT', outputKey: 'fase_2_3_output' },
  { id: 4, name: 'Metodología', description: 'Diseño metodológico', outputKey: 'fase_2_3_output' },
  { id: 5, name: 'Viabilidad', description: 'Análisis FINER', outputKey: 'fase_4_5_output' },
  { id: 6, name: 'Criterios', description: 'Criterios de inclusión/exclusión', outputKey: 'fase_4_5_output' },
  { id: 7, name: 'Búsqueda', description: 'Ecuaciones MeSH y estrategia', outputKey: 'fase_6_7_output' },
  { id: 8, name: 'Protocolo', description: 'Protocolo PRISMA-P', outputKey: 'fase_6_7_output' },
  { id: 9, name: 'Extracción', description: 'PRISMA flow y datos', outputKey: 'fase_8_9_output' },
  { id: 10, name: 'Síntesis', description: 'Manuscrito y meta-análisis', outputKey: 'fase_8_9_output' },
] as const;

export type LabOutputKey = 'fase_0_1_output' | 'fase_2_3_output' | 'fase_4_5_output' | 'fase_6_7_output' | 'fase_8_9_output';

export interface ResearchLabProgress {
  id: string;
  project_id: string;
  research_question: string | null;
  fase_actual: number;
  fase_0_1_output: Record<string, unknown> | null;
  fase_2_3_output: Record<string, unknown> | null;
  fase_4_5_output: Record<string, unknown> | null;
  fase_6_7_output: Record<string, unknown> | null;
  fase_8_9_output: Record<string, unknown> | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type LabStatus = 'idle' | 'processing' | 'paused' | 'completed' | 'error';

// ── Safe JSON parser ──
function safeParse(val: unknown): Record<string, unknown> | null {
  if (!val) return null;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch { /* not valid JSON */ }
    return null;
  }
  if (typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, unknown>;
  }
  return null;
}

export function useResearchLab() {
  const [progress, setProgress] = useState<ResearchLabProgress | null>(null);
  const [labStatus, setLabStatus] = useState<LabStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Derive UI status from DB record ──
  const deriveStatus = useCallback((record: ResearchLabProgress) => {
    const s = record.status;
    if (s === 'error') setLabStatus('error');
    else if (s === 'completed') setLabStatus('completed');
    else if (s === 'paused') setLabStatus('paused');
    else if (s === 'processing' || s === 'active') setLabStatus('processing');
    else setLabStatus('idle');
  }, []);

  // ── Subscribe to realtime changes ──
  const subscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    console.log('[ResearchLab] Subscribing to realtime for project:', FIXED_PROJECT_ID);

    channelRef.current = supabase
      .channel('research_lab_progress_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_lab_progress',
          filter: `project_id=eq.${FIXED_PROJECT_ID}`,
        },
        (payload) => {
          try {
            console.log('[ResearchLab] Realtime event:', payload.eventType, '| Full payload.new:', JSON.stringify(payload.new, null, 2));
            const record = payload.new as ResearchLabProgress;
            if (!record) return;

            // Parse output columns that may arrive as JSON strings
            const outputKeys: LabOutputKey[] = ['fase_0_1_output', 'fase_2_3_output', 'fase_4_5_output', 'fase_6_7_output', 'fase_8_9_output'];
            for (const key of outputKeys) {
              if (record[key]) {
                record[key] = safeParse(record[key]) as any;
              }
            }

            setProgress(record);
            deriveStatus(record);

            if (record.status === 'paused') {
              console.log('[ResearchLab] ✅ Status paused — Siguiente button enabled');
            }
          } catch (err) {
            console.error('[ResearchLab] Error processing realtime payload:', err);
          }
        }
      )
      .subscribe((st) => {
        console.log('[ResearchLab] Subscription status:', st);
      });
  }, [deriveStatus]);

  // ── Fetch existing progress ──
  const fetchProgress = useCallback(async () => {
    const { data, error } = await supabase
      .from('research_lab_progress')
      .select('*')
      .eq('project_id', FIXED_PROJECT_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[ResearchLab] Fetch error:', error.message);
      return;
    }
    if (data) {
      const record = data as unknown as ResearchLabProgress;
      setProgress(record);
      deriveStatus(record);
    }
  }, [deriveStatus]);

  // ── Start research (Phase 1) ──
  const startResearch = async (researchQuestion: string) => {
    setIsLoading(true);
    setLabStatus('processing');
    setProgress(null);

    try {
      const payload = {
        action: 'START_RESEARCH_LAB',
        projectId: FIXED_PROJECT_ID,
        phaseNumber: 1,
        inputData: { research_question: researchQuestion },
      };

      console.log('[ResearchLab] Starting research:', payload);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[ResearchLab] Webhook response status:', response.status);
    } catch (err) {
      console.error('[ResearchLab] Webhook fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Generic: advance to any phase ──
  const advanceToPhase = async (phaseNumber: number) => {
    setLabStatus('processing');

    try {
      const payload = {
        action: 'START_PHASE',
        projectId: FIXED_PROJECT_ID,
        phaseNumber,
      };

      console.log(`[ResearchLab] Advancing to Phase ${phaseNumber}:`, payload);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`[ResearchLab] Phase ${phaseNumber} response status:`, response.status);
    } catch (err) {
      console.error(`[ResearchLab] Phase ${phaseNumber} webhook error:`, err);
    }
  };

  // ── Get phase output data ──
  const getPhaseOutput = useCallback((phaseNumber: number): Record<string, unknown> | null => {
    if (!progress) return null;
    const phase = LAB_PHASES.find(p => p.id === phaseNumber);
    if (!phase) return null;
    const raw = progress[phase.outputKey as keyof ResearchLabProgress];
    return safeParse(raw);
  }, [progress]);

  // ── Cleanup ──
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    subscribe();
    fetchProgress();
    return cleanup;
  }, [subscribe, fetchProgress, cleanup]);

  return {
    progress,
    labStatus,
    isLoading,
    startResearch,
    advanceToPhase,
    getPhaseOutput,
    fetchProgress,
    cleanup,
    projectId: FIXED_PROJECT_ID,
  };
}
