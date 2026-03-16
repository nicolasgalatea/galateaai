-- Create research_projects table
CREATE TABLE IF NOT EXISTS public.research_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text UNIQUE NOT NULL,
  title text,
  research_question text,
  current_phase integer DEFAULT 0,
  status text DEFAULT 'pending',
  phase_data jsonb DEFAULT '{}'::jsonb,
  user_edits jsonb DEFAULT '{}'::jsonb,
  department_id text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

-- Allow anon to read all projects
CREATE POLICY "anon_select" ON public.research_projects
  FOR SELECT TO anon USING (true);

-- Allow anon to insert projects
CREATE POLICY "anon_insert" ON public.research_projects
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to update projects
CREATE POLICY "anon_update" ON public.research_projects
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow service_role full access (server-side agents)
CREATE POLICY "service_role_all" ON public.research_projects
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_projects;
