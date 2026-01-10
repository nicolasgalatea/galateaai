import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Sparkles, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIEngine {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'idle' | 'scanning' | 'complete' | 'error';
  articlesFound: number;
  topStudies: string[];
  reproducibilityScore: number;
  scanTime: number;
}

interface MultiAIConsensusGridProps {
  onRunValidation?: () => void;
  isRunning?: boolean;
}

const initialEngines: AIEngine[] = [
  {
    id: 'galatea',
    name: 'Galatea Engine',
    icon: <Sparkles className="w-4 h-4" />,
    status: 'idle',
    articlesFound: 0,
    topStudies: [],
    reproducibilityScore: 0,
    scanTime: 0,
  },
  {
    id: 'gpt',
    name: 'Audit GPT',
    icon: <Brain className="w-4 h-4" />,
    status: 'idle',
    articlesFound: 0,
    topStudies: [],
    reproducibilityScore: 0,
    scanTime: 0,
  },
  {
    id: 'gemini',
    name: 'Audit Gemini',
    icon: <Cpu className="w-4 h-4" />,
    status: 'idle',
    articlesFound: 0,
    topStudies: [],
    reproducibilityScore: 0,
    scanTime: 0,
  },
];

export function MultiAIConsensusGrid({ onRunValidation, isRunning = false }: MultiAIConsensusGridProps) {
  const [engines, setEngines] = useState<AIEngine[]>(initialEngines);
  const [convergence, setConvergence] = useState(0);

  const runSimulation = async () => {
    // Reset engines
    setEngines(initialEngines.map(e => ({ ...e, status: 'scanning' })));
    setConvergence(0);

    const configs = [
      { idx: 0, delay: 2000, articles: 342, score: 94, studies: ['Ng TP et al. 2014', 'Orkaby AR 2017', 'Kuan YC 2017'] },
      { idx: 1, delay: 2500, articles: 356, score: 91, studies: ['Ng TP et al. 2014', 'Zhang Z 2022', 'Chen F 2023'] },
      { idx: 2, delay: 2200, articles: 338, score: 96, studies: ['Orkaby AR 2017', 'Samaras K 2020', 'Ng TP 2014'] },
    ];

    for (const config of configs) {
      await new Promise(r => setTimeout(r, config.delay));
      
      setEngines(prev => prev.map((e, i) => 
        i === config.idx ? {
          ...e,
          status: 'complete',
          articlesFound: config.articles + Math.floor(Math.random() * 20) - 10,
          topStudies: config.studies,
          reproducibilityScore: config.score,
          scanTime: config.delay + Math.floor(Math.random() * 300),
        } : e
      ));
    }

    // Calculate convergence
    await new Promise(r => setTimeout(r, 500));
    setConvergence(Math.floor(85 + Math.random() * 12));
    
    onRunValidation?.();
  };

  const getStatusColor = (status: AIEngine['status']) => {
    switch (status) {
      case 'complete': return '#00D395';
      case 'scanning': return '#00BCFF';
      case 'error': return '#FF4757';
      default: return '#484F58';
    }
  };

  const getStatusIcon = (status: AIEngine['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-[#00D395]" />;
      case 'scanning': return <Loader2 className="w-4 h-4 text-[#00BCFF] animate-spin" />;
      case 'error': return <XCircle className="w-4 h-4 text-[#FF4757]" />;
      default: return <div className="w-2 h-2 rounded-full bg-[#484F58]" />;
    }
  };

  const allComplete = engines.every(e => e.status === 'complete');

  return (
    <div className="bg-[#0D1117] rounded-lg border border-[#21262D] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D] bg-[#161B22]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Multi-AI Consensus Grid
          </span>
        </div>
        <button
          onClick={runSimulation}
          disabled={isRunning || engines.some(e => e.status === 'scanning')}
          className={cn(
            "px-3 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wide transition-all",
            engines.some(e => e.status === 'scanning')
              ? "bg-[#21262D] text-[#484F58] cursor-not-allowed"
              : "bg-[#00BCFF] text-black hover:shadow-[0_0_15px_rgba(0,188,255,0.4)]"
          )}
        >
          {engines.some(e => e.status === 'scanning') ? 'Validating...' : 'Run Validation'}
        </button>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="bg-[#161B22]">
              <th className="px-4 py-2 text-left text-[9px] text-[#484F58] uppercase tracking-wide font-semibold border-b border-[#21262D]">Engine</th>
              <th className="px-4 py-2 text-center text-[9px] text-[#484F58] uppercase tracking-wide font-semibold border-b border-[#21262D]">Status</th>
              <th className="px-4 py-2 text-center text-[9px] text-[#484F58] uppercase tracking-wide font-semibold border-b border-[#21262D]">Articles</th>
              <th className="px-4 py-2 text-center text-[9px] text-[#484F58] uppercase tracking-wide font-semibold border-b border-[#21262D]">Score</th>
              <th className="px-4 py-2 text-left text-[9px] text-[#484F58] uppercase tracking-wide font-semibold border-b border-[#21262D]">Top Studies</th>
            </tr>
          </thead>
          <tbody>
            {engines.map((engine) => (
              <motion.tr
                key={engine.id}
                className="border-b border-[#21262D] hover:bg-[#21262D]/30 transition-colors"
                initial={{ opacity: 0.5 }}
                animate={{ 
                  opacity: 1,
                  backgroundColor: engine.status === 'scanning' 
                    ? 'rgba(0, 188, 255, 0.05)' 
                    : 'transparent'
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${getStatusColor(engine.status)}20`,
                        color: getStatusColor(engine.status)
                      }}
                    >
                      {engine.icon}
                    </div>
                    <span className="font-semibold text-[#E6EDF3]">{engine.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {getStatusIcon(engine.status)}
                    <span 
                      className="text-[10px] uppercase font-semibold"
                      style={{ color: getStatusColor(engine.status) }}
                    >
                      {engine.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-mono font-bold text-[#E6EDF3]">
                    {engine.articlesFound || '--'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {engine.reproducibilityScore > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-12 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#00BCFF] to-[#00D395]"
                          initial={{ width: 0 }}
                          animate={{ width: `${engine.reproducibilityScore}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[#00D395]">
                        {engine.reproducibilityScore}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#484F58]">--</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {engine.topStudies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {engine.topStudies.slice(0, 2).map((study, i) => (
                        <span 
                          key={i}
                          className="px-1.5 py-0.5 bg-[#21262D] rounded text-[9px] text-[#8B949E]"
                        >
                          {study}
                        </span>
                      ))}
                      {engine.topStudies.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-[#21262D] rounded text-[9px] text-[#484F58]">
                          +{engine.topStudies.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#484F58]">--</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convergence Footer */}
      <AnimatePresence>
        {allComplete && convergence > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#21262D] overflow-hidden"
          >
            <div className={cn(
              "px-4 py-3 flex items-center justify-between",
              convergence >= 90 
                ? "bg-[#00D395]/10" 
                : convergence >= 75 
                  ? "bg-[#00BCFF]/10"
                  : "bg-[#F7B500]/10"
            )}>
              <div className="flex items-center gap-3">
                {convergence >= 90 ? (
                  <CheckCircle className="w-5 h-5 text-[#00D395]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#F7B500]" />
                )}
                <div>
                  <div className={cn(
                    "text-[11px] font-bold uppercase tracking-wide",
                    convergence >= 90 ? "text-[#00D395]" : "text-[#F7B500]"
                  )}>
                    {convergence >= 90 ? 'Gold Standard Consensus' : 'Partial Consensus'}
                  </div>
                  <div className="text-[10px] text-[#8B949E]">
                    {convergence >= 90 
                      ? 'High reproducibility confirmed across all engines' 
                      : 'Review methodology for potential bias'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-2xl font-bold font-mono",
                  convergence >= 90 ? "text-[#00D395]" : "text-[#F7B500]"
                )}>
                  {convergence}%
                </div>
                <div className="text-[9px] text-[#484F58] uppercase">Convergence</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
