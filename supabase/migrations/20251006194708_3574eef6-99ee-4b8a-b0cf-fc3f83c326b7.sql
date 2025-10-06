-- Tighten access to sensitive columns in profiles table without breaking existing app flows
-- 1) Revoke broad grants so unauthenticated/public users cannot introspect or access the table
REVOKE ALL ON TABLE public.profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.profiles FROM anon;
-- Reset authenticated grants to a minimal set (RLS still enforced)
REVOKE ALL ON TABLE public.profiles FROM authenticated;

-- 2) Grant minimal privileges to authenticated role
-- Allow row-level SELECT for non-sensitive columns only; RLS will still restrict to own row
GRANT SELECT (id, user_id, email, full_name, organization, specialty, phone, created_at, updated_at, license_verified, license_verified_at, license_expires_at)
ON public.profiles TO authenticated;

-- Keep existing ability for users to manage their profile through RLS, but do not expose extra columns via SELECT
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- NOTE: We intentionally DO NOT grant SELECT on these highly sensitive columns:
--   medical_license_number, medical_license_country, license_verification_notes, verification_source
-- They remain invisible to the authenticated role via PostgREST, mitigating accidental exposure.

-- 3) Double-check RLS is enabled (safe no-op if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4) Optional hardening: Ensure no unintended default privileges would leak access in the future
-- (Supabase typically manages defaults, but this guards against future grants)
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC;
