import { supabase } from '@/integrations/supabase/client';
import type { ResearchProject } from '@/types/domain';

// Double-cast to bypass typed client constraints on research_projects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

export interface ApiErrorDetail {
  message: string;
  column?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiErrorDetail | null;
}

export interface TriggerN8NParams {
  phase: 'protocol' | 'review';
  projectId: string;
  title: string;
  research_question: string;
  userId?: string;
}

export interface TriggerN8NResult {
  success: boolean;
  error?: string;
}

const DEMO_MODE = true;
const DEMO_USER_ID = 'demo-user';

async function getCurrentUserId(): Promise<string> {
  if (DEMO_MODE) return DEMO_USER_ID;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || DEMO_USER_ID;
  } catch {
    console.warn('No se pudo obtener el userId');
    return DEMO_USER_ID;
  }
}

function parseSupabaseError(err: unknown, fallbackMessage: string): ApiErrorDetail {
  const supabaseError = err as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
    status?: number;
  };
  console.error('[apiService] Supabase error detail:', JSON.stringify(supabaseError, null, 2));

  const combined = `${supabaseError?.details ?? ''} ${supabaseError?.message ?? ''}`.trim();
  const columnMatch = combined.match(/column "([^"]+)"/i);

  return {
    message: supabaseError?.message || fallbackMessage,
    details: supabaseError?.details,
    hint: supabaseError?.hint,
    code: supabaseError?.code,
    status: supabaseError?.status,
    column: columnMatch?.[1],
  };
}

export async function createProject(payload: {
  title: string;
  research_question: string;
}): Promise<ApiResult<ResearchProject>> {
  try {
    // Always upsert with FIXED_PROJECT_ID so Realtime and n8n stay in sync
    const { data, error } = await (supabase
      .from('research_projects' as AnyQuery)
      .upsert(
        {
          id: FIXED_PROJECT_ID,
          title: payload.title,
          research_question: payload.research_question,
          current_phase: 0,
          status: 'PROTOCOL_GENERATION',
          user_edits: {},
          phase_data: {},
        },
        { onConflict: 'id' }
      )
      .select('*')
      .single() as unknown as Promise<{
        data: unknown;
        error: { message: string; details?: string; hint?: string; code?: string; status?: number } | null;
      }>);

    if (error) throw error;
    return { data: data as ResearchProject, error: null };
  } catch (err) {
    return {
      data: null,
      error: parseSupabaseError(err, 'Error al crear proyecto'),
    };
  }
}

export async function fetchProjectById(projectId: string): Promise<ApiResult<ResearchProject>> {
  try {
    const { data, error } = await (supabase
      .from('research_projects' as AnyQuery)
      .select('*')
      .eq('id', projectId)
      .maybeSingle() as unknown as Promise<{
        data: unknown;
        error: { message: string; details?: string; hint?: string; code?: string; status?: number } | null;
      }>);

    if (error) throw error;
    return { data: data ? (data as ResearchProject) : null, error: null };
  } catch (err) {
    return {
      data: null,
      error: parseSupabaseError(err, 'Error al cargar proyecto'),
    };
  }
}

export async function fetchProjects(): Promise<ApiResult<ResearchProject[]>> {
  try {
    const { data, error } = await (supabase
      .from('research_projects' as AnyQuery)
      .select('*')
      .order('created_at', { ascending: false }) as unknown as Promise<{
        data: unknown[];
        error: { message: string } | null;
      }>);

    if (error) throw error;
    return { data: (data || []) as ResearchProject[], error: null };
  } catch (err) {
    return {
      data: null,
      error: parseSupabaseError(err, 'Error al cargar proyectos'),
    };
  }
}

const N8N_WEBHOOK_URL = 'https://nicolasgalatea.app.n8n.cloud/webhook/galatea-research-agent';
const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

export async function triggerN8N({
  phase,
  projectId,
  title,
  research_question,
  userId,
}: TriggerN8NParams): Promise<TriggerN8NResult> {
  try {
    // Always use FIXED_PROJECT_ID to match Realtime subscription
    const resolvedProjectId = projectId || FIXED_PROJECT_ID;

    const resolvedUserId = userId || await getCurrentUserId() || 'anonymous';
    const payload = {
      project_id: resolvedProjectId,
      title,
      research_question,
      phase,
      userId: resolvedUserId,
    };

    console.log('N8N WEBHOOK:', N8N_WEBHOOK_URL);
    console.log('PAYLOAD:', JSON.stringify(payload, null, 2));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    console.log('N8N respondio con status:', response.status);
    return { success: response.ok };
  } catch (error) {
    console.error('Error al llamar webhook n8n:', error);
    return { success: false, error: String(error) };
  }
}
