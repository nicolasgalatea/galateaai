
-- Create research_projects table for 10-phase dashboard
CREATE TABLE public.research_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL DEFAULT 'e8233417-9ddf-4453-8372-c5b6797da8aa',
  title TEXT NOT NULL DEFAULT 'Untitled Research',
  research_question TEXT,
  current_phase INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'idle',
  phase_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_edits JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

-- Public access policies (matching research_lab_progress pattern)
CREATE POLICY "Anyone can read research projects"
  ON public.research_projects FOR SELECT USING (true);

CREATE POLICY "Anyone can insert research projects"
  ON public.research_projects FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update research projects"
  ON public.research_projects FOR UPDATE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_research_projects_updated_at
  BEFORE UPDATE ON public.research_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_projects;
