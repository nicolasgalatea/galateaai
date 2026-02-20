-- ============================================================================
-- FIX AGENT_PROJECTS SCHEMA
-- Ejecutar en Supabase SQL Editor para alinear la tabla con el codigo
-- ============================================================================

-- 1. AGREGAR COLUMNAS FALTANTES A agent_projects
-- ============================================================================

-- Agregar 'title' si no existe
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS title TEXT;

-- Agregar 'description' si no existe
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS description TEXT;

-- Agregar 'research_question' si no existe
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS research_question TEXT;

-- Agregar 'phase' si no existe (con valor por defecto)
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'PROTOCOL_GENERATION';

-- Agregar 'current_agent_step' si no existe (con valor por defecto)
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS current_agent_step INTEGER DEFAULT 1;

-- Agregar 'created_at' si no existe
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Agregar 'updated_at' si no existe (util para tracking)
ALTER TABLE agent_projects
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. MIGRAR DATOS EXISTENTES (si 'name' existe, copiarlo a 'title')
-- ============================================================================

-- Copiar 'name' a 'title' donde title este vacio
UPDATE agent_projects
SET title = name
WHERE title IS NULL AND name IS NOT NULL;

-- Copiar 'status' a 'phase' donde phase este vacio (mapeo basico)
UPDATE agent_projects
SET phase = CASE
    WHEN status = 'pending' THEN 'PROTOCOL_GENERATION'
    WHEN status = 'in_progress' THEN 'PROTOCOL_GENERATION'
    WHEN status = 'completed' THEN 'COMPLETED'
    WHEN status = 'error' THEN 'ERROR'
    ELSE 'PROTOCOL_GENERATION'
END
WHERE phase IS NULL OR phase = 'PROTOCOL_GENERATION';

-- 3. CREAR INDICES PARA MEJOR RENDIMIENTO
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_agent_projects_phase
ON agent_projects(phase);

CREATE INDEX IF NOT EXISTS idx_agent_projects_created_at
ON agent_projects(created_at DESC);

-- 4. TRIGGER PARA ACTUALIZAR updated_at AUTOMATICAMENTE
-- ============================================================================

-- Crear funcion para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger (eliminar si existe primero)
DROP TRIGGER IF EXISTS update_agent_projects_updated_at ON agent_projects;

CREATE TRIGGER update_agent_projects_updated_at
BEFORE UPDATE ON agent_projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. DESHABILITAR RLS PARA DESARROLLO (opcional, quitar en produccion)
-- ============================================================================

ALTER TABLE agent_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outputs DISABLE ROW LEVEL SECURITY;

-- 6. PERMISOS
-- ============================================================================

GRANT ALL ON TABLE agent_projects TO anon, authenticated, service_role;
GRANT ALL ON TABLE agent_outputs TO anon, authenticated, service_role;

-- 7. HABILITAR REALTIME (si no esta habilitado)
-- ============================================================================

-- Nota: Esto puede fallar si ya esta habilitado, es seguro ignorar el error
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_projects;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE agent_outputs;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 8. VERIFICACION FINAL
-- ============================================================================

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'agent_projects'
AND table_schema = 'public'
ORDER BY ordinal_position;
