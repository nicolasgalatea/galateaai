import { cn } from '@/lib/utils';
import { Layout } from 'lucide-react';
import type { MethodologyData } from '@/navigator';

interface MethodologyDisplayProps {
  data: MethodologyData;
  className?: string;
}

const PICO_LABELS: { key: 'P' | 'I' | 'C' | 'O' | 'T'; label: string; color: string }[] = [
  { key: 'P', label: 'Population', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { key: 'I', label: 'Intervention', color: 'bg-green-50 border-green-200 text-green-800' },
  { key: 'C', label: 'Comparison', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { key: 'O', label: 'Outcome', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { key: 'T', label: 'Timeframe', color: 'bg-rose-50 border-rose-200 text-rose-800' },
];

export function MethodologyDisplay({ data, className }: MethodologyDisplayProps) {
  const { pico_data, pregunta_final, tipo_estudio, modelo_pregunta } = data;

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-5 space-y-4', className)}>
      <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm uppercase tracking-wide">
        <Layout className="h-4 w-4" />
        Arquitecto Metodologico — Fase 2-3
      </div>

      {pregunta_final && (
        <div className="rounded-md bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Pregunta Estructurada</p>
          <p className="text-sm text-gray-900 leading-relaxed">{pregunta_final}</p>
        </div>
      )}

      {pico_data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {PICO_LABELS.map(({ key, label, color }) => {
            const value = pico_data[key];
            if (!value) return null;
            return (
              <div key={key} className={cn('rounded-md border p-3', color)}>
                <p className="text-xs font-bold mb-0.5">{key} — {label}</p>
                <p className="text-sm leading-snug">{value}</p>
              </div>
            );
          })}
        </div>
      )}

      {(tipo_estudio || modelo_pregunta) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {tipo_estudio && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-indigo-700 font-medium">
              {tipo_estudio}
            </span>
          )}
          {modelo_pregunta && (
            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-slate-700 font-medium">
              Modelo: {modelo_pregunta}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
