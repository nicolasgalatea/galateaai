import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FINERScore {
  feasible: number;
  interesting: number;
  novel: number;
  ethical: number;
  relevant: number;
}

const FINER_META: { key: keyof FINERScore; label: string; abbr: string; icon: string }[] = [
  { key: 'feasible',    label: 'Factible',     abbr: 'F', icon: '🔧' },
  { key: 'interesting', label: 'Interesante',  abbr: 'I', icon: '💡' },
  { key: 'novel',       label: 'Novedoso',     abbr: 'N', icon: '✨' },
  { key: 'ethical',     label: 'Ético',        abbr: 'E', icon: '⚖️' },
  { key: 'relevant',    label: 'Relevante',    abbr: 'R', icon: '🎯' },
];

function extractScores(merged: Record<string, unknown>): FINERScore {
  // Support flat scores (0-5 or 0-100) from various key shapes
  const get = (...keys: string[]): number => {
    for (const k of keys) {
      const v = merged[k];
      if (typeof v === 'number') return v;
      if (typeof v === 'string') { const n = parseFloat(v); if (!isNaN(n)) return n; }
    }
    return 0;
  };

  // Try nested finer_results first
  const nested = merged.finer_results as Record<string, unknown> | undefined;
  if (nested && typeof nested === 'object') {
    return {
      feasible:    get.call(null, 'feasible') || Number(nested.feasible    ?? nested.factible    ?? 0),
      interesting: Number(nested.interesting ?? nested.interesante ?? 0),
      novel:       Number(nested.novel       ?? nested.novedoso    ?? 0),
      ethical:     Number(nested.ethical     ?? nested.etico       ?? 0),
      relevant:    Number(nested.relevant    ?? nested.relevante   ?? 0),
    };
  }

  return {
    feasible:    get('feasible',    'finer_feasible',    'factible'),
    interesting: get('interesting', 'finer_interesting', 'interesante'),
    novel:       get('novel',       'finer_novel',       'novedoso'),
    ethical:     get('ethical',     'finer_ethical',     'etico'),
    relevant:    get('relevant',    'finer_relevant',    'relevante'),
  };
}

// Normalise to 0-100 range for radar (scores may come as 0-5 or 0-100)
function normalise(scores: FINERScore): FINERScore {
  const max = Math.max(...Object.values(scores));
  if (max <= 5) {
    return {
      feasible:    (scores.feasible    / 5) * 100,
      interesting: (scores.interesting / 5) * 100,
      novel:       (scores.novel       / 5) * 100,
      ethical:     (scores.ethical     / 5) * 100,
      relevant:    (scores.relevant    / 5) * 100,
    };
  }
  return scores;
}

const CustomRadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{payload[0]?.payload?.label}</p>
      <p className="text-primary">{payload[0]?.value?.toFixed(0)}%</p>
    </div>
  );
};

export default function PhaseFINER({
  data,
  userEdits,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
}) {
  const merged = useMemo(() => ({ ...data, ...userEdits }), [data, userEdits]);
  const rawScores = useMemo(() => extractScores(merged), [merged]);
  const normScores = useMemo(() => normalise(rawScores), [rawScores]);

  // Determine pass/fail
  const finerResults = merged.finer_results as Record<string, unknown> | undefined;
  const explicitPassed =
    finerResults?.passed !== undefined
      ? Boolean(finerResults.passed)
      : merged.passed !== undefined
      ? Boolean(merged.passed)
      : null;

  const total = Object.values(rawScores).reduce((a, b) => a + b, 0);
  const maxTotal = Math.max(...Object.values(rawScores)) <= 5 ? 25 : 500;
  const passed = explicitPassed !== null ? explicitPassed : total >= maxTotal * 0.8;
  const percentage = Math.round((total / maxTotal) * 100);

  const radarData = FINER_META.map(({ key, label }) => ({
    label,
    value: normScores[key],
    fullMark: 100,
  }));

  const justification = (
    finerResults?.justification ??
    merged.justification ??
    finerResults?.feedback ??
    merged.feedback
  ) as string | undefined;

  const recommendation = (merged.recommendation ?? finerResults?.recommendation) as string | undefined;
  const blockReason    = (finerResults?.block_reason ?? merged.block_reason) as string | undefined;

  return (
    <div className="space-y-5">

      {/* ── FINER Radar Chart ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-2"
      >
        <h4 className="text-sm font-semibold text-primary self-start">🕸️ Radar FINER</h4>
        <div className="w-full" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))', fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tickCount={4}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomRadarTooltip />} />
              <Radar
                name="FINER"
                dataKey="value"
                stroke={passed ? 'hsl(160, 50%, 40%)' : 'hsl(0, 60%, 50%)'}
                fill={passed ? 'hsl(160, 50%, 40%)' : 'hsl(0, 60%, 50%)'}
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Individual score bars ── */}
      <div className="space-y-2">
        {FINER_META.map(({ key, label, abbr, icon }, i) => {
          const norm = normScores[key];
          const raw  = rawScores[key];
          const color = norm >= 80 ? 'hsl(160, 50%, 40%)' : norm >= 60 ? 'hsl(35, 70%, 50%)' : 'hsl(0, 60%, 50%)';
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3"
            >
              <span className="text-base w-6 text-center shrink-0">{icon}</span>
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {abbr}
              </span>
              <span className="text-sm font-medium w-24 shrink-0 text-foreground">{label}</span>
              <div className="flex-1">
                <Progress value={norm} className="h-2" />
              </div>
              <span className="text-xs font-mono w-10 text-right shrink-0" style={{ color }}>
                {raw <= 5 ? `${raw}/5` : `${norm.toFixed(0)}%`}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Overall score badge ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`flex items-center justify-between p-3 rounded-lg border-2 ${
          passed
            ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20'
            : 'border-destructive/40 bg-destructive/5'
        }`}
      >
        <div className="flex items-center gap-2">
          {passed
            ? <ShieldCheck className="w-5 h-5 text-emerald-600" />
            : <XCircle className="w-5 h-5 text-destructive" />
          }
          <span className="text-sm font-semibold text-foreground">
            {passed ? 'PROYECTO VIABLE' : 'REVISIÓN NECESARIA'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{percentage}%</span>
          <Badge
            className="text-xs"
            style={{
              backgroundColor: passed ? 'hsl(160, 50%, 40%)' : 'hsl(0, 60%, 50%)',
              color: 'white',
              border: 'none',
            }}
          >
            {rawScores && Object.values(rawScores).some(v => v > 5)
              ? `${total.toFixed(0)}/500`
              : `${total}/${maxTotal}`
            }
          </Badge>
        </div>
      </motion.div>

      {/* ── BLOCKER BANNER (if not passed) ── */}
      {!passed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-bold">⛔ Avance bloqueado por Test FINER</AlertTitle>
            <AlertDescription className="text-sm space-y-1.5 mt-1">
              <p>
                El Agente FINER ha detectado que el proyecto <strong>no cumple los criterios mínimos</strong> de viabilidad.
                Debes refinar la pregunta de investigación antes de continuar.
              </p>
              {blockReason && (
                <p className="font-mono text-xs bg-destructive/10 rounded px-2 py-1">
                  🔎 {blockReason}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* ── Justificación ── */}
      {justification && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
            Justificación del Agente
          </label>
          <p className="text-sm text-foreground leading-relaxed">{justification}</p>
        </div>
      )}

      {/* ── Recomendación ── */}
      {recommendation && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-xs font-bold uppercase tracking-wider text-primary block mb-1">
            Recomendación
          </label>
          <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
        </div>
      )}
    </div>
  );
}

// Export helper so ResearchDashboard can check if phase 4 blocks approval
export function isFinerPassed(data: Record<string, unknown> | null): boolean | null {
  if (!data) return null;
  const merged = data;
  const finerResults = merged.finer_results as Record<string, unknown> | undefined;
  if (finerResults?.passed !== undefined) return Boolean(finerResults.passed);
  if (merged.passed !== undefined) return Boolean(merged.passed);
  const scores = {
    feasible:    Number((finerResults ?? merged).feasible    ?? (merged as any).factible    ?? 0),
    interesting: Number((finerResults ?? merged).interesting ?? (merged as any).interesante ?? 0),
    novel:       Number((finerResults ?? merged).novel       ?? (merged as any).novedoso    ?? 0),
    ethical:     Number((finerResults ?? merged).ethical     ?? (merged as any).etico       ?? 0),
    relevant:    Number((finerResults ?? merged).relevant    ?? (merged as any).relevante   ?? 0),
  };
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const max = Math.max(...Object.values(scores));
  if (max === 0) return null; // no data yet
  const threshold = max <= 5 ? 20 : 400;
  return total >= threshold;
}
