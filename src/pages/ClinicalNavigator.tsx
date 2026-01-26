import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal as TerminalIcon, ChevronRight, Download, Award,
  Target, BookOpen, Filter, FlaskConical, Shield, CheckCircle, 
  AlertCircle, Clock, Brain, Microscope, Database, Activity,
  FileText, Zap, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PDFReportViewer } from '@/components/terminal';
import { useToast } from '@/hooks/use-toast';
import '@/components/terminal/TerminalTheme.css';

// 14 Agents Configuration
const agents = [
  // Phase 1: Protocol Rigor (Agents 1-8)
  { id: 1, name: 'PICOT Analyst', phase: 1, icon: Target, color: '#DC2626', role: 'Estructuración de pregunta clínica' },
  { id: 2, name: 'FINER Validator', phase: 1, icon: CheckCircle, color: '#00D395', role: 'Validación de factibilidad' },
  { id: 3, name: 'Literature Scout', phase: 1, icon: BookOpen, color: '#0033A0', role: 'Identificación de gaps de evidencia' },
  { id: 4, name: 'Criteria Designer', phase: 1, icon: Filter, color: '#00A651', role: 'Diseño de criterios I/E' },
  { id: 5, name: 'PROSPERO Checker', phase: 1, icon: Shield, color: '#F7B500', role: 'Verificación de duplicación' },
  { id: 6, name: 'Bias Assessor', phase: 1, icon: AlertCircle, color: '#FF4757', role: 'Evaluación de riesgo de sesgo' },
  { id: 7, name: 'Yadav Strategist', phase: 1, icon: FlaskConical, color: '#6B21A8', role: 'Sintaxis de búsqueda multicapa' },
  { id: 8, name: 'Protocol Architect', phase: 1, icon: FileText, color: '#00BCFF', role: 'Consolidación de protocolo final' },
  
  // Phase 2: Scientific Action (Agents 9-14)
  { id: 9, name: 'PRISMA Navigator', phase: 2, icon: Activity, color: '#00D395', role: 'Flujo de selección de estudios' },
  { id: 10, name: 'Data Extractor', phase: 2, icon: Database, color: '#00BCFF', role: 'Extracción estructurada de datos' },
  { id: 11, name: 'Quality Auditor', phase: 2, icon: Shield, color: '#F7B500', role: 'Evaluación de calidad metodológica' },
  { id: 12, name: 'Meta-Analyst', phase: 2, icon: Brain, color: '#9333EA', role: 'Síntesis cuantitativa' },
  { id: 13, name: 'Evidence Grader', phase: 2, icon: Award, color: '#00D395', role: 'Clasificación GRADE de evidencia' },
  { id: 14, name: 'Report Generator', phase: 2, icon: Microscope, color: '#DC2626', role: 'Generación de dossier final' },
];

// Demo Research Question
const DEMO_QUESTION = "¿Cuál es la eficacia de los inhibidores SGLT2 en insuficiencia cardíaca con fracción de eyección preservada comparado con placebo?";

// SGLT2 specific data for demo
const sglt2PICOT = {
  P: 'Adultos ≥18 años con IC-FEP (FEVI ≥50%)',
  I: 'Inhibidores SGLT2 (Empagliflozina, Dapagliflozina)',
  C: 'Placebo',
  O: 'Hospitalización por IC, mortalidad CV, calidad de vida',
  T: 'Seguimiento ≥12 meses'
};

const sglt2SearchEquations = {
  pubmed: `("Sodium-Glucose Transporter 2 Inhibitors"[MeSH] OR "SGLT2 inhibitor*"[tw] OR "Empagliflozin"[tw] OR "Dapagliflozin"[tw] OR "Canagliflozin"[tw])
AND ("Heart Failure"[MeSH] OR "heart failure"[tw] OR "cardiac failure"[tw])
AND ("preserved ejection fraction"[tw] OR "HFpEF"[tw] OR "diastolic dysfunction"[tw])
AND ("Randomized Controlled Trial"[pt] OR "Clinical Trial"[pt])
Filters: Humans, English, 2018-2025`,
  embase: `('sodium glucose cotransporter 2 inhibitor'/exp OR 'empagliflozin':ti,ab OR 'dapagliflozin':ti,ab)
AND ('heart failure'/exp OR 'cardiac insufficiency':ti,ab)
AND ('preserved ejection fraction':ti,ab OR 'HFpEF':ti,ab)
AND ('randomized controlled trial'/exp OR 'clinical trial'/exp)
AND [2018-2025]/py`,
};

interface TerminalLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'process' | 'system';
  agent?: string;
  message: string;
  data?: Record<string, unknown>;
}

interface AgentState {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  output?: string;
  latencyMs?: number;
}

export default function ClinicalNavigator() {
  const { toast } = useToast();
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    agents.map(a => ({ id: a.id, status: 'pending' }))
  );
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showDossierPDF, setShowDossierPDF] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Add terminal log
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

  // Update agent state
  const updateAgentState = (agentId: number, status: AgentState['status'], output?: string, latencyMs?: number) => {
    setAgentStates(prev => prev.map(a => 
      a.id === agentId ? { ...a, status, output, latencyMs } : a
    ));
  };

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Run the full 14-agent orchestration
  const runOrchestration = async () => {
    if (isOrchestrating) return;
    
    setIsOrchestrating(true);
    setTerminalLogs([]);
    setIsComplete(false);
    setCurrentPhase(1);

    // System initialization
    addTerminalLog('system', 'Galatea AI Clinical Navigator v2.1.0 initialized');
    addTerminalLog('system', 'Multi-agent orchestration starting with 14 specialized agents...');
    addTerminalLog('info', `Input: "${DEMO_QUESTION}"`, 'ORCHESTRATOR');
    await new Promise(r => setTimeout(r, 800));

    // === PHASE 1: PROTOCOL RIGOR (Agents 1-8) ===
    addTerminalLog('info', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    addTerminalLog('info', 'FASE 1: RIGOR DEL PROTOCOLO - Iniciando Agentes 1-8', 'ORCHESTRATOR');
    addTerminalLog('info', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    await new Promise(r => setTimeout(r, 500));

    // Agent 1: PICOT Analyst
    updateAgentState(1, 'processing');
    addTerminalLog('info', 'Activando Agente 01: PICOT Analyst...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Extrayendo componentes PICOT del texto de entrada...', 'PICOT', undefined, 245);
    await new Promise(r => setTimeout(r, 1500));
    addTerminalLog('success', 'Componentes PICOT extraídos correctamente', 'PICOT', sglt2PICOT, 340);
    updateAgentState(1, 'completed', 'Marco PICOT estructurado para SGLT2/HFpEF', 340);
    await new Promise(r => setTimeout(r, 400));

    // Agent 2: FINER Validator
    updateAgentState(2, 'processing');
    addTerminalLog('info', 'Activando Agente 02: FINER Validator...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Evaluando criterios Feasible-Interesting-Novel-Ethical-Relevant...', 'FINER', undefined, 320);
    await new Promise(r => setTimeout(r, 1200));
    addTerminalLog('success', 'Pregunta validada: Alta relevancia clínica detectada', 'FINER', {
      feasible: '92%',
      interesting: '95%',
      novel: '88%',
      ethical: '100%',
      relevant: '97%'
    }, 280);
    updateAgentState(2, 'completed', 'Puntuación FINER: 94.4%', 280);
    await new Promise(r => setTimeout(r, 400));

    // Agent 3: Literature Scout
    updateAgentState(3, 'processing');
    addTerminalLog('info', 'Activando Agente 03: Literature Scout...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Consultando Cochrane, PubMed y Embase para revisiones previas...', 'LITERATURE', undefined, 890);
    await new Promise(r => setTimeout(r, 1800));
    addTerminalLog('warning', 'Detectados 4 gaps de evidencia significativos', 'LITERATURE', {
      gap_1: 'Subgrupos de edad >75 años poco representados',
      gap_2: 'Comparación directa entre SGLT2i no disponible',
      gap_3: 'Datos limitados en IC-FEP con FEVI 40-49%',
      gap_4: 'Seguimiento a largo plazo (>3 años) escaso'
    }, 1240);
    updateAgentState(3, 'completed', '4 gaps de evidencia identificados', 1240);
    await new Promise(r => setTimeout(r, 400));

    // Agent 4: Criteria Designer
    updateAgentState(4, 'processing');
    addTerminalLog('info', 'Activando Agente 04: Criteria Designer...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Generando criterios de elegibilidad basados en PICOT...', 'CRITERIA', undefined, 445);
    await new Promise(r => setTimeout(r, 1400));
    addTerminalLog('success', 'Tabla de criterios I/E generada', 'CRITERIA', {
      inclusion: ['Adultos ≥18 años', 'IC-FEP con FEVI ≥50%', 'SGLT2i ≥6 meses', 'RCT o cohortes', 'Seguimiento ≥12 meses'],
      exclusion: ['IC-FEr previa', 'ERC estadio V', 'DM tipo 1', 'Ensayos no aleatorizados']
    }, 380);
    updateAgentState(4, 'completed', 'Criterios I/E validados por Cochrane Handbook', 380);
    await new Promise(r => setTimeout(r, 400));

    // Agent 5: PROSPERO Checker
    updateAgentState(5, 'processing');
    addTerminalLog('info', 'Activando Agente 05: PROSPERO Checker...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Buscando duplicados en registro PROSPERO...', 'PROSPERO', undefined, 1560);
    await new Promise(r => setTimeout(r, 1600));
    addTerminalLog('success', 'Sin duplicados detectados - Registro recomendado', 'PROSPERO', {
      registrosAnalizados: 2847,
      similares: 3,
      duplicados: 0
    }, 890);
    updateAgentState(5, 'completed', 'No hay duplicados en PROSPERO', 890);
    await new Promise(r => setTimeout(r, 400));

    // Agent 6: Bias Assessor
    updateAgentState(6, 'processing');
    addTerminalLog('info', 'Activando Agente 06: Bias Assessor...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Evaluando riesgo de sesgo potencial en diseño...', 'BIAS', undefined, 520);
    await new Promise(r => setTimeout(r, 1300));
    addTerminalLog('warning', 'Riesgo moderado de sesgo de publicación identificado', 'BIAS', {
      seleccion: 'Bajo',
      desempeño: 'Bajo',
      deteccion: 'Bajo',
      desgaste: 'Moderado',
      reporte: 'Moderado'
    }, 680);
    updateAgentState(6, 'completed', 'Riesgo global: Moderado (requiere análisis de sensibilidad)', 680);
    await new Promise(r => setTimeout(r, 400));

    // Agent 7: Yadav Strategist (THE KEY AGENT)
    updateAgentState(7, 'processing');
    addTerminalLog('info', 'Activando Agente 07: Yadav Strategist...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Iniciando mapeo de descriptores MeSH/Emtree...', 'YADAV', undefined, 520);
    await new Promise(r => setTimeout(r, 1000));
    addTerminalLog('process', 'Aplicando método Yadav 2025 de dos capas...', 'YADAV', undefined, 380);
    addTerminalLog('process', 'Capa 1: Términos controlados (thesaurus) → [MeSH]/[Emtree]', 'YADAV', undefined, 290);
    addTerminalLog('process', 'Capa 2: Términos de texto libre → [tw]/[ti,ab]', 'YADAV', undefined, 310);
    await new Promise(r => setTimeout(r, 1500));
    addTerminalLog('success', 'Query PubMed generada (Método Yadav 2025):', 'YADAV', {
      database: 'PubMed/MEDLINE',
      query: sglt2SearchEquations.pubmed,
      operators: ['MeSH', 'tw', 'pt', 'AND', 'OR']
    }, 680);
    await new Promise(r => setTimeout(r, 500));
    addTerminalLog('success', 'Query Embase generada:', 'YADAV', {
      database: 'Embase',
      query: sglt2SearchEquations.embase
    }, 520);
    updateAgentState(7, 'completed', 'Sintaxis validada - 5 bases de datos configuradas', 680);
    await new Promise(r => setTimeout(r, 400));

    // Agent 8: Protocol Architect
    updateAgentState(8, 'processing');
    addTerminalLog('info', 'Activando Agente 08: Protocol Architect...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Consolidando protocolo final con 17 secciones...', 'ARCHITECT', undefined, 890);
    await new Promise(r => setTimeout(r, 1600));
    addTerminalLog('success', 'Protocolo PROSPERO-ready generado', 'ARCHITECT', {
      secciones: 17,
      cumplimiento: '100%',
      estado: 'LISTO PARA COMITÉ'
    }, 1120);
    updateAgentState(8, 'completed', 'Protocolo final: 17 secciones, 100% cumplimiento ICH-GCP', 1120);
    await new Promise(r => setTimeout(r, 600));

    // Phase 1 Complete
    addTerminalLog('success', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    addTerminalLog('success', 'FASE 1 COMPLETADA - Protocolo aprobado automáticamente', 'ORCHESTRATOR');
    await new Promise(r => setTimeout(r, 800));

    // === PHASE 2: SCIENTIFIC ACTION (Agents 9-14) ===
    setCurrentPhase(2);
    addTerminalLog('info', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    addTerminalLog('info', 'FASE 2: EJECUCIÓN CIENTÍFICA - Iniciando Agentes 9-14', 'ORCHESTRATOR');
    addTerminalLog('info', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    await new Promise(r => setTimeout(r, 500));

    // Agent 9: PRISMA Navigator
    updateAgentState(9, 'processing');
    addTerminalLog('info', 'Activando Agente 09: PRISMA Navigator...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Ejecutando búsqueda en 5 bases de datos...', 'PRISMA', undefined, 2340);
    await new Promise(r => setTimeout(r, 2000));
    addTerminalLog('process', 'Filtrando 2,847 registros iniciales...', 'PRISMA', undefined, 1560);
    await new Promise(r => setTimeout(r, 1500));
    addTerminalLog('success', 'Flujo PRISMA completado', 'PRISMA', {
      identificados: 2847,
      duplicados: 892,
      cribados: 1955,
      textoCompleto: 127,
      incluidos: 24,
      metaAnalisis: 18
    }, 890);
    updateAgentState(9, 'completed', '18 estudios incluidos en meta-análisis final', 890);
    await new Promise(r => setTimeout(r, 400));

    // Agent 10: Data Extractor
    updateAgentState(10, 'processing');
    addTerminalLog('info', 'Activando Agente 10: Data Extractor...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Extrayendo datos de 18 estudios incluidos...', 'EXTRACTOR', undefined, 3200);
    await new Promise(r => setTimeout(r, 2500));
    addTerminalLog('success', 'Datos extraídos con referencias PMID', 'EXTRACTOR', {
      estudios: [
        { pmid: '32456127', autor: 'Anker SD et al.', estudio: 'EMPEROR-Preserved', n: 5988, hr: 0.79 },
        { pmid: '34170564', autor: 'Solomon SD et al.', estudio: 'DELIVER', n: 6263, hr: 0.82 },
        { pmid: '35363499', autor: 'Vaduganathan M et al.', estudio: 'Pooled Analysis', n: 12251, hr: 0.80 }
      ]
    }, 1680);
    updateAgentState(10, 'completed', '18 estudios extraídos con PMIDs verificados', 1680);
    await new Promise(r => setTimeout(r, 400));

    // Agent 11: Quality Auditor
    updateAgentState(11, 'processing');
    addTerminalLog('info', 'Activando Agente 11: Quality Auditor...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Aplicando herramienta Cochrane RoB 2.0...', 'QUALITY', undefined, 1890);
    await new Promise(r => setTimeout(r, 1800));
    addTerminalLog('success', 'Evaluación de calidad completada', 'QUALITY', {
      bajoRiesgo: 14,
      moderadoRiesgo: 3,
      altoRiesgo: 1,
      promedioGeneral: 'Bajo riesgo de sesgo'
    }, 920);
    updateAgentState(11, 'completed', '78% de estudios con bajo riesgo de sesgo', 920);
    await new Promise(r => setTimeout(r, 400));

    // Agent 12: Meta-Analyst
    updateAgentState(12, 'processing');
    addTerminalLog('info', 'Activando Agente 12: Meta-Analyst...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Ejecutando modelo de efectos aleatorios (DerSimonian-Laird)...', 'META', undefined, 2450);
    await new Promise(r => setTimeout(r, 2200));
    addTerminalLog('success', 'Meta-análisis completado', 'META', {
      efectoCombinado: 'HR 0.80 (IC 95%: 0.73-0.87)',
      heterogeneidad: 'I² = 18% (baja)',
      pValor: 'p < 0.001',
      NNT: 21
    }, 1340);
    updateAgentState(12, 'completed', 'HR 0.80 (0.73-0.87), p<0.001, I²=18%', 1340);
    await new Promise(r => setTimeout(r, 400));

    // Agent 13: Evidence Grader
    updateAgentState(13, 'processing');
    addTerminalLog('info', 'Activando Agente 13: Evidence Grader...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Aplicando metodología GRADE...', 'GRADE', undefined, 1560);
    await new Promise(r => setTimeout(r, 1600));
    addTerminalLog('success', 'Clasificación GRADE completada', 'GRADE', {
      certeza: 'ALTA',
      dominios: {
        riesgoSesgo: 'Sin downgrade',
        inconsistencia: 'Sin downgrade',
        imprecision: 'Sin downgrade',
        indirectness: 'Sin downgrade',
        publicationBias: 'Sin downgrade'
      }
    }, 890);
    updateAgentState(13, 'completed', 'Certeza GRADE: ALTA ⭐⭐⭐⭐', 890);
    await new Promise(r => setTimeout(r, 400));

    // Agent 14: Report Generator
    updateAgentState(14, 'processing');
    addTerminalLog('info', 'Activando Agente 14: Report Generator...', 'ORCHESTRATOR');
    addTerminalLog('process', 'Compilando Dossier de Evidencia Científica...', 'REPORT', undefined, 2890);
    await new Promise(r => setTimeout(r, 2500));
    addTerminalLog('success', 'Dossier de Evidencia generado exitosamente', 'REPORT', {
      paginas: 47,
      secciones: 12,
      figuras: 8,
      tablas: 15,
      referencias: 127
    }, 1890);
    updateAgentState(14, 'completed', 'Dossier listo: 47 páginas, 12 secciones', 1890);
    await new Promise(r => setTimeout(r, 600));

    // Final completion
    addTerminalLog('success', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    addTerminalLog('success', '★ ORQUESTACIÓN COMPLETADA - 14/14 AGENTES EXITOSOS ★', 'ORCHESTRATOR');
    addTerminalLog('success', '═══════════════════════════════════════════════════════════', 'ORCHESTRATOR');
    addTerminalLog('info', 'Dossier de Evidencia listo para descarga', 'ORCHESTRATOR');
    
    setIsOrchestrating(false);
    setIsComplete(true);
    
    toast({
      title: '✅ Orquestación Completada',
      description: 'Los 14 agentes han procesado exitosamente. Dossier disponible.',
    });
  };

  // Auto-start on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      // Small delay to allow UI to render
      setTimeout(() => {
        runOrchestration();
      }, 500);
    }
  }, []);

  const getLogColor = (level: TerminalLog['level']) => {
    switch (level) {
      case 'success': return '#00D395';
      case 'warning': return '#F7B500';
      case 'error': return '#FF4757';
      case 'process': return '#00BCFF';
      case 'system': return '#8B949E';
      default: return '#E6EDF3';
    }
  };

  return (
    <div className="min-h-screen terminal-theme" style={{ background: '#0A0E14' }}>
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-6 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex items-center gap-3">
            <TerminalIcon className="w-5 h-5 text-[#00BCFF]" />
            <span className="text-lg font-semibold text-[#E6EDF3]">
              Clinical Guideline Navigator
            </span>
            <span className="px-2 py-0.5 bg-[#00BCFF]/20 text-[#00BCFF] rounded text-xs font-bold">
              14-AGENT ORCHESTRATION
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isOrchestrating ? "bg-[#F7B500] animate-pulse" : isComplete ? "bg-[#00D395]" : "bg-[#8B949E]"
            )} />
            <span className="text-sm text-[#8B949E]">
              {isOrchestrating ? 'PROCESSING' : isComplete ? 'COMPLETE' : 'READY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Left Panel - Agent Status */}
        <div className="w-80 border-r border-[#21262D] overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider mb-2">
              Fase {currentPhase}: {currentPhase === 1 ? 'Rigor del Protocolo' : 'Ejecución Científica'}
            </h2>
            <div className="text-xs text-[#8B949E]">
              {agentStates.filter(a => a.status === 'completed').length} / 14 agentes completados
            </div>
          </div>

          <div className="space-y-2">
            {agents.map(agent => {
              const state = agentStates.find(s => s.id === agent.id);
              const Icon = agent.icon;
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: agent.id * 0.05 }}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    state?.status === 'processing' 
                      ? "border-[#00BCFF] bg-[#00BCFF]/10 shadow-[0_0_20px_rgba(0,188,255,0.2)]"
                      : state?.status === 'completed'
                      ? "border-[#00D395]/50 bg-[#00D395]/5"
                      : "border-[#21262D] bg-[#0D1117]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={cn(
                        "p-2 rounded-lg",
                        state?.status === 'processing' ? "animate-pulse" : ""
                      )}
                      style={{ 
                        backgroundColor: `${agent.color}20`,
                        color: agent.color 
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#8B949E]">
                          {String(agent.id).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-semibold text-[#E6EDF3] truncate">
                          {agent.name}
                        </span>
                      </div>
                      <div className="text-xs text-[#8B949E] mb-2">
                        {agent.role}
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {state?.status === 'pending' && (
                          <span className="text-[10px] text-[#484F58] uppercase">Pendiente</span>
                        )}
                        {state?.status === 'processing' && (
                          <span className="text-[10px] text-[#00BCFF] uppercase animate-pulse flex items-center gap-1">
                            <Play className="w-3 h-3" /> Procesando...
                          </span>
                        )}
                        {state?.status === 'completed' && (
                          <span className="text-[10px] text-[#00D395] uppercase flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completado
                            {state.latencyMs && (
                              <span className="text-[#8B949E] ml-1">({state.latencyMs}ms)</span>
                            )}
                          </span>
                        )}
                      </div>
                      
                      {/* Output preview */}
                      {state?.output && (
                        <div className="mt-2 text-xs text-[#8B949E] truncate">
                          → {state.output}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Center Panel - Terminal Logs */}
        <div className="flex-1 flex flex-col">
          <div className="h-10 flex items-center px-4 bg-[#161B22] border-b border-[#21262D]">
            <TerminalIcon className="w-4 h-4 text-[#00BCFF] mr-2" />
            <span className="text-sm font-semibold text-[#E6EDF3]">Audit Log Terminal</span>
            <span className="ml-auto text-xs text-[#8B949E]">
              {terminalLogs.length} entries
            </span>
          </div>
          
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm terminal-scroll"
            style={{ background: '#0D1117' }}
          >
            <AnimatePresence>
              {terminalLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mb-2 leading-relaxed"
                >
                  <span className="text-[#484F58] text-xs whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString('es-ES', { hour12: false })}
                  </span>
                  {log.agent && (
                    <span className="text-[#00BCFF] font-bold text-xs min-w-[100px]">
                      [{log.agent}]
                    </span>
                  )}
                  <span style={{ color: getLogColor(log.level) }}>
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isOrchestrating && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-2 text-[#00BCFF] mt-4"
              >
                <Zap className="w-4 h-4" />
                <span>Procesando...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Panel - Research Question & Actions */}
        <div className="w-96 border-l border-[#21262D] flex flex-col">
          <div className="p-4 border-b border-[#21262D]">
            <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider mb-3">
              Pregunta de Investigación
            </h3>
            <div className="p-4 rounded-lg bg-[#0D1117] border border-[#21262D]">
              <p className="text-lg text-[#E6EDF3] leading-relaxed">
                {DEMO_QUESTION}
              </p>
            </div>
          </div>

          {/* PICOT Display */}
          <div className="p-4 border-b border-[#21262D]">
            <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider mb-3">
              Marco PICOT
            </h3>
            <div className="space-y-2">
              {Object.entries(sglt2PICOT).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-lg font-bold text-[#DC2626] w-6">{key}</span>
                  <span className="text-sm text-[#8B949E]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Summary */}
          <div className="p-4 flex-1">
            <h3 className="text-sm font-bold text-[#E6EDF3] uppercase tracking-wider mb-3">
              Resumen de Progreso
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B949E]">Fase 1 (Protocolo)</span>
                <span className="text-sm font-bold" style={{ 
                  color: agentStates.filter(a => a.id <= 8 && a.status === 'completed').length === 8 
                    ? '#00D395' : '#F7B500' 
                }}>
                  {agentStates.filter(a => a.id <= 8 && a.status === 'completed').length}/8
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B949E]">Fase 2 (Ejecución)</span>
                <span className="text-sm font-bold" style={{ 
                  color: agentStates.filter(a => a.id > 8 && a.status === 'completed').length === 6 
                    ? '#00D395' : '#F7B500' 
                }}>
                  {agentStates.filter(a => a.id > 8 && a.status === 'completed').length}/6
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2 bg-[#21262D] rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ 
                    background: 'linear-gradient(90deg, #00BCFF, #00D395)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(agentStates.filter(a => a.status === 'completed').length / 14) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Download Dossier Button */}
          <div className="p-4 border-t border-[#21262D]">
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button
                    onClick={() => setShowDossierPDF(true)}
                    className="w-full h-16 text-lg font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #0033A0, #00BCFF)',
                      boxShadow: '0 0 30px rgba(0, 188, 255, 0.4)'
                    }}
                  >
                    <Download className="w-6 h-6 mr-3" />
                    Descargar Dossier de Evidencia
                  </Button>
                  <p className="text-xs text-center text-[#8B949E] mt-2">
                    47 páginas • 12 secciones • 127 referencias
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PDF Dossier Modal */}
      <PDFReportViewer 
        isOpen={showDossierPDF}
        onClose={() => setShowDossierPDF(false)}
        reportData={{
          title: 'Eficacia de Inhibidores SGLT2 en IC-FEP',
          researchQuestion: DEMO_QUESTION,
          generatedAt: new Date(),
          totalStudies: 2847,
          metaAnalysisStudies: 18,
          validationScore: 94.2,
        }}
      />
    </div>
  );
}
