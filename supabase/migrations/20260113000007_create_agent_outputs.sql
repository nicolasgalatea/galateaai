-- ============================================================
-- MIGRACION 7: Tabla para outputs de agentes (auditoria completa)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,
  
  -- Identificacion del agente
  agent_number INTEGER NOT NULL CHECK (agent_number BETWEEN 1 AND 14),
  agent_name TEXT NOT NULL,
  
  -- Datos de salida
  output_data JSONB NOT NULL DEFAULT '{}',
  output_markdown TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices para performance
CREATE INDEX idx_agent_outputs_project_id ON public.agent_outputs(project_id);
CREATE INDEX idx_agent_outputs_agent_number ON public.agent_outputs(agent_number);
CREATE INDEX idx_agent_outputs_created_at ON public.agent_outputs(created_at DESC);

-- Indice compuesto para consultas frecuentes
CREATE INDEX idx_agent_outputs_project_agent ON public.agent_outputs(project_id, agent_number);

-- RLS
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view outputs for their projects"
ON public.agent_outputs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);

CREATE POLICY "System can insert outputs for projects"
ON public.agent_outputs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);
