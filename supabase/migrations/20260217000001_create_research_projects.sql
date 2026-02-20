-- ============================================================
-- Research Projects: Tabla con columnas semanticas por agente
-- Arquitectura de 4 agentes (Arquitecto, Metodólogo, Evidencia, Redactor)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.research_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Fase actual del flujo (0 a 10)
  current_phase INTEGER NOT NULL DEFAULT 0 CHECK (current_phase >= 0 AND current_phase <= 10),

  -- Agent 1 — Arquitecto (Fases 0-3): diseño y pregunta de investigación
  study_design TEXT,
  research_question JSONB,

  -- Agent 2 — Metodólogo (Fases 4-6): FINER, hipótesis, carpetas
  finer_results JSONB,
  hypothesis TEXT,
  folder_path TEXT,

  -- Agent 3 — Evidencia (Fase 7): estrategia de búsqueda
  search_strategy JSONB,

  -- Agent 4 — Redactor (Fases 8-10): protocolo, manuscrito, plan estadístico
  protocol_draft JSONB,
  manuscript_draft JSONB,
  statistical_plan JSONB,

  -- Shared: ediciones del usuario (patrón atómico con jsonb_set)
  user_edits_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Estado del proyecto
  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_research_projects_user_id ON public.research_projects(user_id);
CREATE INDEX idx_research_projects_current_phase ON public.research_projects(current_phase);
CREATE INDEX idx_research_projects_status ON public.research_projects(status);

-- RLS
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own research projects"
ON public.research_projects FOR SELECT
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own research projects"
ON public.research_projects FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own research projects"
ON public.research_projects FOR UPDATE
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own research projects"
ON public.research_projects FOR DELETE
USING (user_id = auth.uid()::text);

-- Service role bypass (para n8n y edge functions)
CREATE POLICY "Service role has full access to research projects"
ON public.research_projects FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Trigger updated_at
CREATE TRIGGER update_research_projects_updated_at
BEFORE UPDATE ON public.research_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RPC: set_research_project_user_edits
-- Patrón atómico con jsonb_set para ediciones del usuario.
-- Solo toca la clave de la fase activa — las demás quedan intactas.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_research_project_user_edits(
  p_project_id TEXT,
  p_phase_key TEXT,
  p_edits JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  UPDATE public.research_projects
  SET
    user_edits_json = jsonb_set(
      COALESCE(user_edits_json, '{}'::jsonb),
      ARRAY[p_phase_key],
      p_edits,
      true
    ),
    updated_at = now()
  WHERE id = p_project_id::uuid
  RETURNING user_edits_json INTO v_result;

  -- Si no existe el registro, hacer upsert
  IF NOT FOUND THEN
    INSERT INTO public.research_projects (id, user_id, user_edits_json)
    VALUES (
      p_project_id::uuid,
      COALESCE(auth.uid()::text, 'system'),
      jsonb_build_object(p_phase_key, p_edits)
    )
    ON CONFLICT (id) DO UPDATE
    SET
      user_edits_json = jsonb_set(
        COALESCE(public.research_projects.user_edits_json, '{}'::jsonb),
        ARRAY[p_phase_key],
        p_edits,
        true
      ),
      updated_at = now()
    RETURNING user_edits_json INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;
