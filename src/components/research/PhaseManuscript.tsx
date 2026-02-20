/**
 * PhaseManuscript — Fase 10
 * ─────────────────────────
 * Layout 75 / 25:
 *   • Izquierda (75 %): ManuscriptTiptapEditor con autosave + focus mode
 *   • Derecha  (25 %): ReferencesPanel sticky — clic inserta cita en el editor
 *
 * Modos:
 *   - Default   : split 75/25
 *   - Fullscreen: ocupa toda la pantalla
 *
 * Extras:
 *   - Focus mode: difumina el panel de referencias y toolbar cuando el editor
 *     está activo, para concentración máxima.
 *   - Botón "Validar Entregable" con estados saving / saved + toast flotante.
 *   - Exportar PDF (jsPDF).
 *   - SyncBadge integrado en el editor Tiptap.
 */
import { useCallback, useState } from 'react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Maximize2, Minimize2, FileText,
  CheckCircle2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ManuscriptTiptapEditor from '@/components/research/ManuscriptTiptapEditor';
import ReferencesPanel from '@/components/research/ReferencesPanel';
import { useManuscriptEditor } from '@/hooks/useManuscriptEditor';
import { cn } from '@/lib/utils';

interface PhaseManuscriptProps {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  projectId?: string;
  onValidate?: () => Promise<void>;
  isSaving?: boolean;
}

type ValidateState = 'idle' | 'saving' | 'saved';

export default function PhaseManuscript({
  data,
  userEdits,
  projectId,
  onValidate,
  isSaving = false,
}: PhaseManuscriptProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [validateState, setValidateState] = useState<ValidateState>('idle');

  // Merge phase data + user edits to get initial content
  const merged = { ...data, ...userEdits };
  const initialContent = (merged.manuscript || merged.content || merged.dossier || '') as string;
  const titleStr = (merged.title || 'Manuscrito - Revisión Sistemática') as string;

  // Autosave hook
  const {
    editorRef,
    syncStatus,
    isFocused,
    setIsFocused,
    handleContentChange,
    insertCitation,
  } = useManuscriptEditor({ projectId, initialContent });

  // Export PDF from raw text (fallback: no Tiptap HTML stripping needed for PDF)
  const handleExportPDF = useCallback(() => {
    const rawText = editorRef.current
      ? editorRef.current.getText()
      : initialContent.replace(/[#*_`<>]/g, '');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(titleStr, 20, 20);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(rawText, 170);
    let y = 35;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 5;
    }
    doc.save(`${titleStr.replace(/\s+/g, '_')}.pdf`);
  }, [editorRef, initialContent, titleStr]);

  // Validate button
  const handleValidate = useCallback(async () => {
    if (!onValidate || validateState === 'saving') return;
    setValidateState('saving');
    try {
      await onValidate();
      setValidateState('saved');
      setTimeout(() => setValidateState('idle'), 3500);
    } catch {
      setValidateState('idle');
    }
  }, [onValidate, validateState]);

  // Empty state
  if (!initialContent) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm italic">
          Manuscrito pendiente — se generará al completar todas las fases.
        </p>
      </div>
    );
  }

  // ── Toolbar ──────────────────────────────────────────────────────
  const toolbar = (
    <div
      className={cn(
        'flex items-center justify-between flex-wrap gap-2 mb-3 transition-opacity duration-300',
        isFocused && 'opacity-30 hover:opacity-100',
      )}
    >
      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Borrador del Manuscrito
      </h4>
      <div className="flex gap-2 flex-wrap">
        {/* Fullscreen */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFullscreen(v => !v)}
          className="gap-1.5"
        >
          {fullscreen
            ? <><Minimize2 className="w-3.5 h-3.5" /> Salir</>
            : <><Maximize2 className="w-3.5 h-3.5" /> Pantalla Completa</>}
        </Button>

        {/* Export PDF */}
        <Button size="sm" variant="outline" onClick={handleExportPDF} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Exportar PDF
        </Button>

        {/* Validate */}
        {onValidate && (
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={handleValidate}
              disabled={validateState === 'saving' || isSaving}
              className={cn(
                'gap-1.5 transition-all duration-300',
                validateState === 'saved' && 'bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white',
              )}
            >
              <AnimatePresence mode="wait">
                {validateState === 'saving' && (
                  <motion.span key="saving"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                  </motion.span>
                )}
                {validateState === 'saved' && (
                  <motion.span key="saved"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> ¡Entregable Guardado!
                  </motion.span>
                )}
                {validateState === 'idle' && (
                  <motion.span key="idle"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Validar Entregable
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );

  // ── Save success toast ───────────────────────────────────────────
  const saveToast = (
    <AnimatePresence>
      {validateState === 'saved' && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border bg-card"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Entregable guardado exitosamente</p>
            <p className="text-xs text-muted-foreground">El manuscrito ha sido validado y sincronizado.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Focus mode overlay (dims references panel) ───────────────────
  // Handled via CSS opacity transitions on the references pane

  const heightClass = fullscreen ? 'flex-1 min-h-0' : 'h-[680px]';

  return (
    <>
      {saveToast}

      <div className={cn(
        fullscreen && 'fixed inset-0 z-50 bg-background flex flex-col p-6 overflow-hidden',
      )}>
        {toolbar}

        {/* ── Split 75 / 25 ── */}
        <div className={cn('flex gap-4', heightClass)}>

          {/* Left — 75 %: Tiptap Editor */}
          <div className="flex flex-col min-h-0 flex-[3]">
            <ManuscriptTiptapEditor
              initialContent={initialContent}
              onUpdate={handleContentChange}
              editorRef={editorRef}
              syncStatus={syncStatus}
              isFocused={isFocused}
              onFocusChange={setIsFocused}
            />
          </div>

          {/* Right — 25 %: References Panel (dims on focus mode) */}
          <motion.div
            animate={{ opacity: isFocused ? 0.25 : 1, scale: isFocused ? 0.99 : 1 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={cn(
              'flex flex-col min-h-0 flex-[1] border border-border rounded-lg overflow-hidden',
              !projectId && 'hidden',
            )}
          >
            {projectId && (
              <ReferencesPanel
                projectId={projectId}
                onInsertCitation={insertCitation}
              />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
