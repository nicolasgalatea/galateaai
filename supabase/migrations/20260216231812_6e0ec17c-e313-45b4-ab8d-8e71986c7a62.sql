
-- RPC: set_user_edits_for_phase
-- Deep-merges a user edit into research_projects.user_edits under the given phase key
CREATE OR REPLACE FUNCTION public.set_user_edits_for_phase(
  p_project_id uuid,
  p_phase_key text,
  p_field text,
  p_value jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE research_projects
  SET user_edits = jsonb_set(
    COALESCE(user_edits, '{}'::jsonb),
    ARRAY[p_phase_key],
    COALESCE(user_edits -> p_phase_key, '{}'::jsonb) || jsonb_build_object(p_field, p_value, '_updated_at', to_jsonb(now()::text)),
    true
  )
  WHERE id = p_project_id;
END;
$$;
