-- ============================================================
-- MIGRACION 3: Tabla para revisiones existentes (Agente 3: Literature Scout)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.existing_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Metadatos de la revision encontrada
  title TEXT NOT NULL,
  authors TEXT[],
  publication_year INTEGER,
  journal TEXT,
  doi TEXT,
  pmid TEXT,

  -- Tipo de revision
  review_type TEXT CHECK (review_type IN (
    'systematic_review', 'meta_analysis', 'scoping_review',
    'narrative_review', 'umbrella_review', 'cochrane_review'
  )),

  -- Relevancia y gaps
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  overlap_percentage INTEGER CHECK (overlap_percentage BETWEEN 0 AND 100),
  identified_gaps TEXT[],

  -- Resumen y conclusiones
  abstract TEXT,
  key_findings TEXT,
  limitations TEXT,

  -- Fuente de busqueda
  source_database TEXT,
  search_date TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Recomendacion del agente
  recommendation TEXT CHECK (recommendation IN (
    'proceed_new_review', 'update_existing', 'no_new_review_needed', 'narrow_scope'
  )),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_existing_reviews_project_id ON public.existing_reviews(project_id);
CREATE INDEX idx_existing_reviews_relevance ON public.existing_reviews(relevance_score DESC);

-- RLS
ALTER TABLE public.existing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews for their projects"
ON public.existing_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert reviews for their projects"
ON public.existing_reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete reviews for their projects"
ON public.existing_reviews FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);
