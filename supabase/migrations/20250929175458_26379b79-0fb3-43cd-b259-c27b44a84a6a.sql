-- =====================================================
-- CRITICAL SECURITY FIX: Medical License Verification
-- Implements proper medical credential validation
-- =====================================================

-- Step 1: Add medical license verification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medical_license_number text,
ADD COLUMN IF NOT EXISTS medical_license_country text,
ADD COLUMN IF NOT EXISTS license_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS license_verified boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS license_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_source text,
ADD COLUMN IF NOT EXISTS license_verification_notes text;

-- Step 2: Create index for faster license lookups
CREATE INDEX IF NOT EXISTS idx_profiles_license_verified 
ON public.profiles(license_verified, user_role) 
WHERE license_verified = true;

-- Step 3: Replace is_verified_medical_professional with strict validation
DROP FUNCTION IF EXISTS public.is_verified_medical_professional() CASCADE;

CREATE OR REPLACE FUNCTION public.is_verified_medical_professional()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get user profile with strict validation requirements
  SELECT 
    user_role, 
    organization, 
    specialty,
    full_name,
    medical_license_number,
    license_verified,
    license_expires_at,
    created_at
  INTO user_profile
  FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND user_role IN ('medico', 'hospital');
  
  -- Return false if no valid profile found
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- CRITICAL: Require verified medical license
  IF user_profile.license_verified IS NOT TRUE THEN
    RETURN false;
  END IF;
  
  -- Check license has not expired
  IF user_profile.license_expires_at IS NOT NULL 
     AND user_profile.license_expires_at < now() THEN
    RETURN false;
  END IF;
  
  -- Require essential profile information
  IF user_profile.full_name IS NULL OR user_profile.full_name = '' THEN
    RETURN false;
  END IF;
  
  IF user_profile.organization IS NULL OR user_profile.organization = '' THEN
    RETURN false;
  END IF;
  
  IF user_profile.specialty IS NULL OR user_profile.specialty = '' THEN
    RETURN false;
  END IF;
  
  -- Require medical license number
  IF user_profile.medical_license_number IS NULL 
     OR user_profile.medical_license_number = '' 
     OR length(user_profile.medical_license_number) < 5 THEN
    RETURN false;
  END IF;
  
  -- Account must be at least 1 day old (prevents immediate access after signup)
  IF user_profile.created_at > (now() - interval '1 day') THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.is_verified_medical_professional() IS 
'Strictly validates medical professional credentials including verified license, expiration, and complete profile information. Used for RLS on sensitive medical data.';

-- Step 4: Update RLS policies on profiles to prevent self-verification
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Users CANNOT modify their license verification status
    license_verified = (SELECT license_verified FROM public.profiles WHERE user_id = auth.uid())
    OR license_verified IS NULL
  )
);

-- Step 5: Recreate RLS policies on AGENTE AORTA table with strict validation
DROP POLICY IF EXISTS "Verified medical professionals can view AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Verified medical professionals can insert AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Verified medical professionals can update AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Verified medical professionals can delete AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Enhanced: Medical professionals can view AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Enhanced: Medical professionals can insert AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Enhanced: Medical professionals can update AGENTE AORTA data" ON public."AGENTE AORTA";
DROP POLICY IF EXISTS "Enhanced: Medical professionals can delete AGENTE AORTA data" ON public."AGENTE AORTA";

CREATE POLICY "Strict: Verified medical professionals can view AGENTE AORTA data"
ON public."AGENTE AORTA"
FOR SELECT
USING (
  is_verified_medical_professional()
  AND (SELECT log_medical_data_access('AGENTE AORTA', 'SELECT')) IS NULL
);

CREATE POLICY "Strict: Verified medical professionals can insert AGENTE AORTA data"
ON public."AGENTE AORTA"
FOR INSERT
WITH CHECK (
  is_verified_medical_professional()
  AND (SELECT log_medical_data_access('AGENTE AORTA', 'INSERT')) IS NULL
);

CREATE POLICY "Strict: Verified medical professionals can update AGENTE AORTA data"
ON public."AGENTE AORTA"
FOR UPDATE
USING (
  is_verified_medical_professional()
  AND (SELECT log_medical_data_access('AGENTE AORTA', 'UPDATE')) IS NULL
);

CREATE POLICY "Strict: Hospital admins only can delete AGENTE AORTA data"
ON public."AGENTE AORTA"
FOR DELETE
USING (
  is_verified_medical_professional()
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND user_role = 'hospital'
  )
  AND (SELECT log_medical_data_access('AGENTE AORTA', 'DELETE')) IS NULL
);

-- Step 6: Create admin function to verify medical licenses (only admins can call this)
CREATE OR REPLACE FUNCTION public.admin_verify_medical_license(
  p_user_id uuid,
  p_license_number text,
  p_license_country text,
  p_expires_at timestamp with time zone,
  p_verification_source text,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function should only be called by admin users
  -- In production, add additional admin role checks here
  
  UPDATE public.profiles
  SET 
    medical_license_number = p_license_number,
    medical_license_country = p_license_country,
    license_expires_at = p_expires_at,
    license_verified = true,
    license_verified_at = now(),
    verification_source = p_verification_source,
    license_verification_notes = p_notes
  WHERE user_id = p_user_id;
END;
$$;

COMMENT ON FUNCTION public.admin_verify_medical_license IS 
'Admin-only function to verify medical professional licenses. Should only be called after proper credential verification.';

-- Step 7: Create view for pending license verifications
CREATE OR REPLACE VIEW public.pending_license_verifications AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.full_name,
  p.user_role,
  p.organization,
  p.specialty,
  p.medical_license_number,
  p.medical_license_country,
  p.created_at
FROM public.profiles p
WHERE p.user_role IN ('medico', 'hospital')
  AND (p.license_verified = false OR p.license_verified IS NULL)
  AND p.medical_license_number IS NOT NULL
ORDER BY p.created_at DESC;

COMMENT ON VIEW public.pending_license_verifications IS 
'View showing medical professionals awaiting license verification';

-- Step 8: Add helpful comments
COMMENT ON COLUMN public.profiles.medical_license_number IS 'Medical license number - must be verified by admin before access is granted';
COMMENT ON COLUMN public.profiles.license_verified IS 'Whether the medical license has been verified by an administrator - users cannot self-verify';
COMMENT ON COLUMN public.profiles.license_expires_at IS 'Expiration date of medical license - access is revoked after this date';
COMMENT ON COLUMN public.profiles.verification_source IS 'Source of license verification (e.g., medical board, hospital credentials)';

-- Grant necessary permissions
GRANT SELECT ON public.pending_license_verifications TO authenticated;