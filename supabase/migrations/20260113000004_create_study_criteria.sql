-- ============================================================
-- MIGRACION 4: Tabla para criterios de inclusion/exclusion (Agente 6)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.study_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Tipo de criterio
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('inclusion', 'exclusion')),

  -- Categoria PICOS
  category TEXT NOT NULL CHECK (category IN (
    'population', 'intervention', 'comparator', 'outcome',
    'study_design', 'timeframe', 'language', 'publication_type', 'other'
  )),

  -- Descripcion del criterio
  description TEXT NOT NULL,

  -- Justificacion cientifica
  rationale TEXT,

  -- Operacionalizacion (como se evaluara)
  operationalization TEXT,

  -- Prioridad (para resolucion de conflictos)
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),

  -- Estado de validacion
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Orden de presentacion
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_study_criteria_project_id ON public.study_criteria(project_id);
CREATE INDEX idx_study_criteria_type ON public.study_criteria(criteria_type);

-- RLS
ALTER TABLE public.study_criteria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage criteria for their projects"
ON public.study_criteria FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

-- Trigger
CREATE TRIGGER update_study_criteria_updated_at
BEFORE UPDATE ON public.study_criteria
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
