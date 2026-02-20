-- ════════════════════════════════════════════════════════════════════════════
-- SCRIPT COMPLETO: Tablas para el Sistema de Investigación de Galatea
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ════════════════════════════════════════════════════════════════════════════

-- 1. CREAR ENUMS (si no existen)
-- ════════════════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE public.research_project_phase AS ENUM (
    'PROTOCOL_GENERATION',
    'AWAITING_APPROVAL',
    'EXECUTING_REVIEW',
    'COMPLETED',
    'ERROR'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.agent_execution_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed',
    'skipped'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLA PRINCIPAL: agent_projects
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.agent_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadatos del proyecto
  title TEXT NOT NULL,
  description TEXT,
  research_question TEXT,
  idea TEXT, -- Campo alternativo para la pregunta inicial

  -- Estado y fase actual
  phase public.research_project_phase NOT NULL DEFAULT 'PROTOCOL_GENERATION',
  status TEXT DEFAULT 'pending', -- Campo simple para compatibilidad con n8n
  current_agent_step INTEGER NOT NULL DEFAULT 1,
  active_agent TEXT,
  error_message TEXT, -- Para guardar errores si phase = ERROR

  -- Datos de PICOT (Agente 1)
  picot_population TEXT,
  picot_intervention TEXT,
  picot_comparison TEXT,
  picot_outcome TEXT,
  picot_timeframe TEXT,

  -- Score FINER (Agente 2)
  finer_feasible INTEGER CHECK (finer_feasible BETWEEN 0 AND 10),
  finer_interesting INTEGER CHECK (finer_interesting BETWEEN 0 AND 10),
  finer_novel INTEGER CHECK (finer_novel BETWEEN 0 AND 10),
  finer_ethical INTEGER CHECK (finer_ethical BETWEEN 0 AND 10),
  finer_relevant INTEGER CHECK (finer_relevant BETWEEN 0 AND 10),
  finer_total_score INTEGER,

  -- Tipo de estudio (Agente 4)
  study_type TEXT,

  -- Objetivos ICMJE (Agente 5)
  objectives_primary TEXT,
  objectives_secondary TEXT[],

  -- Estrategia de búsqueda Yadav (Agente 7)
  search_strategy_pubmed TEXT,
  search_strategy_cochrane TEXT,
  search_strategy_embase TEXT,
  search_strategy_other JSONB,

  -- Protocolo generado (Agente 8)
  protocol_pdf_url TEXT,
  protocol_generated_at TIMESTAMP WITH TIME ZONE,

  -- Aprobación (Bloqueo entre fases)
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,

  -- Resultados Fase 2
  prisma_data JSONB,
  extracted_data_url TEXT,
  final_report_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agent_projects_user_id ON public.agent_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_projects_phase ON public.agent_projects(phase);
CREATE INDEX IF NOT EXISTS idx_agent_projects_status ON public.agent_projects(status);
CREATE INDEX IF NOT EXISTS idx_agent_projects_created_at ON public.agent_projects(created_at DESC);

-- 3. TABLA: agent_outputs (Historial de outputs de cada agente)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.agent_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Identificación del agente
  agent_number INTEGER NOT NULL CHECK (agent_number BETWEEN 1 AND 14),
  agent_name TEXT,

  -- Output del agente
  output_data JSONB,
  output_markdown TEXT,

  -- Metadatos
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  status TEXT DEFAULT 'completed',
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agent_outputs_project_id ON public.agent_outputs(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_agent_number ON public.agent_outputs(agent_number);

-- 4. TABLA: existing_reviews (Agente 3: Literature Scout)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.existing_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Metadatos de la revisión
  title TEXT NOT NULL,
  authors TEXT[],
  publication_year INTEGER,
  journal TEXT,
  doi TEXT,
  pmid TEXT,

  -- Tipo de revisión
  review_type TEXT,

  -- Relevancia y gaps
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  overlap_percentage INTEGER CHECK (overlap_percentage BETWEEN 0 AND 100),
  identified_gaps TEXT[],

  -- Resumen
  abstract TEXT,
  key_findings TEXT,
  limitations TEXT,

  -- Fuente
  source_database TEXT DEFAULT 'PubMed',
  search_date TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Recomendación
  recommendation TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_existing_reviews_project_id ON public.existing_reviews(project_id);

-- 5. TABLA: study_criteria (Agente 6: Criteria Definer)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.study_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.agent_projects(id) ON DELETE CASCADE,

  -- Tipo de criterio
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('inclusion', 'exclusion')),

  -- Categoría
  category TEXT NOT NULL,

  -- Descripción
  description TEXT NOT NULL,
  rationale TEXT,
  operationalization TEXT,

  -- Prioridad y orden
  priority INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,

  -- Validación
  is_validated BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_criteria_project_id ON public.study_criteria(project_id);

-- 6. HABILITAR RLS (Row Level Security)
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.agent_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.existing_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_criteria ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE SEGURIDAD
-- ════════════════════════════════════════════════════════════════════════════

-- agent_projects: usuarios pueden ver/editar sus propios proyectos
DROP POLICY IF EXISTS "Users can view their own projects" ON public.agent_projects;
CREATE POLICY "Users can view their own projects" ON public.agent_projects
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create projects" ON public.agent_projects;
CREATE POLICY "Users can create projects" ON public.agent_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.agent_projects;
CREATE POLICY "Users can update their own projects" ON public.agent_projects
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.agent_projects;
CREATE POLICY "Users can delete their own projects" ON public.agent_projects
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Política para permitir acceso anónimo (para n8n webhooks)
DROP POLICY IF EXISTS "Allow anonymous access for webhooks" ON public.agent_projects;
CREATE POLICY "Allow anonymous access for webhooks" ON public.agent_projects
  FOR ALL USING (true);

-- agent_outputs
DROP POLICY IF EXISTS "Users can manage agent outputs" ON public.agent_outputs;
CREATE POLICY "Users can manage agent outputs" ON public.agent_outputs
  FOR ALL USING (true);

-- existing_reviews
DROP POLICY IF EXISTS "Users can manage existing reviews" ON public.existing_reviews;
CREATE POLICY "Users can manage existing reviews" ON public.existing_reviews
  FOR ALL USING (true);

-- study_criteria
DROP POLICY IF EXISTS "Users can manage study criteria" ON public.study_criteria;
CREATE POLICY "Users can manage study criteria" ON public.study_criteria
  FOR ALL USING (true);

-- 8. FUNCIÓN PARA ACTUALIZAR updated_at
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_agent_projects_updated_at ON public.agent_projects;
CREATE TRIGGER update_agent_projects_updated_at
  BEFORE UPDATE ON public.agent_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_study_criteria_updated_at ON public.study_criteria;
CREATE TRIGGER update_study_criteria_updated_at
  BEFORE UPDATE ON public.study_criteria
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. HABILITAR REALTIME
-- ════════════════════════════════════════════════════════════════════════════

-- Habilitar Realtime para las tablas principales
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_outputs;

-- 10. INSERTAR PROYECTO DE PRUEBA (opcional)
-- ════════════════════════════════════════════════════════════════════════════

-- INSERT INTO public.agent_projects (title, research_question, idea, status, phase)
-- VALUES (
--   'Proyecto de Prueba',
--   '¿Cuál es la efectividad de la metformina en la prevención del Alzheimer?',
--   'Efectividad de metformina en prevención de Alzheimer en diabéticos tipo 2',
--   'pending',
--   'PROTOCOL_GENERATION'
-- );

-- ════════════════════════════════════════════════════════════════════════════
-- FIN DEL SCRIPT
-- ════════════════════════════════════════════════════════════════════════════

SELECT 'Tablas creadas exitosamente. Realtime habilitado para agent_projects y agent_outputs.' as resultado;
