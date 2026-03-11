-- Add project_code with auto-generation and institutional route fields
-- Migration: Carlos CMO corrections

-- 1. Project code (GAL-YYYY-XXXX)
ALTER TABLE research_projects
  ADD COLUMN IF NOT EXISTS project_code TEXT UNIQUE;

-- Auto-generate project_code on INSERT
CREATE OR REPLACE FUNCTION generate_project_code()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  -- Get the next sequence number for the current year
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

-- 2. Institutional route fields
ALTER TABLE research_projects
  ADD COLUMN IF NOT EXISTS submission_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subdireccion_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS comite_etica_status TEXT DEFAULT 'pending';

-- 3. source_section for references
ALTER TABLE project_references
  ADD COLUMN IF NOT EXISTS source_section TEXT;

-- Index for filtering references by section
CREATE INDEX IF NOT EXISTS idx_project_references_source_section
  ON project_references(project_id, source_section);
