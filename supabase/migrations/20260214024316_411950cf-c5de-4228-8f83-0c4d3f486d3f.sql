
-- Table for 10-phase Research Lab orchestration
CREATE TABLE public.research_lab_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  research_question TEXT,
  fase_actual INTEGER NOT NULL DEFAULT 0,
  fase_0_1_output JSONB,
  fase_2_3_output JSONB,
  fase_4_5_output JSONB,
  fase_6_7_output JSONB,
  fase_8_9_output JSONB,
  status TEXT NOT NULL DEFAULT 'idle',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_lab_progress ENABLE ROW LEVEL SECURITY;

-- Public read policy (demo data, no auth required)
CREATE POLICY "Anyone can read research lab progress"
ON public.research_lab_progress
FOR SELECT
USING (true);

-- Public insert/update for n8n webhook writes
CREATE POLICY "Anyone can insert research lab progress"
ON public.research_lab_progress
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update research lab progress"
ON public.research_lab_progress
FOR UPDATE
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_lab_progress;

-- Trigger for updated_at
CREATE TRIGGER update_research_lab_progress_updated_at
BEFORE UPDATE ON public.research_lab_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
