import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let _client = null;

function getClient() {
  if (!_client) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials in environment variables');
    }
    _client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

const TABLE = 'research_projects';

/**
 * Merge data into a project's phase_data JSONB column
 * @param {string} projectId - UUID of the project
 * @param {string} phase - Phase key (e.g., 'picot', 'finer_results')
 * @param {any} data - Data to merge
 */
export async function updatePhaseData(projectId, phase, data) {
  const sb = getClient();

  // Fetch current phase_data
  const { data: row, error: fetchErr } = await sb
    .from(TABLE)
    .select('phase_data')
    .eq('project_id', projectId)
    .single();

  if (fetchErr) {
    // Try by id column instead
    const { data: row2, error: fetchErr2 } = await sb
      .from(TABLE)
      .select('phase_data')
      .eq('id', projectId)
      .single();
    if (fetchErr2) throw new Error(`Supabase fetch error: ${fetchErr2.message}`);
    const merged = { ...(row2.phase_data || {}), [phase]: data };
    const { error: updateErr } = await sb
      .from(TABLE)
      .update({ phase_data: merged, updated_at: new Date().toISOString() })
      .eq('id', projectId);
    if (updateErr) throw new Error(`Supabase update error: ${updateErr.message}`);
    return merged;
  }

  const merged = { ...(row.phase_data || {}), [phase]: data };
  const { error: updateErr } = await sb
    .from(TABLE)
    .update({ phase_data: merged, updated_at: new Date().toISOString() })
    .eq('project_id', projectId);
  if (updateErr) throw new Error(`Supabase update error: ${updateErr.message}`);
  return merged;
}
