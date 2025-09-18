-- SECURITY FIX: Restrict public access to financial data in transacciones
-- This migration removes public access and implements user-specific RLS while allowing finance roles to manage data.

BEGIN;

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

-- Remove dangerously permissive policy
DROP POLICY IF EXISTS "Allow all access to transacciones" ON public.transacciones;

-- Add user ownership column (nullable for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'transacciones' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.transacciones
    ADD COLUMN user_id uuid;
  END IF;
END $$;

-- Helpful index for ownership lookups
CREATE INDEX IF NOT EXISTS idx_transacciones_user_id ON public.transacciones(user_id);

-- Security definer function: finance roles only (hospital, eps)
CREATE OR REPLACE FUNCTION public.can_manage_financial_data()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND user_role IN ('hospital','eps')
  );
END;
$$;

-- USER-SPECIFIC AND ROLE-BASED POLICIES
-- View: owner can view their own, finance roles can view all
CREATE POLICY "Users can view their own transactions or finance admins"
ON public.transacciones
FOR SELECT
USING (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  public.can_manage_financial_data()
);

-- Insert: owner can insert their own, finance roles can insert
CREATE POLICY "Users can insert their own transactions or finance admins"
ON public.transacciones
FOR INSERT
WITH CHECK (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  public.can_manage_financial_data()
);

-- Update: owner can update their own, finance roles can update
CREATE POLICY "Users can update their own transactions or finance admins"
ON public.transacciones
FOR UPDATE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  public.can_manage_financial_data()
);

-- Delete: owner can delete their own, finance roles can delete
CREATE POLICY "Users can delete their own transactions or finance admins"
ON public.transacciones
FOR DELETE
USING (
  (user_id IS NOT NULL AND user_id = auth.uid()) OR
  public.can_manage_financial_data()
);

COMMIT;