import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Database, FileText } from 'lucide-react';

interface AnimatedStudyCounterProps {
  totalStudies: number;
  isActive: boolean;
}

export function AnimatedStudyCounter({ totalStudies, isActive }: AnimatedStudyCounterProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'counting' | 'done'>('idle');

  useEffect(() => {
    if (!isActive || totalStudies <= 0) return;
    setPhase('counting');

    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      const progress = current / steps;
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayCount(Math.round(eased * totalStudies));
      if (current >= steps) {
        clearInterval(interval);
        setDisplayCount(totalStudies);
        setPhase('done');
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, [isActive, totalStudies]);

  const databases = [
    { name: 'PubMed', count: Math.round(totalStudies * 0.40), color: '#1B4D7A' },
    { name: 'Embase', count: Math.round(totalStudies * 0.34), color: '#2E7D6B' },
    { name: 'Cochrane', count: Math.round(totalStudies * 0.18), color: '#4A90A4' },
    { name: 'Web of Science', count: Math.round(totalStudies * 0.08), color: '#6B7280' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 bg-white shadow-lg overflow-hidden"
      style={{ borderColor: '#1B4D7A' }}
    >
      <div className="px-6 py-4" style={{ backgroundColor: '#1B4D7A' }}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5" />
          Búsqueda Sistemática en Curso
        </h3>
      </div>

      <div className="p-8 text-center">
        {/* Main Counter */}
        <div className="mb-6">
          <motion.div
            className="text-7xl font-bold font-mono mb-2"
            style={{ color: '#1B4D7A' }}
            animate={phase === 'counting' ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {displayCount.toLocaleString()}
          </motion.div>
          <p className="text-lg font-medium" style={{ color: '#333333' }}>
            estudios identificados
          </p>
        </div>

        {/* Database Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {databases.map((db) => (
            <motion.div
              key={db.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: phase !== 'idle' ? 1 : 0.5, scale: 1 }}
              className="p-3 rounded-lg border flex items-center gap-2"
              style={{ borderColor: '#E5E7EB' }}
            >
              <Database className="w-4 h-4" style={{ color: db.color }} />
              <div className="text-left">
                <div className="text-sm font-semibold" style={{ color: db.color }}>{db.name}</div>
                <div className="text-xs font-mono" style={{ color: '#333333' }}>
                  {phase !== 'idle' ? db.count.toLocaleString() : '—'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Completion Badge */}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-3 rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: '#ECFDF5', color: '#2E7D6B' }}
          >
            <FileText className="w-4 h-4" />
            <span className="font-semibold">Búsqueda completada — Iniciando deduplicación</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
