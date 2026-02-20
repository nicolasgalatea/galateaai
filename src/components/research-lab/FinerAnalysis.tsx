import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, FlaskConical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface FinerAnalysisProps {
  data: Record<string, unknown> | null;
  isProcessing: boolean;
}

const FINER_CRITERIA = [
  { key: 'feasible', label: 'Feasible', abbr: 'F' },
  { key: 'interesting', label: 'Interesting', abbr: 'I' },
  { key: 'novel', label: 'Novel', abbr: 'N' },
  { key: 'ethical', label: 'Ethical', abbr: 'E' },
  { key: 'relevant', label: 'Relevant', abbr: 'R' },
];

function extractScores(data: Record<string, unknown>): Record<string, number> {
  const scores = (data.finer_scores ?? data.scores ?? data) as Record<string, unknown>;
  const result: Record<string, number> = {};
  for (const c of FINER_CRITERIA) {
    const val = scores[c.key] ?? scores[c.abbr] ?? scores[c.label];
    result[c.key] = typeof val === 'number' ? val : (typeof val === 'string' ? parseFloat(val) || 0 : 0);
  }
  return result;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'hsl(160, 50%, 40%)';
  if (score >= 60) return 'hsl(35, 70%, 50%)';
  return 'hsl(0, 60%, 50%)';
}

export function FinerAnalysis({ data, isProcessing }: FinerAnalysisProps) {
  if (isProcessing && !data) {
    return (
      <Card className="border border-border bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <FlaskConical className="w-5 h-5" />
            Fase 4-5 — Análisis FINER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(207, 60%, 45%)' }} />
            Evaluando viabilidad con IA...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const scores = extractScores(data);
  const aprobado = Boolean(data.aprobado ?? data.approved ?? data.viable);

  const h0 = (data.h0 ?? data.hipotesis_nula ?? data.null_hypothesis ?? null) as string | null;
  const h1 = (data.h1 ?? data.hipotesis_alternativa ?? data.alternative_hypothesis ?? null) as string | null;
  const critica = (data.critica_constructiva ?? data.constructive_criticism ?? data.feedback ?? null) as string | null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-white border border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: 'hsl(207, 60%, 35%)' }}>
            <FlaskConical className="w-5 h-5" />
            Fase 4-5 — Análisis FINER
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* FINER Score Bars */}
          <div className="space-y-3">
            {FINER_CRITERIA.map((c, i) => {
              const score = scores[c.key];
              return (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: scoreColor(score) }}
                  >
                    {c.abbr}
                  </span>
                  <span className="text-sm font-medium w-24 shrink-0">{c.label}</span>
                  <div className="flex-1">
                    <Progress value={score} className="h-2.5" />
                  </div>
                  <span className="text-sm font-mono w-10 text-right" style={{ color: scoreColor(score) }}>
                    {score}%
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Verdict */}
          {aprobado ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <Badge className="text-lg px-6 py-2 gap-2 border-0" style={{ backgroundColor: 'hsl(160, 50%, 40%)', color: 'white' }}>
                  <ShieldCheck className="w-5 h-5" />
                  PROYECTO VIABLE
                </Badge>
              </div>

              {(h0 || h1) && (
                <div
                  className="p-4 rounded-md border space-y-2"
                  style={{ backgroundColor: 'hsl(207, 60%, 97%)', borderColor: 'hsl(207, 50%, 85%)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(207, 60%, 40%)' }}>
                    Hipótesis del Estudio
                  </p>
                  {h0 && (
                    <p className="text-sm font-mono leading-relaxed" style={{ color: 'hsl(207, 60%, 25%)' }}>
                      H₀: {h0}
                    </p>
                  )}
                  {h1 && (
                    <p className="text-sm font-mono leading-relaxed" style={{ color: 'hsl(160, 50%, 30%)' }}>
                      H₁: {h1}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div
                className="flex items-center gap-3 p-4 rounded-md border"
                style={{ backgroundColor: 'hsl(0, 60%, 97%)', borderColor: 'hsl(0, 50%, 80%)' }}
              >
                <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: 'hsl(0, 60%, 50%)' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'hsl(0, 60%, 40%)' }}>
                    REVISIÓN NECESARIA
                  </p>
                  {critica && (
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: 'hsl(0, 40%, 30%)' }}>
                      {critica}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
