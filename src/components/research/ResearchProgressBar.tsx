import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  PHASE_1_AGENTS,
  PHASE_2_AGENTS,
  RESEARCH_AGENTS,
  type ResearchAgent,
  type ResearchProjectPhase,
} from '@/config/researchAgents';
import {
  RESEARCH_LAB_AGENTS,
  getResearchLabAgentByPhase,
  type ResearchLabAgent,
  type ResearchLabPhaseNumber,
} from '@/config/researchLabAgents';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface ResearchProgressBarProps {
  currentStep: number;
  phase: ResearchProjectPhase;
  activeAgent?: string | null;
  projectId?: string;
  onAgentClick?: (agentNumber: number) => void;
  /** Fase actual del Research Lab v2 (0-10) — fuente de verdad desde el navigator */
  researchLabPhase?: number;
}

type AgentStatus = 'pending' | 'active' | 'completed' | 'error' | 'locked';

const getAgentStatus = (
  agent: ResearchAgent,
  currentStep: number,
  phase: ResearchProjectPhase,
  completedAgents: Set<number>
): AgentStatus => {
  // Fase 2 bloqueada si no aprobado
  if (agent.phase === 2 && phase !== 'EXECUTING_REVIEW' && phase !== 'COMPLETED') {
    return 'locked';
  }

  // Verificar si el agente tiene output guardado (completado)
  if (completedAgents.has(agent.id)) {
    return 'completed';
  }

  if (agent.id < currentStep) return 'completed';
  if (agent.id === currentStep) return 'active';
  return 'pending';
};

const statusColors: Record<AgentStatus, string> = {
  pending: 'bg-gray-200 text-gray-500 border-gray-300',
  active: 'bg-blue-500 text-white border-blue-600 animate-pulse',
  completed: 'bg-green-500 text-white border-green-600',
  error: 'bg-red-500 text-white border-red-600',
  locked: 'bg-gray-300 text-gray-400 border-gray-400',
};

const statusIcons: Record<AgentStatus, React.ReactNode> = {
  pending: null,
  active: <Loader2 className="w-3 h-3 animate-spin" />,
  completed: <CheckCircle className="w-3 h-3" />,
  error: <AlertCircle className="w-3 h-3" />,
  locked: <Lock className="w-3 h-3" />,
};

function AgentStep({
  agent,
  status,
  onClick,
}: {
  agent: ResearchAgent;
  status: AgentStatus;
  onClick?: () => void;
}) {
  const Icon = agent.icon as React.ComponentType<{ className?: string }>;
  const isClickable = status !== 'locked' && status !== 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: agent.id * 0.05 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
        statusColors[status],
        isClickable && 'cursor-pointer hover:scale-[1.02]'
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Numero del agente */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
        status === 'completed' ? 'bg-green-600' :
        status === 'active' ? 'bg-blue-600' :
        status === 'locked' ? 'bg-gray-400' : 'bg-gray-300'
      )}>
        {statusIcons[status] || agent.id}
      </div>

      {/* Icono del agente */}
      <div className="w-6 h-6">
        <Icon className="w-full h-full" />
      </div>

      {/* Info del agente */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{agent.displayNameEs}</p>
        <p className="text-xs opacity-75 truncate">{agent.estimatedDuration}</p>
      </div>
    </motion.div>
  );
}

function PhaseSection({
  title,
  agents,
  currentStep,
  phase,
  isExpanded,
  onToggle,
  onAgentClick,
  isLocked = false,
  completedAgents,
}: {
  title: string;
  agents: ResearchAgent[];
  currentStep: number;
  phase: ResearchProjectPhase;
  isExpanded: boolean;
  onToggle: () => void;
  onAgentClick?: (agentNumber: number) => void;
  isLocked?: boolean;
  completedAgents: Set<number>;
}) {
  const completedCount = agents.filter(a => 
    getAgentStatus(a, currentStep, phase, completedAgents) === 'completed'
  ).length;
  const progress = (completedCount / agents.length) * 100;

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between p-4 transition-colors',
          isLocked ? 'bg-gray-100 text-gray-500' : 'bg-white hover:bg-gray-50'
        )}
      >
        <div className="flex items-center gap-3">
          {isLocked && <Lock className="w-5 h-5 text-yellow-500" />}
          <span className="font-bold">{title}</span>
          <span className="text-sm text-gray-500">
            ({completedCount}/{agents.length})
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <motion.div
          className={cn(
            'h-full',
            isLocked ? 'bg-gray-400' : 'bg-green-500'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Agent list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2 bg-gray-50">
              {agents.map((agent) => (
                <AgentStep
                  key={agent.id}
                  agent={agent}
                  status={getAgentStatus(agent, currentStep, phase, completedAgents)}
                  onClick={() => onAgentClick?.(agent.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Determina el estado de un agente v2 (1-4) segun la fase actual del Research Lab */
function getLabAgentStatus(
  agent: ResearchLabAgent,
  researchLabPhase: number,
): 'completed' | 'active' | 'pending' {
  const [phaseStart, phaseEnd] = agent.phases;
  if (researchLabPhase > phaseEnd) return 'completed';
  if (researchLabPhase >= phaseStart && researchLabPhase <= phaseEnd) return 'active';
  return 'pending';
}

const labStatusColors: Record<string, string> = {
  completed: 'bg-green-500 text-white border-green-600',
  active: 'bg-blue-500 text-white border-blue-600 animate-pulse',
  pending: 'bg-gray-200 text-gray-500 border-gray-300',
};

export function ResearchProgressBar({
  currentStep,
  phase,
  projectId,
  onAgentClick,
  researchLabPhase,
}: ResearchProgressBarProps) {
  const [phase1Expanded, setPhase1Expanded] = useState(true);
  const [phase2Expanded, setPhase2Expanded] = useState(false);
  const [completedAgents, setCompletedAgents] = useState<Set<number>>(new Set());

  const isPhase2Locked = phase !== 'EXECUTING_REVIEW' && phase !== 'COMPLETED';
  const isAwaitingApproval = phase === 'AWAITING_APPROVAL';

  // Helper to map agent_name to agent ID
  const getAgentIdByName = (agentName: string): number | null => {
    const agent = RESEARCH_AGENTS.find((a) => a.name === agentName);
    return agent ? agent.id : null;
  };

  // Cargar agentes completados desde agent_executions
  useEffect(() => {
    if (!projectId) return;

    const loadCompletedAgents = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('agent_executions')
          .select('agent_name, agent_number')
          .eq('project_id', projectId);

        if (error) {
          console.warn('Error loading completed agents:', error);
          const fallbackCompleted = new Set<number>();
          for (let i = 1; i < currentStep; i++) {
            fallbackCompleted.add(i);
          }
          setCompletedAgents(fallbackCompleted);
          return;
        }

        if (data) {
          const completed = new Set<number>();
          (data as any[]).forEach((output) => {
            if (output.agent_name) {
              const agentId = getAgentIdByName(output.agent_name);
              if (agentId !== null) {
                completed.add(agentId);
              }
            }
          });
          // Also mark all steps below currentStep as completed (fallback)
          for (let i = 1; i < currentStep; i++) {
            completed.add(i);
          }
          setCompletedAgents(completed);
        }
      } catch (err) {
        console.error('Error loading completed agents:', err);
        // Fall back to using currentStep
        const fallbackCompleted = new Set<number>();
        for (let i = 1; i < currentStep; i++) {
          fallbackCompleted.add(i);
        }
        setCompletedAgents(fallbackCompleted);
      }
    };

    loadCompletedAgents();

    // Suscripcion en tiempo real a agent_executions
    const channel = supabase
      .channel(`agent_executions_progress_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_executions',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newOutput = payload.new as { agent_name?: string };
          if (newOutput.agent_name) {
            const agentId = getAgentIdByName(newOutput.agent_name);
            if (agentId !== null) {
              setCompletedAgents((prev) => new Set([...prev, agentId]));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, currentStep]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-bold text-lg">Progreso de Investigacion</h3>
        {researchLabPhase != null ? (
          <p className="text-sm text-gray-500">
            Fase {researchLabPhase} de 10 — {getResearchLabAgentByPhase(researchLabPhase as ResearchLabPhaseNumber)?.displayNameEs ?? 'Iniciando'}
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Paso {currentStep} de 14 - {phase.replace(/_/g, ' ')}
          </p>
        )}
      </div>

      {/* Research Lab v2 — 4 agentes con indicador de fase */}
      {researchLabPhase != null && (
        <div className="space-y-2 mb-4">
          {RESEARCH_LAB_AGENTS.map((agent) => {
            const status = getLabAgentStatus(agent, researchLabPhase);
            const Icon = agent.icon;
            const [phaseStart, phaseEnd] = agent.phases;
            const phaseLabel = phaseStart === phaseEnd ? `Fase ${phaseStart}` : `Fases ${phaseStart}-${phaseEnd}`;

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: agent.id * 0.08 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                  labStatusColors[status],
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  status === 'completed' ? 'bg-green-600' :
                  status === 'active' ? 'bg-blue-600' : 'bg-gray-300',
                )}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === 'active' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    agent.id
                  )}
                </div>
                <Icon className="w-5 h-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{agent.displayNameEs}</p>
                  <p className="text-xs opacity-75">{phaseLabel}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Barra de progreso global */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((researchLabPhase / 10) * 100, 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Legacy sections — solo si no hay researchLabPhase */}
      {researchLabPhase == null && (
        <>
          <PhaseSection
            title="Fase 1: Generacion de Protocolo"
            agents={PHASE_1_AGENTS}
            currentStep={currentStep}
            phase={phase}
            isExpanded={phase1Expanded}
            onToggle={() => setPhase1Expanded(!phase1Expanded)}
            onAgentClick={onAgentClick}
            completedAgents={completedAgents}
          />

          {isAwaitingApproval && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl text-center"
            >
              <Lock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-bold text-yellow-700">Aprobacion Requerida</p>
              <p className="text-sm text-yellow-600">
                Revisa el protocolo generado antes de continuar con la Fase 2
              </p>
            </motion.div>
          )}

          <PhaseSection
            title="Fase 2: Ejecucion de Revision"
            agents={PHASE_2_AGENTS}
            currentStep={currentStep}
            phase={phase}
            isExpanded={phase2Expanded}
            onToggle={() => setPhase2Expanded(!phase2Expanded)}
            onAgentClick={onAgentClick}
            isLocked={isPhase2Locked}
            completedAgents={completedAgents}
          />
        </>
      )}

      {/* Estado completado — Research Lab v2 (fase 10) o legacy */}
      {(researchLabPhase === 10 || phase === 'COMPLETED') && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 bg-green-50 border-2 border-green-400 rounded-xl text-center"
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <p className="font-bold text-green-700">Revision Completada</p>
          <p className="text-sm text-green-600">
            Todos los agentes han finalizado exitosamente
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default ResearchProgressBar;
