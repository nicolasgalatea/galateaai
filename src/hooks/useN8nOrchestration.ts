import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { AgentExecution } from '@/types/domain';

// ── External Supabase config (n8n outputs) ──
const N8N_SUPABASE_URL = 'https://kwmfnysjxeqhgcdperkf.supabase.co';
const N8N_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3bWZueXNqeGVxaGdjZHBlcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQ3NDcsImV4cCI6MjA4MzgwMDc0N30.iAXnCyNkeSqyfkj2CIBTpfJzaQbGIvUEYxRfitvb510';
const N8N_WEBHOOK_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';

const externalSupabase = createClient(N8N_SUPABASE_URL, N8N_SUPABASE_ANON_KEY);

// ── Production constants (no artificial timeouts) ──
const RECONNECT_MAX_ATTEMPTS = 5;
const RECONNECT_BACKOFF_MS = 2000;
const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

// AgentExecution type imported from @/types/domain

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'processing' | 'fallback';

interface UseN8nOrchestrationOptions {
  onAgentOutput: (agentName: string, output: string, status: string) => void;
  onError: (error: string) => void;
  onFallback: () => void;
}

export const AGENT_NAME_TO_ID: Record<string, number> = {
  'PICOT Builder': 1,
  'MeSH Strategist': 2,
  'Literature Scout': 3,
  'FINER Validator': 4,
  'Study Designer': 5,
  'Objectives Generator': 6,
  'Criteria Definer': 7,
  'Protocol Synthesizer': 8,
  // Phase 2 agents
  'PRISMA Navigator': 9,
  'Data Extractor': 10,
  'Quality Auditor': 11,
  'Meta-Analyst': 12,
  'Evidence Grader': 13,
  'Report Generator': 14,
};

export function useN8nOrchestration(options: UseN8nOrchestrationOptions) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [receivedAgents, setReceivedAgents] = useState<Set<number>>(new Set());

  // ── Refs for sync logic & deduplication ──
  const channelRef = useRef<RealtimeChannel | null>(null);
  const optionsRef = useRef(options);
  const processedIdsRef = useRef<Set<string>>(new Set());
  const receivedAgentsRef = useRef<Set<number>>(new Set());
  const reconnectAttemptsRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const elapsed = () => `${((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s`;

  // ── Centralized record processor with deduplication ──
  const processRecord = useCallback((record: AgentExecution, isUpdate = false) => {
    // For INSERTs, skip duplicates. For UPDATEs, always reprocess.
    if (!isUpdate && processedIdsRef.current.has(record.id)) {
      console.log(`[n8n-Realtime] SKIP duplicate id=${record.id} agent=${record.agent_name} t=${elapsed()}`);
      return;
    }
    processedIdsRef.current.add(record.id);

    const agentId = AGENT_NAME_TO_ID[record.agent_name] ?? record.agent_number;
    if (agentId) {
      receivedAgentsRef.current = new Set([...receivedAgentsRef.current, agentId]);
      setReceivedAgents(new Set(receivedAgentsRef.current));
    }

    const outputText = record.content ?? record.output_markdown ?? JSON.stringify(record.output_result) ?? '';
    const effectiveStatus = record.status || (outputText ? 'completed' : 'in_progress');
    console.log(`[n8n-Realtime] PROCESSED agent="${record.agent_name}" id=${record.id} status=${effectiveStatus} content-len=${outputText?.length ?? 0} t=${elapsed()}`);
    optionsRef.current.onAgentOutput(record.agent_name, outputText, effectiveStatus);
  }, []);

  // ── Cleanup all resources ──
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log(`[n8n-Realtime] CLEANUP removing channel t=${elapsed()}`);
      externalSupabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    processedIdsRef.current = new Set();
    receivedAgentsRef.current = new Set();
    reconnectAttemptsRef.current = 0;
    setReceivedAgents(new Set());
  }, []);

  // ── Fetch existing outputs (initial sync) ──
  const fetchExistingOutputs = useCallback(async (pid: string) => {
    console.log(`[n8n-Realtime] FETCH starting for project=${pid} t=${elapsed()}`);
    try {
      const { data, error } = await externalSupabase
        .from('agent_executions')
        .select('*')
        .eq('project_id', pid)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`[n8n-Realtime] FETCH error:`, error.message);
        return;
      }
      console.log(`[n8n-Realtime] FETCH found ${data?.length ?? 0} existing executions t=${elapsed()}`);
      data?.forEach((r: AgentExecution) => processRecord(r as AgentExecution));
    } catch (err) {
      console.error(`[n8n-Realtime] FETCH exception:`, err);
    }
  }, [processRecord]);

  // ── Reconnect with exponential backoff (ref-based to avoid circular deps) ──
  const attemptReconnectRef = useRef<(pid: string) => Promise<void>>();

  const subscribeRef = useRef<(pid: string) => Promise<void>>();

  subscribeRef.current = (pid: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const channelName = `agent_executions_${pid}`;
      console.log(`[n8n-Realtime] SUBSCRIBE creating channel=${channelName} t=${elapsed()}`);

      channelRef.current = externalSupabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_executions',
            filter: `project_id=eq.${pid}`,
          },
          (payload) => {
            console.log(`[n8n-Realtime] INSERT received agent="${(payload.new as AgentExecution).agent_name}" t=${elapsed()}`);
            processRecord(payload.new as AgentExecution);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'agent_executions',
            filter: `project_id=eq.${pid}`,
          },
          (payload) => {
            const record = payload.new as AgentExecution;
            // Re-process on UPDATE when content becomes available
            if (record.content && record.content.trim().length > 0) {
              console.log(`[n8n-Realtime] UPDATE received agent="${record.agent_name}" content-len=${record.content.length} t=${elapsed()}`);
              processRecord(record, true);
            }
          }
        )
        .subscribe((status) => {
          console.log(`[n8n-Realtime] SUBSCRIBE status=${status} channel=${channelName} t=${elapsed()}`);
          switch (status) {
            case 'SUBSCRIBED':
              setConnectionStatus('connected');
              reconnectAttemptsRef.current = 0;
              resolve();
              break;
            case 'CHANNEL_ERROR':
            case 'CLOSED':
              console.warn(`[n8n-Realtime] Channel ${status} — attempting reconnect t=${elapsed()}`);
              attemptReconnectRef.current?.(pid).catch(() => reject(new Error(`Channel ${status} after max retries`)));
              break;
            case 'TIMED_OUT':
              console.error(`[n8n-Realtime] SUBSCRIBE TIMED_OUT t=${elapsed()}`);
              reject(new Error('Subscription timed out'));
              break;
          }
        });

      setTimeout(() => reject(new Error('Subscription timeout (60s)')), 60000);
    });
  };

  attemptReconnectRef.current = async (pid: string) => {
    if (reconnectAttemptsRef.current >= RECONNECT_MAX_ATTEMPTS) {
      console.error(`[n8n-Realtime] RECONNECT failed after ${RECONNECT_MAX_ATTEMPTS} attempts t=${elapsed()}`);
      setConnectionStatus('fallback');
      return;
    }
    reconnectAttemptsRef.current++;
    const backoff = RECONNECT_BACKOFF_MS * Math.pow(2, reconnectAttemptsRef.current - 1);
    console.log(`[n8n-Realtime] RECONNECT attempt ${reconnectAttemptsRef.current}/${RECONNECT_MAX_ATTEMPTS} backoff=${backoff}ms t=${elapsed()}`);

    if (channelRef.current) {
      externalSupabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    await new Promise(r => setTimeout(r, backoff));
    try {
      await subscribeRef.current?.(pid);
      console.log(`[n8n-Realtime] RECONNECT success on attempt ${reconnectAttemptsRef.current} t=${elapsed()}`);
    } catch {
      await attemptReconnectRef.current?.(pid);
    }
  };

  // ── Main orchestration entry point ──
  const startOrchestration = async (title: string, researchQuestion: string): Promise<{ projectId: string | null; success: boolean }> => {
    cleanup();
    setIsLoading(true);
    setConnectionStatus('connecting');
    startTimeRef.current = Date.now();

    setProjectId(FIXED_PROJECT_ID);
    processedIdsRef.current = new Set();
    receivedAgentsRef.current = new Set();
    reconnectAttemptsRef.current = 0;

    console.log(`[n8n-Realtime] START project=${FIXED_PROJECT_ID} t=0.0s`);

    try {
      // 1. Subscribe
      await subscribeRef.current?.(FIXED_PROJECT_ID);

      // 2. Initial sync
      await fetchExistingOutputs(FIXED_PROJECT_ID);

      // 3. POST to n8n webhook — static payload, no complex validations
      const payload = {
        action: 'START',
        projectId: FIXED_PROJECT_ID,
        research_question: researchQuestion,
      };
      console.log('🚀 Cohete lanzado con ID:', FIXED_PROJECT_ID);
      console.log('[n8n-Realtime] Payload enviado a n8n:', JSON.stringify(payload));

      try {
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (fetchErr) {
        // no-cors opaque responses may throw — ignore if projectId is valid
        console.warn(`[n8n-Realtime] fetch threw (expected in no-cors):`, fetchErr);
      }
      console.log(`[n8n-Realtime] WEBHOOK POST sent (no-cors bypass) t=${elapsed()}`);

      // 4. Always transition to 'processing' — delegate tracking to Realtime
      setConnectionStatus('processing');
      setIsLoading(false);
      return { projectId: FIXED_PROJECT_ID, success: true };
    } catch (error) {
      // Only errors from subscribe/fetch-existing reach here (not from webhook)
      console.error(`[n8n-Realtime] START error (subscription):`, error);
      optionsRef.current.onError(error instanceof Error ? error.message : 'Unknown error');
      setConnectionStatus('fallback');
      setIsLoading(false);
      return { projectId: null, success: false };
    }
  };

  const isPhase1Complete = useCallback(() => receivedAgentsRef.current.size >= 8, []);
  const getReceivedAgentsCount = useCallback(() => receivedAgentsRef.current.size, []);

  useEffect(() => cleanup, [cleanup]);

  return {
    startOrchestration,
    fetchExistingOutputs,
    projectId,
    connectionStatus,
    setConnectionStatus,
    isLoading,
    cleanup,
    isPhase1Complete,
    getReceivedAgentsCount,
    receivedAgents,
    AGENT_NAME_TO_ID,
  };
}
