import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { Bold, Italic, Heading2, List, Quote } from 'lucide-react';
import { useReferencesContext } from '@/contexts/ReferencesContext';

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
    const refsCtx = useReferencesContext();

    // Handle clicks on citation markers [N] inside the editor
    const handleEditorClick = useCallback(
      (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('citation-mark')) {
          const key = target.dataset.citationKey;
          if (key) {
            e.preventDefault();
            e.stopPropagation();
            const rect = target.getBoundingClientRect();
            refsCtx.showReferenceTooltip(parseInt(key, 10), rect);
          }
        }
      },
      [refsCtx],
    );

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

    // Attach click listener on the editor DOM to catch citation clicks
    useEffect(() => {
      if (!editor) return;
      const el = editor.view.dom;
      el.addEventListener('click', handleEditorClick);
      return () => el.removeEventListener('click', handleEditorClick);
    }, [editor, handleEditorClick]);

    // After each editor update, wrap [N] text nodes in styled spans for visual feedback
    useEffect(() => {
      if (!editor) return;

      const decorateCitations = () => {
        const el = editor.view.dom;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodesToProcess: { node: Text; matches: RegExpExecArray[] }[] = [];
        const regex = /\[(\d+)\]/g;

        let textNode: Text | null;
        while ((textNode = walker.nextNode() as Text | null)) {
          // Skip nodes already inside a citation-mark span
          if (textNode.parentElement?.classList.contains('citation-mark')) continue;
          const matches: RegExpExecArray[] = [];
          let m: RegExpExecArray | null;
          regex.lastIndex = 0;
          while ((m = regex.exec(textNode.textContent || '')) !== null) {
            matches.push({ ...m, index: m.index } as RegExpExecArray);
          }
          if (matches.length > 0) {
            nodesToProcess.push({ node: textNode, matches });
          }
        }

        for (const { node, matches } of nodesToProcess) {
          const parent = node.parentNode;
          if (!parent) continue;
          const text = node.textContent || '';
          const frag = document.createDocumentFragment();
          let lastIdx = 0;

          for (const match of matches) {
            // Text before the citation
            if (match.index > lastIdx) {
              frag.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
            }
            // Citation span
            const span = document.createElement('span');
            span.className = 'citation-mark';
            span.dataset.citationKey = match[1];
            span.textContent = match[0];
            span.style.cssText =
              'color:#00BCFF;font-family:monospace;font-weight:700;font-size:11px;background:rgba(0,188,255,0.12);padding:0 3px;border-radius:3px;cursor:pointer;';
            frag.appendChild(span);
            lastIdx = match.index + match[0].length;
          }
          if (lastIdx < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIdx)));
          }
          parent.replaceChild(frag, node);
        }
      };

      // Run decoration after content changes with a small delay
      const timeout = setTimeout(decorateCitations, 100);
      return () => clearTimeout(timeout);
    }, [editor, content]);

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
