-- ============================================================
-- Research Lab v2: Tabla de progreso por fases (0-10)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.research_lab_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Fase actual del flujo (0 a 10)
  fase_actual INTEGER NOT NULL DEFAULT 0 CHECK (fase_actual >= 0 AND fase_actual <= 10),

  -- Outputs por bloque de fases (JSONB para flexibilidad)
  fase_0_1_output JSONB,
  fase_2_3_output JSONB,
  fase_4_5_output JSONB,
  fase_6_7_output JSONB,
  fase_8_9_output JSONB,
  fase_10_output JSONB,

  -- Checkpoint FINER: si no aprueba, el flujo se detiene
  finer_approved BOOLEAN,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  UNIQUE(project_id)
);

-- Indices
CREATE INDEX idx_research_lab_progress_project_id ON public.research_lab_progress(project_id);
CREATE INDEX idx_research_lab_progress_fase_actual ON public.research_lab_progress(fase_actual);

-- RLS
ALTER TABLE public.research_lab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view research lab progress for their projects"
ON public.research_lab_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert research lab progress for their projects"
ON public.research_lab_progress FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update research lab progress for their projects"
ON public.research_lab_progress FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete research lab progress for their projects"
ON public.research_lab_progress FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

-- Trigger updated_at (asumiendo que existe update_updated_at_column)
CREATE TRIGGER update_research_lab_progress_updated_at
BEFORE UPDATE ON public.research_lab_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
