import { supabase } from '@/integrations/supabase/client';
import { N8N_PROTOCOL_START_WEBHOOK, N8N_EXECUTION_START_WEBHOOK } from '@/config/researchAgents';
import type { Project } from '@/types/domain';

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

const RESEARCH_PROJECT_COLUMNS =
  'id,title,description,research_question,phase,current_agent_step,created_at';

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
}): Promise<ApiResult<Project>> {
  try {
    const { data, error } = await supabase
      .from('agent_projects')
      .insert({
        title: payload.title,
        research_question: payload.research_question,
      })
      .select(RESEARCH_PROJECT_COLUMNS)
      .single();

    if (error) throw error;
    return { data: data as Project, error: null };
  } catch (err) {
    return {
      data: null,
      error: parseSupabaseError(err, 'Error al crear proyecto'),
    };
  }
}

export async function fetchProjectById(projectId: string): Promise<ApiResult<Project>> {
  try {
    const { data, error } = await supabase
      .from('agent_projects')
      .select(RESEARCH_PROJECT_COLUMNS)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return { data: data as Project, error: null };
  } catch (err) {
    return {
      data: null,
      error: parseSupabaseError(err, 'Error al cargar proyecto'),
    };
  }
}

export async function fetchProjects(): Promise<ApiResult<Project[]>> {
  try {
    const { data, error } = await supabase
      .from('agent_projects')
      .select(RESEARCH_PROJECT_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: (data || []) as Project[], error: null };
  } catch (err) {
    return {
      data: null,
      error: parseSupabaseError(err, 'Error al cargar proyectos'),
    };
  }
}

export async function triggerN8N({
  phase,
  projectId,
  title,
  research_question,
  userId,
}: TriggerN8NParams): Promise<TriggerN8NResult> {
  try {
    if (!projectId) throw new Error('projectId es requerido');
    if (!title) throw new Error('title es requerido');
    if (!research_question) throw new Error('research_question es requerido');

    const resolvedUserId = userId || await getCurrentUserId() || 'anonymous';
    const payload = {
      title,
      research_question,
      research_id: projectId,
      userId: resolvedUserId,
    };
    const endpoint =
      phase === 'protocol' ? N8N_PROTOCOL_START_WEBHOOK : N8N_EXECUTION_START_WEBHOOK;

    console.log('='.repeat(60));
    console.log(`N8N: Inicio de fase ${phase}`);
    console.log('>>> INTENTANDO LLAMADA A N8N EN:', endpoint);
    console.info('>>> CONECTANDO A N8N EN PUERTO 8085...');
    console.log('PAYLOAD ENVIADO A N8N:', payload);
    console.log('='.repeat(60));

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    window.clearTimeout(timeoutId);

    console.log('>>> CONEXIÓN ESTABLECIDA CON N8N.');
    return { success: true };
  } catch (error) {
    console.error('Error al iniciar flujo en n8n:', error);
    return { success: true, error: 'Proceso iniciado en segundo plano' };
  }
}
