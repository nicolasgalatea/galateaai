import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ── Constants ──
const N8N_WEBHOOK_PHASE_1 = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';
const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

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

export type LabStatus = 'idle' | 'processing' | 'phase1_done' | 'phase2_processing' | 'completed' | 'error';

export function useResearchLab() {
  const [progress, setProgress] = useState<ResearchLabProgress | null>(null);
  const [labStatus, setLabStatus] = useState<LabStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

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
          console.log('[ResearchLab] Realtime event:', payload.eventType);
          const record = (payload.new as ResearchLabProgress) ?? null;
          if (record) {
            setProgress(record);
            deriveStatus(record);
          }
        }
      )
      .subscribe((status) => {
        console.log('[ResearchLab] Subscription status:', status);
      });
  }, []);

  // ── Derive UI status from DB record ──
  const deriveStatus = (record: ResearchLabProgress) => {
    if (record.status === 'error') {
      setLabStatus('error');
    } else if (record.status === 'completed') {
      setLabStatus('completed');
    } else if (record.fase_actual >= 4) {
      setLabStatus('phase2_processing');
    } else if (record.fase_actual >= 2 && record.fase_0_1_output) {
      setLabStatus('phase1_done');
    } else if (record.fase_actual >= 1) {
      setLabStatus('processing');
    } else {
      setLabStatus('idle');
    }
  };

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
  }, []);

  // ── Start Phase 0-1 (Ideador) ──
  const startResearch = async (researchQuestion: string) => {
    setIsLoading(true);
    setLabStatus('processing');
    setProgress(null);

    try {
      const payload = {
        action: 'START_RESEARCH_LAB',
        projectId: FIXED_PROJECT_ID,
        inputData: { research_question: researchQuestion },
      };

      console.log('[ResearchLab] Starting research:', payload);

      const response = await fetch(N8N_WEBHOOK_PHASE_1, {
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

  // ── Process Phase 2-3 ──
  const processPhase23 = async () => {
    setLabStatus('phase2_processing');

    try {
      const payload = {
        action: 'PHASE_2_3',
        projectId: FIXED_PROJECT_ID,
      };

      console.log('[ResearchLab] Advancing to Phase 2-3:', payload);

      const response = await fetch(N8N_WEBHOOK_PHASE_1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[ResearchLab] Phase 2-3 response status:', response.status);
    } catch (err) {
      console.error('[ResearchLab] Phase 2-3 webhook error:', err);
    }
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
    fetchProgress();
    return cleanup;
  }, [subscribe, fetchProgress, cleanup]);

  return {
    progress,
    labStatus,
    isLoading,
    startResearch,
    processPhase23,
    fetchProgress,
    cleanup,
    projectId: FIXED_PROJECT_ID,
  };
}
