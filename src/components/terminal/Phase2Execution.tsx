import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, CheckCircle, Clock, Play, Sparkles,
  Search, FileText, BarChart3, Award, Star
} from 'lucide-react';
import { AnimatedStudyCounter } from './AnimatedStudyCounter';
import { RealtimeForestPlot } from './RealtimeForestPlot';
import { RealtimePRISMAFlow } from './RealtimePRISMAFlow';

interface Phase2Agent {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  content?: string;
  metadata?: Record<string, unknown>;
}

interface Phase2ExecutionProps {
  isActive: boolean;
  completedAgents: Set<number>;
  agentOutputs: Record<number, string>;
  agentMetadata: Record<number, Record<string, unknown>>;
  onComplete?: () => void;
}

const PHASE_2_AGENTS: Omit<Phase2Agent, 'status'>[] = [
  { id: 9, name: 'PRISMA Navigator', description: 'Ejecuta flujo PRISMA 2020' },
  { id: 10, name: 'Data Extractor', description: 'Extrae datos de estudios' },
  { id: 11, name: 'Quality Auditor', description: 'Evalúa calidad metodológica' },
  { id: 12, name: 'Meta-Analyst', description: 'Ejecuta meta-análisis' },
  { id: 13, name: 'Evidence Grader', description: 'Califica evidencia GRADE' },
  { id: 14, name: 'Report Generator', description: 'Genera dossier final' },
];

const COLORS = {
  azulInstitucional: '#1B4D7A',
  verdeMedico: '#2E7D6B',
  grisTexto: '#333333',
  grisClaro: '#E5E7EB',
};

export function Phase2Execution({ 
  isActive, 
  completedAgents, 
  agentOutputs, 
  agentMetadata,
  onComplete 
}: Phase2ExecutionProps) {
  const [agents, setAgents] = useState<Phase2Agent[]>(
    PHASE_2_AGENTS.map(a => ({ ...a, status: 'pending' as const }))
  );

  // Update agent statuses based on completedAgents set
  useEffect(() => {
    setAgents(prev => prev.map(agent => {
      if (completedAgents.has(agent.id)) {
        return { ...agent, status: 'completed', content: agentOutputs[agent.id] };
      }
      // Mark next pending agent as processing if previous is done
      const prevCompleted = agent.id === 9 || completedAgents.has(agent.id - 1);
      if (prevCompleted && !completedAgents.has(agent.id)) {
        return { ...agent, status: 'processing' };
      }
      return { ...agent, status: 'pending' };
    }));

    // Check if all Phase 2 agents are complete
    const phase2Complete = [9, 10, 11, 12, 13, 14].every(id => completedAgents.has(id));
    if (phase2Complete) {
      onComplete?.();
    }
  }, [completedAgents, agentOutputs]);

  if (!isActive) return null;

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const progress = (completedCount / 6) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Phase 2 Header */}
      <div className="rounded-2xl border-2 bg-white shadow-lg overflow-hidden" style={{ borderColor: COLORS.azulInstitucional }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: COLORS.azulInstitucional }}>
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Fase 2: Ejecución Científica</h2>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <Loader2 className={`w-4 h-4 text-white ${completedCount < 6 ? 'animate-spin' : ''}`} />
            <span className="text-white font-semibold text-sm">{completedCount}/6 agentes</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-3 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.grisClaro }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: COLORS.verdeMedico }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: COLORS.verdeMedico }}>{Math.round(progress)}%</span>
          </div>
          
          {/* Agent Status Row */}
          <div className="flex items-center gap-2 mt-3">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium"
                style={{
                  borderColor: agent.status === 'completed' ? COLORS.verdeMedico 
                    : agent.status === 'processing' ? COLORS.azulInstitucional : COLORS.grisClaro,
                  backgroundColor: agent.status === 'completed' ? '#ECFDF5' 
                    : agent.status === 'processing' ? '#EBF5FF' : '#F9FAFB',
                  color: agent.status === 'completed' ? COLORS.verdeMedico 
                    : agent.status === 'processing' ? COLORS.azulInstitucional : '#9CA3AF',
                }}
              >
                {agent.status === 'pending' && <Clock className="w-3 h-3" />}
                {agent.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                {agent.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                <span>{agent.id}. {agent.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent 9: Animated Study Counter */}
      <AnimatePresence>
        {(completedAgents.has(9) || agents.find(a => a.id === 9)?.status === 'processing') && (
          <AnimatedStudyCounter
            totalStudies={847}
            isActive={completedAgents.has(9)}
          />
        )}
      </AnimatePresence>

      {/* PRISMA Flow Diagram - fills progressively */}
      <AnimatePresence>
        {completedAgents.has(9) && (
          <RealtimePRISMAFlow completedAgents={completedAgents} />
        )}
      </AnimatePresence>

      {/* Agent 13: Forest Plot */}
      <AnimatePresence>
        {completedAgents.has(13) && (
          <RealtimeForestPlot
            isActive={completedAgents.has(13)}
            metadata={agentMetadata[13]}
          />
        )}
      </AnimatePresence>

      {/* All Complete Badge */}
      {completedCount >= 6 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 bg-white shadow-xl p-8 text-center"
          style={{ borderColor: COLORS.verdeMedico }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-8 h-8" style={{ color: COLORS.verdeMedico }} />
            <h3 className="text-2xl font-bold" style={{ color: COLORS.verdeMedico }}>
              Fase 2 Completada
            </h3>
            <Award className="w-8 h-8" style={{ color: COLORS.verdeMedico }} />
          </div>
          <p className="text-lg" style={{ color: COLORS.grisTexto }}>
            Todos los agentes de ejecución han finalizado. El dossier de evidencia está listo.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
