// AgentLiveGrid v2 — 4 agentes (Arquitecto, Metodólogo, Evidencia, Redactor)
import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { RESEARCH_LAB_AGENTS } from '@/config/researchLabAgents';
import type { ResearchProject } from '@/types/domain';

type AgentStatus = 'pending' | 'working' | 'done';

/** Maps each agent id to the research_projects key that marks it as done */
const AGENT_DONE_KEY: Record<number, keyof ResearchProject> = {
  1: 'research_question',
  2: 'finer_results',
  3: 'search_strategy',
  4: 'protocol_draft',
};

function extractPreview(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 150);
  try {
    return JSON.stringify(value, null, 2).slice(0, 150);
  } catch {
    return String(value).slice(0, 150);
  }
}

interface AgentLiveGridProps {
  researchProject: ResearchProject | null;
  currentPhase: number;
}

export function AgentLiveGrid({ researchProject, currentPhase }: AgentLiveGridProps) {
  const cards = useMemo(() => {
    return RESEARCH_LAB_AGENTS.map((agent) => {
      const doneKey = AGENT_DONE_KEY[agent.id];
      const outputValue = researchProject ? researchProject[doneKey] : null;
      const isDone = outputValue != null;
      const isActive =
        !isDone && currentPhase >= agent.phases[0] && currentPhase <= agent.phases[1];

      const status: AgentStatus = isDone ? 'done' : isActive ? 'working' : 'pending';
      const preview = isDone ? extractPreview(outputValue) : '';

      return { agent, status, preview };
    });
  }, [researchProject, currentPhase]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ agent, status, preview }) => {
        const Icon = agent.icon;
        const borderClass =
          status === 'pending'
            ? 'border-gray-200'
            : status === 'working'
              ? 'border-[#0091DF] animate-pulse'
              : 'border-[#89BA17]';

        return (
          <div
            key={agent.id}
            className={`rounded-xl border-2 bg-white p-4 shadow-sm transition-colors ${borderClass}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  {agent.displayNameEs}
                </h3>
              </div>
              {status === 'done' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#89BA17]">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="mt-3 min-h-[72px] text-sm text-gray-600">
              {status === 'pending' && (
                <p className="text-gray-400">Pendiente</p>
              )}
              {status === 'working' && (
                <p className="text-[#0091DF]">Procesando...</p>
              )}
              {status === 'done' && (
                <p className="line-clamp-3 whitespace-pre-wrap">
                  {preview || 'Output recibido'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AgentLiveGrid;
