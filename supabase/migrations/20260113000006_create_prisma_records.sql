-- ============================================================
-- MIGRACION 6: Tabla para registros PRISMA (Fase 2)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.prisma_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Identificacion del articulo
  external_id TEXT,
  source_database TEXT NOT NULL,

  -- Metadatos bibliograficos
  title TEXT NOT NULL,
  authors TEXT[],
  publication_year INTEGER,
  journal TEXT,
  doi TEXT,
  pmid TEXT,
  abstract TEXT,

  -- Estado en el flujo PRISMA
  prisma_stage TEXT NOT NULL CHECK (prisma_stage IN (
    'identified', 'after_duplicates', 'screened',
    'sought_retrieval', 'assessed_eligibility',
    'included_qualitative', 'included_quantitative'
  )),

  -- Razones de exclusion (si aplica)
  is_excluded BOOLEAN DEFAULT false,
  exclusion_reason TEXT,
  exclusion_stage TEXT,

  -- Evaluacion
  title_abstract_decision TEXT CHECK (title_abstract_decision IN ('include', 'exclude', 'uncertain')),
  fulltext_decision TEXT CHECK (fulltext_decision IN ('include', 'exclude')),

  -- Extraccion de datos (si incluido)
  extracted_data JSONB,
  quality_score NUMERIC(4,2),
  risk_of_bias JSONB,

  -- Metadatos de procesamiento
  processed_by_agent INTEGER,
  processed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_prisma_records_project_id ON public.prisma_records(project_id);
CREATE INDEX idx_prisma_records_stage ON public.prisma_records(prisma_stage);
CREATE INDEX idx_prisma_records_pmid ON public.prisma_records(pmid);

-- RLS
ALTER TABLE public.prisma_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage PRISMA records for their projects"
ON public.prisma_records FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

-- Trigger
CREATE TRIGGER update_prisma_records_updated_at
BEFORE UPDATE ON public.prisma_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
