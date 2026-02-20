/**
 * useManuscriptEditor — Hook para el editor de manuscrito (Fases 8-10)
 *
 * Responsabilidades:
 * 1. Cargar manuscript_draft desde researchProject
 * 2. Autosave con debounce 2s via saveUserEdits
 * 3. Merge de IA — si n8n actualiza manuscript_draft, no borra ediciones del medico.
 *    Los cambios de IA se almacenan como "pendientes" hasta que el usuario los acepte.
 * 4. Cargar references desde project_references con Realtime
 * 5. Validacion de citas — detecta referencias en la bibliografia sin cita en el texto
 * 6. approve_and_advance via RPC
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { saveUserEdits } from '@/services/research-sync-service';
import type { ProjectReference, ManuscriptDraftData } from '@/types/domain';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Doble Cast para tablas no autogeneradas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

export type SectionKey = 'introduccion' | 'metodos' | 'discusion';

export interface Sections {
  introduccion: string;
  metodos: string;
  discusion: string;
}

export interface UseManuscriptEditorReturn {
  sections: Sections;
  setSectionContent: (section: SectionKey, content: string) => void;
  isSaving: boolean;
  lastSavedAt: Date | null;
  saveError: string | null;
  isAgentWriting: boolean;
  /** Contenido pendiente de la IA que difiere de las ediciones del usuario */
  pendingAiChanges: Partial<Sections>;
  /** Acepta el cambio de IA para una seccion, reemplazando el contenido del usuario */
  acceptAiChange: (section: SectionKey) => void;
  /** Rechaza el cambio de IA para una seccion, conservando el contenido del usuario */
  rejectAiChange: (section: SectionKey) => void;
  /** Acepta todos los cambios pendientes de IA */
  acceptAllAiChanges: () => void;
  references: ProjectReference[];
  /** Citation_keys presentes en la bibliografia pero no citados en el texto */
  uncitedReferences: ProjectReference[];
  /** Descarta la advertencia de cita faltante para una referencia especifica */
  dismissUncitedWarning: (citationKey: number) => void;
  approveAndAdvance: () => Promise<{ success: boolean; error?: string }>;
  isApproving: boolean;
}

const EMPTY_SECTIONS: Sections = { introduccion: '', metodos: '', discusion: '' };
const SECTION_KEYS: SectionKey[] = ['introduccion', 'metodos', 'discusion'];
const AUTOSAVE_DELAY = 2000;

function extractSections(draft: Record<string, unknown> | null): Sections {
  if (!draft) return { ...EMPTY_SECTIONS };
  return {
    introduccion: typeof draft.introduccion === 'string' ? draft.introduccion : '',
    metodos: typeof draft.metodos === 'string' ? draft.metodos : '',
    discusion: typeof draft.discusion === 'string' ? draft.discusion : '',
  };
}

/**
 * Extrae todos los citation_key [N] encontrados en el HTML de las tres secciones.
 */
function extractCitedKeys(sections: Sections): Set<number> {
  const cited = new Set<number>();
  const combined = sections.introduccion + sections.metodos + sections.discusion;
  const regex = /\[(\d+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(combined)) !== null) {
    cited.add(parseInt(match[1], 10));
  }
  return cited;
}

export function useManuscriptEditor(
  projectId: string,
  manuscriptDraft: Record<string, unknown> | null,
): UseManuscriptEditorReturn {
  const [sections, setSections] = useState<Sections>(() => extractSections(manuscriptDraft));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAgentWriting, setIsAgentWriting] = useState(false);
  const [pendingAiChanges, setPendingAiChanges] = useState<Partial<Sections>>({});
  const [references, setReferences] = useState<ProjectReference[]>([]);
  const [dismissedUncited, setDismissedUncited] = useState<Set<number>>(new Set());
  const [isApproving, setIsApproving] = useState(false);

  // Track if the user is the source of the change
  const userEditRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastKnownDraftRef = useRef<string>(JSON.stringify(manuscriptDraft));
  // Ref that always holds the latest sections — avoids stale closure in debounce
  const sectionsRef = useRef<Sections>(sections);
  sectionsRef.current = sections;
  // Last AI baseline — the last version we know came from the agent (before user edits)
  const lastAiBaselineRef = useRef<Sections>(extractSections(manuscriptDraft));

  // ─── Detect agent writing & merge ───
  useEffect(() => {
    const draftStr = JSON.stringify(manuscriptDraft);

    if (draftStr !== lastKnownDraftRef.current) {
      lastKnownDraftRef.current = draftStr;

      if (!userEditRef.current) {
        // Agent wrote new content — merge per-section
        setIsAgentWriting(true);
        const incomingAi = extractSections(manuscriptDraft);
        const currentUser = sectionsRef.current;
        const previousAi = lastAiBaselineRef.current;

        const newPending: Partial<Sections> = {};
        const merged = { ...currentUser };

        for (const key of SECTION_KEYS) {
          const aiChanged = incomingAi[key] !== previousAi[key] && incomingAi[key].length > 0;
          const userEdited = currentUser[key] !== previousAi[key] && currentUser[key].length > 0;

          if (aiChanged && userEdited) {
            // Both edited the same section — keep user's version, store AI as pending
            newPending[key] = incomingAi[key];
          } else if (aiChanged && !userEdited) {
            // Only AI changed — accept directly
            merged[key] = incomingAi[key];
          }
          // If only user edited (or neither), keep user version (already in merged)
        }

        setSections(merged);
        setPendingAiChanges((prev) => {
          const combined = { ...prev, ...newPending };
          // Remove pending entries where the AI content matches what user now has
          for (const key of SECTION_KEYS) {
            if (combined[key] === merged[key]) {
              delete combined[key];
            }
          }
          return combined;
        });

        lastAiBaselineRef.current = incomingAi;
        const timer = setTimeout(() => setIsAgentWriting(false), 2000);
        return () => clearTimeout(timer);
      }
      userEditRef.current = false;
    }
  }, [manuscriptDraft]);

  // ─── Accept / reject AI changes ───
  const acceptAiChange = useCallback((section: SectionKey) => {
    setPendingAiChanges((prev) => {
      const aiContent = prev[section];
      if (aiContent == null) return prev;

      // Apply AI content to the editor
      setSections((s) => ({ ...s, [section]: aiContent }));

      const next = { ...prev };
      delete next[section];
      return next;
    });
  }, []);

  const rejectAiChange = useCallback((section: SectionKey) => {
    setPendingAiChanges((prev) => {
      const next = { ...prev };
      delete next[section];
      return next;
    });
  }, []);

  const acceptAllAiChanges = useCallback(() => {
    setPendingAiChanges((prev) => {
      const updated: Partial<Sections> = {};
      for (const key of SECTION_KEYS) {
        if (prev[key] != null) {
          updated[key] = prev[key];
        }
      }
      if (Object.keys(updated).length > 0) {
        setSections((s) => ({ ...s, ...updated } as Sections));
      }
      return {};
    });
  }, []);

  // ─── Set section content (user edit — optimistic, 2s debounce) ───
  const setSectionContent = useCallback(
    (section: SectionKey, content: string) => {
      userEditRef.current = true;
      setSaveError(null);

      // Clear dismissed uncited warnings when text changes (user might have re-added a citation)
      setDismissedUncited(new Set());

      // Optimistic: UI updates immediately, save is debounced
      setSections((prev) => ({ ...prev, [section]: content }));

      // Debounced autosave — reads from sectionsRef to avoid stale closure
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        // Snapshot the latest sections from the ref (always fresh)
        const snapshot = { ...sectionsRef.current };
        setIsSaving(true);
        try {
          const edits: ManuscriptDraftData = {
            introduccion: snapshot.introduccion,
            metodos: snapshot.metodos,
            discusion: snapshot.discusion,
          };
          const result = await saveUserEdits(projectId, 9, edits);
          if (result.success) {
            setLastSavedAt(new Date());
            lastKnownDraftRef.current = JSON.stringify(edits);
          } else {
            // Rollback: restore from last known good state
            const lastGood = JSON.parse(lastKnownDraftRef.current) as Record<string, unknown> | null;
            setSections(extractSections(lastGood));
            setSaveError(result.error ?? 'Error al guardar');
          }
        } catch (err) {
          console.error('[ManuscriptEditor] Autosave error:', err);
          const lastGood = JSON.parse(lastKnownDraftRef.current) as Record<string, unknown> | null;
          setSections(extractSections(lastGood));
          setSaveError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
          setIsSaving(false);
        }
      }, AUTOSAVE_DELAY);
    },
    [projectId],
  );

  // ─── Uncited references validation ───
  const uncitedReferences = useMemo(() => {
    if (references.length === 0) return [];
    const cited = extractCitedKeys(sections);
    return references.filter(
      (ref) => !cited.has(ref.citation_key) && !dismissedUncited.has(ref.citation_key),
    );
  }, [references, sections, dismissedUncited]);

  const dismissUncitedWarning = useCallback((citationKey: number) => {
    setDismissedUncited((prev) => new Set([...prev, citationKey]));
  }, []);

  // ─── Load references ───
  useEffect(() => {
    if (!projectId) return;

    async function fetchReferences() {
      const { data, error } = await (supabase
        .from('project_references' as AnyQuery)
        .select('*')
        .eq('project_id', projectId)
        .order('citation_key', { ascending: true }) as unknown as Promise<{
          data: unknown[] | null;
          error: { message: string } | null;
        }>);

      if (error) {
        console.error('[ManuscriptEditor] Error fetching references:', error.message);
        return;
      }

      if (data) {
        setReferences(data as ProjectReference[]);
      }
    }

    fetchReferences();
  }, [projectId]);

  // ─── Realtime subscription for new references ───
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project_references_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_references',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newRef = payload.new as ProjectReference;
          setReferences((prev) => {
            if (prev.some((r) => r.id === newRef.id)) return prev;
            return [...prev, newRef].sort((a, b) => a.citation_key - b.citation_key);
          });
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [projectId]);

  // ─── Approve and advance ───
  const approveAndAdvance = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    setIsApproving(true);
    try {
      const rpcCall = (supabase as unknown as {
        rpc: (fn: string, params: Record<string, unknown>) => Promise<{
          data: unknown;
          error: { message: string } | null;
        }>;
      }).rpc('approve_and_advance', {
        p_project_id: projectId,
      });

      const { data, error } = await rpcCall;

      if (error) {
        return { success: false, error: error.message };
      }

      const result = data as { success: boolean; error?: string } | null;
      return result ?? { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      return { success: false, error: message };
    } finally {
      setIsApproving(false);
    }
  }, [projectId]);

  // ─── Cleanup debounce on unmount ───
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    sections,
    setSectionContent,
    isSaving,
    lastSavedAt,
    saveError,
    isAgentWriting,
    pendingAiChanges,
    acceptAiChange,
    rejectAiChange,
    acceptAllAiChanges,
    references,
    uncitedReferences,
    dismissUncitedWarning,
    approveAndAdvance,
    isApproving,
  };
}
