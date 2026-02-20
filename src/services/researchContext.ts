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
    const { data: project, error: projectError } = await supabase
      .from('agent_projects')
      .select(RESEARCH_PROJECT_COLUMNS)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return null;
    }

    return {
      projectId: project.id,
      title: project.title,
      description: project.description ?? null,
      researchQuestion: project.research_question ?? null,
      phase: project.phase,
      currentAgentStep: project.current_agent_step,
      createdAt: project.created_at,
    };
  } catch (error) {
    console.error('Error collecting protocol context:', error);
    return null;
  }
}
