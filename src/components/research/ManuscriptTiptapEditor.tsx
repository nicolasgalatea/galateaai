/**
 * ManuscriptTiptapEditor
 * ───────────────────────
 * Editor Tiptap con toolbar, autosave y focus mode.
 */
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  CheckCircle2, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SyncStatus } from '@/hooks/useManuscriptEditor';
import type { Editor } from '@tiptap/react';

interface ManuscriptTiptapEditorProps {
  initialContent: string;
  onUpdate: (html: string) => void;
  editorRef: React.MutableRefObject<Editor | null>;
  syncStatus: SyncStatus;
  isFocused: boolean;
  onFocusChange: (v: boolean) => void;
}

// ── Toolbar button ────────────────────────────────────────────────
function ToolbarBtn({
  onClick, active, children, title,
}: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

// ── Sync badge ────────────────────────────────────────────────────
function SyncBadge({ status }: { status: SyncStatus }) {
  return (
    <AnimatePresence mode="wait">
      {status === 'saving' && (
        <motion.span
          key="saving"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Guardando…
        </motion.span>
      )}
      {status === 'synced' && (
        <motion.span
          key="synced"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="flex items-center gap-1 text-xs text-[hsl(142,76%,28%)] font-medium"
        >
          <CheckCircle2 className="w-3 h-3" />
          Sincronizado
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function ManuscriptTiptapEditor({
  initialContent,
  onUpdate,
  editorRef,
  syncStatus,
  isFocused,
  onFocusChange,
}: ManuscriptTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Comienza a redactar tu manuscrito… El panel de referencias está disponible a la derecha.',
      }),
    ],
    content: initialContent || '',
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
    onFocus: () => onFocusChange(true),
    onBlur: () => onFocusChange(false),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-6 text-foreground leading-relaxed',
      },
    },
  });

  // Expose editor via ref for insertCitation
  useEffect(() => {
    if (editor) editorRef.current = editor;
    return () => { editorRef.current = null; };
  }, [editor, editorRef]);

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card rounded-t-lg sticky top-0 z-10">
        <div className="flex items-center gap-0.5">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Negrita"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Cursiva"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Título H2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Título H3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Lista"
          >
            <List className="w-3.5 h-3.5" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Lista numerada"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarBtn>
        </div>
        <SyncBadge status={syncStatus} />
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto bg-card border border-t-0 border-border">
        <EditorContent editor={editor} />
      </div>

      {/* Word count footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/40 rounded-b-sm text-[11px] text-muted-foreground">
        <span>{wordCount} palabras</span>
        <span>~{Math.ceil(wordCount / 200) || 0} min lectura</span>
      </div>
    </div>
  );
}
