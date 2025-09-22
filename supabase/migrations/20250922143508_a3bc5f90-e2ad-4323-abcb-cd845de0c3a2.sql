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

-- Enable RLS on audit table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'medical_data_audit'
    ) THEN
        ALTER TABLE public.medical_data_audit ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

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
    user_role
  ) VALUES (
    auth.uid(), 
    p_table_name, 
    p_action, 
    user_profile.user_role
  );
EXCEPTION WHEN OTHERS THEN
  -- Silently handle audit failures to not block medical data access
  NULL;
END;
$$;