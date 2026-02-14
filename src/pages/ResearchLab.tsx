import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Play, FlaskConical, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useResearchLab } from '@/hooks/useResearchLab';
import { IdeadorPhase } from '@/components/research-lab/IdeadorPhase';
import { MethodologyDisplay } from '@/components/research-lab/MethodologyDisplay';
import galateaLogo from '@/assets/galatea-logo-clean.png';
import santaFeLogo from '@/assets/santa-fe-logo-clean.png';

const PHASE_NAMES = [
  'Ideación',
  'Análisis Clínico',
  'PICO Framework',
  'Metodología',
  'Diseño',
  'Protocolo',
  'Búsqueda',
  'Extracción',
  'Calidad',
  'Síntesis',
];

export default function ResearchLab() {
  const [question, setQuestion] = useState('');
  const { progress, labStatus, isLoading, startResearch, processPhase23, processPhase45 } = useResearchLab();

  const faseActual = progress?.fase_actual ?? 0;
  const progressPercent = Math.min((faseActual / 10) * 100, 100);

  const handleStart = async () => {
    if (!question.trim()) return;
    await startResearch(question.trim());
  };

  const isIdle = labStatus === 'idle';
  const isProcessing = labStatus === 'processing';
  const isPhase1Done = labStatus === 'phase1_done';
  const isPhase2Processing = labStatus === 'phase2_processing';
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

        {/* ── Progress Bar ── */}
        {!isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium" style={{ color: 'hsl(207, 60%, 30%)' }}>
                Progreso General
              </span>
              <span className="text-muted-foreground">
                Fase {faseActual}/10 — {PHASE_NAMES[faseActual] ?? 'Completado'}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />

            {/* Phase indicators */}
            <div className="flex gap-1">
              {PHASE_NAMES.map((name, i) => (
                <div
                  key={name}
                  className="flex-1 h-1.5 rounded-full transition-colors duration-500"
                  style={{
                    backgroundColor:
                      i < faseActual
                        ? 'hsl(160, 45%, 40%)'
                        : i === faseActual && !isIdle
                        ? 'hsl(207, 60%, 50%)'
                        : 'hsl(210, 10%, 88%)',
                  }}
                  title={name}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Processing Indicator ── */}
        <AnimatePresence>
          {(isProcessing || isPhase2Processing) && (
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
                  {isProcessing
                    ? 'Analizando el problema clínico, la literatura y el contexto científico.'
                    : 'Construyendo la tabla PICO y la metodología del estudio.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase 1: Ideador ── */}
        <AnimatePresence>
          {(faseActual >= 1 || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <IdeadorPhase
                data={progress?.fase_0_1_output as Record<string, unknown> | null}
                isProcessing={isProcessing && !progress?.fase_0_1_output}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Advance to Phase 2-3 Button ── */}
        <AnimatePresence>
          {isPhase1Done && !progress?.fase_2_3_output && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <Button
                onClick={processPhase23}
                size="lg"
                className="gap-2 px-8"
                style={{ backgroundColor: 'hsl(160, 45%, 35%)', color: 'white' }}
              >
                <ArrowRight className="w-4 h-4" />
                Avanzar a Fase 2: Metodología PICO
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase 2-3: PICO Table ── */}
        <AnimatePresence>
          {(faseActual >= 2 || isPhase2Processing) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MethodologyDisplay
                data={progress?.fase_2_3_output as Record<string, unknown> | null}
                isProcessing={isPhase2Processing && !progress?.fase_2_3_output}
                showApproveButton={!!progress?.fase_2_3_output && !progress?.fase_4_5_output}
                onApprove={processPhase45}
              />
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
                Análisis completado exitosamente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
