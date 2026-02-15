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
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  useResearchProject,
  PHASE_CONFIG,
  AGENT_NAMES,
  type ResearchProject,
} from '@/hooks/useResearchProject';

// ── Phase Stepper ──
function PhaseStepper({
  currentPhase,
  status,
}: {
  currentPhase: number;
  status: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-primary">Progreso de Investigación</span>
        <span className="text-muted-foreground">Fase {currentPhase}/10</span>
      </div>
      <Progress value={(currentPhase / 10) * 100} className="h-2" />
      <div className="flex gap-1">
        {PHASE_CONFIG.map((phase) => (
          <div
            key={phase.id}
            className="flex-1 relative group"
          >
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                phase.id < currentPhase
                  ? 'bg-emerald-500'
                  : phase.id === currentPhase && status === 'executing'
                  ? 'bg-primary animate-pulse'
                  : phase.id === currentPhase
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-[10px] whitespace-nowrap z-10 shadow-sm">
              {phase.id}. {phase.name}
            </div>
          </div>
        ))}
      </div>
      {/* Phase labels */}
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

// ── Medical Skeleton Loader ──
function MedicalSkeleton() {
  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <Skeleton className="h-5 w-48" />
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

// ── Editable Field ──
function EditableField({
  label,
  value,
  fieldKey,
  phaseKey,
  onSave,
  multiline = false,
}: {
  label: string;
  value: string;
  fieldKey: string;
  phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    await onSave(phaseKey, fieldKey, editValue);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary">{label}</label>
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[100px]"
          />
        ) : (
          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Save className="w-3 h-3" /> Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditValue(value); }}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-primary">{label}</label>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
          onClick={() => setEditing(true)}
        >
          <Edit3 className="w-3 h-3 mr-1" /> Editar
        </Button>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{value || '—'}</p>
    </div>
  );
}

// ── Article Table with Checkboxes ──
function ArticleTable({
  articles,
  phaseKey,
  onSave,
}: {
  articles: Array<{ id: string; title: string; authors: string; year: string; journal: string; included: boolean }>;
  phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
}) {
  const [localArticles, setLocalArticles] = useState(articles);

  const toggleArticle = (id: string) => {
    setLocalArticles(prev =>
      prev.map(a => a.id === id ? { ...a, included: !a.included } : a)
    );
  };

  const handleSaveSelection = async () => {
    await onSave(phaseKey, 'articles', localArticles);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary">Artículos Identificados</h4>
        <Button size="sm" variant="outline" onClick={handleSaveSelection} className="gap-1">
          <Save className="w-3 h-3" /> Guardar Selección
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">✓</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Autores</TableHead>
              <TableHead className="w-16">Año</TableHead>
              <TableHead>Revista</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localArticles.map((article) => (
              <TableRow key={article.id} className={!article.included ? 'opacity-50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={article.included}
                    onCheckedChange={() => toggleArticle(article.id)}
                  />
                </TableCell>
                <TableCell className="text-sm font-medium">{article.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{article.authors}</TableCell>
                <TableCell className="text-sm">{article.year}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{article.journal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {localArticles.filter(a => a.included).length}/{localArticles.length} artículos incluidos
      </p>
    </div>
  );
}

// ── Phase Card Renderer ──
function PhaseCard({
  phaseNumber,
  phaseData,
  userEdits,
  isActive,
  isExecuting,
  onSave,
}: {
  phaseNumber: number;
  phaseData: Record<string, unknown> | null;
  userEdits: Record<string, unknown>;
  isActive: boolean;
  isExecuting: boolean;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const config = PHASE_CONFIG.find(p => p.id === phaseNumber)!;
  const phaseKey = `fase_${phaseNumber}`;

  // Show skeleton while executing with no data
  if (isExecuting && !phaseData) {
    return <MedicalSkeleton />;
  }

  if (!phaseData) return null;

  // Try to render structured JSON
  const renderPhaseContent = () => {
    const data = { ...phaseData, ...userEdits } as Record<string, unknown>;

    // Check for articles array (e.g., from PRISMA Navigator)
    if (data.articles && Array.isArray(data.articles)) {
      return (
        <ArticleTable
          articles={data.articles as any}
          phaseKey={phaseKey}
          onSave={onSave}
        />
      );
    }

    // Check for markdown content
    if (data.content && typeof data.content === 'string') {
      return (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{data.content as string}</ReactMarkdown>
          </div>
          <EditableField
            label="Notas del investigador"
            value={(userEdits.notes as string) || ''}
            fieldKey="notes"
            phaseKey={phaseKey}
            onSave={onSave}
            multiline
          />
        </div>
      );
    }

    // Render structured fields as editable cards
    const fields = Object.entries(data).filter(
      ([k]) => !k.startsWith('_') && k !== 'agent_name' && k !== 'agent_number'
    );

    if (fields.length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">
          Datos pendientes de procesamiento por la IA.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {fields.map(([key, val]) => {
          if (typeof val === 'string') {
            return (
              <EditableField
                key={key}
                label={formatLabel(key)}
                value={val}
                fieldKey={key}
                phaseKey={phaseKey}
                onSave={onSave}
              />
            );
          }
          if (Array.isArray(val)) {
            return (
              <div key={key} className="space-y-1">
                <label className="text-sm font-semibold text-primary">{formatLabel(key)}</label>
                <ul className="list-disc list-inside text-sm text-foreground space-y-1">
                  {val.map((item, i) => (
                    <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                  ))}
                </ul>
              </div>
            );
          }
          if (typeof val === 'object' && val !== null) {
            return (
              <div key={key} className="p-3 rounded-lg bg-muted/50 border">
                <label className="text-sm font-semibold text-primary mb-2 block">{formatLabel(key)}</label>
                <pre className="text-xs text-foreground whitespace-pre-wrap">
                  {JSON.stringify(val, null, 2)}
                </pre>
              </div>
            );
          }
          return (
            <EditableField
              key={key}
              label={formatLabel(key)}
              value={String(val)}
              fieldKey={key}
              phaseKey={phaseKey}
              onSave={onSave}
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-2 transition-colors ${
        isActive ? 'border-primary shadow-md' : 'border-border'
      }`}>
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {phaseNumber}
              </div>
              <span className={isActive ? 'text-primary' : ''}>{config.name}</span>
              <span className="text-xs text-muted-foreground font-normal">— {config.description}</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Agent badges */}
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
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                {renderPhaseContent()}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ── Helper: format camelCase/snake_case keys to readable labels ──
function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

// ════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════
export default function ResearchDashboard() {
  const {
    project,
    status,
    isLoading,
    isSaving,
    createProject,
    saveUserEdit,
    syncWithAI,
    getPhaseData,
    getPhaseEdits,
  } = useResearchProject();

  const [question, setQuestion] = useState('');
  const [title, setTitle] = useState('');

  const DEFAULT_QUESTION = '¿Cuál es la eficacia y seguridad de los inhibidores SGLT2 en pacientes con insuficiencia cardíaca con fracción de eyección preservada comparado con placebo?';

  const handleStart = async () => {
    const q = question.trim() || DEFAULT_QUESTION;
    const t = title.trim() || 'Revisión Sistemática SGLT2i en ICFEp';
    await createProject(t, q);
  };

  // ── Idle: show input form ──
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <DashboardHeader />

        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-primary">
              <FlaskConical className="w-5 h-5" />
              Nueva Investigación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Título del Proyecto</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Revisión Sistemática SGLT2i en ICFEp"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Pregunta de Investigación</label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={DEFAULT_QUESTION}
                className="min-h-[80px]"
              />
            </div>
            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Iniciar Investigación de 10 Fases
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Active project ──
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DashboardHeader />

      {/* Stepper */}
      <PhaseStepper currentPhase={project.current_phase} status={status} />

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'executing' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Agentes de IA procesando Fase {project.current_phase}...
            </div>
          )}
          {status === 'paused' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              <Edit3 className="w-4 h-4" />
              Esperando revisión del investigador
            </div>
          )}
          {status === 'completed' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-4 h-4" />
              Investigación completada
            </div>
          )}
        </div>

        {/* Sync button */}
        {status !== 'executing' && status !== 'completed' && (
          <Button onClick={syncWithAI} disabled={isSaving} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            Sincronizar con IA
          </Button>
        )}
      </div>

      {/* Phase Cards */}
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
            />
          );
        })}
      </div>

      {/* Next phase button */}
      {status === 'paused' && project.current_phase < 10 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center pt-4"
        >
          <Button size="lg" onClick={syncWithAI} className="gap-2 px-8">
            <ArrowRight className="w-4 h-4" />
            Avanzar a Fase {project.current_phase + 1}: {PHASE_CONFIG[project.current_phase]?.name}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ── Dashboard Header ──
function DashboardHeader() {
  return (
    <div className="border-b-4 border-primary pb-4 mb-2">
      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
        <FlaskConical className="w-4 h-4" />
        RESEARCH DASHBOARD — 10 Fases · 14 Agentes
      </div>
      <h1 className="text-3xl font-bold text-foreground">
        Dashboard de Investigación Médica
      </h1>
      <p className="text-base mt-1 text-muted-foreground">
        Conectado a n8n + Claude · Sincronización bidireccional con Lovable Cloud
      </p>
    </div>
  );
}
