-- Create audit log table for medical data access
CREATE TABLE IF NOT EXISTS public.medical_data_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_role TEXT,
  ip_address INET,
  session_id TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.medical_data_audit ENABLE ROW LEVEL SECURITY;

-- Create enhanced medical professional validation function
CREATE OR REPLACE FUNCTION public.is_verified_medical_professional()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user profile with additional validation
  SELECT user_role, organization, specialty, created_at
  INTO user_profile
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_role IN ('medico', 'hospital');
  
  -- Return false if no valid profile found
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Additional security checks
  -- Ensure profile has been active for at least 24 hours (prevents immediate access after role change)
  IF user_profile.created_at > now() - INTERVAL '24 hours' THEN
    RETURN false;
  END IF;
  
  -- Ensure user has organization (additional verification)
  IF user_profile.organization IS NULL OR user_profile.organization = '' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create audit logging function
CREATE OR REPLACE FUNCTION public.log_medical_data_access(
  p_table_name TEXT,
  p_action TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Only log if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Get user profile for audit
  SELECT user_role INTO user_profile
  FROM public.profiles 
  WHERE user_id = auth.uid();
  
  -- Insert audit record
  INSERT INTO public.medical_data_audit (
    user_id, 
    table_name, 
    action, 
    user_role,
    session_id
  ) VALUES (
    auth.uid(), 
    p_table_name, 
    p_action, 
    user_profile.user_role,
    current_setting('request.jwt.claims', true)::json->>'session_id'
  );
EXCEPTION WHEN OTHERS THEN
  -- Silently handle audit failures to not block medical data access
  NULL;
END;
$$;

-- Create audit table policies (only allow viewing own audit records for regular users)
CREATE POLICY "Users can view their own audit records" 
ON public.medical_data_audit
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert audit records" 
ON public.medical_data_audit
FOR INSERT 
WITH CHECK (true);

-- Add indexes for better performance and security
CREATE INDEX IF NOT EXISTS idx_medical_audit_user_time 
ON public.medical_data_audit (user_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_medical_audit_table_action 
ON public.medical_data_audit (table_name, action, accessed_at DESC);