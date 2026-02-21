/**
 * Minimal research context aligned to current schema.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ProtocolContext {
  projectId: string;
  title: string;
  description: string | null;
  researchQuestion: string | null;
  phase: string;
  currentAgentStep: number;
  createdAt: string;
}

const RESEARCH_PROJECT_COLUMNS =
  'id,title,description,research_question,phase,current_agent_step,created_at';

/**
 * Fetch minimal project context (current schema only).
 */
export async function collectProtocolContext(
  projectId: string
): Promise<ProtocolContext | null> {
  try {
    const { data: project, error: projectError } = await (supabase as any)
      .from('agent_projects')
      .select(RESEARCH_PROJECT_COLUMNS)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return null;
    }

    return {
      projectId: (project as any).id,
      title: (project as any).title,
      description: (project as any).description ?? null,
      researchQuestion: (project as any).research_question ?? null,
      phase: (project as any).phase,
      currentAgentStep: (project as any).current_agent_step,
      createdAt: (project as any).created_at,
    };
  } catch (error) {
    console.error('Error collecting protocol context:', error);
    return null;
  }
}
