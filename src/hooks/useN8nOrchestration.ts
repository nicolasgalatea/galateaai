import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Cliente Supabase para el proyecto externo (n8n outputs)
const N8N_SUPABASE_URL = 'https://kwmfnysjxeqhgcdperkf.supabase.co';
const N8N_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3bWZueXNqeGVxaGdjZHBlcmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMjQ3NDcsImV4cCI6MjA4MzgwMDc0N30.iAXnCyNkeSqyfkj2CIBTpfJzaQbGIvUEYxRfitvb510';

// N8N Webhook URL
const N8N_WEBHOOK_URL = 'https://galatea89.app.n8n.cloud/webhook/galatea-protocol-start';

// Create external Supabase client once
const externalSupabase = createClient(N8N_SUPABASE_URL, N8N_SUPABASE_ANON_KEY);

interface AgentOutput {
  id: number;
  project_id: string;
  agent_name: string;
  output: string;
  status: 'success' | 'error' | 'processing';
  created_at: string;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'fallback';

interface UseN8nOrchestrationOptions {
  onAgentOutput: (agentName: string, output: string, status: string) => void;
  onError: (error: string) => void;
  onFallback: () => void;
}

// Mapeo de nombres de agente n8n → ID de agente UI
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
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);
  
  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Fetch inicial de datos existentes
  const fetchExistingOutputs = useCallback(async (projectIdToFetch: string) => {
    console.log('[n8n] Fetching existing outputs for project:', projectIdToFetch);
    try {
      const { data, error } = await externalSupabase
        .from('agent_outputs')
        .select('*')
        .eq('project_id', projectIdToFetch)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[n8n] Error fetching existing outputs:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('[n8n] Found existing outputs:', data.length);
        data.forEach((record: AgentOutput) => {
          const { agent_name, output, status } = record;
          const agentId = AGENT_NAME_TO_ID[agent_name];
          if (agentId) {
            setReceivedAgents(prev => new Set([...prev, agentId]));
          }
          optionsRef.current.onAgentOutput(agent_name, output, status);
        });
      }
    } catch (err) {
      console.error('[n8n] Error in fetchExistingOutputs:', err);
    }
  }, []);

  // Limpiar suscripción
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      externalSupabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    setReceivedAgents(new Set());
  }, []);

  // Iniciar orquestación
  const startOrchestration = async (title: string, researchQuestion: string): Promise<{ projectId: string | null; success: boolean }> => {
    cleanup();
    setIsLoading(true);
    setConnectionStatus('connecting');

    const newProjectId = crypto.randomUUID();
    setProjectId(newProjectId);

    try {
      // 1. Suscribirse a Supabase Realtime ANTES del POST
      const subscriptionPromise = new Promise<void>((resolve, reject) => {
        channelRef.current = externalSupabase
          .channel(`agent_outputs_${newProjectId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'agent_outputs',
              filter: `project_id=eq.${newProjectId}`,
            },
            (payload) => {
              const { agent_name, output, status } = payload.new as AgentOutput;
              console.log(`[n8n] Received output from ${agent_name}:`, status);
              
              const agentId = AGENT_NAME_TO_ID[agent_name];
              if (agentId) {
                setReceivedAgents(prev => new Set([...prev, agentId]));
              }
              
              optionsRef.current.onAgentOutput(agent_name, output, status);
              
              // Reset fallback timeout on each output
              if (fallbackTimeoutRef.current) {
                clearTimeout(fallbackTimeoutRef.current);
              }
              fallbackTimeoutRef.current = setTimeout(() => {
                console.log('[n8n] Timeout - no more outputs received');
                optionsRef.current.onFallback();
              }, 180000); // 3 minutes
            }
          )
          .subscribe((status) => {
            console.log('[n8n] Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setConnectionStatus('connected');
              resolve();
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              reject(new Error('Failed to subscribe to Realtime'));
            }
          });

        // Timeout for subscription (60 seconds)
        setTimeout(() => {
          reject(new Error('Subscription timeout'));
        }, 60000);
      });

      // Wait for subscription to be ready
      await subscriptionPromise;

      // 2. POST a n8n webhook
      console.log('[n8n] Sending POST to webhook:', N8N_WEBHOOK_URL);
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: newProjectId,
          title,
          research_question: researchQuestion,
          action: 'START',
        }),
      });

      if (!response.ok) {
        throw new Error(`n8n responded with status ${response.status}`);
      }

      console.log('[n8n] Webhook POST successful');

      // 3. Fetch any existing outputs (in case some were already processed)
      await fetchExistingOutputs(newProjectId);

      // 4. Set fallback timeout (180 seconds = 3 minutes)
      fallbackTimeoutRef.current = setTimeout(() => {
        console.log('[n8n] Fallback timeout triggered - no outputs in 3 minutes');
        optionsRef.current.onFallback();
      }, 180000);

      setIsLoading(false);
      return { projectId: newProjectId, success: true };
      
    } catch (error) {
      console.error('[n8n] Error starting orchestration:', error);
      optionsRef.current.onError(error instanceof Error ? error.message : 'Error desconocido');
      setConnectionStatus('fallback');
      setIsLoading(false);
      return { projectId: null, success: false };
    }
  };

  // Check if all Phase 1 agents have completed
  const isPhase1Complete = useCallback(() => {
    return receivedAgents.size >= 8;
  }, [receivedAgents]);

  // Get count of received agents
  const getReceivedAgentsCount = useCallback(() => {
    return receivedAgents.size;
  }, [receivedAgents]);

  // Limpiar al desmontar
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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
