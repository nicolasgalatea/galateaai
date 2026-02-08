
-- Fix: Prevent users from modifying their own user_role field (privilege escalation prevention)
-- Drop existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create restrictive UPDATE policy that prevents user_role modification
-- Users can update their own profile but cannot change user_role
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (
    user_role IS NOT DISTINCT FROM (SELECT p.user_role FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);
