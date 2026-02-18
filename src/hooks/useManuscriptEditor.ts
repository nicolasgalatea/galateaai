/**
 * useManuscriptEditor
 * ───────────────────
 * Autosave al Supabase (user_edits.manuscript) con debounce de 1.5s.
 * Expone syncStatus: 'idle' | 'saving' | 'synced' para mostrar feedback visual.
 * También expone insertCitation(text) para insertar citas desde el ReferencesPanel.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { supabase } from '@/integrations/supabase/client';

export type SyncStatus = 'idle' | 'saving' | 'synced';

interface UseManuscriptEditorOptions {
  projectId?: string;
  initialContent?: string;
}

export function useManuscriptEditor({ projectId, initialContent = '' }: UseManuscriptEditorOptions) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContent = useRef<string>(initialContent);

  // Save manuscript content to Supabase user_edits
  const saveContent = useCallback(async (content: string) => {
    if (!projectId || content === lastSavedContent.current) return;
    setSyncStatus('saving');
    try {
      const { error } = await supabase.rpc('set_user_edits_for_phase', {
        p_project_id: projectId,
        p_phase_key: 'fase_10',
        p_field: 'manuscript',
        p_value: content,
      });
      if (!error) {
        lastSavedContent.current = content;
        setSyncStatus('synced');
        // Reset to idle after 3s
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('idle');
      }
    } catch {
      setSyncStatus('idle');
    }
  }, [projectId]);

  // Debounced autosave — triggered by editor's onUpdate
  const handleContentChange = useCallback((content: string) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveContent(content);
    }, 1500);
  }, [saveContent]);

  // Insert citation text at current cursor position
  const insertCitation = useCallback((citationText: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent(`<sup>[${citationText}]</sup>`)
      .run();
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    editorRef,
    syncStatus,
    isFocused,
    setIsFocused,
    handleContentChange,
    insertCitation,
  };
}
