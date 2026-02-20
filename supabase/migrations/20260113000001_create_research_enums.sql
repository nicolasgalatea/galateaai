-- ============================================================
-- MIGRACION 1: Crear ENUMs para el sistema de investigacion
-- ============================================================

-- Enum para las fases del proyecto de investigacion
CREATE TYPE public.research_project_phase AS ENUM (
  'PROTOCOL_GENERATION',
  'AWAITING_APPROVAL',
  'EXECUTING_REVIEW',
  'COMPLETED'
);

-- Enum para status de ejecucion de agentes individuales
CREATE TYPE public.agent_execution_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed',
  'skipped'
);
