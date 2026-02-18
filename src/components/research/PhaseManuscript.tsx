import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Maximize2, Minimize2, FileText,
  Columns, LayoutTemplate, CheckCircle2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EvidenceLibrary from '@/components/research/EvidenceLibrary';

interface PhaseManuscriptProps {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  projectId?: string;
  onValidate?: () => Promise<void>;
  isSaving?: boolean;
}

// ── Save confirmation state ──────────────────────────────────
type SaveState = 'idle' | 'saving' | 'saved';

export default function PhaseManuscript({
  data,
  userEdits,
  projectId,
  onValidate,
  isSaving = false,
}: PhaseManuscriptProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const merged = { ...data, ...userEdits };
  const content = (merged.manuscript || merged.content || merged.dossier || '') as string;
  const titleStr = (merged.title || 'Manuscrito - Revisión Sistemática') as string;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(titleStr, 20, 20);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content.replace(/[#*_`]/g, ''), 170);
    let y = 35;
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 5;
    }
    doc.save(`${titleStr.replace(/\s+/g, '_')}.pdf`);
  };

  const handleValidate = useCallback(async () => {
    if (!onValidate || saveState === 'saving') return;
    setSaveState('saving');
    try {
      await onValidate();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch {
      setSaveState('idle');
    }
  }, [onValidate, saveState]);

  if (!content) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="text-sm italic">Manuscrito pendiente — se generará al completar todas las fases.</p>
      </div>
    );
  }

  const toolbar = (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Borrador del Manuscrito
      </h4>
      <div className="flex gap-2 flex-wrap">
        {/* Split / Single toggle */}
        <Button
          size="sm"
          variant={splitMode ? 'default' : 'outline'}
          onClick={() => setSplitMode(v => !v)}
          className="gap-1.5"
        >
        {splitMode
            ? <><LayoutTemplate className="w-3.5 h-3.5" /> Vista Simple</>
            : <><Columns className="w-3.5 h-3.5" /> Pantalla Partida</>}
        </Button>

        {/* Fullscreen */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setFullscreen(v => !v)}
          className="gap-1.5"
        >
          {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          {fullscreen ? 'Salir' : 'Pantalla Completa'}
        </Button>

        {/* Export PDF */}
        <Button size="sm" variant="outline" onClick={handleExportPDF} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Exportar PDF
        </Button>

        {/* Validate with visual feedback */}
        {onValidate && (
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              size="sm"
              onClick={handleValidate}
              disabled={saveState === 'saving' || isSaving}
              className={`gap-1.5 transition-all duration-300 ${
                saveState === 'saved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ''
              }`}
            >
              <AnimatePresence mode="wait">
                {saveState === 'saving' && (
                  <motion.span
                    key="saving"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...
                  </motion.span>
                )}
                {saveState === 'saved' && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> ¡Entregable Guardado!
                  </motion.span>
                )}
                {saveState === 'idle' && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
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

  // ── Save success toast overlay ────────────────────────────────
  const saveToast = (
    <AnimatePresence>
      {saveState === 'saved' && (
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

  // ── Manuscript viewer ─────────────────────────────────────────
  const manuscriptPane = (
    <div className={`prose prose-sm max-w-none text-foreground bg-card rounded-lg border overflow-y-auto ${splitMode ? 'h-full' : 'min-h-[520px]'} p-6`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );

  // ── References pane ───────────────────────────────────────────
  const referencesPane = projectId ? (
    <div className="h-full overflow-y-auto">
      <EvidenceLibrary
        projectId={projectId}
        currentPhase={10}
        isExecuting={false}
        className="h-full"
      />
    </div>
  ) : null;

  return (
    <>
      {saveToast}
      <div className={fullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-6 overflow-hidden' : 'space-y-0'}>
        {toolbar}

        {/* Split vs single layout */}
        {splitMode && projectId ? (
          <div className={`grid grid-cols-2 gap-4 ${fullscreen ? 'flex-1 min-h-0' : 'h-[600px]'}`}>
            {/* Left: manuscript */}
            <div className="flex flex-col min-h-0 h-full">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Borrador IA
              </p>
              {manuscriptPane}
            </div>
            {/* Right: references */}
            <div className="flex flex-col min-h-0 h-full border-l border-border pl-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Referencias Bibliográficas
              </p>
              {referencesPane}
            </div>
          </div>
        ) : (
          <div className={fullscreen ? 'flex-1 min-h-0 overflow-y-auto' : ''}>
            {manuscriptPane}
          </div>
        )}
      </div>
    </>
  );
}
