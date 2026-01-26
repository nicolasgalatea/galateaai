import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Play, Download, ExternalLink, Clock, CheckCircle, 
  Loader2, FileText, BookOpen, Award, ChevronDown, ChevronUp,
  RotateCcw, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import galateaLogo from '@/assets/galatea-logo.png';
import santaFeLogo from '@/assets/logo-santa-fe.png';
import agentAvatar from '@/assets/galatea-agent-avatar.jpg';

// =========================================
// TYPES & INTERFACES
// =========================================
type DemoPhase = 'landing' | 'execution' | 'verification';

interface Agent {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  latency?: number;
  output?: string;
}

interface TerminalLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'process' | 'data';
}

interface Deliverable {
  id: number;
  agentId: number;
  title: string;
  content: string;
  isExpanded: boolean;
}

// =========================================
// CONSTANTS - SANTA FE COLORS
// =========================================
const COLORS = {
  azulInstitucional: '#1B4D7A',
  verdeMedico: '#2E7D6B',
  azulClaro: '#4A90A4',
  fondoTerminal: '#0A1628',
  grisTexto: '#1A1A2E',
};

// =========================================
// 14 AGENTS CONFIGURATION
// =========================================
const AGENTS_CONFIG: Omit<Agent, 'status' | 'latency'>[] = [
  { id: 1, name: 'PICOT Builder', description: 'Estructura la pregunta clínica', output: '' },
  { id: 2, name: 'FINER Validator', description: 'Valida viabilidad del estudio', output: '' },
  { id: 3, name: 'Literature Scout', description: 'Busca revisiones previas', output: '' },
  { id: 4, name: 'Criteria Designer', description: 'Define criterios I/E', output: '' },
  { id: 5, name: 'PROSPERO Checker', description: 'Verifica registro previo', output: '' },
  { id: 6, name: 'Bias Assessor', description: 'Evalúa riesgo de sesgos', output: '' },
  { id: 7, name: 'Yadav Strategist', description: 'Genera ecuaciones de búsqueda', output: '' },
  { id: 8, name: 'Protocol Architect', description: 'Estructura el protocolo', output: '' },
  { id: 9, name: 'PRISMA Navigator', description: 'Ejecuta flujo PRISMA 2020', output: '' },
  { id: 10, name: 'Data Extractor', description: 'Extrae datos de estudios', output: '' },
  { id: 11, name: 'Quality Auditor', description: 'Evalúa calidad metodológica', output: '' },
  { id: 12, name: 'Meta-Analyst', description: 'Ejecuta meta-análisis', output: '' },
  { id: 13, name: 'Evidence Grader', description: 'Califica evidencia GRADE', output: '' },
  { id: 14, name: 'Report Generator', description: 'Genera dossier final', output: '' },
];

// =========================================
// AGENT OUTPUTS (Simulated)
// =========================================
const AGENT_OUTPUTS: Record<number, { title: string; content: string }> = {
  1: {
    title: 'Marco PICOT',
    content: `**P (Población):** Adultos ≥18 años con insuficiencia cardíaca con fracción de eyección preservada (ICFEp, FEVI ≥50%)

**I (Intervención):** Inhibidores SGLT2 (empagliflozina 10mg, dapagliflozina 10mg)

**C (Comparador):** Placebo o tratamiento estándar

**O (Outcomes):** 
- Primario: Hospitalización por IC + muerte cardiovascular
- Secundarios: Calidad de vida (KCCQ), función renal

**T (Tiempo):** Seguimiento mínimo 12 meses`
  },
  2: {
    title: 'Validación FINER',
    content: `✅ **Factible:** Existen >15 RCTs publicados disponibles
✅ **Interesante:** Alta relevancia clínica actual
✅ **Novedoso:** Gaps en subpoblaciones específicas
✅ **Ético:** No hay conflictos identificados
✅ **Relevante:** Impacto directo en guías clínicas

**Score FINER:** 5/5 - Pregunta altamente viable`
  },
  3: {
    title: 'Gap Analysis',
    content: `**Revisiones sistemáticas previas encontradas:** 8

**Gaps identificados:**
1. Ninguna RS incluye EMPEROR-Preserved completo
2. Falta análisis por subgrupos de FEVI (50-60% vs >60%)
3. Datos limitados en población latinoamericana
4. No hay meta-análisis de seguridad renal

**Conclusión:** Justificación sólida para nueva RS`
  },
  4: {
    title: 'Criterios de Elegibilidad',
    content: `**INCLUSIÓN:**
- RCTs fase III
- Adultos con ICFEp (FEVI ≥50%)
- SGLT2i vs placebo/control
- Seguimiento ≥6 meses
- Outcomes CV reportados

**EXCLUSIÓN:**
- Estudios observacionales
- ICFEr o ICFEmr
- Dosis no estándar
- Publicaciones duplicadas
- Sin datos de mortalidad`
  },
  5: {
    title: 'Verificación PROSPERO',
    content: `**Búsqueda en PROSPERO:** Completada

**Protocolos similares encontrados:** 3
- CRD42023456789: Enfocado en ICFEr (diferente)
- CRD42024123456: Solo empagliflozina (más limitado)
- CRD42024789012: En progreso, diferente outcome primario

**Recomendación:** ✅ Proceder con registro nuevo
**ID sugerido:** CRD42025XXXXXX`
  },
  6: {
    title: 'Evaluación de Sesgos',
    content: `**Herramienta:** Cochrane RoB 2.0

**Riesgos anticipados:**
- Aleatorización: BAJO (RCTs grandes)
- Cegamiento: BAJO (doble ciego típico)
- Datos incompletos: MODERADO (pérdidas de seguimiento)
- Reporte selectivo: BAJO (registros previos)
- Otros sesgos: BAJO

**Plan de mitigación:** Análisis de sensibilidad excluyendo alto riesgo`
  },
  7: {
    title: 'Ecuaciones de Búsqueda',
    content: `**PubMed:**
("SGLT2 inhibitor"[MeSH] OR "empagliflozin"[tw] OR "dapagliflozin"[tw])
AND ("Heart Failure"[MeSH] OR "HFpEF"[tw])
AND ("randomized controlled trial"[pt])
Filters: 2019-2025, English/Spanish

**Embase:**
('sodium glucose cotransporter 2 inhibitor'/exp)
AND ('heart failure with preserved ejection fraction'/exp)
AND [randomized controlled trial]/lim

**Cochrane:** MeSH descriptors aplicados`
  },
  8: {
    title: 'Estructura del Protocolo',
    content: `**Secciones completadas:**
1. ✅ Título y registro
2. ✅ Antecedentes y justificación
3. ✅ Objetivos e hipótesis
4. ✅ Métodos (PRISMA 2020)
5. ✅ Criterios de elegibilidad
6. ✅ Estrategia de búsqueda
7. ✅ Extracción de datos
8. ✅ Evaluación de calidad
9. ✅ Síntesis y análisis
10. ✅ Cronograma

**Estado:** Listo para registro PROSPERO`
  },
  9: {
    title: 'Flujo PRISMA 2020',
    content: `**Identificación:**
- PubMed: 342 artículos
- Embase: 289 artículos
- Cochrane: 156 artículos
- Otras fuentes: 60 artículos
- **Total:** 847 artículos

**Cribado:**
- Duplicados removidos: 234
- Título/Abstract excluidos: 489
- Texto completo evaluados: 124

**Incluidos:**
- Estudios cualitativos: 18
- **Meta-análisis final: 12 RCTs**`
  },
  10: {
    title: 'Datos Extraídos',
    content: `**12 estudios incluidos:**

| Estudio | N | SGLT2i | Seguimiento |
|---------|---|--------|-------------|
| EMPEROR-Preserved | 5,988 | Empa | 26 meses |
| DELIVER | 6,263 | Dapa | 28 meses |
| PRESERVED-HF | 324 | Dapa | 12 semanas |
| ... | ... | ... | ... |

**Total participantes:** 14,234
**Eventos primarios:** 2,847`
  },
  11: {
    title: 'Evaluación de Calidad',
    content: `**Cochrane RoB 2.0 - Resultados:**

| Estudio | D1 | D2 | D3 | D4 | D5 | Overall |
|---------|----|----|----|----|----|----|
| EMPEROR-Preserved | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | Bajo |
| DELIVER | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | Bajo |
| PRESERVED-HF | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 | Bajo |

**Calidad general:** 10/12 estudios con bajo riesgo
**Publicación bias:** Funnel plot simétrico (p=0.34)`
  },
  12: {
    title: 'Resultados Meta-análisis',
    content: `**Outcome primario (Hospitalización IC + muerte CV):**
- **HR: 0.80 (IC 95%: 0.73-0.87)**
- p < 0.0001
- **I²: 18%** (heterogeneidad baja)
- Modelo: Efectos aleatorios

**Outcomes secundarios:**
- Muerte CV: HR 0.88 (0.77-1.00)
- Hospitalización IC: HR 0.74 (0.67-0.83)
- KCCQ-TSS: +1.8 puntos (1.2-2.4)

**NNT:** 21 pacientes por 2 años`
  },
  13: {
    title: 'Calificación GRADE',
    content: `**Certeza de la evidencia:**

| Outcome | Estudios | Calidad | Certeza |
|---------|----------|---------|---------|
| Hosp IC + muerte CV | 12 | ⭐⭐⭐⭐ | ALTA |
| Muerte CV | 12 | ⭐⭐⭐ | MODERADA |
| Calidad de vida | 8 | ⭐⭐⭐⭐ | ALTA |
| Eventos adversos | 12 | ⭐⭐⭐⭐ | ALTA |

**Recomendación:** FUERTE a favor de SGLT2i en ICFEp`
  },
  14: {
    title: 'Dossier de Evidencia',
    content: `**📋 DOSSIER COMPLETO GENERADO**

**Documento:** Revisión Sistemática y Meta-análisis
**Páginas:** 47
**Formato:** PDF/Word

**Contenido:**
1. Resumen ejecutivo
2. Protocolo PROSPERO
3. Estrategia de búsqueda completa
4. Flujo PRISMA 2020
5. Tabla de características
6. Forest plots
7. Análisis de sensibilidad
8. Evaluación GRADE
9. Referencias (n=124)

**Estado:** ✅ LISTO PARA DESCARGA`
  },
};

// =========================================
// DEFAULT DEMO QUESTION
// =========================================
const DEFAULT_QUESTION = "¿Cuál es la eficacia y seguridad de los inhibidores SGLT2 (empagliflozina, dapagliflozina) en pacientes con insuficiencia cardíaca con fracción de eyección preservada comparado con placebo, medido por hospitalización y mortalidad cardiovascular?";

// =========================================
// MAIN COMPONENT
// =========================================
export default function ClinicalNavigator() {
  const [phase, setPhase] = useState<DemoPhase>('landing');
  const [question, setQuestion] = useState('');
  const [agents, setAgents] = useState<Agent[]>(
    AGENTS_CONFIG.map(a => ({ ...a, status: 'pending' as const, output: '' }))
  );
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  // Add terminal log
  const addLog = (message: string, type: TerminalLog['type'] = 'info') => {
    const log: TerminalLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type,
    };
    setTerminalLogs(prev => [...prev, log]);
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + ms;
  };

  // Update agent status
  const updateAgent = (id: number, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // Add deliverable
  const addDeliverable = (agentId: number) => {
    const output = AGENT_OUTPUTS[agentId];
    if (output) {
      setDeliverables(prev => [...prev, {
        id: agentId,
        agentId,
        title: output.title,
        content: output.content,
        isExpanded: false,
      }]);
    }
  };

  // Toggle deliverable expansion
  const toggleDeliverable = (id: number) => {
    setDeliverables(prev => prev.map(d => 
      d.id === id ? { ...d, isExpanded: !d.isExpanded } : d
    ));
  };

  // =========================================
  // MAIN ORCHESTRATION
  // =========================================
  const runOrchestration = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const usedQuestion = question.trim() || DEFAULT_QUESTION;
    
    addLog('🚀 Iniciando orquestación de 14 agentes especializados...', 'info');
    addLog(`📋 Pregunta: "${usedQuestion.substring(0, 80)}..."`, 'data');
    
    await new Promise(r => setTimeout(r, 500));

    for (let i = 0; i < AGENTS_CONFIG.length; i++) {
      const agent = AGENTS_CONFIG[i];
      const latency = 800 + Math.random() * 1200; // 800-2000ms
      
      // Start processing
      setActiveAgentId(agent.id);
      updateAgent(agent.id, { status: 'processing' });
      addLog(`🔄 Agente ${agent.id}: ${agent.name} iniciando...`, 'process');
      
      await new Promise(r => setTimeout(r, latency));
      
      // Complete
      updateAgent(agent.id, { status: 'completed', latency: Math.round(latency) });
      addLog(`✅ ${agent.name} completado (${Math.round(latency)}ms)`, 'success');
      
      // Add specific output log
      const output = AGENT_OUTPUTS[agent.id];
      if (output) {
        addLog(`📄 Entregable: ${output.title}`, 'data');
      }
      
      // Add to deliverables library
      addDeliverable(agent.id);
      
      await new Promise(r => setTimeout(r, 200));
    }

    addLog('═══════════════════════════════════════════════════════════', 'info');
    addLog('🎉 ORQUESTACIÓN COMPLETADA - 14/14 agentes ejecutados', 'success');
    addLog('📊 Resultados del meta-análisis listos para revisión', 'data');
    
    setActiveAgentId(null);
    setIsComplete(true);
    
    // Transition to verification after 1.5s
    setTimeout(() => {
      setPhase('verification');
    }, 1500);
  };

  // Start demo
  const handleStartDemo = () => {
    setPhase('execution');
    hasStartedRef.current = false;
    setTimeout(() => {
      runOrchestration();
    }, 500);
  };

  // Reset demo
  const handleReset = () => {
    setPhase('landing');
    setQuestion('');
    setAgents(AGENTS_CONFIG.map(a => ({ ...a, status: 'pending' as const, output: '' })));
    setTerminalLogs([]);
    setDeliverables([]);
    setActiveAgentId(null);
    setIsComplete(false);
    hasStartedRef.current = false;
  };

  // =========================================
  // RENDER: LANDING PHASE
  // =========================================
  const renderLanding = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${COLORS.azulInstitucional} 0%, ${COLORS.verdeMedico} 100%)`,
      }}
    >
      {/* Header with logos */}
      <header className="flex justify-between items-center p-6">
        <img src={galateaLogo} alt="Galatea AI" className="h-16" />
        <img src={santaFeLogo} alt="Fundación Santa Fe de Bogotá" className="h-20 bg-white rounded-lg p-2" />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-8 pb-12">
        {/* Agent Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
            <img 
              src={agentAvatar} 
              alt="Galatea AI Agent" 
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg"
          >
            <Sparkles className="w-8 h-8" style={{ color: COLORS.verdeMedico }} />
          </motion.div>
        </motion.div>

        {/* Input section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Clinical Guideline Navigator
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Soy tu asistente de investigación clínica. Cuéntame tu pregunta y orquestaré 
            14 agentes especializados para generar evidencia científica de alta calidad.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <label className="block text-white/90 font-medium mb-3">
              Tu pregunta de investigación:
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Cuéntame tu pregunta de investigación clínica..."
              className="w-full h-32 p-4 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 
                         focus:outline-none focus:ring-2 focus:ring-white/50 resize-none text-lg"
            />
            <p className="text-white/60 text-sm mt-2 mb-4">
              O deja vacío para usar la pregunta demo: SGLT2 en insuficiencia cardíaca
            </p>
            
            <Button
              onClick={handleStartDemo}
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              style={{ 
                backgroundColor: COLORS.verdeMedico,
                color: 'white',
              }}
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Análisis con Galatea
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // =========================================
  // RENDER: EXECUTION PHASE (3 Columns)
  // =========================================
  const renderExecution = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.fondoTerminal }}
    >
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          <img src={galateaLogo} alt="Galatea AI" className="h-10" />
          <div className="h-6 w-px bg-white/20" />
          <span className="text-white font-medium">Clinical Guideline Navigator</span>
          <span 
            className="px-2 py-1 rounded text-xs font-bold"
            style={{ backgroundColor: COLORS.verdeMedico, color: 'white' }}
          >
            14-AGENT ORCHESTRATION
          </span>
        </div>
        <img src={santaFeLogo} alt="Santa Fe" className="h-12 bg-white rounded p-1" />
      </header>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Agent List (25%) */}
        <div className="w-1/4 border-r border-white/10 overflow-y-auto p-4">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Orquestación de 14 Agentes
          </h2>
          
          <div className="space-y-2">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: agent.id * 0.05 }}
                className={`p-3 rounded-lg border transition-all ${
                  agent.status === 'processing' 
                    ? 'border-blue-400 bg-blue-400/10' 
                    : agent.status === 'completed'
                    ? 'border-green-400/50 bg-green-400/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {agent.status === 'pending' && (
                      <Clock className="w-4 h-4 text-gray-500" />
                    )}
                    {agent.status === 'processing' && (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    )}
                    {agent.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      agent.status === 'completed' ? 'text-green-400' :
                      agent.status === 'processing' ? 'text-blue-400' : 'text-gray-400'
                    }`}>
                      {agent.id}. {agent.name}
                    </span>
                  </div>
                  {agent.latency && (
                    <span className="text-xs text-gray-500">{agent.latency}ms</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">{agent.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CENTER: Terminal (50%) */}
        <div className="w-1/2 flex flex-col border-r border-white/10">
          <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-gray-400 text-sm ml-2 font-mono">terminal — galatea-orchestrator</span>
          </div>
          
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          >
            {terminalLogs.length === 0 ? (
              <div className="text-gray-500 animate-pulse">
                Esperando inicio de orquestación...
              </div>
            ) : (
              terminalLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-1"
                >
                  <span className="text-gray-500">[{formatTime(log.timestamp)}]</span>
                  {' '}
                  <span className={
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'process' ? 'text-blue-400' :
                    log.type === 'data' ? 'text-yellow-400' :
                    'text-gray-300'
                  }>
                    {log.message}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Deliverables Library (25%) */}
        <div className="w-1/4 overflow-y-auto p-4">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: COLORS.verdeMedico }} />
            Biblioteca de Evidencia
          </h2>
          
          {deliverables.length === 0 ? (
            <div className="text-gray-500 text-sm">
              Los entregables aparecerán aquí conforme cada agente complete su tarea...
            </div>
          ) : (
            <div className="space-y-2">
              {deliverables.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader 
                      className="py-3 px-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleDeliverable(d.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: COLORS.verdeMedico }} />
                          <CardTitle className="text-sm text-white">{d.title}</CardTitle>
                        </div>
                        {d.isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence>
                      {d.isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="text-xs text-gray-300 whitespace-pre-wrap bg-black/30 rounded p-3 max-h-48 overflow-y-auto">
                              {d.content}
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // =========================================
  // RENDER: VERIFICATION PHASE
  // =========================================
  const renderVerification = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${COLORS.fondoTerminal} 0%, ${COLORS.azulInstitucional} 100%)`,
      }}
    >
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-white/10">
        <img src={galateaLogo} alt="Galatea AI" className="h-12" />
        <img src={santaFeLogo} alt="Santa Fe" className="h-14 bg-white rounded-lg p-2" />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Success badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/20 border border-green-400">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-semibold text-lg">
              Análisis Completado — Verificado por Instituciones Líderes
            </span>
          </div>
        </motion.div>

        {/* Institutional logos */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-8 mb-12"
        >
          <div className="bg-white rounded-xl p-4">
            <img src={santaFeLogo} alt="Santa Fe de Bogotá" className="h-16" />
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-2">
            <Award className="w-8 h-8 text-blue-600" />
            <span className="font-bold text-blue-600">OMS</span>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="font-bold text-purple-600">Cochrane</span>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-800" />
            <span className="font-bold text-blue-800">PubMed</span>
          </div>
        </motion.div>

        {/* Results card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                📊 Resultados del Meta-Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">0.80</div>
                  <div className="text-sm text-gray-300">Hazard Ratio</div>
                  <div className="text-xs text-gray-400">IC 95%: 0.73-0.87</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">18%</div>
                  <div className="text-sm text-gray-300">Heterogeneidad (I²)</div>
                  <div className="text-xs text-green-400">BAJA</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">⭐⭐⭐⭐</div>
                  <div className="text-sm text-gray-300">Calidad GRADE</div>
                  <div className="text-xs text-yellow-400">ALTA</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">847→12</div>
                  <div className="text-sm text-gray-300">Artículos</div>
                  <div className="text-xs text-gray-400">Analizados→Incluidos</div>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold"
                  style={{ backgroundColor: COLORS.verdeMedico }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Descargar Dossier Completo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-white/30 text-white hover:bg-white/10"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Ver Referencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reset button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Button
            onClick={handleReset}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Iniciar Nueva Investigación
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  // =========================================
  // MAIN RENDER
  // =========================================
  return (
    <AnimatePresence mode="wait">
      {phase === 'landing' && renderLanding()}
      {phase === 'execution' && renderExecution()}
      {phase === 'verification' && renderVerification()}
    </AnimatePresence>
  );
}
