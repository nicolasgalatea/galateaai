import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Search, Filter, CheckCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PRISMABlock {
  id: string;
  label: string;
  count: number;
  targetCount: number;
  description: string;
  icon: React.ReactNode;
  excluded?: number;
  excludedReason?: string;
}

interface AnimatedPRISMAFlowProps {
  isAnimating?: boolean;
  onComplete?: () => void;
}

const initialBlocks: PRISMABlock[] = [
  { 
    id: 'identified', 
    label: 'Identificados', 
    count: 0, 
    targetCount: 1372, 
    description: 'Registros de bases de datos',
    icon: <Search className="w-4 h-4" />
  },
  { 
    id: 'duplicates', 
    label: 'Tras Duplicados', 
    count: 0, 
    targetCount: 1063, 
    description: 'Registros únicos',
    icon: <FileText className="w-4 h-4" />,
    excluded: 309,
    excludedReason: 'Duplicados removidos'
  },
  { 
    id: 'screened', 
    label: 'Cribados', 
    count: 0, 
    targetCount: 187, 
    description: 'Títulos/Abstracts revisados',
    icon: <Filter className="w-4 h-4" />,
    excluded: 876,
    excludedReason: 'No cumplen criterios'
  },
  { 
    id: 'fulltext', 
    label: 'Texto Completo', 
    count: 0, 
    targetCount: 54, 
    description: 'Artículos evaluados',
    icon: <FileText className="w-4 h-4" />,
    excluded: 133,
    excludedReason: 'Excluidos tras lectura'
  },
  { 
    id: 'included', 
    label: 'Incluidos', 
    count: 0, 
    targetCount: 18, 
    description: 'Síntesis cualitativa',
    icon: <CheckCircle className="w-4 h-4" />,
    excluded: 36,
    excludedReason: 'No elegibles'
  },
  { 
    id: 'metaanalysis', 
    label: 'Meta-análisis', 
    count: 0, 
    targetCount: 12, 
    description: 'Síntesis cuantitativa',
    icon: <BarChart3 className="w-4 h-4" />,
    excluded: 6,
    excludedReason: 'Datos insuficientes'
  },
];

export function AnimatedPRISMAFlow({ isAnimating = false, onComplete }: AnimatedPRISMAFlowProps) {
  const [blocks, setBlocks] = useState<PRISMABlock[]>(initialBlocks);
  const [activeBlockIndex, setActiveBlockIndex] = useState(-1);
  const [fallingArticles, setFallingArticles] = useState<{ id: number; x: number; delay: number }[]>([]);

  const runAnimation = async () => {
    setBlocks(initialBlocks);
    setActiveBlockIndex(0);

    for (let i = 0; i < initialBlocks.length; i++) {
      setActiveBlockIndex(i);
      
      // Generate falling articles for this block
      const articleCount = Math.min(15, Math.floor(initialBlocks[i].targetCount / 50));
      const newArticles = Array.from({ length: articleCount }, (_, idx) => ({
        id: Date.now() + idx,
        x: 20 + Math.random() * 60,
        delay: idx * 0.05,
      }));
      setFallingArticles(newArticles);

      // Animate count up
      const target = initialBlocks[i].targetCount;
      const steps = 30;
      const stepTime = 40;
      
      for (let step = 0; step <= steps; step++) {
        await new Promise(r => setTimeout(r, stepTime));
        const currentCount = Math.round((step / steps) * target);
        setBlocks(prev => prev.map((block, idx) => 
          idx === i ? { ...block, count: currentCount } : block
        ));
      }

      await new Promise(r => setTimeout(r, 300));
      setFallingArticles([]);
    }

    setActiveBlockIndex(-1);
    onComplete?.();
  };

  useEffect(() => {
    if (isAnimating) {
      runAnimation();
    }
  }, [isAnimating]);

  return (
    <div className="bg-[#0D1117] rounded-lg border border-[#21262D] p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            PRISMA Flow Diagram
          </span>
        </div>
        <button
          onClick={runAnimation}
          disabled={activeBlockIndex >= 0}
          className={cn(
            "px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-all",
            activeBlockIndex >= 0
              ? "bg-[#21262D] text-[#484F58] cursor-not-allowed"
              : "bg-[#00D395] text-black hover:shadow-[0_0_15px_rgba(0,211,149,0.4)]"
          )}
        >
          {activeBlockIndex >= 0 ? 'Running...' : 'Animate Flow'}
        </button>
      </div>

      {/* Flow Diagram */}
      <div className="relative">
        {/* Falling articles animation */}
        <AnimatePresence>
          {fallingArticles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 400, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                delay: article.delay,
                ease: 'easeIn'
              }}
              className="absolute w-1.5 h-2 bg-[#00BCFF] rounded-sm"
              style={{ left: `${article.x}%` }}
            />
          ))}
        </AnimatePresence>

        {/* PRISMA Blocks */}
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block.id}>
              <motion.div
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded border transition-all",
                  activeBlockIndex === index 
                    ? "border-[#00BCFF] bg-[#00BCFF]/10 shadow-[0_0_20px_rgba(0,188,255,0.2)]"
                    : block.count === block.targetCount
                      ? "border-[#00D395]/50 bg-[#00D395]/5"
                      : "border-[#21262D] bg-[#161B22]"
                )}
                animate={{
                  scale: activeBlockIndex === index ? 1.02 : 1,
                }}
              >
                {/* Icon */}
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center",
                  block.count === block.targetCount
                    ? "bg-[#00D395]/20 text-[#00D395]"
                    : "bg-[#21262D] text-[#8B949E]"
                )}>
                  {block.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#E6EDF3]">
                      {block.label}
                    </span>
                    <span className="text-[9px] text-[#484F58]">
                      {block.description}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-1.5 h-1 bg-[#21262D] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#00BCFF] to-[#00D395]"
                      style={{ width: `${(block.count / block.targetCount) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>

                {/* Count */}
                <div className="text-right">
                  <motion.div 
                    className={cn(
                      "text-lg font-bold font-mono",
                      block.count === block.targetCount ? "text-[#00D395]" : "text-[#E6EDF3]"
                    )}
                    key={block.count}
                  >
                    {block.count.toLocaleString()}
                  </motion.div>
                  <div className="text-[9px] text-[#484F58]">
                    / {block.targetCount.toLocaleString()}
                  </div>
                </div>

                {/* Scanning overlay */}
                {activeBlockIndex === index && (
                  <motion.div
                    className="absolute inset-0 rounded overflow-hidden pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="absolute inset-x-0 h-8 bg-gradient-to-b from-[#00BCFF]/20 to-transparent"
                      animate={{ y: [-32, 60] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                )}
              </motion.div>

              {/* Connector arrow with excluded count */}
              {index < blocks.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-4 h-4 text-[#484F58]" />
                    {block.excluded && block.count === block.targetCount && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-[#FF4757]/10 border border-[#FF4757]/30 rounded text-[9px]"
                      >
                        <span className="text-[#FF4757] font-mono font-bold">
                          -{block.excluded}
                        </span>
                        <span className="text-[#8B949E]">{block.excludedReason}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completion badge */}
      {blocks.every(b => b.count === b.targetCount) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-[#00D395]/10 border border-[#00D395]/30 rounded flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-[#00D395]" />
          <span className="text-[11px] font-semibold text-[#00D395]">
            PRISMA Flow Complete
          </span>
          <span className="text-[10px] text-[#8B949E]">
            • 12 studies included in meta-analysis
          </span>
        </motion.div>
      )}
    </div>
  );
}
