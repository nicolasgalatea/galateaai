/**
 * PhaseVariableMapping — Fase 5
 * Renderiza el mapeo de variables del estudio (independiente, dependiente, confusoras)
 * con Supabase Realtime interno: highlight verde sin flicker (Framer Motion),
 * y Software Recommendation Badge cuando statistical_plan está presente.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Variable, CheckCircle2, Clock, AlertCircle,
  RefreshCw, BarChart2, FlaskConical, PieChart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

// ── Constants ─────────────────────────────────────────────────
const FIXED_PROJECT_ID = 'e8233417-9ddf-4453-8372-c5b6797da8aa';

// ── Types ──────────────────────────────────────────────────────
type VarType = 'independent' | 'dependent' | 'confounding' | 'covariable' | string;
type VarStatus = 'pending' | 'mapped' | 'validated';
type MeasureScale = 'nominal' | 'ordinal' | 'interval' | 'ratio' | 'continuous' | 'binary' | string;
type SoftwareTool = 'spss' | 'r' | 'stata' | 'python' | 'sas' | string;

interface StudyVariable {
  name: string;
  type: VarType;
  scale?: MeasureScale;
  unit?: string;
  instrument?: string;
  status?: VarStatus;
  notes?: string;
}

interface StatisticalPlan {
  software?: SoftwareTool;
  software_version?: string;
  tests?: string[];
  significance_level?: number;
  power?: number;
  sample_size?: number;
  notes?: string;
}

// ── Software meta ──────────────────────────────────────────────
const SOFTWARE_META: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  spss: {
    label: 'SPSS',
    color: 'hsl(207, 65%, 42%)',
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    description: 'IBM SPSS Statistics — Análisis estadístico clásico',
  },
  r: {
    label: 'R',
    color: 'hsl(207, 80%, 35%)',
    icon: <FlaskConical className="w-3.5 h-3.5" />,
    description: 'R Project — Meta-análisis, forestplots y reproducibilidad',
  },
  stata: {
    label: 'Stata',
    color: 'hsl(160, 55%, 38%)',
    icon: <PieChart className="w-3.5 h-3.5" />,
    description: 'Stata — Epidemiología, regresión y datos longitudinales',
  },
  python: {
    label: 'Python',
    color: 'hsl(45, 80%, 38%)',
    icon: <FlaskConical className="w-3.5 h-3.5" />,
    description: 'Python (scipy/pingouin) — ML y análisis avanzado',
  },
  sas: {
    label: 'SAS',
    color: 'hsl(280, 50%, 42%)',
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    description: 'SAS — Análisis clínicos regulatorios (FDA/EMA)',
  },
};

// ── Variable type meta ─────────────────────────────────────────
const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  independent: { label: 'Independiente', color: 'hsl(207, 60%, 40%)', icon: '→' },
  dependent:   { label: 'Dependiente',   color: 'hsl(160, 50%, 38%)', icon: '◎' },
  confounding: { label: 'Confusora',     color: 'hsl(35,  70%, 46%)', icon: '⚡' },
  covariable:  { label: 'Covariable',    color: 'hsl(280, 50%, 45%)', icon: '≈' },
};

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:   { label: 'Pendiente', icon: <Clock className="w-3 h-3" />,        cls: 'bg-muted text-muted-foreground' },
  mapped:    { label: 'Mapeada',   icon: <RefreshCw className="w-3 h-3" />,    cls: 'bg-primary/10 text-primary border-primary/30' },
  validated: { label: 'Validada',  icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' },
};

// ── Data extraction ────────────────────────────────────────────
function extractVariables(merged: Record<string, unknown>): StudyVariable[] {
  const candidates = [
    merged.variables,
    merged.study_variables,
    merged.variable_mapping,
    merged.variables_list,
    (merged as any).variablesDelEstudio,
    (merged as any).mapeo_variables,
  ];

  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) {
      return c.map((v: any) => ({
        name:       v.name       || v.nombre    || v.variable || 'Sin nombre',
        type:       v.type       || v.tipo      || 'independent',
        scale:      v.scale      || v.escala    || v.measurement_scale || undefined,
        unit:       v.unit       || v.unidad    || undefined,
        instrument: v.instrument || v.instrumento || undefined,
        status:     v.status     || v.estado    || 'pending',
        notes:      v.notes      || v.notas     || undefined,
      }));
    }
  }

  // Fallback: build synthetic rows from flat fields
  const synthetic: StudyVariable[] = [];
  if (merged.independent_variable || (merged as any).variable_independiente) {
    synthetic.push({
      name:   String(merged.independent_variable ?? (merged as any).variable_independiente),
      type:   'independent',
      status: 'mapped',
    });
  }
  if (merged.dependent_variable || (merged as any).variable_dependiente) {
    synthetic.push({
      name:   String(merged.dependent_variable ?? (merged as any).variable_dependiente),
      type:   'dependent',
      status: 'mapped',
    });
  }
  const confounders = merged.confounders || merged.confounding_variables || (merged as any).variables_confusoras;
  if (Array.isArray(confounders)) {
    confounders.forEach(c =>
      synthetic.push({ name: typeof c === 'string' ? c : c.name || JSON.stringify(c), type: 'confounding', status: 'pending' })
    );
  }
  return synthetic;
}

function extractStatisticalPlan(merged: Record<string, unknown>): StatisticalPlan | null {
  const plan =
    merged.statistical_plan ||
    merged.plan_estadistico ||
    (merged as any).statistics ||
    (merged as any).analysis_plan;

  if (!plan || typeof plan !== 'object') return null;
  return plan as StatisticalPlan;
}

function safeParse(val: unknown): unknown {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
}

// ── Software Recommendation Badge ─────────────────────────────
function SoftwareBadge({ plan }: { plan: StatisticalPlan }) {
  const key = (plan.software || '').toLowerCase();
  const meta = SOFTWARE_META[key] ?? {
    label:       plan.software || 'N/A',
    color:       'hsl(210, 10%, 45%)',
    icon:        <BarChart2 className="w-3.5 h-3.5" />,
    description: 'Software estadístico recomendado por el Agente',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-xl border bg-card p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Software Recomendado
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Main badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: meta.color }}
        >
          {meta.icon}
          {meta.label}
          {plan.software_version && (
            <span className="ml-1 text-xs font-normal opacity-80">v{plan.software_version}</span>
          )}
        </span>
        <p className="text-xs text-muted-foreground">{meta.description}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {plan.significance_level && (
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <div className="text-base font-bold text-foreground">α = {plan.significance_level}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Nivel de significancia</div>
          </div>
        )}
        {plan.power && (
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <div className="text-base font-bold text-foreground">{plan.power}%</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Potencia estadística</div>
          </div>
        )}
        {plan.sample_size && (
          <div className="p-2 rounded-lg bg-muted/50 border text-center">
            <div className="text-base font-bold text-foreground">n = {plan.sample_size}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Tamaño de muestra</div>
          </div>
        )}
      </div>

      {/* Tests list */}
      {Array.isArray(plan.tests) && plan.tests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {plan.tests.map((test: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-[11px]">
              {test}
            </Badge>
          ))}
        </div>
      )}

      {plan.notes && (
        <p className="text-xs text-muted-foreground italic border-t pt-2">{plan.notes}</p>
      )}
    </motion.div>
  );
}

// ── Variable row ───────────────────────────────────────────────
function VariableRow({
  variable,
  index,
  isNew,
}: {
  variable: StudyVariable;
  index: number;
  isNew: boolean;
}) {
  const typeMeta = TYPE_META[variable.type] ?? { label: variable.type, color: 'hsl(210,10%,45%)', icon: '·' };
  const statusMeta = STATUS_META[variable.status ?? 'pending'];

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, x: isNew ? 14 : 0 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: isNew ? 'hsl(160 50% 95% / 1)' : 'hsl(0 0% 0% / 0)',
      }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      className="border-t border-border hover:bg-muted/30 transition-colors"
    >
      <td className="px-3 py-2.5 text-sm font-medium text-foreground">{variable.name}</td>
      <td className="px-3 py-2.5">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: typeMeta.color }}
        >
          {typeMeta.icon} {typeMeta.label}
        </span>
      </td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">{variable.scale ?? '—'}</td>
      <td className="px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell">
        {variable.unit || variable.instrument || '—'}
      </td>
      <td className="px-3 py-2.5">
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusMeta.cls}`}>
          {statusMeta.icon} {statusMeta.label}
        </span>
      </td>
    </motion.tr>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function PhaseVariableMapping({
  data: externalData,
  userEdits,
  isLiveUpdating: externalLive,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  isLiveUpdating?: boolean;
}) {
  // Internal Realtime state — merges with prop data (no-flicker)
  const [liveData, setLiveData] = useState<Record<string, unknown> | null>(null);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Track which variable indexes are "new" for the green highlight
  const [displayedVars, setDisplayedVars] = useState<StudyVariable[]>([]);
  const [newIndexes, setNewIndexes] = useState<Set<number>>(new Set());
  const prevLengthRef = useRef(0);

  // ── Subscribe to research_projects Realtime ──
  const subscribeRealtime = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);

    channelRef.current = supabase
      .channel('phase5_variable_mapping')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_projects',
          filter: `project_id=eq.${FIXED_PROJECT_ID}`,
        },
        (payload) => {
          const record = payload.new as any;
          if (!record) return;

          // Extract phase 5 data from phase_data
          let phaseData = record.phase_data;
          if (typeof phaseData === 'string') {
            try { phaseData = JSON.parse(phaseData); } catch { return; }
          }

          const fase5Raw = phaseData?.fase_5 ?? phaseData?.fase_4_5 ?? phaseData?.variables ?? null;
          if (!fase5Raw) return;

          const fase5 = typeof fase5Raw === 'string'
            ? (() => { try { return JSON.parse(fase5Raw); } catch { return null; } })()
            : fase5Raw;

          if (fase5 && typeof fase5 === 'object') {
            setLiveData(fase5 as Record<string, unknown>);
            setIsLive(true);
            // Auto-clear live pulse after 4 s of no new events
            setTimeout(() => setIsLive(false), 4000);
          }
        }
      )
      .subscribe();
  }, []);

  useEffect(() => {
    subscribeRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [subscribeRealtime]);

  // ── Merge sources: Realtime > prop data ──
  const merged: Record<string, unknown> = {
    ...externalData,
    ...userEdits,
    ...(liveData ?? {}),
  };

  const variables = extractVariables(merged);
  const statPlan  = extractStatisticalPlan(merged);
  const isLiveUpdating = externalLive || isLive;

  // ── Animate new variables in (green highlight, no flicker) ──
  useEffect(() => {
    if (variables.length === 0) return;
    const prev = prevLengthRef.current;
    const newOnes = new Set<number>();
    for (let i = prev; i < variables.length; i++) newOnes.add(i);

    // Batch: update displayed list and new indexes atomically
    setDisplayedVars([...variables]);
    if (newOnes.size > 0) {
      setNewIndexes(newOnes);
      const t = setTimeout(() => setNewIndexes(new Set()), 1400);
      prevLengthRef.current = variables.length;
      return () => clearTimeout(t);
    }
    prevLengthRef.current = variables.length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables.length, liveData, externalData]);

  // ── Stats ──
  const typeCount = (t: VarType) => variables.filter(v => v.type === t).length;
  const validatedCount = variables.filter(v => v.status === 'validated').length;

  // ── Empty states ──
  if (variables.length === 0 && isLiveUpdating) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          Agente mapeando variables del estudio…
        </div>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (variables.length === 0 && !isLiveUpdating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground italic p-4">
        <AlertCircle className="w-4 h-4 shrink-0" />
        El Agente aún no ha enviado el mapeo de variables. Esperando respuesta…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header + live indicator ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-primary flex items-center gap-1.5">
          <Variable className="w-4 h-4" />
          Mapeo de Variables del Estudio
          <Badge variant="secondary" className="text-xs">{variables.length} variables</Badge>
        </h4>

        <AnimatePresence>
          {isLiveUpdating && (
            <motion.span
              key="live"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 text-xs text-primary font-medium"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Actualización en tiempo real
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Independientes', value: typeCount('independent'), color: TYPE_META.independent.color },
          { label: 'Dependientes',   value: typeCount('dependent'),   color: TYPE_META.dependent.color },
          { label: 'Confusoras',     value: typeCount('confounding'), color: TYPE_META.confounding.color },
          { label: 'Validadas',      value: validatedCount,           color: 'hsl(160, 50%, 38%)' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            layout
            className="p-3 rounded-lg border bg-card text-center"
          >
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Variables table ── */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60">
              {['Variable', 'Tipo', 'Escala', 'Unidad/Instrumento', 'Estado'].map((h, i) => (
                <th
                  key={h}
                  className={`px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide${i === 3 ? ' hidden md:table-cell' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {displayedVars.map((v, i) => (
                <VariableRow
                  key={`${v.name}-${i}`}
                  variable={v}
                  index={i}
                  isNew={newIndexes.has(i)}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Software Recommendation Badge (auto-render) ── */}
      <AnimatePresence>
        {statPlan && <SoftwareBadge key="software-badge" plan={statPlan} />}
      </AnimatePresence>

      {/* ── Agent notes ── */}
      {merged.variable_notes && typeof merged.variable_notes === 'string' && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
            Notas del Agente de Variables
          </label>
          <p className="text-sm text-foreground leading-relaxed">{merged.variable_notes}</p>
        </div>
      )}
    </div>
  );
}
