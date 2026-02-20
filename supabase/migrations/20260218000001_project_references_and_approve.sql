-- ============================================================================
-- Migracion: project_references + RPC approve_and_advance
-- Fases 8-10 del Research Lab (Agent 4 — Redactor)
-- ============================================================================

-- Tabla project_references: articulos asociados a un proyecto
CREATE TABLE public.project_references (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT,
  journal TEXT,
  year INTEGER,
  doi TEXT,
  pmid TEXT,
  url TEXT,
  abstract TEXT,
  citation_key INTEGER NOT NULL,  -- [1], [2], etc.
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_references_project ON public.project_references(project_id);

-- RLS (misma politica que research_projects)
ALTER TABLE public.project_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "refs_select" ON public.project_references FOR SELECT
  USING (project_id IN (SELECT id FROM public.research_projects WHERE user_id = auth.uid()::text));

CREATE POLICY "refs_insert" ON public.project_references FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.research_projects WHERE user_id = auth.uid()::text));

CREATE POLICY "refs_service" ON public.project_references FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- RPC approve_and_advance: valida version del manuscrito y avanza fase
CREATE OR REPLACE FUNCTION public.approve_and_advance(
  p_project_id UUID,
  p_target_phase INTEGER DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_project public.research_projects%ROWTYPE;
  v_next_phase INTEGER;
BEGIN
  SELECT * INTO v_project FROM public.research_projects WHERE id = p_project_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Project not found');
  END IF;

  v_next_phase := COALESCE(p_target_phase, v_project.current_phase + 1);
  IF v_next_phase > 10 THEN v_next_phase := 10; END IF;

  UPDATE public.research_projects
  SET current_phase = v_next_phase,
      status = CASE WHEN v_next_phase >= 10 THEN 'completed' ELSE status END,
      updated_at = now()
  WHERE id = p_project_id;

  RETURN jsonb_build_object(
    'success', true,
    'previous_phase', v_project.current_phase,
    'new_phase', v_next_phase
  );
END;
$$;
