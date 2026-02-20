import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, X, Table2 } from 'lucide-react';

interface PicoEntry {
  key: string;
  label: string;
  fullLabel: string;
  color: string;
  value: string;
}

interface PicotInteractiveTableProps {
  picoData: Record<string, unknown> | null;
  onEdit?: (key: string, value: string) => void;
  readOnly?: boolean;
}

const PICOT_CONFIG: { key: string; label: string; fullLabel: string; color: string }[] = [
  { key: 'P', label: 'P', fullLabel: 'Poblacion', color: '#00BCFF' },
  { key: 'I', label: 'I', fullLabel: 'Intervencion', color: '#00D395' },
  { key: 'C', label: 'C', fullLabel: 'Comparador', color: '#F7B500' },
  { key: 'O', label: 'O', fullLabel: 'Outcome (Desenlace)', color: '#A78BFA' },
  { key: 'T', label: 'T', fullLabel: 'Tiempo', color: '#FF6B9D' },
];

function resolvePicoValue(data: Record<string, unknown> | null, key: string): string {
  if (!data) return '';
  // Try nested pico_data first, then top-level, then lowercase aliases
  const nested = data.pico_data as Record<string, unknown> | undefined;
  const keyLower = key.toLowerCase();
  const aliases: Record<string, string[]> = {
    P: ['P', 'population', 'poblacion'],
    I: ['I', 'intervention', 'intervencion'],
    C: ['C', 'comparison', 'comparador', 'control'],
    O: ['O', 'outcome', 'desenlace'],
    T: ['T', 'timeframe', 'tiempo', 'time'],
  };

  const tryKeys = aliases[key] ?? [key, keyLower];
  for (const k of tryKeys) {
    if (nested && typeof nested[k] === 'string' && nested[k]) return nested[k] as string;
    if (typeof data[k] === 'string' && data[k]) return data[k] as string;
  }
  return '';
}

export function PicotInteractiveTable({ picoData, onEdit, readOnly = false }: PicotInteractiveTableProps) {
  const entries: PicoEntry[] = PICOT_CONFIG.map((cfg) => ({
    ...cfg,
    value: resolvePicoValue(picoData, cfg.key),
  }));

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filledCount = entries.filter((e) => e.value.length > 0).length;

  const startEdit = (entry: PicoEntry) => {
    if (readOnly) return;
    setEditingKey(entry.key);
    setEditValue(entry.value);
  };

  const confirmEdit = () => {
    if (editingKey && onEdit) {
      onEdit(editingKey, editValue);
    }
    setEditingKey(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const isEmpty = entries.every((e) => e.value.length === 0);

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            PICOT
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-[#484F58]">
          <Table2 className="w-8 h-8 mb-3" />
          <p className="text-sm text-center">
            Los datos PICOT apareceran aqui cuando el Arquitecto los genere
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Pregunta PICOT
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22]">
          <span className="text-[10px] text-[#8B949E]">COMPLETO:</span>
          <span className="text-sm font-bold font-mono text-[#E6EDF3]">{filledCount}/5</span>
        </div>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-lg border border-[#21262D] bg-[#161B22] overflow-hidden"
          >
            <div className="flex items-stretch">
              {/* Letter badge */}
              <div
                className="flex items-center justify-center w-12 shrink-0 border-r border-[#21262D]"
                style={{ backgroundColor: `${entry.color}15` }}
              >
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: entry.color }}
                >
                  {entry.label}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 px-3 py-2.5">
                <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: entry.color }}>
                  {entry.fullLabel}
                </div>

                {editingKey === entry.key ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 px-2 py-1 rounded bg-[#0D1117] border border-[#21262D] text-xs text-[#E6EDF3] outline-none focus:border-[#00BCFF]/50"
                    />
                    <button
                      type="button"
                      onClick={confirmEdit}
                      className="p-1 rounded text-[#00D395] hover:bg-[#00D395]/10 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-1 rounded text-[#484F58] hover:bg-[#21262D] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs leading-relaxed ${
                      entry.value ? 'text-[#E6EDF3]' : 'text-[#484F58] italic'
                    }`}>
                      {entry.value || 'No definido'}
                    </p>
                    {!readOnly && onEdit && (
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="p-1 rounded text-[#484F58] hover:text-[#8B949E] hover:bg-[#21262D] transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex items-center px-3 border-l border-[#21262D]">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: entry.value ? '#00D395' : '#484F58',
                    boxShadow: entry.value ? '0 0 6px rgba(0,211,149,0.5)' : 'none',
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Structured question preview */}
      {picoData && typeof (picoData as Record<string, unknown>).pregunta_estructurada === 'string' && (
        <div className="mt-4 rounded-lg border border-[#21262D] bg-[#161B22] p-3">
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase block mb-1.5">
            Pregunta Estructurada
          </span>
          <p className="text-xs text-[#E6EDF3] leading-relaxed italic">
            {(picoData as Record<string, unknown>).pregunta_estructurada as string}
          </p>
        </div>
      )}
    </div>
  );
}
