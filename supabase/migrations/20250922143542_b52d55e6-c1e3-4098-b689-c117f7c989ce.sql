-- Add RLS policies for the audit table
DO $$
BEGIN
  -- Create audit table policies only if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medical_data_audit' 
    AND policyname = 'Users can view their own audit records'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own audit records" ON public.medical_data_audit FOR SELECT USING (user_id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medical_data_audit' 
    AND policyname = 'System can insert audit records'
  ) THEN
    EXECUTE 'CREATE POLICY "System can insert audit records" ON public.medical_data_audit FOR INSERT WITH CHECK (true)';
  END IF;
END;
$$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_audit_user_time 
ON public.medical_data_audit (user_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_audit_table_action 
ON public.medical_data_audit (table_name, action, accessed_at DESC);

-- Update existing AGENTE AORTA policies to use the enhanced function
-- Drop and recreate policies with enhanced security

-- SELECT policy
DROP POLICY IF EXISTS "Medical professionals can view AGENTE AORTA data" ON public."AGENTE AORTA";
CREATE POLICY "Enhanced: Medical professionals can view AGENTE AORTA data" 
ON public."AGENTE AORTA"
FOR SELECT 
USING (
  is_verified_medical_professional() AND
  (SELECT public.log_medical_data_access('AGENTE AORTA', 'SELECT')) IS NULL
);

-- INSERT policy  
DROP POLICY IF EXISTS "Medical professionals can insert AGENTE AORTA data" ON public."AGENTE AORTA";
CREATE POLICY "Enhanced: Medical professionals can insert AGENTE AORTA data" 
ON public."AGENTE AORTA"
FOR INSERT 
WITH CHECK (
  is_verified_medical_professional() AND
  (SELECT public.log_medical_data_access('AGENTE AORTA', 'INSERT')) IS NULL
);

-- UPDATE policy
DROP POLICY IF EXISTS "Medical professionals can update AGENTE AORTA data" ON public."AGENTE AORTA";
CREATE POLICY "Enhanced: Medical professionals can update AGENTE AORTA data" 
ON public."AGENTE AORTA"
FOR UPDATE 
USING (
  is_verified_medical_professional() AND
  (SELECT public.log_medical_data_access('AGENTE AORTA', 'UPDATE')) IS NULL
);

-- DELETE policy
DROP POLICY IF EXISTS "Medical professionals can delete AGENTE AORTA data" ON public."AGENTE AORTA";
CREATE POLICY "Enhanced: Medical professionals can delete AGENTE AORTA data" 
ON public."AGENTE AORTA"
FOR DELETE 
USING (
  is_verified_medical_professional() AND
  (SELECT public.log_medical_data_access('AGENTE AORTA', 'DELETE')) IS NULL
);