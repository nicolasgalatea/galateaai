-- Fix: Secure pending_license_verifications to prevent exposure
-- 1) Drop insecure view if it exists (also removes prior broad GRANTs)
DROP VIEW IF EXISTS public.pending_license_verifications;

-- 2) Create a proper table with RLS
CREATE TABLE IF NOT EXISTS public.pending_license_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_role app_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  email text,
  full_name text,
  organization text,
  specialty text,
  medical_license_number text,
  medical_license_country text
);

-- 3) Enable Row Level Security (default deny)
ALTER TABLE public.pending_license_verifications ENABLE ROW LEVEL SECURITY;

-- 4) Least-privilege: ensure no direct grants remain
REVOKE ALL ON TABLE public.pending_license_verifications FROM PUBLIC;
REVOKE ALL ON TABLE public.pending_license_verifications FROM anon;
REVOKE ALL ON TABLE public.pending_license_verifications FROM authenticated;

-- 5) Admin check function (based on profiles.user_role = 'hospital')
CREATE OR REPLACE FUNCTION public.is_license_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and user_role = 'hospital'::app_role
  );
$$;

-- 6) RLS policies: admins only for read/update/delete; users can insert their own
DROP POLICY IF EXISTS "License admins can view all pending verifications" ON public.pending_license_verifications;
CREATE POLICY "License admins can view all pending verifications"
ON public.pending_license_verifications
FOR SELECT
USING (public.is_license_admin());

DROP POLICY IF EXISTS "Users can insert their own pending verification" ON public.pending_license_verifications;
CREATE POLICY "Users can insert their own pending verification"
ON public.pending_license_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_license_admin());

DROP POLICY IF EXISTS "License admins can update pending verifications" ON public.pending_license_verifications;
CREATE POLICY "License admins can update pending verifications"
ON public.pending_license_verifications
FOR UPDATE
USING (public.is_license_admin());

DROP POLICY IF EXISTS "License admins can delete pending verifications" ON public.pending_license_verifications;
CREATE POLICY "License admins can delete pending verifications"
ON public.pending_license_verifications
FOR DELETE
USING (public.is_license_admin());

-- 7) Optional: seed table once with current pending info from profiles (no duplicates)
INSERT INTO public.pending_license_verifications (
  user_id, user_role, email, full_name, organization, specialty, medical_license_number, medical_license_country
)
SELECT 
  p.user_id, p.user_role, p.email, p.full_name, p.organization, p.specialty, p.medical_license_number, p.medical_license_country
FROM public.profiles p
LEFT JOIN public.pending_license_verifications v ON v.user_id = p.user_id
WHERE v.user_id IS NULL
  AND p.user_role IN ('medico'::app_role, 'hospital'::app_role)
  AND (p.license_verified = false OR p.license_verified IS NULL)
  AND p.medical_license_number IS NOT NULL;

-- 8) Comments for clarity
COMMENT ON TABLE public.pending_license_verifications IS 'Pending medical license verification requests. Protected via RLS; only admins (hospital role) can read/update/delete. Users can insert their own request.';
COMMENT ON FUNCTION public.is_license_admin IS 'Returns true if current user is a license admin (hospital role).';
