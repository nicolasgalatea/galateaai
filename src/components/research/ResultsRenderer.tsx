import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ResultsRendererProps {
  content: string;
  className?: string;
}

// Componentes personalizados para ReactMarkdown con soporte para estadisticas cientificas
const markdownComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">
      {children}
    </h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-bold text-gray-800 mt-5 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-base font-semibold text-gray-700 mt-3 mb-1">
      {children}
    </h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-3 leading-relaxed text-gray-700">
      {children}
    </p>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-bold text-gray-900">
      {children}
    </strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-gray-600">
      {children}
    </em>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-4 space-y-1 ml-2">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 ml-2">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-700 leading-relaxed">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">
      {children}
    </blockquote>
  ),
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-red-600">
          {children}
        </code>
      );
    }
    // Block code - para forest plots y tablas ASCII
    return (
      <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto my-4 font-mono text-sm">
        <code>{children}</code>
      </pre>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-gray-100">
      {children}
    </thead>
  ),
  tbody: ({ children }: { children: React.ReactNode }) => (
    <tbody className="divide-y divide-gray-200">
      {children}
    </tbody>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="hover:bg-gray-50">
      {children}
    </tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left font-semibold text-gray-900 border border-gray-300">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-2 text-gray-700 border border-gray-300">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-6 border-t-2 border-gray-200" />
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline"
    >
      {children}
    </a>
  ),
};

// Funcion para resaltar valores estadisticos
function highlightStatistics(content: string): string {
  // Resaltar RR, OR, HR con intervalos de confianza
  let processed = content;

  // Patron para RR/OR/HR = valor (IC95%: x-y, p = z)
  processed = processed.replace(
    /(RR|OR|HR)\s*=\s*([\d.]+)\s*\(IC95%:\s*([\d.]+)-([\d.]+),?\s*p\s*[=<]\s*([\d.]+)\)/gi,
    '**$1 = $2** (IC95%: $3-$4, p = $5)'
  );

  // Patron para I² (heterogeneidad)
  processed = processed.replace(
    /I[²2]\s*=\s*([\d.]+)%/gi,
    '**I² = $1%**'
  );

  // Patron para valores p solos
  processed = processed.replace(
    /p\s*[=<]\s*(0\.\d+)/gi,
    '**p = $1**'
  );

  return processed;
}

export function ResultsRenderer({ content, className }: ResultsRendererProps) {
  // Procesar contenido para resaltar estadisticas
  const processedContent = highlightStatistics(
    content.replace(/\\n/g, '\n')
  );

  return (
    <div className={cn('prose prose-gray max-w-none', className)}>
      <ReactMarkdown components={markdownComponents}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

// Componente especializado para mostrar estadisticas de meta-analisis
export function MetaAnalysisStats({
  rr,
  ciLower,
  ciUpper,
  pValue,
  iSquared,
  label = 'Resultado',
}: {
  rr: number;
  ciLower: number;
  ciUpper: number;
  pValue: number;
  iSquared?: number;
  label?: string;
}) {
  const isSignificant = pValue < 0.05;
  const isProtective = rr < 1;

  return (
    <div className={cn(
      'p-4 rounded-lg border-2',
      isSignificant
        ? isProtective
          ? 'bg-green-50 border-green-300'
          : 'bg-red-50 border-red-300'
        : 'bg-gray-50 border-gray-300'
    )}>
      <h4 className="font-semibold text-gray-900 mb-2">{label}</h4>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Risk Ratio:</span>
          <span className={cn(
            'ml-2 font-bold',
            isSignificant
              ? isProtective ? 'text-green-700' : 'text-red-700'
              : 'text-gray-700'
          )}>
            RR = {rr.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="text-gray-600">IC 95%:</span>
          <span className="ml-2 font-mono">
            [{ciLower.toFixed(2)} - {ciUpper.toFixed(2)}]
          </span>
        </div>

        <div>
          <span className="text-gray-600">Valor p:</span>
          <span className={cn(
            'ml-2 font-bold',
            isSignificant ? 'text-green-700' : 'text-gray-500'
          )}>
            p = {pValue < 0.001 ? '< 0.001' : pValue.toFixed(3)}
            {isSignificant && ' *'}
          </span>
        </div>

        {iSquared !== undefined && (
          <div>
            <span className="text-gray-600">Heterogeneidad:</span>
            <span className={cn(
              'ml-2 font-bold',
              iSquared > 75 ? 'text-red-600' :
              iSquared > 50 ? 'text-yellow-600' : 'text-green-600'
            )}>
              I² = {iSquared.toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Interpretacion */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
        <span className="font-semibold">Interpretacion: </span>
        {isSignificant ? (
          <span className={isProtective ? 'text-green-700' : 'text-red-700'}>
            {isProtective
              ? `Efecto protector significativo (reduccion del ${((1 - rr) * 100).toFixed(0)}% en el riesgo)`
              : `Aumento significativo del riesgo (${((rr - 1) * 100).toFixed(0)}% mayor)`
            }
          </span>
        ) : (
          <span className="text-gray-600">
            No se encontro diferencia estadisticamente significativa
          </span>
        )}
      </div>
    </div>
  );
}

export default ResultsRenderer;
