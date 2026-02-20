import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code2, Database, Tag } from 'lucide-react';

interface BooleanEquationBlockProps {
  searchStrategy: Record<string, unknown> | null;
}

function extractString(data: Record<string, unknown> | null, key: string): string {
  if (!data) return '';
  const val = data[key];
  return typeof val === 'string' ? val : '';
}

function extractStringArray(data: Record<string, unknown> | null, key: string): string[] {
  if (!data) return [];
  const val = data[key];
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
  return [];
}

export function BooleanEquationBlock({ searchStrategy }: BooleanEquationBlockProps) {
  const [copied, setCopied] = useState(false);

  const ecuacion = extractString(searchStrategy, 'ecuacion_booleana');
  const descriptores = extractStringArray(searchStrategy, 'descriptores');
  const basesDatos = extractStringArray(searchStrategy, 'bases_datos');
  const meshTerms = extractStringArray(searchStrategy, 'mesh_terms');

  const isEmpty = !ecuacion && descriptores.length === 0 && basesDatos.length === 0;

  const handleCopy = async () => {
    if (!ecuacion) return;
    try {
      await navigator.clipboard.writeText(ecuacion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement('textarea');
      textarea.value = ecuacion;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#00D395] shadow-[0_0_8px_rgba(0,211,149,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Estrategia de Busqueda
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-[#484F58]">
          <Code2 className="w-8 h-8 mb-3" />
          <p className="text-sm text-center">
            La ecuacion booleana aparecera aqui cuando el agente de Evidencia la genere
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D395] shadow-[0_0_8px_rgba(0,211,149,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Estrategia de Busqueda
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22]">
          <span className="text-[10px] text-[#8B949E]">FASE:</span>
          <span className="text-sm font-bold font-mono text-[#00D395]">7</span>
        </div>
      </div>

      {/* Boolean Equation — main code block */}
      {ecuacion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-[#21262D] bg-[#161B22] overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#21262D] bg-[#0D1117]">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#00D395]" />
              <span className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider">
                Ecuacion Booleana
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                copied
                  ? 'bg-[#00D395]/20 text-[#00D395]'
                  : 'bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <pre className="px-4 py-3 text-xs font-mono text-[#E6EDF3] leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[200px] overflow-y-auto select-all">
            {highlightBoolean(ecuacion)}
          </pre>
        </motion.div>
      )}

      {/* Databases */}
      {basesDatos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-[#21262D] bg-[#161B22] p-3"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Database className="w-3 h-3 text-[#00BCFF]" />
            <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
              Bases de Datos
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {basesDatos.map((db) => (
              <span
                key={db}
                className="px-2 py-1 rounded text-[10px] font-medium bg-[#00BCFF]/10 text-[#00BCFF] border border-[#00BCFF]/20"
              >
                {db}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Descriptors / MeSH terms */}
      {(descriptores.length > 0 || meshTerms.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-[#21262D] bg-[#161B22] p-3"
        >
          {descriptores.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3 h-3 text-[#F7B500]" />
                <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
                  Descriptores
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {descriptores.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-[#F7B500]/10 text-[#F7B500] border border-[#F7B500]/20"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {meshTerms.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3 h-3 text-[#A78BFA]" />
                <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
                  MeSH Terms
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meshTerms.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-[#A78BFA]/10 text-[#A78BFA] border border-[#A78BFA]/20"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Returns the equation as a React element with boolean operators highlighted.
 * We use dangerouslySetInnerHTML-free approach: just return the raw string
 * and let CSS + the `select-all` class handle copy. The operators are visually
 * highlighted in the rendered <pre> via a simple span replacement.
 */
function highlightBoolean(equation: string): React.ReactNode {
  // Split by boolean operators while keeping them as tokens
  const parts = equation.split(/\b(AND|OR|NOT)\b/g);

  return parts.map((part, i) => {
    if (part === 'AND') {
      return (
        <span key={i} className="text-[#00D395] font-bold">
          AND
        </span>
      );
    }
    if (part === 'OR') {
      return (
        <span key={i} className="text-[#00BCFF] font-bold">
          OR
        </span>
      );
    }
    if (part === 'NOT') {
      return (
        <span key={i} className="text-[#FF4757] font-bold">
          NOT
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
