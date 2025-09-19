-- Harden RLS for profiles: restrict to authenticated role explicitly and ensure own-row access only
-- 1) Ensure RLS enabled (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing policies to avoid duplicates and recreate with explicit role scoping
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 3) Recreate strict policies bound to the authenticated role only
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4) Defense-in-depth: helpful index on user_id used by RLS and queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
