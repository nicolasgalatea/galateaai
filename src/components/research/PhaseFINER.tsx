import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface FINERScore {
  feasible: number;
  interesting: number;
  novel: number;
  ethical: number;
  relevant: number;
}

const FINER_LABELS: { key: keyof FINERScore; label: string; icon: string }[] = [
  { key: 'feasible', label: 'Factible', icon: '🔧' },
  { key: 'interesting', label: 'Interesante', icon: '💡' },
  { key: 'novel', label: 'Novedoso', icon: '✨' },
  { key: 'ethical', label: 'Ético', icon: '⚖️' },
  { key: 'relevant', label: 'Relevante', icon: '🎯' },
];

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < value
              ? 'fill-primary text-primary'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export default function PhaseFINER({
  data,
  userEdits,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
}) {
  const merged = { ...data, ...userEdits };

  // Extract FINER scores from various possible JSON shapes
  const scores: FINERScore = {
    feasible: Number(merged.feasible || merged.finer_feasible || merged.factible || 0),
    interesting: Number(merged.interesting || merged.finer_interesting || merged.interesante || 0),
    novel: Number(merged.novel || merged.finer_novel || merged.novedoso || 0),
    ethical: Number(merged.ethical || merged.finer_ethical || merged.etico || 0),
    relevant: Number(merged.relevant || merged.finer_relevant || merged.relevante || 0),
  };

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxTotal = 25;
  const percentage = Math.round((total / maxTotal) * 100);
  const isViable = total >= 20;

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className={`p-4 rounded-lg border-2 text-center ${
        isViable
          ? 'border-emerald-500/50 bg-emerald-50/50'
          : 'border-amber-500/50 bg-amber-50/50'
      }`}>
        <div className="text-3xl font-bold text-foreground">{total}/{maxTotal}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {isViable ? '✅ PROYECTO VIABLE' : '⚠️ REVISIÓN NECESARIA'}
        </div>
        <Progress value={percentage} className="h-2 mt-3" />
      </div>

      {/* Individual scores */}
      <div className="space-y-3">
        {FINER_LABELS.map(({ key, label, icon }) => {
          const val = scores[key];
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">{icon}</span>
              <span className="text-sm font-medium w-24">{label}</span>
              <div className="flex-1">
                <Progress value={(val / 5) * 100} className="h-2" />
              </div>
              <StarRating value={val} />
              <span className="text-xs text-muted-foreground w-8 text-right">{val}/5</span>
            </div>
          );
        })}
      </div>

      {/* Justification from AI */}
      {merged.justification && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-sm font-semibold text-primary block mb-1">Justificación de la IA</label>
          <p className="text-sm text-foreground leading-relaxed">{merged.justification as string}</p>
        </div>
      )}

      {merged.recommendation && (
        <div className="p-3 rounded-lg bg-muted/50 border">
          <label className="text-sm font-semibold text-primary block mb-1">Recomendación</label>
          <p className="text-sm text-foreground leading-relaxed">{merged.recommendation as string}</p>
        </div>
      )}
    </div>
  );
}
