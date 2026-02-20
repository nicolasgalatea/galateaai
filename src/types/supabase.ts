export interface ResearchProject {
  id: string;
  title: string;
  description: string | null;
  research_question: string | null;
  phase: string;
  current_agent_step: number;
  // Timestamps
  created_at: string;
}
