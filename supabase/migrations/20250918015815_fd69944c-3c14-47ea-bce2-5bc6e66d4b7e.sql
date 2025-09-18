-- Enable Row Level Security on AGENTE AORTA table
ALTER TABLE public."AGENTE AORTA" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow medical professionals to view patient data
CREATE POLICY "Medical professionals can view AGENTE AORTA data" 
ON public."AGENTE AORTA" 
FOR SELECT 
USING (is_medical_professional());

-- Create policy to allow medical professionals to insert patient data
CREATE POLICY "Medical professionals can insert AGENTE AORTA data" 
ON public."AGENTE AORTA" 
FOR INSERT 
WITH CHECK (is_medical_professional());

-- Create policy to allow medical professionals to update patient data
CREATE POLICY "Medical professionals can update AGENTE AORTA data" 
ON public."AGENTE AORTA" 
FOR UPDATE 
USING (is_medical_professional());

-- Create policy to allow medical professionals to delete patient data
CREATE POLICY "Medical professionals can delete AGENTE AORTA data" 
ON public."AGENTE AORTA" 
FOR DELETE 
USING (is_medical_professional());