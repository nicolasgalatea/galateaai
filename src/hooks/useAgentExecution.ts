import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  RESEARCH_AGENTS,
  getAgentById,
  N8N_RESEARCH_FLOW_WEBHOOK,
  type AgentExecutionStatus,
} from '@/config/researchAgents';

export interface AgentExecution {
  id: string;
  project_id: string;
  agent_number: number;
  agent_name: string;
  phase: number;
  status: AgentExecutionStatus;
  input_payload: Record<string, unknown> | null;
  output_result: Record<string, unknown> | null;
  output_markdown: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
}

export interface ExecuteAgentParams {
  projectId: string;
  agentNumber: number;
  inputData: Record<string, unknown>;
  previousResults?: Record<string, unknown>;
}

export interface AgentResponse {
  output: string;
  structured_data?: Record<string, unknown>;
  error?: string;
}

export function useAgentExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<AgentExecution | null>(null);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Crear registro de ejecucion en la base de datos
  const createExecutionRecord = useCallback(async (
    projectId: string,
    agentNumber: number,
    inputPayload: Record<string, unknown>
  ): Promise<AgentExecution | null> => {
    const agent = getAgentById(agentNumber);
    if (!agent) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('agent_executions')
        .insert({
          project_id: projectId,
          agent_number: agentNumber,
          agent_name: agent.name,
          phase: agent.phase,
          status: 'in_progress',
          input_payload: inputPayload,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data as AgentExecution;
    } catch (err) {
      console.error('Error creating execution record:', err);
      return null;
    }
  }, []);

  // Actualizar registro de ejecucion
  const updateExecutionRecord = useCallback(async (
    executionId: string,
    updates: Partial<AgentExecution>
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('agent_executions')
        .update(updates)
        .eq('id', executionId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating execution record:', err);
      return false;
    }
  }, []);

  // Ejecutar agente
  const executeAgent = useCallback(async ({
    projectId,
    agentNumber,
    inputData,
    previousResults = {},
  }: ExecuteAgentParams): Promise<AgentResponse | null> => {
    const agent = getAgentById(agentNumber);
    if (!agent) {
      setError('Agente no encontrado');
      return null;
    }

    setIsExecuting(true);
    setError(null);
    setResult(null);

    const startTime = Date.now();

    // Crear registro de ejecucion
    const execution = await createExecutionRecord(projectId, agentNumber, inputData);
    if (execution) {
      setCurrentExecution(execution);
    }

    try {
      // Construir payload para n8n
      const payload = {
        projectId,
        agentName: agent.name,
        agentNumber: agent.id,
        phase: agent.phase,
        chatInput: inputData.chatInput || inputData.research_question || '',
        inputData,
        previousResults,
        sessionId: `research_${projectId}_${Date.now()}`,
      };

      console.log('═══════════════════════════════════════════════════════');
      console.log(`🤖 Ejecutando Agente ${agentNumber}: ${agent.displayName}`);
      console.log('Payload:', payload);
      console.log('═══════════════════════════════════════════════════════');

      // Llamar al webhook centralizado de n8n
      const response = await fetch(N8N_RESEARCH_FLOW_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          agentNumber: agent.id,
          agentName: agent.name,
          action: 'EXECUTE_AGENT',
          inputData,
          previousResults,
          sessionId: `research_${projectId}_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const duration = Date.now() - startTime;

      console.log('═══════════════════════════════════════════════════════');
      console.log(`✅ Agente ${agentNumber} completado en ${duration}ms`);
      console.log('Respuesta:', data);
      console.log('═══════════════════════════════════════════════════════');

      const agentResponse: AgentResponse = {
        output: data.output || data.text || data.response || JSON.stringify(data, null, 2),
        structured_data: data.structured_data || data.data || {},
      };

      setResult(agentResponse);

      // Actualizar registro de ejecucion
      if (execution) {
        await updateExecutionRecord(execution.id, {
          status: 'completed',
          output_result: agentResponse.structured_data || {},
          output_markdown: agentResponse.output,
          completed_at: new Date().toISOString(),
          duration_ms: duration,
        });
      }

      toast({
        title: `${agent.displayNameEs} completado`,
        description: `Agente ${agentNumber} de ${RESEARCH_AGENTS.length} ejecutado exitosamente.`,
      });

      return agentResponse;

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('═══════════════════════════════════════════════════════');
      console.error(`❌ Error en Agente ${agentNumber}`);
      console.error('Mensaje:', errorMessage);
      console.error('═══════════════════════════════════════════════════════');

      setError(errorMessage);

      // Actualizar registro con error
      if (execution) {
        await updateExecutionRecord(execution.id, {
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        });
      }

      toast({
        title: 'Error en agente',
        description: `${agent.displayNameEs}: ${errorMessage}`,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [createExecutionRecord, updateExecutionRecord, toast]);

  // Obtener historial de ejecuciones de un proyecto
  const getProjectExecutions = useCallback(async (projectId: string): Promise<AgentExecution[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('project_id', projectId)
        .order('agent_number', { ascending: true });

      if (fetchError) throw fetchError;
      return (data || []) as AgentExecution[];
    } catch (err) {
      console.error('Error fetching executions:', err);
      return [];
    }
  }, []);

  // Reintentar ejecucion fallida
  const retryExecution = useCallback(async (
    execution: AgentExecution,
    inputData: Record<string, unknown>
  ): Promise<AgentResponse | null> => {
    // Incrementar contador de reintentos
    await updateExecutionRecord(execution.id, {
      retry_count: execution.retry_count + 1,
    });

    return executeAgent({
      projectId: execution.project_id,
      agentNumber: execution.agent_number,
      inputData,
    });
  }, [executeAgent, updateExecutionRecord]);

  return {
    isExecuting,
    currentExecution,
    result,
    error,
    executeAgent,
    getProjectExecutions,
    retryExecution,
  };
}
