import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, CheckCircle, Loader2, ChevronDown, ChevronUp,
  Sparkles, Brain, Edit3, Save, RefreshCw, FileText,
  FlaskConical, ArrowRight, BookOpen, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useResearchProject,
  PHASE_CONFIG,
  AGENT_NAMES,
  type ResearchProject,
} from '@/hooks/useResearchProject';
import { useResearchLab, type ResearchLabProgress } from '@/hooks/useResearchLab';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Phase-specific renderers
import N8nResearchChat from '@/components/research/N8nResearchChat';
import type { StructuredUpdate } from '@/components/research/N8nResearchChat';
import PhaseDefinition from '@/components/research/PhaseDefinition';
import PhaseFINER, { isFinerPassed } from '@/components/research/PhaseFINER';
import PhaseVariableMapping from '@/components/research/PhaseVariableMapping';
import PhaseArticles from '@/components/research/PhaseArticles';
import PhasePRISMA from '@/components/research/PhasePRISMA';
import PhaseManuscript from '@/components/research/PhaseManuscript';
import SaveIndicator from '@/components/research/SaveIndicator';
import EvidenceLibrary from '@/components/research/EvidenceLibrary';
import { GoldenRulesModal } from '@/components/research/GoldenRulesModal';

// ── Phase Stepper ──
function PhaseStepper({ currentPhase, status }: { currentPhase: number; status: string }) {
  const pct = Math.round((currentPhase / 10) * 100);
  const currentConfig = PHASE_CONFIG.find(p => p.id === currentPhase);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-primary">Progreso de Investigación</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Fase {currentPhase}/10</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={pct}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="font-bold text-primary tabular-nums"
            >
              {pct}%
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <Progress value={pct} className="h-2" />
      <div className="flex gap-1">
        {PHASE_CONFIG.map((phase) => (
          <div key={phase.id} className="flex-1 relative group">
            <div className={`h-2 rounded-full transition-all duration-500 ${
              phase.id < currentPhase
                ? 'bg-emerald-500'
                : phase.id === currentPhase && status === 'executing'
                ? 'bg-primary animate-pulse'
                : phase.id === currentPhase
                ? 'bg-primary'
                : 'bg-muted'
            }`} />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-[10px] whitespace-nowrap z-10 shadow-sm">
              {phase.id}. {phase.name}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1 pt-2">
        {PHASE_CONFIG.map((phase) => (
          <div key={phase.id} className="flex-1 text-center">
            <span className={`text-[9px] font-medium ${
              phase.id === currentPhase
                ? 'text-primary font-bold'
                : phase.id < currentPhase
                ? 'text-emerald-600'
                : 'text-muted-foreground'
            }`}>
              {phase.name}
            </span>
          </div>
        ))}
      </div>
      {currentConfig && (
        <div className="text-xs text-center text-muted-foreground mt-1">
          <span className="text-primary font-medium">{currentConfig.name}</span>
          {' — '}{currentConfig.description}
        </div>
      )}
    </div>
  );
}

// ── Phase-specific spinner messages ──
const PHASE_SPINNER_MESSAGES: Record<number, string> = {
  1: 'PICOT Builder estructurando pregunta clínica...',
  2: 'Validador FINER evaluando viabilidad...',
  3: 'Literature Scout buscando revisiones previas...',
  4: 'Criteria Designer definiendo criterios I/E...',
  5: 'PROSPERO Checker verificando registros...',
  6: 'Bias Assessor planificando evaluación de sesgos...',
  7: 'Bibliotecario buscando MeSH y ecuaciones de búsqueda...',
  8: 'Protocol Architect ensamblando protocolo PRISMA-P...',
  9: 'PRISMA Navigator ejecutando búsqueda sistemática...',
  10: 'Data Extractor procesando manuscrito final...',
};

// ── Medical Skeleton Loader ──
function MedicalSkeleton({ phaseNumber }: { phaseNumber?: number }) {
  const message = phaseNumber ? PHASE_SPINNER_MESSAGES[phaseNumber] : 'Procesando...';
  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-primary animate-pulse">{message}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Generic Editable Field (for phases without a dedicated renderer) ──
function EditableField({
  label, value, fieldKey, phaseKey, onSave, multiline = false, onLocalChange,
}: {
  label: string; value: string; fieldKey: string; phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  multiline?: boolean; onLocalChange: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    await onSave(phaseKey, fieldKey, editValue);
    setEditing(false);
    onLocalChange();
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary">{label}</label>
        {multiline ? (
          <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} className="min-h-[100px]" />
        ) : (
          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="gap-1"><Save className="w-3 h-3" /> Guardar</Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditValue(value); }}>Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-primary">{label}</label>
        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2" onClick={() => setEditing(true)}>
          <Edit3 className="w-3 h-3 mr-1" /> Editar
        </Button>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{value || '—'}</p>
    </div>
  );
}

// ── Helper ──
function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

// ── Phase Card Renderer ──
function PhaseCard({
  phaseNumber, phaseData, userEdits, isActive, isExecuting, onSave, isSaving, projectId,
}: {
  phaseNumber: number;
  phaseData: Record<string, unknown> | null;
  userEdits: Record<string, unknown>;
  isActive: boolean;
  isExecuting: boolean;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  isSaving: boolean;
  projectId?: string;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const config = PHASE_CONFIG.find(p => p.id === phaseNumber)!;
  const phaseKey = `fase_${phaseNumber}`;

  const handleLocalChange = useCallback(() => {
    setHasLocalChanges(true);
  }, []);

  if (isExecuting && !phaseData) return <MedicalSkeleton phaseNumber={phaseNumber} />;
  if (!phaseData) return null;

  // ── Route to phase-specific renderer ──
  const renderPhaseContent = () => {
    const data = phaseData || {};
    const edits = userEdits || {};

    // Phases 1-3: Definition (rich text + PICOT)
    if (phaseNumber >= 1 && phaseNumber <= 3) {
      return (
        <PhaseDefinition
          phaseNumber={phaseNumber}
          data={data}
          userEdits={edits}
          phaseKey={phaseKey}
          onSave={onSave}
          onLocalChange={handleLocalChange}
        />
      );
    }

    // Phase 4: FINER viability score — Radar Chart
    if (phaseNumber === 4) {
      return <PhaseFINER data={data} userEdits={edits} />;
    }

    // Phase 5: Variable Mapping
    if (phaseNumber === 5) {
      return (
        <PhaseVariableMapping
          data={data}
          userEdits={edits}
          isLiveUpdating={isExecuting}
        />
      );
    }

    // Phase 7: Article table with inclusion/exclusion + EvidenceLibrary (Realtime)
    if (phaseNumber === 7) {
      return (
        <div className="space-y-6">
          <PhaseArticles
            data={data}
            userEdits={edits}
            phaseKey={phaseKey}
            onSave={onSave}
            onLocalChange={handleLocalChange}
          />
          {projectId && (
            <div className="border-t border-[hsl(var(--border))] pt-5">
              <EvidenceLibrary
                projectId={projectId}
                currentPhase={7}
                isExecuting={isExecuting}
              />
            </div>
          )}
        </div>
      );
    }

    // Phase 9: PRISMA flow diagram
    if (phaseNumber === 9) {
      return <PhasePRISMA data={data} userEdits={edits} />;
    }

    // Phase 10: Manuscript viewer (handled separately as full-width)
    if (phaseNumber === 10) {
      return <PhaseManuscript data={data} userEdits={edits} projectId={projectId} />;
    }

    // ── Default: generic structured renderer for phases 5, 6, 8 ──
    const merged = { ...data, ...edits };

    // If there's markdown content
    if (merged.content && typeof merged.content === 'string') {
      return (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{merged.content as string}</ReactMarkdown>
          </div>
          <EditableField
            label="Notas del investigador"
            value={(edits.notes as string) || ''}
            fieldKey="notes"
            phaseKey={phaseKey}
            onSave={onSave}
            multiline
            onLocalChange={handleLocalChange}
          />
        </div>
      );
    }

    // Generic key-value rendering
    const fields = Object.entries(merged).filter(
      ([k]) => !k.startsWith('_') && k !== 'agent_name' && k !== 'agent_number'
    );

    if (fields.length === 0) {
      return <p className="text-sm text-muted-foreground italic">Datos pendientes de procesamiento por la IA.</p>;
    }

    return (
      <div className="space-y-4">
        {fields.map(([key, val]) => {
          if (typeof val === 'string') {
            return (
              <EditableField key={key} label={formatLabel(key)} value={val} fieldKey={key}
                phaseKey={phaseKey} onSave={onSave} onLocalChange={handleLocalChange} />
            );
          }
          if (Array.isArray(val)) {
            return (
              <div key={key} className="space-y-1">
                <label className="text-sm font-semibold text-primary">{formatLabel(key)}</label>
                <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                  {val.map((item, i) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
                </ul>
              </div>
            );
          }
          if (typeof val === 'object' && val !== null) {
            return (
              <div key={key} className="p-3 rounded-lg bg-muted/50 border">
                <label className="text-sm font-semibold text-primary mb-2 block">{formatLabel(key)}</label>
                <pre className="text-xs text-foreground whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
              </div>
            );
          }
          return (
            <EditableField key={key} label={formatLabel(key)} value={String(val)} fieldKey={key}
              phaseKey={phaseKey} onSave={onSave} onLocalChange={handleLocalChange} />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={`border-2 transition-colors ${isActive ? 'border-primary shadow-md' : 'border-border'}`}>
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>{phaseNumber}</div>
              <span className={isActive ? 'text-primary' : ''}>{config.name}</span>
              <span className="text-xs text-muted-foreground font-normal">— {config.description}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <SaveIndicator hasLocalChanges={hasLocalChanges} isSaving={isSaving} />
              {config.agents.map(agentId => (
                <span key={agentId} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  {AGENT_NAMES[agentId]}
                </span>
              ))}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </CardHeader>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              <CardContent className="pt-0">{renderPhaseContent()}</CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ── Chat-focused view for early phases (< 4) ──
function EarlyPhaseView({
  children,
  currentPhase,
}: {
  children: ReactNode;
  currentPhase: number;
}) {
  return (
    <motion.div
      key="early-phase"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
        <Brain className="w-4 h-4 text-primary shrink-0 animate-pulse" />
        <span className="text-sm text-primary font-medium">
          Fase {currentPhase} — Refinamiento Clínico activo
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Avanza a Fase 4 para ver el análisis FINER completo
        </span>
      </div>
      {children}
    </motion.div>
  );
}

// ── Mid-phase view (phases 4-7): FINER radar + evidence ──
function MidPhaseView({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      key="mid-phase"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {children}
    </motion.div>
  );
}

// ── Late-phase view (phases 8+): full-width manuscript ──
function LatePhaseView({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      key="late-phase"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto space-y-4"
    >
      {children}
    </motion.div>
  );
}

// ════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════
export default function ResearchDashboard() {
  const {
    project, status, isLoading, isSaving,
    createProject, saveUserEdit, approvePhase, syncWithAI, getPhaseData, getPhaseEdits,
    fetchProject,
  } = useResearchProject();

  const { progress: labProgress, labStatus } = useResearchLab();

  // ── Realtime subscription to research_lab_progress ──
  const [realtimeLabProgress, setRealtimeLabProgress] = useState<ResearchLabProgress | null>(null);
  const labChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

    labChannelRef.current = supabase
      .channel('dashboard_lab_progress_rt')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_lab_progress',
          filter: `project_id=eq.${FIXED_PROJECT_ID}`,
        },
        (payload) => {
          console.log('[Dashboard] research_lab_progress realtime:', payload.eventType);
          const record = payload.new as ResearchLabProgress;
          if (record) setRealtimeLabProgress(record);
        }
      )
      .subscribe();

    return () => {
      if (labChannelRef.current) {
        supabase.removeChannel(labChannelRef.current);
      }
    };
  }, []);

  // Merge: prefer realtime over initial fetch
  const currentLab = realtimeLabProgress || labProgress;
  const labIsActive = currentLab?.status === 'active' || currentLab?.status === 'processing';
  const labIsPaused = currentLab?.status === 'paused';

  // ── Bridge lab progress data into PhaseCard-compatible format ──
  // Helper: safely parse JSON that might be a string
  const safeParse = (val: unknown): Record<string, unknown> | null => {
    if (!val) return null;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // Not valid JSON string
      }
      return null;
    }
    if (typeof val === 'object' && !Array.isArray(val)) {
      return val as Record<string, unknown>;
    }
    return null;
  };

  const getLabPhaseData = useCallback((phaseNumber: number): Record<string, unknown> | null => {
    // First check research_projects.phase_data (primary source)
    const projectData = getPhaseData(phaseNumber);
    if (projectData && Object.keys(projectData).length > 0) {
      return safeParse(projectData) || projectData;
    }

    // Fallback: map from research_lab_progress outputs
    if (!currentLab) return null;
    const labOutputMap: Record<number, keyof ResearchLabProgress> = {
      1: 'fase_0_1_output', 2: 'fase_0_1_output',
      3: 'fase_2_3_output', 4: 'fase_2_3_output',
      5: 'fase_4_5_output', 6: 'fase_4_5_output',
      7: 'fase_6_7_output', 8: 'fase_6_7_output',
      9: 'fase_8_9_output', 10: 'fase_8_9_output',
    };
    const outputKey = labOutputMap[phaseNumber];
    if (outputKey) {
      const raw = currentLab[outputKey];
      const labData = safeParse(raw);
      if (labData && Object.keys(labData).length > 0) {
        console.log(`[Dashboard] Phase ${phaseNumber} data from ${outputKey}:`, labData);
        return labData;
      }
    }
    return null;
  }, [getPhaseData, currentLab]);

  const [question, setQuestion] = useState('');
  const [title, setTitle] = useState('');
  const [goldenRulesAccepted, setGoldenRulesAccepted] = useState(false);
  const DEFAULT_QUESTION = '¿Cuál es la eficacia y seguridad de los inhibidores SGLT2 en pacientes con insuficiencia cardíaca con fracción de eyección preservada comparado con placebo?';

  // ── Guardar título / pregunta directamente en Supabase ──
  const handleFieldUpdate = useCallback(async (
    field: 'title' | 'research_question',
    value: string,
  ) => {
    if (!project) return;
    const { error } = await supabase
      .from('research_projects')
      .update({ [field]: value })
      .eq('id', project.id);
    if (error) {
      toast({ title: 'Error al guardar', description: error.message, variant: 'destructive' });
    }
  }, [project]);

  // ── Datos estructurados desde n8n → refetch inmediato ──
  const handleStructuredData = useCallback((update: StructuredUpdate) => {
    console.log('[Dashboard] Structured update from n8n:', update);
    if (project?.id) fetchProject(project.id);
  }, [fetchProject, project?.id]);

  // ── FINER gate: block approval when Phase 4 output explicitly marks passed=false ──
  const finerData = getLabPhaseData(4);
  const finerPassed = isFinerPassed(finerData);
  // Block only when we have data AND it clearly failed (null = no data yet → allow)
  const finerBlocking = project?.current_phase === 4 && finerPassed === false;

  const handleApproval = async () => {
    if (finerBlocking) return; // safety guard
    await approvePhase();
  };

  const handleStart = async () => {
    const q = question.trim() || DEFAULT_QUESTION;
    const t = title.trim() || 'Revisión Sistemática SGLT2i en ICFEp';
    await createProject({ title: t, research_question: q });
  };

  // Auto-scroll to Phase 1 results when status transitions to 'paused'
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current === 'executing' && status === 'paused' && project?.current_phase === 1) {
      // Phase 1 done — results are now visible via PhaseCard
      console.log('[Dashboard] Phase 1 paused — showing results');
    }
    prevStatusRef.current = status;
  }, [status, project?.current_phase]);

  // ── Idle: no project yet ──
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <GoldenRulesModal
          isOpen={!goldenRulesAccepted}
          onAccept={() => setGoldenRulesAccepted(true)}
        />
        <DashboardHeader />
        <Card className={`border-2 border-primary transition-opacity duration-300 ${!goldenRulesAccepted ? 'opacity-40 pointer-events-none' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <FlaskConical className="w-5 h-5" /> Nueva Investigación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Título del Proyecto</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Revisión Sistemática SGLT2i en ICFEp" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Pregunta de Investigación</label>
              <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={DEFAULT_QUESTION} className="min-h-[80px]" />
            </div>
            <Button onClick={handleStart} disabled={isLoading} className="w-full gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Iniciar Investigación de 10 Fases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Shared: status bar + approval buttons ──
  const statusBar = (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {labIsActive && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="animate-pulse">El Agente Estratega está analizando tu pregunta...</span>
          </motion.div>
        )}
        {labIsPaused && !labIsActive && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground border border-accent">
            <Edit3 className="w-4 h-4" /> Fase lista para revisión — Aprueba para continuar
          </div>
        )}
        {!labIsActive && !labIsPaused && status === 'executing' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            {PHASE_SPINNER_MESSAGES[project.current_phase] || `Agentes de IA procesando Fase ${project.current_phase}...`}
          </div>
        )}
        {!labIsActive && !labIsPaused && status === 'paused' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
            <Edit3 className="w-4 h-4" /> Esperando revisión del investigador
          </div>
        )}
        {status === 'completed' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
            <CheckCircle className="w-4 h-4" /> Investigación completada
          </div>
        )}
      </div>
      {(status === 'paused' || labIsPaused) && (
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleApproval}
            disabled={isSaving || finerBlocking}
            className="gap-2"
            title={finerBlocking ? 'El Test FINER falló. Debes refinar la pregunta antes de continuar.' : undefined}
          >
            <CheckCircle className="w-4 h-4" /> Aprobar Fase
          </Button>
          {finerBlocking && (
            <span className="text-[11px] text-destructive font-medium">⛔ Bloqueado por Test FINER</span>
          )}
        </div>
      )}
      {!labIsActive && status !== 'executing' && status !== 'completed' && status !== 'paused' && !labIsPaused && (
        <Button onClick={syncWithAI} disabled={isSaving} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} /> Sincronizar con IA
        </Button>
      )}
    </div>
  );

  const approvalFooter = status === 'paused' && project.current_phase < 10 ? (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 pt-4">
      <Button size="lg" onClick={handleApproval} disabled={finerBlocking || isSaving} className="gap-2 px-8">
        <CheckCircle className="w-4 h-4" />
        Aprobar y Avanzar a Fase {project.current_phase + 1}: {PHASE_CONFIG[project.current_phase]?.name}
      </Button>
      {finerBlocking && (
        <p className="text-sm text-destructive font-medium">
          ⛔ El Test FINER no pasó — refina tu pregunta de investigación antes de continuar.
        </p>
      )}
    </motion.div>
  ) : null;

  // ══════════════════════════════════════════════════
  // VISTA A: Fases < 4 — Chat enfocado (Refinamiento)
  // ══════════════════════════════════════════════════
  if (project.current_phase < 4) {
    return (
      <EarlyPhaseView currentPhase={project.current_phase}>
        <DashboardHeader project={project as any} onFieldUpdate={handleFieldUpdate} />
        <PhaseStepper currentPhase={project.current_phase} status={status} />
        {statusBar}

        {/* Chat prominente para fases de refinamiento */}
        <N8nResearchChat
          projectId={project.id}
          projectFixedId={project.project_id}
          onRefetch={() => { if (project?.id) fetchProject(project.id); }}
          currentPhase={project.current_phase}
          onStructuredData={handleStructuredData}
        />

        <div className="space-y-4">
          {PHASE_CONFIG.filter(p => p.id <= 3).map((phase) => {
            const isCurrentPhase = phase.id === project.current_phase;
            const isPastPhase = phase.id < project.current_phase;
            const isExecutingPhase = isCurrentPhase && status === 'executing';
            if (!isPastPhase && !isCurrentPhase) return null;
            return (
              <PhaseCard
                key={phase.id}
                phaseNumber={phase.id}
                phaseData={getLabPhaseData(phase.id)}
                userEdits={getPhaseEdits(phase.id)}
                isActive={isCurrentPhase}
                isExecuting={isExecutingPhase}
                onSave={saveUserEdit}
                isSaving={isSaving}
                projectId={project.id}
              />
            );
          })}
        </div>
        {approvalFooter}
      </EarlyPhaseView>
    );
  }

  // ══════════════════════════════════════════════════
  // VISTA B: Fases >= 8 — ManuscriptEditor a pantalla completa
  // ══════════════════════════════════════════════════
  if (project.current_phase >= 8) {
    const phaseData10 = getLabPhaseData(10);
    const userEdits10 = getPhaseEdits(10);
    const showManuscript = project.current_phase >= 10 && (phaseData10 || status === 'executing');

    return (
      <LatePhaseView>
        <DashboardHeader project={project as any} onFieldUpdate={handleFieldUpdate} />
        <PhaseStepper currentPhase={project.current_phase} status={status} />
        {statusBar}

        {/* Header strip fases 8-10 */}
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary text-sm tracking-wide uppercase">
            Fases 8–10 · Protocolo PRISMA-P, Manuscrito &amp; Dossier Final
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Fase actual: {project.current_phase}/10</span>
        </div>

        {/* Phases 1-7 summary (collapsed) */}
        {[1, 2, 3, 4, 5, 6, 7].map((phaseId) => {
          const phaseData = getLabPhaseData(phaseId);
          if (!phaseData) return null;
          const config = PHASE_CONFIG.find(p => p.id === phaseId)!;
          return (
            <PhaseCard
              key={phaseId}
              phaseNumber={phaseId}
              phaseData={phaseData}
              userEdits={getPhaseEdits(phaseId)}
              isActive={false}
              isExecuting={false}
              onSave={saveUserEdit}
              isSaving={isSaving}
              projectId={project.id}
            />
          );
        })}

        {/* Phases 8 & 9 */}
        {[8, 9].map((phaseId) => {
          if (phaseId > project.current_phase) return null;
          const isCurrentPhase = phaseId === project.current_phase;
          const isExecutingPhase = isCurrentPhase && status === 'executing';
          return (
            <PhaseCard
              key={phaseId}
              phaseNumber={phaseId}
              phaseData={getLabPhaseData(phaseId)}
              userEdits={getPhaseEdits(phaseId)}
              isActive={isCurrentPhase}
              isExecuting={isExecutingPhase}
              onSave={saveUserEdit}
              isSaving={isSaving}
              projectId={project.id}
            />
          );
        })}

        {/* Phase 10: Manuscript full-width con ReferencesPanel integrado */}
        {showManuscript && (
          <motion.div
            key="phase-10-manuscript"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-primary rounded-xl shadow-lg bg-card overflow-hidden"
          >
            {/* Phase header */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-primary/5">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                10
              </div>
              <span className="font-semibold text-primary">Manuscrito Final</span>
              <span className="text-xs text-muted-foreground">— Dossier completo listo para publicación</span>
              <div className="ml-auto">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                  Data Extractor
                </span>
              </div>
            </div>
            {/* Editor con ReferencesPanel (projectId siempre presente) */}
            <div className="p-6">
              <PhaseManuscript
                data={phaseData10 || {}}
                userEdits={userEdits10 || {}}
                projectId={project.id}
                onValidate={approvePhase}
                isSaving={isSaving}
              />
            </div>
          </motion.div>
        )}

        {/* Phase 10 skeleton while executing */}
        {project.current_phase >= 10 && !phaseData10 && status === 'executing' && (
          <MedicalSkeleton phaseNumber={10} />
        )}

        {approvalFooter}

        {/* Chat disponible en fases avanzadas */}
        <N8nResearchChat
          projectId={project.id}
          projectFixedId={project.project_id}
          onRefetch={() => { if (project?.id) fetchProject(project.id); }}
          currentPhase={project.current_phase}
          onStructuredData={handleStructuredData}
        />
      </LatePhaseView>
    );
  }

  // ══════════════════════════════════════════════════
  // VISTA C: Fases 4-7 — Dashboard con radar FINER
  // ══════════════════════════════════════════════════
  return (
    <MidPhaseView>
      <DashboardHeader project={project as any} onFieldUpdate={handleFieldUpdate} />
      <PhaseStepper currentPhase={project.current_phase} status={status} />
      {statusBar}

      {/* All phases up to current */}
      <div className="space-y-4">
        {PHASE_CONFIG.filter(p => p.id <= 7).map((phase) => {
          const isCurrentPhase = phase.id === project.current_phase;
          const isPastPhase = phase.id < project.current_phase;
          const isExecutingPhase = isCurrentPhase && status === 'executing';
          if (!isPastPhase && !isCurrentPhase) return null;
          return (
            <PhaseCard
              key={phase.id}
              phaseNumber={phase.id}
              phaseData={getLabPhaseData(phase.id)}
              userEdits={getPhaseEdits(phase.id)}
              isActive={isCurrentPhase}
              isExecuting={isExecutingPhase}
              onSave={saveUserEdit}
              isSaving={isSaving}
              projectId={project.id}
            />
          );
        })}
      </div>

      {approvalFooter}

      {/* Chat disponible en fases intermedias */}
      <N8nResearchChat
        projectId={project.id}
        projectFixedId={project.project_id}
        onRefetch={() => { if (project?.id) fetchProject(project.id); }}
        currentPhase={project.current_phase}
        onStructuredData={handleStructuredData}
      />
    </MidPhaseView>
  );
}

// ── DashboardHeader (editable inline) ──────────────────────────
interface DashboardHeaderProps {
  project?: ResearchProject | null;
  onFieldUpdate?: (field: 'title' | 'research_question', value: string) => Promise<void>;
}

function DashboardHeader({ project, onFieldUpdate }: DashboardHeaderProps) {
  const [titleValue, setTitleValue] = useState(project?.title ?? '');
  const [questionValue, setQuestionValue] = useState(typeof project?.research_question === 'string' ? project.research_question : '');
  const [savedField, setSavedField] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  // Keep local state in sync when project updates from Supabase realtime
  useEffect(() => {
    if (project?.title) setTitleValue(project.title);
  }, [project?.title]);
  useEffect(() => {
    if (project?.research_question && typeof project.research_question === 'string') setQuestionValue(project.research_question);
  }, [project?.research_question]);

  const handleBlur = async (field: 'title' | 'research_question', value: string) => {
    const original = field === 'title' ? project?.title : project?.research_question;
    if (!onFieldUpdate || value === original || !project) return;
    setSavingField(field);
    await onFieldUpdate(field, value);
    setSavingField(null);
    setSavedField(field);
    setTimeout(() => setSavedField(null), 2000);
  };

  if (!project || !onFieldUpdate) {
    // Static header for idle state
    return (
      <div className="border-b-4 border-primary pb-4 mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
          <FlaskConical className="w-4 h-4" /> RESEARCH DASHBOARD — 10 Fases · 14 Agentes
        </div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard de Investigación Médica</h1>
        <p className="text-base mt-1 text-muted-foreground">Conectado a n8n + Claude · GalateaAI Cloud</p>
      </div>
    );
  }

  return (
    <div className="border-b-4 border-primary pb-4 mb-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
        <FlaskConical className="w-4 h-4" /> RESEARCH DASHBOARD — 10 Fases · 14 Agentes
      </div>

      {/* Editable title */}
      <div className="group relative">
        <input
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={() => handleBlur('title', titleValue)}
          className="text-3xl font-bold text-foreground bg-transparent border-0 border-b-2 border-transparent group-hover:border-primary/30 focus:border-primary focus:outline-none w-full transition-colors py-0.5"
          aria-label="Título del proyecto"
        />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {savingField === 'title' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          {savedField === 'title' && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Guardado ✓
            </Badge>
          )}
          <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
      </div>

      {/* Editable research question */}
      <div className="group relative">
        <textarea
          value={questionValue}
          onChange={(e) => setQuestionValue(e.target.value)}
          onBlur={() => handleBlur('research_question', questionValue)}
          rows={2}
          className="text-sm text-muted-foreground bg-transparent border-0 border-b border-transparent group-hover:border-primary/20 focus:border-primary/40 focus:outline-none w-full resize-none transition-colors leading-relaxed"
          aria-label="Pregunta de investigación"
        />
        <div className="absolute right-0 top-1 flex items-center gap-1.5">
          {savingField === 'research_question' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
          {savedField === 'research_question' && (
            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Guardado ✓
            </Badge>
          )}
          <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
        </div>
      </div>
    </div>
  );
}


