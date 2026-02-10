import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, FileText, Filter, CheckCircle, BarChart3 } from 'lucide-react';

interface PRISMAStage {
  id: string;
  label: string;
  count: number;
  description: string;
  icon: React.ReactNode;
  excluded?: number;
  excludedReason?: string;
  triggeredByAgent?: number; // Which agent triggers this stage
}

interface RealtimePRISMAFlowProps {
  completedAgents: Set<number>;
}

const PRISMA_STAGES: PRISMAStage[] = [
  { 
    id: 'identified', label: 'Identificación', count: 847, 
    description: 'Registros de bases de datos',
    icon: <Search className="w-5 h-5" />,
    triggeredByAgent: 9,
  },
  { 
    id: 'duplicates', label: 'Deduplicación', count: 613, 
    description: 'Registros únicos tras duplicados',
    icon: <FileText className="w-5 h-5" />,
    excluded: 234, excludedReason: 'Duplicados removidos',
    triggeredByAgent: 9,
  },
  { 
    id: 'screened', label: 'Cribado', count: 124, 
    description: 'Título/Abstract revisados',
    icon: <Filter className="w-5 h-5" />,
    excluded: 489, excludedReason: 'No cumplen criterios',
    triggeredByAgent: 10,
  },
  { 
    id: 'fulltext', label: 'Texto Completo', count: 18, 
    description: 'Artículos evaluados',
    icon: <FileText className="w-5 h-5" />,
    excluded: 106, excludedReason: 'Excluidos tras lectura',
    triggeredByAgent: 11,
  },
  { 
    id: 'included', label: 'Incluidos', count: 12, 
    description: 'Estudios en revisión',
    icon: <CheckCircle className="w-5 h-5" />,
    excluded: 6, excludedReason: 'No elegibles',
    triggeredByAgent: 12,
  },
  { 
    id: 'metaanalysis', label: 'Meta-análisis', count: 12, 
    description: 'Síntesis cuantitativa',
    icon: <BarChart3 className="w-5 h-5" />,
    triggeredByAgent: 12,
  },
];

export function RealtimePRISMAFlow({ completedAgents }: RealtimePRISMAFlowProps) {
  const [animatedCounts, setAnimatedCounts] = useState<Record<string, number>>({});
  const [activeStageIdx, setActiveStageIdx] = useState(-1);

  // Determine which stages are unlocked based on completed agents
  const getUnlockedStages = () => {
    return PRISMA_STAGES.filter(stage => 
      stage.triggeredByAgent && completedAgents.has(stage.triggeredByAgent)
    ).map(s => s.id);
  };

  const unlockedStages = getUnlockedStages();

  // Animate counts when new stages unlock
  useEffect(() => {
    PRISMA_STAGES.forEach((stage, idx) => {
      if (unlockedStages.includes(stage.id) && !animatedCounts[stage.id]) {
        // Animate this stage's count
        setActiveStageIdx(idx);
        const target = stage.count;
        const steps = 40;
        const stepTime = 30;
        let current = 0;

        const interval = setInterval(() => {
          current++;
          const eased = 1 - Math.pow(1 - current / steps, 3);
          setAnimatedCounts(prev => ({ ...prev, [stage.id]: Math.round(eased * target) }));
          if (current >= steps) {
            clearInterval(interval);
            setAnimatedCounts(prev => ({ ...prev, [stage.id]: target }));
          }
        }, stepTime);
      }
    });
  }, [unlockedStages.length]);

  const allComplete = unlockedStages.length === PRISMA_STAGES.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 bg-white shadow-lg overflow-hidden"
      style={{ borderColor: '#4A90A4' }}
    >
      <div className="px-6 py-4" style={{ backgroundColor: '#4A90A4' }}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Diagrama PRISMA 2020 — En Tiempo Real
        </h3>
      </div>

      <div className="p-6">
        <div className="space-y-2">
          {PRISMA_STAGES.map((stage, index) => {
            const isUnlocked = unlockedStages.includes(stage.id);
            const currentCount = animatedCounts[stage.id] ?? 0;
            const isActive = activeStageIdx === index && currentCount < stage.count;

            return (
              <div key={stage.id}>
                <motion.div
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    isUnlocked ? '' : 'opacity-40'
                  }`}
                  style={{
                    borderColor: isActive ? '#1B4D7A' : isUnlocked ? '#2E7D6B' : '#E5E7EB',
                    backgroundColor: isActive ? '#EBF5FF' : isUnlocked ? '#F0FDF4' : '#F9FAFB',
                  }}
                  animate={isActive ? { scale: 1.01 } : { scale: 1 }}
                >
                  {/* Icon */}
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: isUnlocked ? '#2E7D6B' : '#E5E7EB',
                      color: isUnlocked ? 'white' : '#9CA3AF',
                    }}
                  >
                    {stage.icon}
                  </div>

                  {/* Label & description */}
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: isUnlocked ? '#1B4D7A' : '#9CA3AF' }}>
                      {stage.label}
                    </div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>
                      {stage.description}
                    </div>
                    {/* Progress bar */}
                    {isUnlocked && (
                      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: '#2E7D6B', width: `${(currentCount / stage.count) * 100}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Count */}
                  <div className="text-right">
                    <div 
                      className="text-2xl font-bold font-mono"
                      style={{ color: isUnlocked ? '#1B4D7A' : '#D1D5DB' }}
                    >
                      {isUnlocked ? currentCount.toLocaleString() : '—'}
                    </div>
                  </div>

                  {/* Active scanner */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="absolute inset-x-0 h-10"
                        style={{ background: 'linear-gradient(to bottom, rgba(27,77,122,0.1), transparent)' }}
                        animate={{ y: [-40, 70] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  )}
                </motion.div>

                {/* Connector with excluded count */}
                {index < PRISMA_STAGES.length - 1 && (
                  <div className="flex items-center justify-center py-1">
                    <div className="flex items-center gap-3">
                      <ChevronDown className="w-4 h-4" style={{ color: isUnlocked ? '#1B4D7A' : '#D1D5DB' }} />
                      {stage.excluded && isUnlocked && currentCount >= stage.count && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                        >
                          <span className="font-bold font-mono">−{stage.excluded}</span>
                          <span>{stage.excludedReason}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion badge */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl flex items-center justify-center gap-2"
            style={{ backgroundColor: '#ECFDF5', border: '2px solid #2E7D6B' }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: '#2E7D6B' }} />
            <span className="font-bold" style={{ color: '#2E7D6B' }}>
              PRISMA Flow Completo — 12 estudios en meta-análisis
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
