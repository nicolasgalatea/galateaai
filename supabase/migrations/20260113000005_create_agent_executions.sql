-- ============================================================
-- MIGRACION 5: Tabla para tracking de ejecucion de agentes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.agent_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Identificacion del agente
  agent_number INTEGER NOT NULL CHECK (agent_number BETWEEN 1 AND 14),
  agent_name TEXT NOT NULL,
  phase INTEGER NOT NULL CHECK (phase IN (1, 2)),

  -- Estado de ejecucion
  status public.agent_execution_status NOT NULL DEFAULT 'pending',

  -- Input/Output
  input_payload JSONB,
  output_result JSONB,
  output_markdown TEXT,

  -- Metricas
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  tokens_used INTEGER,

  -- Errores
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_agent_executions_project_id ON public.agent_executions(project_id);
CREATE INDEX idx_agent_executions_agent_number ON public.agent_executions(agent_number);
CREATE INDEX idx_agent_executions_status ON public.agent_executions(status);

-- RLS
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view executions for their projects"
ON public.agent_executions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.agent_projects
    WHERE id = project_id AND user_id = auth.uid()
  )
);
