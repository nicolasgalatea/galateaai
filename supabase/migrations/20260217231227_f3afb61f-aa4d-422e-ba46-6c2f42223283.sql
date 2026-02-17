
-- Grant full permissions to service_role for n8n access
GRANT ALL ON TABLE public.research_lab_progress TO service_role;
GRANT ALL ON TABLE public.research_projects TO service_role;

-- Ensure fase_0_1_output is JSONB
ALTER TABLE public.research_lab_progress 
ALTER COLUMN fase_0_1_output SET DATA TYPE jsonb USING fase_0_1_output::jsonb;
