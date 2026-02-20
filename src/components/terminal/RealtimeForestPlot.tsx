import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface ForestPlotStudy {
  name: string;
  hr: number;
  ciLow: number;
  ciHigh: number;
  weight: number;
  n: number;
}

interface RealtimeForestPlotProps {
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

// Default studies data (used when no metadata provided)
const DEFAULT_STUDIES: ForestPlotStudy[] = [
  { name: 'EMPEROR-Preserved', hr: 0.79, ciLow: 0.69, ciHigh: 0.90, weight: 28.5, n: 5988 },
  { name: 'DELIVER', hr: 0.82, ciLow: 0.73, ciHigh: 0.92, weight: 26.2, n: 6263 },
  { name: 'PRESERVED-HF', hr: 0.87, ciLow: 0.68, ciHigh: 1.11, weight: 5.1, n: 324 },
  { name: 'SOLOIST-WHF', hr: 0.67, ciLow: 0.52, ciHigh: 0.85, weight: 8.3, n: 1222 },
  { name: 'EMPEROR-Pooled', hr: 0.71, ciLow: 0.58, ciHigh: 0.87, weight: 9.8, n: 1863 },
  { name: 'VERTIS CV', hr: 0.83, ciLow: 0.70, ciHigh: 0.98, weight: 12.4, n: 2547 },
  { name: 'DAPA-HF Sub', hr: 0.74, ciLow: 0.59, ciHigh: 0.93, weight: 9.7, n: 1027 },
];

const POOLED = { hr: 0.80, ciLow: 0.73, ciHigh: 0.87 };

// Scale HR values to pixel positions (0.4 to 1.4 range)
const hrToX = (hr: number, width: number) => {
  const minHR = 0.4;
  const maxHR = 1.4;
  return ((hr - minHR) / (maxHR - minHR)) * width;
};

export function RealtimeForestPlot({ isActive, metadata }: RealtimeForestPlotProps) {
  const [visibleStudies, setVisibleStudies] = useState<number>(0);
  const [showPooled, setShowPooled] = useState(false);

  const studies = metadata?.studies 
    ? (metadata.studies as ForestPlotStudy[]) 
    : DEFAULT_STUDIES;

  useEffect(() => {
    if (!isActive) return;
    setVisibleStudies(0);
    setShowPooled(false);

    // Reveal studies one by one
    const interval = setInterval(() => {
      setVisibleStudies(prev => {
        if (prev >= studies.length) {
          clearInterval(interval);
          setTimeout(() => setShowPooled(true), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isActive, studies.length]);

  const plotWidth = 400;
  const rowHeight = 36;
  const labelWidth = 150;
  const weightWidth = 60;
  const totalHeight = (studies.length + 2) * rowHeight + 40;
  const nullLineX = hrToX(1.0, plotWidth);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 bg-white shadow-lg overflow-hidden"
      style={{ borderColor: '#2E7D6B' }}
    >
      <div className="px-6 py-4" style={{ backgroundColor: '#2E7D6B' }}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Forest Plot — Meta-análisis de Efectos Aleatorios
        </h3>
      </div>

      <div className="p-6 overflow-x-auto">
        <svg 
          width={labelWidth + plotWidth + weightWidth + 40} 
          height={totalHeight}
          className="mx-auto"
        >
          {/* Header */}
          <text x={labelWidth / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1B4D7A">
            Estudio
          </text>
          <text x={labelWidth + plotWidth / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1B4D7A">
            HR (IC 95%)
          </text>
          <text x={labelWidth + plotWidth + weightWidth / 2 + 10} y={20} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#1B4D7A">
            Peso
          </text>

          {/* Null effect line (HR = 1.0) */}
          <line
            x1={labelWidth + nullLineX} y1={30}
            x2={labelWidth + nullLineX} y2={totalHeight - 20}
            stroke="#999" strokeWidth={1} strokeDasharray="4,4"
          />

          {/* Scale labels */}
          {[0.5, 0.7, 1.0, 1.3].map(hr => (
            <g key={hr}>
              <text
                x={labelWidth + hrToX(hr, plotWidth)}
                y={totalHeight - 5}
                textAnchor="middle"
                fontSize={9}
                fill="#666"
              >
                {hr.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Scale labels for direction */}
          <text x={labelWidth + hrToX(0.6, plotWidth)} y={totalHeight} textAnchor="middle" fontSize={8} fill="#2E7D6B">
            ← Favorece SGLT2i
          </text>
          <text x={labelWidth + hrToX(1.3, plotWidth)} y={totalHeight} textAnchor="middle" fontSize={8} fill="#DC2626">
            Favorece placebo →
          </text>

          {/* Studies */}
          <AnimatePresence>
            {studies.slice(0, visibleStudies).map((study, idx) => {
              const y = 35 + (idx + 1) * rowHeight;
              const centerX = labelWidth + hrToX(study.hr, plotWidth);
              const lowX = labelWidth + hrToX(study.ciLow, plotWidth);
              const highX = labelWidth + hrToX(study.ciHigh, plotWidth);
              const squareSize = Math.max(6, Math.sqrt(study.weight) * 3);

              return (
                <motion.g
                  key={study.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Study name */}
                  <text x={5} y={y + 4} fontSize={10} fill="#333">
                    {study.name}
                  </text>
                  
                  {/* CI Line */}
                  <line x1={lowX} y1={y} x2={highX} y2={y} stroke="#1B4D7A" strokeWidth={1.5} />
                  
                  {/* CI Caps */}
                  <line x1={lowX} y1={y - 4} x2={lowX} y2={y + 4} stroke="#1B4D7A" strokeWidth={1.5} />
                  <line x1={highX} y1={y - 4} x2={highX} y2={y + 4} stroke="#1B4D7A" strokeWidth={1.5} />
                  
                  {/* Square (weighted) */}
                  <rect
                    x={centerX - squareSize / 2}
                    y={y - squareSize / 2}
                    width={squareSize}
                    height={squareSize}
                    fill="#1B4D7A"
                  />

                  {/* HR text */}
                  <text x={labelWidth + plotWidth + 15} y={y + 4} fontSize={9} fill="#333">
                    {(study.weight).toFixed(1)}%
                  </text>
                </motion.g>
              );
            })}
          </AnimatePresence>

          {/* Pooled Diamond */}
          {showPooled && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Separator line */}
              <line
                x1={5} y1={35 + (studies.length + 0.5) * rowHeight}
                x2={labelWidth + plotWidth + weightWidth + 30} y2={35 + (studies.length + 0.5) * rowHeight}
                stroke="#E5E7EB" strokeWidth={1}
              />

              {(() => {
                const y = 35 + (studies.length + 1) * rowHeight;
                const centerX = labelWidth + hrToX(POOLED.hr, plotWidth);
                const lowX = labelWidth + hrToX(POOLED.ciLow, plotWidth);
                const highX = labelWidth + hrToX(POOLED.ciHigh, plotWidth);

                return (
                  <>
                    <text x={5} y={y + 4} fontSize={10} fontWeight="bold" fill="#2E7D6B">
                      Pooled (RE)
                    </text>
                    {/* Diamond shape */}
                    <polygon
                      points={`${lowX},${y} ${centerX},${y - 8} ${highX},${y} ${centerX},${y + 8}`}
                      fill="#2E7D6B"
                      opacity={0.8}
                    />
                    <text x={labelWidth + plotWidth + 15} y={y + 4} fontSize={9} fontWeight="bold" fill="#2E7D6B">
                      100%
                    </text>
                  </>
                );
              })()}
            </motion.g>
          )}
        </svg>

        {/* Summary below plot */}
        {showPooled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 rounded-lg text-center"
            style={{ backgroundColor: '#ECFDF5', color: '#2E7D6B' }}
          >
            <p className="font-bold text-lg">
              HR Pooled: {POOLED.hr} (IC 95%: {POOLED.ciLow}–{POOLED.ciHigh}) — p &lt; 0.0001
            </p>
            <p className="text-sm mt-1">
              Heterogeneidad: I² = 18% (baja) | Modelo: DerSimonian-Laird
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
