-- ============================================================
-- MIGRACION 2: Tabla principal de proyectos de investigacion
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadatos del proyecto
  title TEXT NOT NULL,
  description TEXT,
  research_question TEXT,

  -- Estado y fase actual
  phase public.research_project_phase NOT NULL DEFAULT 'PROTOCOL_GENERATION',
  current_agent_step INTEGER NOT NULL DEFAULT 1,
  active_agent TEXT,

  -- Datos de PICOT (Agente 1)
  picot_population TEXT,
  picot_intervention TEXT,
  picot_comparison TEXT,
  picot_outcome TEXT,
  picot_timeframe TEXT,

  -- Score FINER (Agente 2)
  finer_feasible INTEGER CHECK (finer_feasible BETWEEN 0 AND 10),
  finer_interesting INTEGER CHECK (finer_interesting BETWEEN 0 AND 10),
  finer_novel INTEGER CHECK (finer_novel BETWEEN 0 AND 10),
  finer_ethical INTEGER CHECK (finer_ethical BETWEEN 0 AND 10),
  finer_relevant INTEGER CHECK (finer_relevant BETWEEN 0 AND 10),
  finer_total_score INTEGER GENERATED ALWAYS AS (
    COALESCE(finer_feasible, 0) + COALESCE(finer_interesting, 0) +
    COALESCE(finer_novel, 0) + COALESCE(finer_ethical, 0) + COALESCE(finer_relevant, 0)
  ) STORED,

  -- Tipo de estudio (Agente 4)
  study_type TEXT CHECK (study_type IN (
    'systematic_review', 'meta_analysis', 'rct', 'cohort',
    'case_control', 'cross_sectional', 'qualitative'
  )),

  -- Objetivos ICMJE (Agente 5)
  objectives_primary TEXT,
  objectives_secondary TEXT[],

  -- Estrategia de busqueda Yadav (Agente 7)
  search_strategy_pubmed TEXT,
  search_strategy_cochrane TEXT,
  search_strategy_embase TEXT,
  search_strategy_other JSONB,

  -- Protocolo generado (Agente 8)
  protocol_pdf_url TEXT,
  protocol_generated_at TIMESTAMP WITH TIME ZONE,

  -- Aprobacion (Bloqueo entre fases)
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,

  -- Resultados Fase 2
  prisma_data JSONB,
  extracted_data_url TEXT,
  final_report_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices para performance
CREATE INDEX idx_agent_projects_user_id ON public.agent_projects(user_id);
CREATE INDEX idx_agent_projects_phase ON public.agent_projects(phase);
CREATE INDEX idx_agent_projects_created_at ON public.agent_projects(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.agent_projects ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
CREATE POLICY "Users can view their own projects"
ON public.agent_projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.agent_projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.agent_projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.agent_projects FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_agent_projects_updated_at
BEFORE UPDATE ON public.agent_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
