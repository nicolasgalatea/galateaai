import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, PenTool, Save, AlertCircle, PartyPopper, AlertTriangle, Sparkles, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ManuscriptTiptapEditor, type ManuscriptTiptapEditorHandle } from './ManuscriptTiptapEditor';
import { ReferencesPanel } from './ReferencesPanel';
import { useManuscriptEditor, type SectionKey } from '@/hooks/useManuscriptEditor';

interface ManuscriptEditorProps {
  projectId: string;
  manuscriptDraft: Record<string, unknown> | null;
  currentPhase: number;
}

const SECTION_TABS: { key: SectionKey; label: string; placeholder: string }[] = [
  { key: 'introduccion', label: 'Introduccion', placeholder: 'Escribe la introduccion del manuscrito...' },
  { key: 'metodos', label: 'Metodos', placeholder: 'Describe la metodologia utilizada...' },
  { key: 'discusion', label: 'Discusion', placeholder: 'Desarrolla la discusion de resultados...' },
];

// Confetti particle for the success animation
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, x, scale: 1, rotate: 0 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -80, -120],
        x: [x, x + (Math.random() - 0.5) * 100],
        scale: [1, 1.2, 0.6],
        rotate: [0, (Math.random() - 0.5) * 360],
      }}
      transition={{ duration: 1.4, delay, ease: 'easeOut' }}
      className="absolute w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

const CONFETTI_COLORS = ['#00D395', '#00BCFF', '#F7B500', '#A78BFA', '#FF6B9D'];

export function ManuscriptEditor({ projectId, manuscriptDraft, currentPhase }: ManuscriptEditorProps) {
  const {
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
  } = useManuscriptEditor(projectId, manuscriptDraft);

  const [activeTab, setActiveTab] = useState<SectionKey>('introduccion');
  const [showSuccess, setShowSuccess] = useState(false);
  const editorRefs = useRef<Record<SectionKey, ManuscriptTiptapEditorHandle | null>>({
    introduccion: null,
    metodos: null,
    discusion: null,
  });

  const handleInsertCitation = (citationKey: number) => {
    const activeEditor = editorRefs.current[activeTab];
    if (activeEditor) {
      activeEditor.insertCitation(citationKey);
    }
  };

  const handleApprove = async () => {
    const result = await approveAndAdvance();
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      console.error('[ManuscriptEditor] Approve failed:', result.error);
    }
  };

  const hasSomeContent =
    sections.introduccion.length > 0 ||
    sections.metodos.length > 0 ||
    sections.discusion.length > 0;

  const canApprove = currentPhase >= 10 && hasSomeContent;
  const pendingCount = Object.keys(pendingAiChanges).length;

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4 relative overflow-hidden">
      {/* ── Success overlay with confetti ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0D1117]/80 backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={i * 0.05}
                  x={(Math.random() - 0.5) * 60}
                  color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ boxShadow: ['0 0 0px rgba(0,211,149,0.4)', '0 0 40px rgba(0,211,149,0.6)', '0 0 20px rgba(0,211,149,0.3)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-[#00D395] flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-[#0D1117] stroke-[3]" />
              </motion.div>
              <div className="text-center">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm font-semibold text-[#E6EDF3]"
                >
                  Version aprobada
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-[#8B949E] flex items-center gap-1 mt-1"
                >
                  <PartyPopper className="w-3 h-3" />
                  Avanzando a la siguiente fase...
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Editor de Manuscrito
          </span>
          <span className="text-[10px] text-[#484F58]">Fase {currentPhase}/10</span>
        </div>

        {/* Autosave indicator + approve button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px]">
            {saveError ? (
              <>
                <AlertCircle className="w-3 h-3 text-[#FF4757]" />
                <span className="text-[#FF4757]">Error al guardar</span>
              </>
            ) : isSaving ? (
              <>
                <Save className="w-3 h-3 text-[#F7B500] animate-pulse" />
                <span className="text-[#F7B500]">Guardando...</span>
              </>
            ) : lastSavedAt ? (
              <>
                <Check className="w-3 h-3 text-[#00D395]" />
                <span className="text-[#00D395]">Guardado</span>
              </>
            ) : null}
          </div>

          <Button
            onClick={handleApprove}
            disabled={!canApprove || isApproving}
            size="sm"
            className="bg-[#00D395] hover:bg-[#00B880] text-[#0D1117] font-semibold text-xs disabled:opacity-40"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Aprobando...
              </>
            ) : (
              <>
                <Check className="w-3 h-3 mr-1.5" />
                Validar Version y Avanzar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Global AI pending banner ── */}
      <AnimatePresence>
        {pendingCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="text-[11px] text-[#A78BFA]">
                  La IA ha propuesto cambios en {pendingCount} {pendingCount === 1 ? 'seccion' : 'secciones'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={acceptAllAiChanges}
                  className="px-2 py-1 rounded text-[10px] font-medium bg-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/30 transition-colors"
                >
                  Aceptar todos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Uncited references warning ── */}
      <AnimatePresence>
        {uncitedReferences.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="px-3 py-2 rounded-lg border border-[#F7B500]/30 bg-[#F7B500]/5">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F7B500]" />
                <span className="text-[11px] text-[#F7B500] font-medium">
                  {uncitedReferences.length === 1
                    ? '1 referencia en la bibliografia no esta citada en el texto'
                    : `${uncitedReferences.length} referencias en la bibliografia no estan citadas en el texto`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uncitedReferences.map((ref) => (
                  <div
                    key={ref.id}
                    className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded bg-[#F7B500]/10 text-[10px]"
                  >
                    <span className="font-mono font-bold text-[#F7B500]">[{ref.citation_key}]</span>
                    <span className="text-[#8B949E] truncate max-w-[120px]">{ref.title}</span>
                    <button
                      type="button"
                      onClick={() => handleInsertCitation(ref.citation_key)}
                      className="px-1 py-0.5 rounded text-[9px] text-[#00BCFF] hover:bg-[#00BCFF]/10 transition-colors"
                      title="Insertar cita en el editor"
                    >
                      Insertar
                    </button>
                    <button
                      type="button"
                      onClick={() => dismissUncitedWarning(ref.citation_key)}
                      className="p-0.5 rounded text-[#484F58] hover:text-[#8B949E] hover:bg-[#21262D] transition-colors"
                      title="Descartar advertencia"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid: Editor + References */}
      <div className="grid grid-cols-12 gap-4">
        {/* Editor column */}
        <div className="col-span-8 relative">
          {/* Agent writing overlay */}
          <AnimatePresence>
            {isAgentWriting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 rounded-lg border border-[#00BCFF]/30 bg-[#00BCFF]/5 flex items-center justify-center pointer-events-none"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161B22] border border-[#00BCFF]/40"
                >
                  <PenTool className="w-4 h-4 text-[#00BCFF]" />
                  <span className="text-xs text-[#00BCFF] font-medium">
                    Agente escribiendo...
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionKey)}>
            <TabsList className="bg-[#161B22] border border-[#21262D] mb-3">
              {SECTION_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="text-xs text-[#8B949E] data-[state=active]:bg-[#21262D] data-[state=active]:text-[#E6EDF3] relative"
                >
                  {tab.label}
                  {sections[tab.key].length > 0 && (
                    <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#00D395] inline-block" />
                  )}
                  {pendingAiChanges[tab.key] != null && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#A78BFA] inline-block animate-pulse" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {SECTION_TABS.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="mt-0">
                {/* Per-section AI diff banner */}
                <AnimatePresence>
                  {pendingAiChanges[tab.key] != null && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-2 overflow-hidden"
                    >
                      <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/5 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#A78BFA]/20">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                            <span className="text-[10px] font-medium text-[#A78BFA]">
                              Sugerencia de la IA para {tab.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => acceptAiChange(tab.key)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/30 transition-colors"
                            >
                              Aceptar
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectAiChange(tab.key)}
                              className="px-2 py-0.5 rounded text-[10px] font-medium text-[#484F58] hover:text-[#8B949E] hover:bg-[#21262D] transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                        <div
                          className="px-3 py-2 text-[11px] text-[#A78BFA]/80 max-h-[120px] overflow-y-auto leading-relaxed prose-ai-preview"
                          dangerouslySetInnerHTML={{ __html: pendingAiChanges[tab.key]! }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <ManuscriptTiptapEditor
                  ref={(handle) => {
                    editorRefs.current[tab.key] = handle;
                  }}
                  content={sections[tab.key]}
                  onChange={(html) => setSectionContent(tab.key, html)}
                  placeholder={tab.placeholder}
                  disabled={isAgentWriting}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* References column */}
        <div className="col-span-4">
          <ReferencesPanel
            references={references}
            onInsertCitation={handleInsertCitation}
            uncitedKeys={new Set(uncitedReferences.map((r) => r.citation_key))}
          />
        </div>
      </div>
    </div>
  );
}
