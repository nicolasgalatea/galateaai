import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, ChevronRight, Play, Pause, Trash2,
  Target, BookOpen, Filter, FlaskConical, Shield, Award,
  CheckCircle, AlertCircle, Clock, Lock, Download, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProtocolNavigator } from './ProtocolNavigator';
import { DocumentEditor } from './DocumentEditor';
import { AgentTerminal } from './AgentTerminal';
import { ConsistencyRadar } from './ConsistencyRadar';
import { MultiAIConsensusGrid } from './MultiAIConsensusGrid';
import { AnimatedPRISMAFlow } from './AnimatedPRISMAFlow';
import './TerminalTheme.css';

// Terminal Log Interface - Compatible with AgentTerminal
export interface TerminalLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'process' | 'system';
  agent?: string;
  message: string;
  data?: Record<string, unknown>;
}

interface IntegratedTerminalViewProps {
  isVisible: boolean;
  ideaInput: string;
  onClose?: () => void;
  onPhase2Unlock?: () => void;
  onComplete?: () => void;
}

// Metformin Search Equations - High fidelity data
const metforminSearchEquations = {
  pubmed: `("Metformin"[MeSH] OR "Metformin"[tw] OR "Glucophage"[tw] OR "Dimethylbiguanide"[tw])
AND ("Alzheimer Disease"[MeSH] OR "Cognitive Dysfunction"[MeSH] OR "Dementia"[MeSH] 
     OR "cognitive decline"[tw] OR "neuroprotection"[tw])
AND ("Diabetes Mellitus, Type 2"[MeSH] OR "type 2 diabetes"[tw])
AND ("Cohort Studies"[MeSH] OR "Randomized Controlled Trial"[pt] OR "longitudinal"[tw])
Filters: Humans, English/Spanish, 2015-2025, Age: 60+ years`,
  embase: `('metformin'/exp OR 'metformin':ti,ab OR 'glucophage':ti,ab)
AND ('alzheimer disease'/exp OR 'dementia'/exp OR 'cognitive defect'/exp 
     OR 'neuroprotection':ti,ab)
AND ('non insulin dependent diabetes mellitus'/exp)
AND ('cohort analysis'/exp OR 'randomized controlled trial'/exp)
AND [2015-2025]/py AND ([english]/lim OR [spanish]/lim)`,
  cochrane: `#1 MeSH descriptor: [Metformin] explode all trees
#2 MeSH descriptor: [Alzheimer Disease] explode all trees
#3 MeSH descriptor: [Cognitive Dysfunction] explode all trees
#4 MeSH descriptor: [Diabetes Mellitus, Type 2] explode all trees
#5 #1 AND (#2 OR #3) AND #4
#6 #5 with Cochrane Library publication date Between Jan 2015 and Dec 2025`,
};

const metforminPICOT = {
  P: 'Adultos ≥60 años con DM2',
  I: 'Metformina (500-2000mg/día)',
  C: 'Otros antidiabéticos orales',
  O: 'Incidencia Alzheimer, MMSE',
  T: 'Seguimiento ≥3 años'
};

export function IntegratedTerminalView({ 
  isVisible, 
  ideaInput,
  onClose,
  onPhase2Unlock,
  onComplete
}: IntegratedTerminalViewProps) {
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [activePhaseId, setActivePhaseId] = useState('1-1');
  const [activeTab, setActiveTab] = useState<'radar' | 'consensus' | 'prisma'>('radar');
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [showGoldStandard, setShowGoldStandard] = useState(false);
  const [isPRISMAAnimating, setIsPRISMAAnimating] = useState(false);
  const [radarMetrics, setRadarMetrics] = useState([
    { label: 'Coherencia', value: 0, maxValue: 100, color: '#00BCFF' },
    { label: 'Ética', value: 0, maxValue: 100, color: '#00D395' },
    { label: 'Evidencia', value: 0, maxValue: 100, color: '#F7B500' },
    { label: 'Rigor', value: 0, maxValue: 100, color: '#9333EA' },
  ]);

  // Add terminal log with latency simulation
  const addTerminalLog = (
    level: TerminalLog['level'],
    message: string,
    agent?: string,
    data?: Record<string, unknown>,
    latencyMs?: number
  ) => {
    const log: TerminalLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      agent: agent?.toUpperCase(),
      message: latencyMs ? `${message} [Latency: ${latencyMs}ms]` : message,
      data
    };
    setTerminalLogs(prev => [...prev, log]);
  };

  // Clear logs
  const clearLogs = () => {
    setTerminalLogs([]);
  };

  // Run the full orchestration with high-fidelity terminal logs
  const runOrchestration = async () => {
    if (isOrchestrating) return;
    
    setIsOrchestrating(true);
    clearLogs();
    setShowGoldStandard(false);
    setActiveTab('radar');

    // System initialization
    addTerminalLog('system', 'Galatea AI Terminal v2.1.0 initialized');
    addTerminalLog('system', `Multi-agent orchestration starting...`);
    addTerminalLog('info', `Input received: "${ideaInput.substring(0, 60)}..."`, 'ORCHESTRATOR');
    await new Promise(r => setTimeout(r, 500));

    // === AGENT 1: PICOT ANALYST ===
    setActivePhaseId('1-5');
    addTerminalLog('info', 'Activando Agente PICOT Analyst...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Extrayendo componentes PICOT del texto de entrada...', 'PICOT', undefined, 245);
    await new Promise(r => setTimeout(r, 1200));
    
    addTerminalLog('process', 'Mapeando estructura P-I-C-O-T a formato estandarizado...', 'PICOT', undefined, 180);
    await new Promise(r => setTimeout(r, 800));
    
    addTerminalLog('success', 'Componentes PICOT extraídos correctamente', 'PICOT', metforminPICOT, 340);
    setRadarMetrics(prev => prev.map(m => m.label === 'Coherencia' ? { ...m, value: 85 } : m));
    await new Promise(r => setTimeout(r, 600));

    // === AGENT 2: LITERATURE SCOUT ===
    setActivePhaseId('1-6');
    addTerminalLog('info', 'Activando Agente Literature Scout...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Consultando base de datos de revisiones sistemáticas previas...', 'LITERATURE', undefined, 890);
    await new Promise(r => setTimeout(r, 1500));
    
    addTerminalLog('process', 'Analizando meta-análisis existentes sobre Metformina-Alzheimer...', 'LITERATURE', undefined, 1240);
    await new Promise(r => setTimeout(r, 1200));
    
    addTerminalLog('warning', 'Detectados 5 gaps de evidencia significativos', 'LITERATURE', {
      gap_1: 'Mecanismo neuroprotector no caracterizado',
      gap_2: 'Dosis óptima para efecto cognitivo no establecida',
      gap_3: 'Heterogeneidad en definiciones de deterioro cognitivo',
      gap_4: 'Falta de estudios con biomarcadores de amiloide',
      gap_5: 'Poblaciones asiáticas subrepresentadas'
    }, 456);
    setRadarMetrics(prev => prev.map(m => m.label === 'Evidencia' ? { ...m, value: 72 } : m));
    await new Promise(r => setTimeout(r, 800));

    // === AGENT 3: CRITERIA DESIGNER ===
    setActivePhaseId('1-7');
    addTerminalLog('info', 'Activando Agente Criteria Designer...', 'CRITERIA');
    addTerminalLog('process', 'Generando criterios de elegibilidad basados en PICOT...', 'CRITERIA', undefined, 320);
    await new Promise(r => setTimeout(r, 1000));
    
    addTerminalLog('process', 'Aplicando filtros metodológicos Cochrane Handbook v6.3...', 'CRITERIA', undefined, 445);
    await new Promise(r => setTimeout(r, 800));
    
    addTerminalLog('success', 'Tabla de criterios I/E generada', 'CRITERIA', {
      inclusion: ['Adultos ≥60y DM2', 'Metformina ≥12 meses', 'MMSE/MoCA evaluación', 'RCT o cohortes', 'Seguimiento ≥2 años'],
      exclusion: ['Demencia preexistente', 'Insulina primera línea', 'ERC IV-V', 'Estudios transversales', 'Sin grupo comparador']
    }, 280);
    setRadarMetrics(prev => prev.map(m => m.label === 'Rigor' ? { ...m, value: 91 } : m));
    await new Promise(r => setTimeout(r, 600));

    // === AGENT 4: YADAV STRATEGIST (THE KEY AGENT - Agent 7) ===
    setActivePhaseId('1-8');
    addTerminalLog('info', 'Activando Agente Yadav Strategist (Agente 7)...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Iniciando mapeo de descriptores MeSH/Emtree...', 'YADAV', undefined, 520);
    await new Promise(r => setTimeout(r, 1200));
    
    addTerminalLog('process', 'Aplicando método Yadav 2025 de dos capas...', 'YADAV', undefined, 380);
    addTerminalLog('process', 'Capa 1: Términos controlados (thesaurus) → [MeSH]/[Emtree]', 'YADAV', undefined, 290);
    addTerminalLog('process', 'Capa 2: Términos de texto libre → [tw]/[ti,ab]', 'YADAV', undefined, 310);
    await new Promise(r => setTimeout(r, 1500));
    
    addTerminalLog('process', 'Construyendo ecuaciones con operadores booleanos...', 'YADAV', undefined, 445);
    await new Promise(r => setTimeout(r, 800));

    // Show the complete PubMed query in terminal
    addTerminalLog('success', 'Query PubMed generada (Método Yadav 2025):', 'YADAV', {
      database: 'PubMed/MEDLINE',
      query: metforminSearchEquations.pubmed,
      operators: ['MeSH', 'tw', 'pt', 'AND', 'OR'],
      filters: 'Humans, English/Spanish, 2015-2025, Age: 60+'
    }, 680);
    await new Promise(r => setTimeout(r, 500));

    addTerminalLog('success', 'Query Embase generada:', 'YADAV', {
      database: 'Embase',
      query: metforminSearchEquations.embase,
      operators: ['/exp', ':ti,ab', '/py', '/lim']
    }, 520);
    await new Promise(r => setTimeout(r, 400));

    addTerminalLog('success', 'Query Cochrane generada:', 'YADAV', {
      database: 'Cochrane Library',
      query: metforminSearchEquations.cochrane,
      operators: ['MeSH descriptor', 'explode all trees', 'AND', 'OR']
    }, 390);
    await new Promise(r => setTimeout(r, 400));

    addTerminalLog('success', 'Sintaxis validada - 4 bases de datos configuradas', 'YADAV');
    setRadarMetrics(prev => prev.map(m => m.label === 'Ética' ? { ...m, value: 88 } : m));
    
    // Phase 1 Complete
    await new Promise(r => setTimeout(r, 600));
    addTerminalLog('success', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    addTerminalLog('success', 'FASE 1 COMPLETADA - Protocolo generado con éxito', 'ORCHESTRATOR');
    addTerminalLog('info', 'Iniciando validación Multi-AI Consensus...', 'ORCHESTRATOR');
    
    // Switch to consensus tab and run validation
    setActiveTab('consensus');
    await new Promise(r => setTimeout(r, 1000));
    
    // Simulate Multi-AI validation
    addTerminalLog('process', 'Ejecutando triple validación independiente...', 'CONSENSUS');
    addTerminalLog('process', 'Motor 1: Galatea AI analizando ecuación...', 'GALATEA', undefined, 1240);
    await new Promise(r => setTimeout(r, 1500));
    addTerminalLog('success', 'Galatea: 342 artículos identificados', 'GALATEA', undefined, 890);
    
    addTerminalLog('process', 'Motor 2: Audit GPT analizando ecuación...', 'GPT', undefined, 1680);
    await new Promise(r => setTimeout(r, 1500));
    addTerminalLog('success', 'GPT: 338 artículos identificados', 'GPT', undefined, 1450);
    
    addTerminalLog('process', 'Motor 3: Audit Gemini analizando ecuación...', 'GEMINI', undefined, 1120);
    await new Promise(r => setTimeout(r, 1200));
    addTerminalLog('success', 'Gemini: 345 artículos identificados', 'GEMINI', undefined, 980);
    
    // Calculate convergence
    await new Promise(r => setTimeout(r, 500));
    addTerminalLog('success', 'Convergencia calculada: 94.2%', 'CONSENSUS', {
      galatea: 342,
      gpt: 338,
      gemini: 345,
      overlap: 325,
      convergence: '94.2%'
    });
    
    // Show Gold Standard badge
    setShowGoldStandard(true);
    addTerminalLog('success', '★ GOLD STANDARD CONSENSUS: HIGH REPRODUCIBILITY ★', 'CONSENSUS');
    addTerminalLog('info', 'Protocolo listo para aprobación → Fase 2', 'ORCHESTRATOR');
    
    setIsOrchestrating(false);
    onComplete?.();
  };

  // Trigger PRISMA animation (Phase 2)
  const triggerPRISMA = () => {
    setActiveTab('prisma');
    setIsPRISMAAnimating(true);
    addTerminalLog('info', 'Iniciando flujo PRISMA dinámico...', 'PRISMA');
    addTerminalLog('process', 'Animando cribado de artículos...', 'PRISMA');
  };

  // Handle PRISMA completion
  const handlePRISMAComplete = () => {
    setIsPRISMAAnimating(false);
    addTerminalLog('success', 'Flujo PRISMA completado - 12 estudios en meta-análisis', 'PRISMA');
    onPhase2Unlock?.();
  };

  // Auto-start orchestration when visible
  useEffect(() => {
    if (isVisible && terminalLogs.length === 0) {
      runOrchestration();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 terminal-theme"
      style={{ background: '#0A0E14' }}
    >
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[#00BCFF]" />
            <span className="text-sm font-semibold text-[#E6EDF3]">
              Galatea AI Terminal — Clinical Guideline Navigator
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00D395] animate-pulse" />
            <span className="text-xs text-[#8B949E]">CONNECTED</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1 text-xs text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] rounded transition-colors"
            >
              Exit Terminal
            </button>
          )}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex h-[calc(100vh-96px)]">
        {/* Left Panel - Protocol Navigator */}
        <div className="w-64 border-r border-[#21262D]">
          <ProtocolNavigator 
            activePhaseId={activePhaseId} 
            onPhaseSelect={setActivePhaseId} 
          />
        </div>

        {/* Center Panel - Document Editor */}
        <div className="flex-1 border-r border-[#21262D]">
          <DocumentEditor />
        </div>

        {/* Right Panel - Widgets + Terminal */}
        <div className="w-[480px] flex flex-col">
          {/* Widget Tabs */}
          <div className="flex border-b border-[#21262D] bg-[#161B22]">
            {[
              { id: 'radar', label: 'Radar' },
              { id: 'consensus', label: 'Consensus' },
              { id: 'prisma', label: 'PRISMA' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                  activeTab === tab.id
                    ? "text-[#00BCFF] border-b-2 border-[#00BCFF] bg-[#21262D]/50"
                    : "text-[#8B949E] hover:text-[#E6EDF3]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Widget Content */}
          <div className="h-64 overflow-hidden bg-[#0D1117]">
            <AnimatePresence mode="wait">
              {activeTab === 'radar' && (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <ConsistencyRadar metrics={radarMetrics} />
                </motion.div>
              )}
              {activeTab === 'consensus' && (
                <motion.div
                  key="consensus"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full overflow-auto"
                >
                  <MultiAIConsensusGrid />
                  
                  {/* Gold Standard Badge */}
                  <AnimatePresence>
                    {showGoldStandard && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mx-3 mb-3"
                      >
                        <div 
                          className="p-4 rounded-lg border-2 text-center"
                          style={{
                            background: 'rgba(0, 211, 149, 0.1)',
                            borderColor: '#00D395',
                            boxShadow: '0 0 30px rgba(0, 211, 149, 0.3)'
                          }}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Award className="w-6 h-6 text-[#00D395]" />
                            <span className="text-lg font-bold text-[#00D395] animate-pulse">
                              GOLD STANDARD CONSENSUS
                            </span>
                            <Award className="w-6 h-6 text-[#00D395]" />
                          </div>
                          <div className="text-sm text-[#00D395]/80">
                            HIGH REPRODUCIBILITY — Triple AI Validation Passed
                          </div>
                          <button
                            onClick={triggerPRISMA}
                            className="mt-3 px-6 py-2 bg-[#00D395] text-[#0A0E14] font-semibold rounded-lg hover:bg-[#00D395]/90 transition-colors flex items-center gap-2 mx-auto"
                          >
                            <Play className="w-4 h-4" />
                            Aprobar Protocolo → PRISMA
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {activeTab === 'prisma' && (
                <motion.div
                  key="prisma"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <AnimatedPRISMAFlow 
                    isAnimating={isPRISMAAnimating} 
                    onComplete={handlePRISMAComplete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agent Terminal */}
          <div className="flex-1 border-t border-[#21262D]">
            <AgentTerminal 
              logs={terminalLogs}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused(!isPaused)}
              onClear={clearLogs}
            />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-8 flex items-center justify-between px-4 bg-[#161B22] border-t border-[#21262D] text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D395]" />
            <span className="text-[#8B949E]">4 Agents Active</span>
          </div>
          <div className="text-[#484F58]">|</div>
          <span className="text-[#8B949E]">
            Phase: <span className="text-[#00BCFF]">{activePhaseId}</span>
          </span>
          <div className="text-[#484F58]">|</div>
          <span className="text-[#8B949E]">
            Logs: <span className="text-[#E6EDF3]">{terminalLogs.length}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262D]">
            <Shield className="w-3 h-3 text-[#00D395]" />
            <span className="text-[#8B949E]">ICH-GCP</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262D]">
            <Shield className="w-3 h-3 text-[#00D395]" />
            <span className="text-[#8B949E]">PRISMA 2020</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262D]">
            <Zap className="w-3 h-3 text-[#F7B500]" />
            <span className="text-[#8B949E]">Yadav 2025</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
