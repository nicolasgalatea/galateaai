import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, CheckCircle, Loader2, ChevronDown, ChevronUp,
  Sparkles, Brain, Edit3, Save, RefreshCw, FileText,
  FlaskConical, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useResearchProject,
  PHASE_CONFIG,
  AGENT_NAMES,
  type ResearchProject,
} from '@/hooks/useResearchProject';

// Phase-specific renderers
import PhaseDefinition from '@/components/research/PhaseDefinition';
import PhaseFINER from '@/components/research/PhaseFINER';
import PhaseArticles from '@/components/research/PhaseArticles';
import PhasePRISMA from '@/components/research/PhasePRISMA';
import PhaseManuscript from '@/components/research/PhaseManuscript';
import SaveIndicator from '@/components/research/SaveIndicator';

// ── Phase Stepper ──
function PhaseStepper({ currentPhase, status }: { currentPhase: number; status: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-primary">Progreso de Investigación</span>
        <span className="text-muted-foreground">Fase {currentPhase}/10</span>
      </div>
      <Progress value={(currentPhase / 10) * 100} className="h-2" />
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
              phase.id <= currentPhase ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {phase.name}
            </span>
          </div>
        ))}
      </div>
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
  phaseNumber, phaseData, userEdits, isActive, isExecuting, onSave, isSaving,
}: {
  phaseNumber: number;
  phaseData: Record<string, unknown> | null;
  userEdits: Record<string, unknown>;
  isActive: boolean;
  isExecuting: boolean;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  isSaving: boolean;
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

    // Phase 4: FINER viability score
    if (phaseNumber === 4) {
      return <PhaseFINER data={data} userEdits={edits} />;
    }

    // Phase 7: Article table with inclusion/exclusion
    if (phaseNumber === 7) {
      return (
        <PhaseArticles
          data={data}
          userEdits={edits}
          phaseKey={phaseKey}
          onSave={onSave}
          onLocalChange={handleLocalChange}
        />
      );
    }

    // Phase 9: PRISMA flow diagram
    if (phaseNumber === 9) {
      return <PhasePRISMA data={data} userEdits={edits} />;
    }

    // Phase 10: Manuscript viewer
    if (phaseNumber === 10) {
      return <PhaseManuscript data={data} userEdits={edits} />;
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

// ════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════
export default function ResearchDashboard() {
  const {
    project, status, isLoading, isSaving,
    createProject, saveUserEdit, approvePhase, syncWithAI, getPhaseData, getPhaseEdits,
  } = useResearchProject();

  const [question, setQuestion] = useState('');
  const [title, setTitle] = useState('');
  const DEFAULT_QUESTION = '¿Cuál es la eficacia y seguridad de los inhibidores SGLT2 en pacientes con insuficiencia cardíaca con fracción de eyección preservada comparado con placebo?';

  const handleApproval = async () => {
    await approvePhase();
  };

  const handleStart = async () => {
    const q = question.trim() || DEFAULT_QUESTION;
    const t = title.trim() || 'Revisión Sistemática SGLT2i en ICFEp';
    await createProject(t, q);
  };

  // ── Idle ──
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <DashboardHeader />
        <Card className="border-2 border-primary">
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

  // ── Active ──
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DashboardHeader />
      <PhaseStepper currentPhase={project.current_phase} status={status} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'executing' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              {PHASE_SPINNER_MESSAGES[project.current_phase] || `Agentes de IA procesando Fase ${project.current_phase}...`}
            </div>
          )}
          {status === 'paused' && (
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
        {status === 'paused' && (
          <Button onClick={handleApproval} disabled={isSaving} className="gap-2">
            <CheckCircle className="w-4 h-4" /> Aprobar Fase
          </Button>
        )}
        {status !== 'executing' && status !== 'completed' && status !== 'paused' && (
          <Button onClick={syncWithAI} disabled={isSaving} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} /> Sincronizar con IA
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {PHASE_CONFIG.map((phase) => {
          const isCurrentPhase = phase.id === project.current_phase;
          const isPastPhase = phase.id < project.current_phase;
          const isExecutingPhase = isCurrentPhase && status === 'executing';
          if (!isPastPhase && !isCurrentPhase) return null;
          return (
            <PhaseCard
              key={phase.id}
              phaseNumber={phase.id}
              phaseData={getPhaseData(phase.id)}
              userEdits={getPhaseEdits(phase.id)}
              isActive={isCurrentPhase}
              isExecuting={isExecutingPhase}
              onSave={saveUserEdit}
              isSaving={isSaving}
            />
          );
        })}
      </div>

      {status === 'paused' && project.current_phase < 10 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center pt-4">
          <Button size="lg" onClick={handleApproval} className="gap-2 px-8">
            <CheckCircle className="w-4 h-4" />
            Aprobar y Avanzar a Fase {project.current_phase + 1}: {PHASE_CONFIG[project.current_phase]?.name}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="border-b-4 border-primary pb-4 mb-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
        <FlaskConical className="w-4 h-4" /> RESEARCH DASHBOARD — 10 Fases · 14 Agentes
      </div>
      <h1 className="text-3xl font-bold text-foreground">Dashboard de Investigación Médica</h1>
      <p className="text-base mt-1 text-muted-foreground">Conectado a n8n + Claude · Sincronización bidireccional con Lovable Cloud</p>
    </div>
  );
}
