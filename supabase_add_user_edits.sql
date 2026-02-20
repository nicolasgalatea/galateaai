-- ============================================================================
-- MIGRACION: user_edits_json + RPC atomico para Galatea Orchestrator
-- Ejecutar en Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Agregar columna user_edits_json con default {}
ALTER TABLE public.research_lab_progress
  ADD COLUMN IF NOT EXISTS user_edits_json jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.research_lab_progress.user_edits_json IS
  'Ediciones manuales del investigador indexadas por fase. Usado por el orquestador para deep merge.';

-- 2. RPC atomico: actualiza SOLO la clave de una fase dentro de user_edits_json
--    sin tocar las ediciones de otras fases. Usa jsonb_set para atomicidad.
--
--    Uso desde Supabase JS:
--      supabase.rpc('set_user_edits_for_phase', {
--        p_project_id: 'proj_123',
--        p_phase_key: 'fase_2_3_output',
--        p_edits: { population: 'Corregida', _processed: false }
--      })
CREATE OR REPLACE FUNCTION public.set_user_edits_for_phase(
  p_project_id text,
  p_phase_key text,
  p_edits jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current jsonb;
  v_phase_edits jsonb;
  v_merged jsonb;
  v_result jsonb;
BEGIN
  -- Leer el user_edits_json actual
  SELECT COALESCE(user_edits_json, '{}'::jsonb)
    INTO v_current
    FROM public.research_lab_progress
    WHERE project_id = p_project_id;

  -- Si no existe el registro, crearlo con user_edits_json inicializado
  IF NOT FOUND THEN
    INSERT INTO public.research_lab_progress (project_id, fase_actual, user_edits_json, updated_at)
    VALUES (p_project_id, 0, jsonb_build_object(p_phase_key, p_edits || '{"_processed": false}'::jsonb), now())
    RETURNING user_edits_json INTO v_result;
    RETURN v_result;
  END IF;

  -- Obtener las ediciones existentes para esta fase (o {} si no hay)
  v_phase_edits := COALESCE(v_current -> p_phase_key, '{}'::jsonb);

  -- Merge: ediciones existentes + nuevas (las nuevas ganan en conflicto)
  v_merged := v_phase_edits || p_edits || '{"_processed": false}'::jsonb;

  -- Actualizar SOLO la clave de la fase con jsonb_set (atomico, no toca otras fases)
  UPDATE public.research_lab_progress
    SET user_edits_json = jsonb_set(
          COALESCE(user_edits_json, '{}'::jsonb),
          ARRAY[p_phase_key],
          v_merged
        ),
        updated_at = now()
    WHERE project_id = p_project_id
    RETURNING user_edits_json INTO v_result;

  RETURN v_result;
END;
$$;

-- 3. Permisos para que anon y authenticated puedan llamar al RPC
GRANT EXECUTE ON FUNCTION public.set_user_edits_for_phase(text, text, jsonb) TO anon, authenticated, service_role;

-- 4. Backfill: asegurar que registros existentes tengan {} en vez de null
UPDATE public.research_lab_progress
  SET user_edits_json = '{}'::jsonb
  WHERE user_edits_json IS NULL;
