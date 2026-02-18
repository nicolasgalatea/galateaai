/**
 * PhaseVariableMapping — Fase 5
 * Renderiza el mapeo de variables del estudio (independiente, dependiente, confusoras)
 * con actualización en Realtime cuando el Agente 2 envía los datos.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Variable, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ──────────────────────────────────────────────────────
type VarType = 'independent' | 'dependent' | 'confounding' | 'covariable' | string;
type VarStatus = 'pending' | 'mapped' | 'validated';
type MeasureScale = 'nominal' | 'ordinal' | 'interval' | 'ratio' | 'continuous' | 'binary' | string;

interface StudyVariable {
  name: string;
  type: VarType;
  scale?: MeasureScale;
  unit?: string;
  instrument?: string;
  status?: VarStatus;
  notes?: string;
}

// ── Helpers ────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; color: string; icon: string }> = {
  independent: { label: 'Independiente', color: 'hsl(207, 60%, 40%)', icon: '→' },
  dependent:   { label: 'Dependiente',  color: 'hsl(160, 50%, 38%)', icon: '◎' },
  confounding: { label: 'Confusora',    color: 'hsl(35,  70%, 46%)', icon: '⚡' },
  covariable:  { label: 'Covariable',   color: 'hsl(280, 50%, 45%)', icon: '≈' },
};

const STATUS_META: Record<VarStatus | string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending:   { label: 'Pendiente',  icon: <Clock className="w-3 h-3" />,         cls: 'bg-muted text-muted-foreground' },
  mapped:    { label: 'Mapeada',    icon: <RefreshCw className="w-3 h-3" />,     cls: 'bg-primary/10 text-primary border-primary/30' },
  validated: { label: 'Validada',   icon: <CheckCircle2 className="w-3 h-3" />,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400' },
};

function extractVariables(merged: Record<string, unknown>): StudyVariable[] {
  // Try various key shapes from different agent outputs
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

  // Flat fields as fallback: build synthetic rows from IV / DV / CV
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

// ── Row component ──────────────────────────────────────────────
function VariableRow({ variable, index, isNew }: { variable: StudyVariable; index: number; isNew?: boolean }) {
  const typeMeta = TYPE_META[variable.type] ?? { label: variable.type, color: 'hsl(210,10%,45%)', icon: '·' };
  const statusMeta = STATUS_META[variable.status ?? 'pending'];

  return (
    <motion.tr
      initial={{ opacity: 0, x: isNew ? 12 : 0, backgroundColor: isNew ? 'hsl(160, 50%, 95%)' : 'transparent' }}
      animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="border-t border-border hover:bg-muted/30 transition-colors"
    >
      {/* Variable name */}
      <td className="px-3 py-2.5 text-sm font-medium text-foreground">{variable.name}</td>

      {/* Type badge */}
      <td className="px-3 py-2.5">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: typeMeta.color }}
        >
          <span>{typeMeta.icon}</span>
          {typeMeta.label}
        </span>
      </td>

      {/* Scale */}
      <td className="px-3 py-2.5 text-xs text-muted-foreground capitalize">
        {variable.scale ?? '—'}
      </td>

      {/* Unit / Instrument */}
      <td className="px-3 py-2.5 text-xs text-muted-foreground hidden md:table-cell">
        {variable.unit || variable.instrument || '—'}
      </td>

      {/* Status */}
      <td className="px-3 py-2.5">
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusMeta.cls}`}>
          {statusMeta.icon}
          {statusMeta.label}
        </span>
      </td>
    </motion.tr>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function PhaseVariableMapping({
  data,
  userEdits,
  isLiveUpdating,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  isLiveUpdating?: boolean;
}) {
  const merged = { ...data, ...userEdits };
  const variables = extractVariables(merged);

  const [displayedVars, setDisplayedVars] = useState<StudyVariable[]>([]);
  const [newIndexes, setNewIndexes] = useState<Set<number>>(new Set());
  const prevLengthRef = useRef(0);

  // Animate in new variables as they arrive via Realtime
  useEffect(() => {
    if (variables.length === 0) return;
    const prev = prevLengthRef.current;
    const newOnes = new Set<number>();
    for (let i = prev; i < variables.length; i++) newOnes.add(i);
    setNewIndexes(newOnes);
    setDisplayedVars(variables);
    prevLengthRef.current = variables.length;
    // Clear "new" highlight after animation
    const t = setTimeout(() => setNewIndexes(new Set()), 1200);
    return () => clearTimeout(t);
  }, [variables.length, data, userEdits]);

  // Group stats
  const typeCount = (t: VarType) => variables.filter(v => v.type === t).length;
  const validatedCount = variables.filter(v => v.status === 'validated').length;

  if (variables.length === 0 && !isLiveUpdating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground italic p-4">
        <AlertCircle className="w-4 h-4 shrink-0" />
        El Agente 2 aún no ha enviado el mapeo de variables. Esperando respuesta...
      </div>
    );
  }

  if (variables.length === 0 && isLiveUpdating) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-primary font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          Agente 2 mapeando variables del estudio...
        </div>
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
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
        {isLiveUpdating && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 text-xs text-primary font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Actualización en tiempo real
          </motion.span>
        )}
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Independientes', value: typeCount('independent'), color: TYPE_META.independent.color },
          { label: 'Dependientes',   value: typeCount('dependent'),   color: TYPE_META.dependent.color },
          { label: 'Confusoras',     value: typeCount('confounding'), color: TYPE_META.confounding.color },
          { label: 'Validadas',      value: validatedCount,           color: 'hsl(160, 50%, 38%)' },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-lg border bg-card text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Variables table ── */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Variable</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Escala</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Unidad/Instrumento</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {displayedVars.map((v, i) => (
                <VariableRow key={`${v.name}-${i}`} variable={v} index={i} isNew={newIndexes.has(i)} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Notes field (from agent) ── */}
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
