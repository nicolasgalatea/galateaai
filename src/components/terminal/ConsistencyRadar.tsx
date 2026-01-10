import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RadarMetric {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

interface ConsistencyRadarProps {
  metrics?: RadarMetric[];
  isAnimating?: boolean;
}

const defaultMetrics: RadarMetric[] = [
  { label: 'Coherencia', value: 94, maxValue: 100, color: '#00BCFF' },
  { label: 'Ética', value: 98, maxValue: 100, color: '#00D395' },
  { label: 'Evidencia', value: 87, maxValue: 100, color: '#F7B500' },
  { label: 'Rigor', value: 92, maxValue: 100, color: '#FF6B9D' },
];

export function ConsistencyRadar({ 
  metrics = defaultMetrics, 
  isAnimating = false 
}: ConsistencyRadarProps) {
  const [animatedValues, setAnimatedValues] = useState(metrics.map(() => 0));

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        setAnimatedValues(metrics.map(m => m.value));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [metrics, isAnimating]);

  const centerX = 100;
  const centerY = 100;
  const maxRadius = 70;
  const levels = 4;

  // Calculate points for each metric
  const calculatePoint = (index: number, value: number) => {
    const angle = (index / metrics.length) * 2 * Math.PI - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // Generate polygon path
  const polygonPath = animatedValues
    .map((value, index) => {
      const point = calculatePoint(index, value);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    })
    .join(' ') + ' Z';

  // Calculate overall score
  const overallScore = Math.round(
    animatedValues.reduce((sum, v) => sum + v, 0) / metrics.length
  );

  return (
    <div className="relative bg-[#0D1117] rounded-lg border border-[#21262D] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Consistency Radar
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22]">
          <span className="text-[10px] text-[#8B949E]">SCORE:</span>
          <span className={cn(
            "text-sm font-bold font-mono",
            overallScore >= 90 ? "text-[#00D395]" :
            overallScore >= 75 ? "text-[#00BCFF]" :
            overallScore >= 50 ? "text-[#F7B500]" : "text-[#FF4757]"
          )}>
            {overallScore}%
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="relative aspect-square max-w-[220px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background grid levels */}
          {Array.from({ length: levels }, (_, i) => {
            const radius = ((i + 1) / levels) * maxRadius;
            return (
              <polygon
                key={`level-${i}`}
                points={metrics.map((_, idx) => {
                  const angle = (idx / metrics.length) * 2 * Math.PI - Math.PI / 2;
                  return `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`;
                }).join(' ')}
                fill="none"
                stroke="#21262D"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines */}
          {metrics.map((_, index) => {
            const point = calculatePoint(index, 100);
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
            fill="rgba(0, 188, 255, 0.15)"
            stroke="#00BCFF"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Data points */}
          {animatedValues.map((value, index) => {
            const point = calculatePoint(index, value);
            return (
              <motion.circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={metrics[index].color}
                stroke="#0D1117"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                style={{
                  filter: `drop-shadow(0 0 6px ${metrics[index].color}80)`
                }}
              />
            );
          })}

          {/* Labels */}
          {metrics.map((metric, index) => {
            const labelRadius = maxRadius + 25;
            const angle = (index / metrics.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + labelRadius * Math.cos(angle);
            const y = centerY + labelRadius * Math.sin(angle);
            
            return (
              <text
                key={`label-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-semibold"
                fill={metric.color}
              >
                {metric.label}
              </text>
            );
          })}

          {/* Center label */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="text-xl font-bold"
            fill="#E6EDF3"
          >
            {overallScore}
          </text>
          <text
            x={centerX}
            y={centerY + 12}
            textAnchor="middle"
            className="text-[8px] uppercase tracking-widest"
            fill="#484F58"
          >
            GLOBAL
          </text>
        </svg>
      </div>

      {/* Metric breakdown */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {metrics.map((metric, index) => (
          <div 
            key={metric.label}
            className="flex items-center gap-2 px-2 py-1.5 bg-[#161B22] rounded"
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: metric.color,
                boxShadow: `0 0 6px ${metric.color}80`
              }}
            />
            <span className="text-[10px] text-[#8B949E] flex-1">{metric.label}</span>
            <span 
              className="text-[11px] font-mono font-bold"
              style={{ color: metric.color }}
            >
              {animatedValues[index]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
