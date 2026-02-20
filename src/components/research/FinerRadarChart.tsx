import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FinerScores } from '@/types/domain';

interface FinerRadarChartProps {
  scores: FinerScores;
  compact?: boolean;
}

const FINER_AXES = [
  { key: 'feasible' as const, label: 'F', fullLabel: 'Feasible', color: '#00BCFF' },
  { key: 'interesting' as const, label: 'I', fullLabel: 'Interesting', color: '#00D395' },
  { key: 'novel' as const, label: 'N', fullLabel: 'Novel', color: '#F7B500' },
  { key: 'ethical' as const, label: 'E', fullLabel: 'Ethical', color: '#A78BFA' },
  { key: 'relevant' as const, label: 'R', fullLabel: 'Relevant', color: '#FF6B9D' },
];

function getScoreColor(score: number): string {
  if (score >= 7) return '#00D395';
  if (score >= 5) return '#F7B500';
  return '#FF4757';
}

export function FinerRadarChart({ scores, compact = false }: FinerRadarChartProps) {
  const values = FINER_AXES.map(axis => scores[axis.key] ?? 0);
  const [animatedValues, setAnimatedValues] = useState(values.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(values);
    }, 300);
    return () => clearTimeout(timer);
  }, [scores]);

  const centerX = 100;
  const centerY = 100;
  const maxRadius = 70;
  const levels = 4;
  const numAxes = FINER_AXES.length;

  const calculatePoint = (index: number, value: number) => {
    const angle = (index / numAxes) * 2 * Math.PI - Math.PI / 2;
    const radius = (value / 10) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const polygonPath = animatedValues
    .map((value, index) => {
      const point = calculatePoint(index, value);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ') + ' Z';

  const totalScore = Math.round(
    (animatedValues.reduce((sum, v) => sum + v, 0) / 50) * 100
  );

  const overallColor = totalScore >= 70 ? '#00D395' : totalScore >= 50 ? '#F7B500' : '#FF4757';

  return (
    <div className={cn(
      "relative bg-[#0D1117] rounded-lg border border-[#21262D]",
      compact ? "p-3" : "p-4"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            FINER Audit
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22]">
          <span className="text-[10px] text-[#8B949E]">SCORE:</span>
          <span className={cn("text-sm font-bold font-mono")} style={{ color: overallColor }}>
            {totalScore}%
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className={cn(
        "relative aspect-square mx-auto",
        compact ? "max-w-[160px]" : "max-w-[220px]"
      )}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background grid levels */}
          {Array.from({ length: levels }, (_, i) => {
            const radius = ((i + 1) / levels) * maxRadius;
            return (
              <polygon
                key={`level-${i}`}
                points={FINER_AXES.map((_, idx) => {
                  const angle = (idx / numAxes) * 2 * Math.PI - Math.PI / 2;
                  return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`;
                }).join(' ')}
                fill="none"
                stroke="#21262D"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines */}
          {FINER_AXES.map((_, index) => {
            const point = calculatePoint(index, 10);
            return (
              <line
                key={`axis-${index}`}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke="#21262D"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <motion.path
            d={polygonPath}
            fill={`${overallColor}26`}
            stroke={overallColor}
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Data points */}
          {animatedValues.map((value, index) => {
            const point = calculatePoint(index, value);
            const pointColor = getScoreColor(value);
            return (
              <motion.circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={pointColor}
                stroke="#0D1117"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                style={{
                  filter: `drop-shadow(0 0 6px ${pointColor}80)`,
                }}
              />
            );
          })}

          {/* Labels */}
          {FINER_AXES.map((axis, index) => {
            const labelRadius = maxRadius + 25;
            const angle = (index / numAxes) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            const pointColor = getScoreColor(animatedValues[index]);

            return (
              <text
                key={`label-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-semibold"
                fill={pointColor}
              >
                {axis.label}
              </text>
            );
          })}

          {/* Center score */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="text-xl font-bold"
            fill="#E6EDF3"
          >
            {totalScore}
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="text-[8px] uppercase tracking-widest"
            fill="#484F58"
          >
            FINER
          </text>
        </svg>
      </div>

      {/* Metric breakdown */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {FINER_AXES.map((axis, index) => {
            const value = animatedValues[index];
            const scoreColor = getScoreColor(value);
            return (
              <div
                key={axis.key}
                className="flex items-center gap-2 px-2 py-1.5 bg-[#161B22] rounded"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: scoreColor,
                    boxShadow: `0 0 6px ${scoreColor}80`,
                  }}
                />
                <span className="text-[10px] text-[#8B949E] flex-1">{axis.fullLabel}</span>
                <span
                  className="text-[11px] font-mono font-bold"
                  style={{ color: scoreColor }}
                >
                  {value}/10
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
