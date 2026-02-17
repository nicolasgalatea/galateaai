import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, FlaskConical, ArrowRight, CheckCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useResearchLab, LAB_PHASES } from '@/hooks/useResearchLab';
import galateaLogo from '@/assets/galatea-logo-clean.png';
import santaFeLogo from '@/assets/santa-fe-logo-clean.png';

// ── Phase-specific spinner messages ──
const PHASE_SPINNER: Record<number, string> = {
  1: 'Ideador analizando el problema clínico...',
  2: 'Analizando contexto y literatura existente...',
  3: 'Construyendo tabla PICOT estructurada...',
  4: 'Diseñando la metodología del estudio...',
  5: 'Evaluando viabilidad con análisis FINER...',
  6: 'Definiendo criterios de inclusión y exclusión...',
  7: 'Generando ecuaciones de búsqueda MeSH...',
  8: 'Ensamblando protocolo PRISMA-P...',
  9: 'Ejecutando PRISMA flow y extracción de datos...',
  10: 'Generando manuscrito y meta-análisis final...',
};

// ── Phase Output Renderer ──
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
  const phase = LAB_PHASES.find(p => p.id === phaseId)!;

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

  // Render data based on phase type
  const renderContent = () => {
    // If there's a markdown "content" field, render it
    if (data.content && typeof data.content === 'string') {
      return (
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown>{data.content}</ReactMarkdown>
        </div>
      );
    }

    // PICOT table for phase 3
    if (phaseId === 3) {
      const picotKeys = ['population', 'intervention', 'comparison', 'outcome', 'time',
        'P', 'I', 'C', 'O', 'T', 'Población', 'Intervención', 'Comparación', 'Outcome', 'Tiempo'];
      const hasPicot = picotKeys.some(k => data[k]);
      if (hasPicot) {
        const rows = [
          { label: 'Población (P)', icon: '👥', value: (data.population || data.Población || data.P || '') as string },
          { label: 'Intervención (I)', icon: '💊', value: (data.intervention || data.Intervención || data.I || '') as string },
          { label: 'Comparación (C)', icon: '⚖️', value: (data.comparison || data.Comparación || data.C || '') as string },
          { label: 'Desenlace (O)', icon: '🎯', value: (data.outcome || data.Outcome || data.O || '') as string },
          { label: 'Tiempo (T)', icon: '⏱️', value: (data.time || data.Tiempo || data.T || '') as string },
        ];
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">📋 Tabla PICOT</h4>
            <div className="border rounded-lg overflow-hidden bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/5">
                    <th className="px-3 py-2 text-left w-12"></th>
                    <th className="px-3 py-2 text-left font-semibold">Componente</th>
                    <th className="px-3 py-2 text-left font-semibold">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.label} className="border-t">
                      <td className="px-3 py-2 text-center text-lg">{r.icon}</td>
                      <td className="px-3 py-2 font-medium">{r.label}</td>
                      <td className="px-3 py-2">{r.value || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
    }

    // Phase 7: Search equations
    if (phaseId === 7) {
      const equations = data.search_equations || data.ecuaciones || data.equations;
      if (equations && typeof equations === 'string') {
        return (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary">🔍 Ecuaciones de Búsqueda</h4>
            <pre className="text-xs bg-muted/50 p-4 rounded-lg border whitespace-pre-wrap font-mono">{equations}</pre>
          </div>
        );
      }
    }

    // Generic key-value rendering
    const entries = Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'agent_name');
    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground italic">Sin datos aún.</p>;
    }

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
                  {val.map((item, i) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
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
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
                {phaseId}
              </div>
              <span className="text-primary">{phase.name}</span>
              <span className="text-xs text-muted-foreground font-normal">— {phase.description}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CardHeader>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
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
  const { progress, labStatus, isLoading, startResearch, advanceToPhase, getPhaseOutput } = useResearchLab();

  const faseActual = progress?.fase_actual ?? 0;
  const progressPercent = Math.min((faseActual / 10) * 100, 100);

  const handleStart = async () => {
    if (!question.trim()) return;
    await startResearch(question.trim());
  };

  const handleNextPhase = async () => {
    const nextPhase = faseActual + 1;
    if (nextPhase > 10) return;
    await advanceToPhase(nextPhase);
  };

  const isIdle = labStatus === 'idle';
  const isProcessing = labStatus === 'processing';
  const isPaused = labStatus === 'paused';
  const isCompleted = labStatus === 'completed';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'hsl(210, 20%, 98%)' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'linear-gradient(135deg, hsl(207, 60%, 30%), hsl(160, 45%, 35%))',
          borderColor: 'hsl(207, 40%, 25%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={galateaLogo} alt="Galatea" className="h-8 w-auto" />
            <div className="h-6 w-px bg-white/30" />
            <span className="text-white/90 font-semibold text-sm tracking-wide">The Research Lab</span>
          </div>
          <img src={santaFeLogo} alt="Santa Fe" className="h-7 w-auto opacity-80" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Input Section ── */}
        <Card className="border border-border shadow-subtle">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'hsl(207, 60%, 30%)' }}>
              <FlaskConical className="w-5 h-5" />
              Pregunta de Investigación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ej: ¿Son efectivos los inhibidores SGLT2 en insuficiencia cardíaca con fracción de eyección preservada?"
                className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                disabled={!isIdle}
              />
              <Button
                onClick={handleStart}
                disabled={!question.trim() || !isIdle || isLoading}
                className="self-end"
                style={{ backgroundColor: 'hsl(160, 45%, 35%)', color: 'white' }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── 10-Phase Stepper ── */}
        {!isIdle && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium" style={{ color: 'hsl(207, 60%, 30%)' }}>
                Progreso General
              </span>
              <span className="text-muted-foreground">
                Fase {faseActual}/10 — {LAB_PHASES[faseActual - 1]?.name ?? 'Completado'}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />

            {/* Phase indicators with labels */}
            <div className="flex gap-1">
              {LAB_PHASES.map((phase) => (
                <div key={phase.id} className="flex-1 relative group">
                  <div
                    className="h-2 rounded-full transition-colors duration-500"
                    style={{
                      backgroundColor:
                        phase.id < faseActual
                          ? 'hsl(160, 45%, 40%)'
                          : phase.id === faseActual && isProcessing
                          ? 'hsl(207, 60%, 50%)'
                          : phase.id === faseActual
                          ? 'hsl(207, 60%, 40%)'
                          : 'hsl(210, 10%, 88%)',
                    }}
                  />
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-[10px] whitespace-nowrap z-10 shadow-sm">
                    {phase.id}. {phase.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-1 pt-2">
              {LAB_PHASES.map((phase) => (
                <div key={phase.id} className="flex-1 text-center">
                  <span className={`text-[9px] font-medium ${
                    phase.id <= faseActual ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {phase.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Processing Indicator ── */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-border"
              style={{ backgroundColor: 'hsl(207, 50%, 96%)' }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(207, 60%, 45%)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(207, 60%, 30%)' }}>
                  Procesando con IA...
                </p>
                <p className="text-xs text-muted-foreground">
                  {PHASE_SPINNER[faseActual] || `Procesando Fase ${faseActual}...`}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase Output Cards (auto-rendered when data arrives) ── */}
        <div className="space-y-4">
          {LAB_PHASES.map((phase) => {
            const data = getPhaseOutput(phase.id);
            const isCurrentPhase = phase.id === faseActual;
            const isPast = phase.id < faseActual;
            const isCurrentProcessing = isCurrentPhase && isProcessing;

            // Only show past phases, current phase, or currently processing
            if (!isPast && !isCurrentPhase) return null;

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

        {/* ── "Siguiente" Button (enabled when paused) ── */}
        <AnimatePresence>
          {isPaused && faseActual < 10 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-4"
            >
              <Button
                onClick={handleNextPhase}
                size="lg"
                className="gap-2 px-8"
                style={{ backgroundColor: 'hsl(160, 45%, 35%)', color: 'white' }}
              >
                <ArrowRight className="w-4 h-4" />
                Siguiente: Fase {faseActual + 1} — {LAB_PHASES[faseActual]?.name}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Completed ── */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-lg border"
              style={{
                backgroundColor: 'hsl(160, 40%, 96%)',
                borderColor: 'hsl(160, 40%, 80%)',
              }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: 'hsl(160, 45%, 40%)' }} />
              <p className="text-sm font-medium" style={{ color: 'hsl(160, 50%, 30%)' }}>
                Investigación de 10 fases completada exitosamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
