-- ============================================================================
-- Migracion: Correcciones Carlos (CMO) - Marzo 2026
-- 1. Crear project_references si no existe
-- 2. Agregar project_code con auto-generacion
-- 3. Agregar campos de ruta institucional
-- 4. Agregar source_section a project_references
-- ============================================================================

-- 1. CREAR project_references si no existe
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_references (
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
  citation_key INTEGER NOT NULL,
  source_section TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_references_project ON public.project_references(project_id);
CREATE INDEX IF NOT EXISTS idx_project_references_source_section ON public.project_references(project_id, source_section);

-- RLS
ALTER TABLE public.project_references ENABLE ROW LEVEL SECURITY;

-- Politica permisiva (para n8n y anon)
DO $$ BEGIN
  CREATE POLICY "refs_anon_all" ON public.project_references FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- RPC approve_and_advance (crear si no existe)
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

-- 2. AGREGAR project_code con auto-generacion
-- ============================================================================
ALTER TABLE public.research_projects
  ADD COLUMN IF NOT EXISTS project_code TEXT UNIQUE;

ALTER TABLE public.research_projects
  ADD COLUMN IF NOT EXISTS title TEXT;

CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(project_code FROM 10 FOR 4) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM research_projects
  WHERE project_code LIKE 'GAL-' || EXTRACT(YEAR FROM NOW())::TEXT || '-%';

  NEW.project_code := 'GAL-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(next_seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_project_code ON research_projects;
CREATE TRIGGER trg_generate_project_code
  BEFORE INSERT ON research_projects
  FOR EACH ROW
  WHEN (NEW.project_code IS NULL)
  EXECUTE FUNCTION generate_project_code();

-- 3. CAMPOS DE RUTA INSTITUCIONAL
-- ============================================================================
ALTER TABLE public.research_projects
  ADD COLUMN IF NOT EXISTS submission_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subdireccion_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS comite_etica_status TEXT DEFAULT 'pending';

-- 4. source_section en project_references (por si la tabla ya existia sin esa columna)
-- ============================================================================
ALTER TABLE public.project_references
  ADD COLUMN IF NOT EXISTS source_section TEXT;

-- Habilitar Realtime para project_references
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.project_references;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

SELECT 'Migracion Carlos CMO completada exitosamente.' AS resultado;
