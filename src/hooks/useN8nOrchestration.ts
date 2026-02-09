import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import type { AgentExecution } from '@/types/domain';

// ── External Supabase config (n8n outputs) ──
const N8N_SUPABASE_URL = 'https://kwmfnysjxeqhgcdperkf.supabase.co';
const N8N_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3bWZueXNqeGVxaGdjZHBlcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQ3NDcsImV4cCI6MjA4MzgwMDc0N30.iAXnCyNkeSqyfkj2CIBTpfJzaQbGIvUEYxRfitvb510';
const N8N_WEBHOOK_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-protocol-start';

const externalSupabase = createClient(N8N_SUPABASE_URL, N8N_SUPABASE_ANON_KEY);

// ── Industrial-grade constants ──
const RECONNECT_MAX_ATTEMPTS = 3;
const RECONNECT_BACKOFF_MS = 2000;
const FALLBACK_UI_TIMEOUT_MS = 60000;
const GLOBAL_TIMEOUT_MS = 180000;
const PER_AGENT_TIMEOUT_MS = 45000;

// AgentExecution type imported from @/types/domain

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'fallback';

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
  const fallbackUITimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const globalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perAgentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const elapsed = () => `${((Date.now() - startTimeRef.current) / 1000).toFixed(1)}s`;

  // ── Centralized record processor with deduplication ──
  const processRecord = useCallback((record: AgentExecution) => {
    if (processedIdsRef.current.has(record.id)) {
      console.log(`[n8n-Realtime] SKIP duplicate id=${record.id} agent=${record.agent_name} t=${elapsed()}`);
      return;
    }
    processedIdsRef.current.add(record.id);

    const agentId = AGENT_NAME_TO_ID[record.agent_name] ?? record.agent_number;
    if (agentId) {
      receivedAgentsRef.current = new Set([...receivedAgentsRef.current, agentId]);
      setReceivedAgents(new Set(receivedAgentsRef.current));
    }

    const outputText = record.output_markdown ?? JSON.stringify(record.output_result) ?? '';
    console.log(`[n8n-Realtime] PROCESSED agent="${record.agent_name}" id=${record.id} status=${record.status} t=${elapsed()}`);
    optionsRef.current.onAgentOutput(record.agent_name, outputText, record.status);

    // Reset per-agent timeout
    if (perAgentTimeoutRef.current) clearTimeout(perAgentTimeoutRef.current);
    perAgentTimeoutRef.current = setTimeout(() => {
      console.log(`[n8n-Realtime] WARNING no new agent output in ${PER_AGENT_TIMEOUT_MS / 1000}s t=${elapsed()}`);
    }, PER_AGENT_TIMEOUT_MS);
  }, []);

  // ── Cleanup all resources ──
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      console.log(`[n8n-Realtime] CLEANUP removing channel t=${elapsed()}`);
      externalSupabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    [fallbackUITimeoutRef, globalTimeoutRef, perAgentTimeoutRef].forEach(ref => {
      if (ref.current) { clearTimeout(ref.current); ref.current = null; }
    });
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

    const newProjectId = crypto.randomUUID();
    setProjectId(newProjectId);
    processedIdsRef.current = new Set();
    receivedAgentsRef.current = new Set();
    reconnectAttemptsRef.current = 0;

    console.log(`[n8n-Realtime] START project=${newProjectId} t=0.0s`);

    try {
      // 1. Subscribe
      await subscribeRef.current?.(newProjectId);

      // 2. Initial sync
      await fetchExistingOutputs(newProjectId);

      // 3. POST to n8n webhook
      console.log(`[n8n-Realtime] WEBHOOK POST starting t=${elapsed()}`);
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newProjectId,
          title,
          research_question: researchQuestion,
          action: 'START',
        }),
      });
      // With no-cors, response is opaque — we can't check status, so we trust it was sent
      console.log(`[n8n-Realtime] WEBHOOK POST sent (no-cors mode) t=${elapsed()}`);

      // 4. Fallback UI timeout (60s) — non-blocking
      fallbackUITimeoutRef.current = setTimeout(() => {
        console.log(`[n8n-Realtime] FALLBACK triggered after ${FALLBACK_UI_TIMEOUT_MS / 1000}s — UI switching to demo t=${elapsed()}`);
        setConnectionStatus('fallback');
        optionsRef.current.onFallback();
        // Subscription stays active — late outputs still processed
      }, FALLBACK_UI_TIMEOUT_MS);

      // 5. Global timeout (180s) — hard stop
      globalTimeoutRef.current = setTimeout(() => {
        console.log(`[n8n-Realtime] GLOBAL TIMEOUT ${GLOBAL_TIMEOUT_MS / 1000}s — closing connection t=${elapsed()}`);
        cleanup();
      }, GLOBAL_TIMEOUT_MS);

      setIsLoading(false);
      return { projectId: newProjectId, success: true };
    } catch (error) {
      console.error(`[n8n-Realtime] START error:`, error);
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
