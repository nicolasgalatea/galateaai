import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { Bold, Italic, Heading2, List, Quote } from 'lucide-react';

export interface ManuscriptTiptapEditorHandle {
  insertCitation: (citationKey: number) => void;
}

interface ManuscriptTiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ManuscriptTiptapEditor = forwardRef<ManuscriptTiptapEditorHandle, ManuscriptTiptapEditorProps>(
  function ManuscriptTiptapEditor({ content, onChange, placeholder = 'Escribe aqui...', disabled = false }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Placeholder.configure({ placeholder }),
      ],
      content,
      editable: !disabled,
      onUpdate: ({ editor: e }) => {
        onChange(e.getHTML());
      },
    });

    // Sync external content changes (agent writing)
    useEffect(() => {
      if (!editor) return;
      const currentHTML = editor.getHTML();
      // Only update if the external content is truly different
      if (content !== currentHTML && content !== '<p></p>') {
        editor.commands.setContent(content, { emitUpdate: false } as any);
      }
    }, [content, editor]);

    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [disabled, editor]);

    useImperativeHandle(ref, () => ({
      insertCitation(citationKey: number) {
        if (!editor) return;
        editor.chain().focus().insertContent(`[${citationKey}]`).run();
      },
    }));

    if (!editor) return null;

    return (
      <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-[#21262D] bg-[#161B22]">
          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            title="Negrita"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            title="Cursiva"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <div className="w-px h-5 bg-[#21262D] mx-1" />

          <ToolbarButton
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={disabled}
            title="Encabezado"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            title="Lista"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
            title="Cita"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent
          editor={editor}
          className="prose prose-invert prose-sm max-w-none px-4 py-3 min-h-[300px] text-[#E6EDF3] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#484F58] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
        />
      </div>
    );
  },
);

function ToolbarButton({
  active,
  onClick,
  disabled,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-[#00BCFF]/20 text-[#00BCFF]'
          : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
