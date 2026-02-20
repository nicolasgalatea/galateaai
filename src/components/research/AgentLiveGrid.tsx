import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type AgentStatus = 'pending' | 'working' | 'done';

interface AgentCardState {
  status: AgentStatus;
  preview: string;
  updatedAt?: string;
}

const AGENTS = [
  { key: 'workflow-configuration-agent', label: 'Workflow Configuration Agent' },
  { key: 'hypothesis-generation-agent', label: 'Hypothesis Generation Agent' },
  { key: 'literature-review-agent', label: 'Literature Review Agent' },
  { key: 'experimental-design-agent', label: 'Experimental Design Agent' },
  { key: 'data-analysis-agent', label: 'Data Analysis Agent' },
  { key: 'interpretation-agent', label: 'Interpretation Agent' },
  { key: 'safety-assessment-agent', label: 'Safety Assessment Agent' },
  { key: 'regulatory-strategy-agent', label: 'Regulatory Strategy Agent' },
  { key: 'patent-landscape-agent', label: 'Patent Landscape Agent' },
  { key: 'market-assessment-agent', label: 'Market Assessment Agent' },
  { key: 'cost-benefit-agent', label: 'Cost-Benefit Agent' },
  { key: 'risk-assessment-agent', label: 'Risk Assessment Agent' },
  { key: 'sustainability-agent', label: 'Sustainability Agent' },
  { key: 'final-report-agent', label: 'Final Report Agent' },
];

const normalizeAgentName = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const extractPreview = (payload: unknown): string => {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
};

interface AgentLiveGridProps {
  projectId?: string;
}

export function AgentLiveGrid({ projectId }: AgentLiveGridProps) {
  const initialState = useMemo<Record<string, AgentCardState>>(() => {
    return AGENTS.reduce((acc, agent) => {
      acc[agent.key] = { status: 'pending', preview: '' };
      return acc;
    }, {} as Record<string, AgentCardState>);
  }, []);

  const [agentStates, setAgentStates] = useState<Record<string, AgentCardState>>(initialState);

  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`agent_executions_live_grid_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_executions',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const row = (payload.new || payload.old) as {
            agent_name?: string | null;
            output_markdown?: string | null;
            output_data?: unknown | null;
            status?: string | null;
            created_at?: string | null;
          };

          const normalized = normalizeAgentName(row.agent_name);
          if (!normalized) return;

          const match = AGENTS.find((agent) => agent.key === normalized);
          if (!match) return;

          const previewSource = row.output_markdown ?? row.output_data ?? '';
          const preview = extractPreview(previewSource).trim();
          const status: AgentStatus =
            row.status === 'completed' || row.status === 'done' || preview
              ? 'done'
              : 'working';

          setAgentStates((prev) => ({
            ...prev,
            [match.key]: {
              status,
              preview,
              updatedAt: row.created_at || new Date().toISOString(),
            },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {AGENTS.map((agent) => {
        const state = agentStates[agent.key];
        const borderClass =
          state.status === 'pending'
            ? 'border-gray-200'
            : state.status === 'working'
              ? 'border-[#0091DF] animate-pulse'
              : 'border-[#89BA17]';

        return (
          <div
            key={agent.key}
            className={`rounded-xl border-2 bg-white p-4 shadow-sm transition-colors ${borderClass}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{agent.label}</h3>
              {state.status === 'done' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#89BA17]">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="mt-3 min-h-[72px] text-sm text-gray-600">
              {state.status === 'pending' && (
                <p className="text-gray-400">Pending output</p>
              )}
              {state.status === 'working' && (
                <p className="text-[#0091DF]">Working...</p>
              )}
              {state.status === 'done' && (
                <p className="line-clamp-3 whitespace-pre-wrap">
                  {state.preview || 'Output received'}
                </p>
              )}
            </div>

            {state.status === 'done' && (
              <button
                type="button"
                className="mt-3 inline-flex items-center justify-center rounded-md border border-[#89BA17] px-3 py-1 text-xs font-semibold text-[#89BA17] hover:bg-[#89BA17]/10"
              >
                Full Analysis
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AgentLiveGrid;
