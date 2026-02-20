
-- ═══════════════════════════════════════════════════════════════
-- TABLE: project_references
-- Relación 1:N con research_projects
-- Cero tolerancia a citas sin PMID (enforced via trigger)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.project_references (
  id            uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id    text NOT NULL,                   -- FK lógico a research_projects.project_id
  row_id        uuid REFERENCES public.research_projects(id) ON DELETE CASCADE,
  pmid          text NOT NULL,                   -- PubMed ID — obligatorio
  doi           text,
  title         text NOT NULL,
  authors       text,
  journal       text,
  year          integer,
  abstract      text,
  url           text GENERATED ALWAYS AS (
                  CASE WHEN pmid IS NOT NULL
                    THEN 'https://pubmed.ncbi.nlm.nih.gov/' || pmid || '/'
                    ELSE NULL
                  END
                ) STORED,
  phase_used    integer,                         -- En qué fase fue citado (1-10)
  relevance_score numeric(3,2),                  -- 0.00 – 1.00
  inclusion_status text DEFAULT 'pending',       -- pending | included | excluded
  exclusion_reason text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pmid_not_empty CHECK (pmid <> '')
);

-- ── Trigger: PMID validation (no vacío, no nulo) ─────────────
CREATE OR REPLACE FUNCTION public.validate_reference_pmid()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.pmid IS NULL OR trim(NEW.pmid) = '' THEN
    RAISE EXCEPTION 'PMID obligatorio: no se aceptan citas sin identificador PubMed. pmid=%', NEW.pmid;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_reference_pmid
  BEFORE INSERT OR UPDATE ON public.project_references
  FOR EACH ROW EXECUTE FUNCTION public.validate_reference_pmid();

-- ── Trigger: updated_at automático ──────────────────────────
CREATE OR REPLACE TRIGGER trg_project_references_updated_at
  BEFORE UPDATE ON public.project_references
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Index para búsquedas por proyecto ───────────────────────
CREATE INDEX IF NOT EXISTS idx_project_references_project_id ON public.project_references (project_id);
CREATE INDEX IF NOT EXISTS idx_project_references_row_id     ON public.project_references (row_id);
CREATE INDEX IF NOT EXISTS idx_project_references_pmid       ON public.project_references (pmid);

-- ── Enable Realtime ──────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_references;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.project_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read project references"
  ON public.project_references FOR SELECT USING (true);

CREATE POLICY "Anyone can insert project references"
  ON public.project_references FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update project references"
  ON public.project_references FOR UPDATE USING (true);

-- Permisos para service_role (n8n)
GRANT ALL ON TABLE public.project_references TO service_role;
