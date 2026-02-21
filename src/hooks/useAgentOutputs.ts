/**
 * ============================================================================
 * HOOK: useAgentOutputs
 *
 * Suscripcion en tiempo real a la tabla agent_executions de Supabase
 * para mostrar el progreso de los agentes mientras n8n trabaja.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAgentById } from '@/config/researchAgents';
import type { AgentOutput } from '@/types/domain';

export interface UseAgentOutputsReturn {
  outputs: AgentOutput[];
  outputsByAgent: Record<number, AgentOutput>;
  latestOutput: AgentOutput | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getOutputForAgent: (agentNumber: number) => AgentOutput | null;
}

export function useAgentOutputs(projectId?: string): UseAgentOutputsReturn {
  const [outputs, setOutputs] = useState<AgentOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar outputs existentes
  const fetchOutputs = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('agent_executions')
        .select('*')
        .eq('project_id', projectId)
        .order('agent_number', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setOutputs((data || []) as unknown as AgentOutput[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar executions';
      setError(message);
      console.error('Error fetching agent executions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Suscripcion en tiempo real a cambios en agent_executions
  useEffect(() => {
    if (!projectId) return;

    // Cargar outputs iniciales
    fetchOutputs();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`agent_executions_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_executions',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('='.repeat(60));
          console.log('REALTIME: Cambio en agent_executions');
          console.log('Evento:', payload.eventType);
          console.log('Datos:', payload.new);
          console.log('='.repeat(60));

          if (payload.eventType === 'INSERT') {
            const newOutput = payload.new as AgentOutput;
            const agentInfo = getAgentById(newOutput.agent_number);

            console.log(`Agente ${newOutput.agent_number} (${agentInfo?.displayNameEs || 'Desconocido'}) completado`);

            setOutputs((prev) => {
              // Evitar duplicados
              const exists = prev.some((o) => o.id === newOutput.id);
              if (exists) return prev;
              return [...prev, newOutput].sort((a, b) => a.agent_number - b.agent_number);
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedOutput = payload.new as AgentOutput;
            setOutputs((prev) =>
              prev.map((o) => (o.id === updatedOutput.id ? updatedOutput : o))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedOutput = payload.old as { id: string };
            setOutputs((prev) => prev.filter((o) => o.id !== deletedOutput.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status (agent_executions):', status);
      });

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, fetchOutputs]);

  // Agrupar outputs por numero de agente (tomar el mas reciente)
  const outputsByAgent: Record<number, AgentOutput> = {};
  outputs.forEach((output) => {
    if (
      !outputsByAgent[output.agent_number] ||
      new Date(output.created_at) > new Date(outputsByAgent[output.agent_number].created_at)
    ) {
      outputsByAgent[output.agent_number] = output;
    }
  });

  // Obtener el output mas reciente
  const latestOutput = outputs.length > 0
    ? outputs.reduce((latest, current) =>
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest
      )
    : null;

  // Obtener output para un agente especifico
  const getOutputForAgent = useCallback(
    (agentNumber: number): AgentOutput | null => {
      return outputsByAgent[agentNumber] || null;
    },
    [outputsByAgent]
  );

  return {
    outputs,
    outputsByAgent,
    latestOutput,
    isLoading,
    error,
    refetch: fetchOutputs,
    getOutputForAgent,
  };
}

export default useAgentOutputs;
