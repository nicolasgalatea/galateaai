/**
 * ResearchLab — The Research Lab (10-Phase)
 * ─────────────────────────────────────────
 * Fuente de verdad: tabla `research_projects` (research_lab_progress = legacy, NO usar)
 * Webhook unificado: galatea-research-lab-v2
 * Formato de agentes: JSON estricto → columna phase_data
 * Realtime: escucha cambios en research_projects.phase_data y research_projects.status
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, FlaskConical, ArrowRight, CheckCircle,
  ChevronDown, ChevronUp, BookOpen, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useResearchProject, PHASE_CONFIG } from '@/hooks/useResearchProject';
import galateaLogo from '@/assets/galatea-logo-clean.png';
import santaFeLogo from '@/assets/santa-fe-logo-clean.png';

// ── Phase-specific spinner messages ──────────────────────────
const PHASE_SPINNER: Record<number, string> = {
  1: 'Ideador analizando el problema clínico...',
  2: 'Construyendo pregunta PICOT estructurada...',
  3: 'Validando con FINER y gap analysis...',
  4: 'Definiendo criterios de inclusión y exclusión...',
  5: 'Verificando PROSPERO y evaluando sesgos...',
  6: 'Generando ecuaciones de búsqueda MeSH...',
  7: 'Ensamblando protocolo PRISMA-P completo...',
  8: 'Ejecutando PRISMA flow y extracción de datos...',
  9: 'Auditoría de calidad y meta-análisis...',
  10: 'Generando GRADE y dossier final...',
};

// ── PICOT table renderer ──────────────────────────────────────
function PICOTTable({ data }: { data: Record<string, unknown> }) {
  const rows = [
    { label: 'Población (P)', icon: '👥', keys: ['population', 'Población', 'P', 'poblacion'] },
    { label: 'Intervención (I)', icon: '💊', keys: ['intervention', 'Intervención', 'I', 'intervencion'] },
    { label: 'Comparación (C)', icon: '⚖️', keys: ['comparison', 'Comparación', 'C', 'comparacion'] },
    { label: 'Desenlace (O)', icon: '🎯', keys: ['outcome', 'Outcome', 'O', 'desenlace'] },
    { label: 'Tiempo (T)', icon: '⏱️', keys: ['time', 'Tiempo', 'T', 'tiempo'] },
  ];
  const getValue = (keys: string[]) =>
    keys.map(k => data[k]).find(v => v && typeof v === 'string') as string | undefined;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">📋 Tabla PICOT</h4>
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary/5">
              <th className="px-3 py-2 text-left w-10" />
              <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground uppercase tracking-wide">Componente</th>
              <th className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground uppercase tracking-wide">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 text-center text-base">{r.icon}</td>
                <td className="px-3 py-2 font-medium text-foreground">{r.label}</td>
                <td className="px-3 py-2 text-muted-foreground">{getValue(r.keys) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── References list renderer ──────────────────────────────────
function ReferencesList({ refs }: { refs: unknown[] }) {
  if (!refs || refs.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
        <BookOpen className="w-4 h-4" /> Referencias PubMed ({refs.length})
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {refs.map((ref: any, i: number) => (
          <div key={i} className="p-2 rounded-md border bg-card text-xs space-y-0.5">
            {ref.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary underline-offset-2 hover:underline"
              >
                PMID: {ref.pmid}
              </a>
            )}
            {ref.title && <p className="font-medium text-foreground leading-snug">{ref.title}</p>}
            {ref.authors && <p className="text-muted-foreground">{ref.authors}</p>}
            {ref.journal && ref.year && (
              <p className="text-muted-foreground">{ref.journal} — {ref.year}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phase Output Card ─────────────────────────────────────────
function PhaseOutputCard({
  phaseId,
  data,
  isProcessing,
}: {
  phaseId: number;
  data: Record<string, unknown> | null;
  isProcessing: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const phase = PHASE_CONFIG.find(p => p.id === phaseId);
  if (!phase) return null;

  // Loading skeleton
  if (isProcessing && !data) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-primary animate-pulse">
              {PHASE_SPINNER[phaseId] || 'Procesando...'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const renderContent = () => {
    // ── Phase 2: PICOT table ──
    const picotKeys = ['population', 'intervention', 'comparison', 'outcome', 'time', 'P', 'I', 'C', 'O', 'T'];
    if (phaseId === 2 && picotKeys.some(k => data[k])) {
      return <PICOTTable data={data} />;
    }

    // ── Phase 6: Search equations ──
    if (phaseId === 6) {
      const eq = data.search_equations || data.ecuaciones || data.equations;
      if (eq && typeof eq === 'string') {
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary">🔍 Ecuaciones de Búsqueda MeSH</h4>
            <pre className="text-xs bg-muted/50 p-4 rounded-lg border whitespace-pre-wrap font-mono">{eq}</pre>
          </div>
        );
      }
    }

    // ── References (any phase that includes them) ──
    const refs = data.references || data.referencias || data.pubmed_results;
    if (Array.isArray(refs) && refs.length > 0) {
      return (
        <div className="space-y-4">
          {data.content && typeof data.content === 'string' && (
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown>{data.content}</ReactMarkdown>
            </div>
          )}
          <ReferencesList refs={refs} />
        </div>
      );
    }

    // ── Markdown content ──
    if (data.content && typeof data.content === 'string') {
      return (
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>
      );
    }

    // ── Generic key-value ──
    const entries = Object.entries(data).filter(
      ([k]) => !k.startsWith('_') && k !== 'agent_name' && k !== 'agent_number',
    );
    if (entries.length === 0) return <p className="text-sm text-muted-foreground italic">Sin datos aún.</p>;

    return (
      <div className="space-y-3">
        {entries.map(([key, val]) => {
          const label = key.replace(/_/g, ' ').replace(/^./, s => s.toUpperCase());
          if (typeof val === 'string') {
            return (
              <div key={key}>
                <label className="text-xs font-semibold text-primary">{label}</label>
                <div className="prose prose-sm max-w-none text-foreground mt-1">
                  <ReactMarkdown>{val}</ReactMarkdown>
                </div>
              </div>
            );
          }
          if (Array.isArray(val)) {
            return (
              <div key={key}>
                <label className="text-xs font-semibold text-primary">{label}</label>
                <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">
                  {val.map((item, i) => (
                    <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              </div>
            );
          }
          return (
            <div key={key} className="p-3 rounded-lg bg-muted/50 border">
              <label className="text-xs font-semibold text-primary">{label}</label>
              <pre className="text-xs whitespace-pre-wrap mt-1">{JSON.stringify(val, null, 2)}</pre>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-2 border-primary/40 shadow-sm">
        <CardHeader className="pb-3 cursor-pointer select-none" onClick={() => setExpanded(v => !v)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground shrink-0">
                {phaseId}
              </div>
              <span className="text-primary">{phase.name}</span>
              <span className="text-xs text-muted-foreground font-normal hidden sm:block">— {phase.description}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CardContent className="pt-0">{renderContent()}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════
export default function ResearchLab() {
  const [question, setQuestion] = useState('');

  // ── ÚNICA fuente de verdad: research_projects ──
  const {
    project,
    status,
    isLoading,
    createProject,
    approvePhase,
    getPhaseData,
  } = useResearchProject();

  const currentPhase = project?.current_phase ?? 0;
  const progressPercent = Math.min((currentPhase / 10) * 100, 100);

  const isIdle      = status === 'idle' && !project;
  const isExecuting = status === 'executing';
  const isPaused    = status === 'paused';
  const isCompleted = status === 'completed';
  const isError     = status === 'error';

  // ── Iniciar investigación ──
  const handleStart = async () => {
    if (!question.trim()) return;
    await createProject('Research Lab Session', question.trim());
  };

  // ── Aprobar fase actual → dispara siguiente agente ──
  const handleApprove = async () => {
    await approvePhase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-[hsl(207,60%,30%)] to-[hsl(160,45%,35%)] border-[hsl(207,40%,25%)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={galateaLogo} alt="Galatea" className="h-8 w-auto" />
            <div className="h-6 w-px bg-white/30" />
            <span className="text-white/90 font-semibold text-sm tracking-wide">The Research Lab</span>
            <Badge variant="secondary" className="text-[10px] bg-white/20 text-white border-0">
              research_projects
            </Badge>
          </div>
          <img src={santaFeLogo} alt="Santa Fe" className="h-7 w-auto opacity-80" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* ── Input Section ── */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-[hsl(207,60%,30%)]">
              <FlaskConical className="w-5 h-5" />
              Pregunta de Investigación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Ej: ¿Son efectivos los inhibidores SGLT2 en insuficiencia cardíaca con fracción de eyección preservada?"
                className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                disabled={!isIdle}
              />
              <Button
                onClick={handleStart}
                disabled={!question.trim() || !isIdle || isLoading}
                className="self-end bg-[hsl(160,45%,35%)] hover:bg-[hsl(160,45%,30%)] text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Send className="w-4 h-4 mr-1" /> Iniciar</>
                )}
              </Button>
            </div>
            {project?.research_question && (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Pregunta activa:</span> {project.research_question}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── 10-Phase Stepper ── */}
        {project && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[hsl(207,60%,30%)]">Progreso General</span>
              <span className="text-muted-foreground">
                Fase {currentPhase}/10 — {PHASE_CONFIG[currentPhase - 1]?.name ?? 'Completado'}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />

            <div className="flex gap-1 mt-2">
              {PHASE_CONFIG.map(phase => (
                <div key={phase.id} className="flex-1 relative group">
                  <div
                    className="h-2 rounded-full transition-colors duration-500"
                    style={{
                      backgroundColor:
                        phase.id < currentPhase
                          ? 'hsl(160,45%,40%)'
                          : phase.id === currentPhase && isExecuting
                          ? 'hsl(207,60%,50%)'
                          : phase.id === currentPhase
                          ? 'hsl(207,60%,40%)'
                          : 'hsl(210,10%,88%)',
                    }}
                  />
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-[10px] whitespace-nowrap z-10 shadow-sm pointer-events-none">
                    {phase.id}. {phase.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1 pt-2">
              {PHASE_CONFIG.map(phase => (
                <div key={phase.id} className="flex-1 text-center">
                  <span className={`text-[9px] font-medium ${phase.id <= currentPhase ? 'text-primary' : 'text-muted-foreground'}`}>
                    {phase.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Processing Indicator ── */}
        <AnimatePresence>
          {isExecuting && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-[hsl(207,50%,96%)]"
            >
              <Loader2 className="w-5 h-5 animate-spin text-[hsl(207,60%,45%)]" />
              <div>
                <p className="text-sm font-medium text-[hsl(207,60%,30%)]">Agente IA trabajando...</p>
                <p className="text-xs text-muted-foreground">
                  {PHASE_SPINNER[currentPhase] || `Procesando Fase ${currentPhase}...`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error Indicator ── */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5"
            >
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Error en el flujo</p>
                <p className="text-xs text-muted-foreground">Revisa los logs de n8n para más detalles.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase Output Cards ── */}
        <div className="space-y-4">
          {PHASE_CONFIG.map(phase => {
            if (phase.id > currentPhase) return null;

            const data = getPhaseData(phase.id);
            const isCurrentProcessing = phase.id === currentPhase && isExecuting;

            return (
              <PhaseOutputCard
                key={phase.id}
                phaseId={phase.id}
                data={data}
                isProcessing={isCurrentProcessing}
              />
            );
          })}
        </div>

        {/* ── Approve / Siguiente Button (enabled when paused) ── */}
        <AnimatePresence>
          {isPaused && currentPhase < 10 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={handleApprove}
                size="lg"
                className="gap-2 px-8 bg-[hsl(160,45%,35%)] hover:bg-[hsl(160,45%,30%)] text-white"
              >
                <ArrowRight className="w-4 h-4" />
                Aprobar Fase {currentPhase} → Ejecutar Fase {currentPhase + 1}: {PHASE_CONFIG[currentPhase]?.name}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Completed ── */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg border bg-[hsl(160,40%,96%)] border-[hsl(160,40%,80%)]"
            >
              <CheckCircle className="w-5 h-5 text-[hsl(160,45%,40%)]" />
              <p className="text-sm font-medium text-[hsl(160,50%,30%)]">
                Investigación de 10 fases completada exitosamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
