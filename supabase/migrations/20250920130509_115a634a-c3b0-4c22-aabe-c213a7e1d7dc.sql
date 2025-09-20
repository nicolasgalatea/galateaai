-- Fix dashboard_metrics security: restrict access to authenticated users only
-- Currently the table has a policy "Allow all access to dashboard_metrics" with USING (true)
-- This exposes business intelligence data to everyone

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all access to dashboard_metrics" ON public.dashboard_metrics;

-- Create restricted policies for authenticated users only
CREATE POLICY "Authenticated users can view dashboard metrics"
ON public.dashboard_metrics
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update dashboard metrics" 
ON public.dashboard_metrics
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert dashboard metrics"
ON public.dashboard_metrics
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete dashboard metrics"
ON public.dashboard_metrics
FOR DELETE
TO authenticated
USING (true);