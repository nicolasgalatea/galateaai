import { useState, useEffect, useRef } from 'react';
import { 
  FileSearch, Upload, Cpu, AlertTriangle, Plus, Send, Building2, FileText,
  Search, ClipboardCheck, Shield, Play, Copy, Check, ChevronRight, BookOpen,
  Filter, FlaskConical, Lock, Unlock, Award, Users, BarChart3, ArrowDown,
  CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Diamond, Minus, Terminal,
  Target, Eye
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, Zap, DollarSign } from 'lucide-react';

interface AgentMessage {
  id: string;
  agent: 'picot' | 'literature' | 'criteria' | 'yadav';
  message: string;
  timestamp: Date;
  type?: 'text' | 'gaps' | 'criteria-table' | 'picot-result';
}

interface SubAgent {
  id: 'picot' | 'literature' | 'criteria' | 'yadav';
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  isProcessing: boolean;
}

interface ProtocolSection {
  id: string;
  title: string;
  status: 'pending' | 'complete' | 'warning';
  content?: string;
}

interface PRISMABlock {
  label: string;
  count: number;
  targetCount: number;
  description: string;
}

interface AuthorVote {
  name: string;
  avatar: string;
  vote: 'include' | 'exclude' | 'pending';
}

interface AuditLog {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'process';
  message: string;
}

const kpiStats = [
  { value: '92%', label: 'Issue Detection' },
  { value: 'ICH-GCP', label: 'Compliant' },
  { value: '70%', label: 'Faster Review' },
];

const workflowSteps = [
  {
    title: 'Protocol Upload',
    description: 'Upload clinical trial protocol document in PDF or Word format.',
    icon: <Upload className="w-6 h-6" />,
  },
  {
    title: 'AI Analysis',
    description: 'AI checks against ICH-GCP, identifies inconsistencies, and validates scientific methodology.',
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    title: 'Audit Report',
    description: 'Generates prioritized findings with specific sections and recommended corrections.',
    icon: <AlertTriangle className="w-6 h-6" />,
  },
];

const techStack = ['ICH-GCP', 'INVIMA', 'FDA Guidelines', 'Protocol AI'];

const integrations = [
  { name: 'Veeva' },
  { name: 'Medidata' },
  { name: 'CTMS' },
  { name: 'REDCap' },
  { name: 'EDC Systems' },
];

// Metformin & Alzheimer specific data
const metforminPICOT = {
  population: 'Adultos ≥60 años con diabetes tipo 2 y riesgo de deterioro cognitivo',
  intervention: 'Tratamiento con Metformina (500-2000mg/día)',
  comparison: 'Otros antidiabéticos orales o placebo',
  outcome: 'Incidencia de Alzheimer, puntuaciones MMSE, biomarcadores de amiloide',
  time: 'Seguimiento ≥3 años'
};

const metforminEvidenceGaps = [
  { gap: 'Mecanismo neuroprotector de metformina no completamente caracterizado', severity: 'high' },
  { gap: 'Dosis óptima para efecto cognitivo no establecida', severity: 'high' },
  { gap: 'Heterogeneidad en definiciones de deterioro cognitivo', severity: 'medium' },
  { gap: 'Falta de estudios prospectivos con biomarcadores de amiloide', severity: 'high' },
  { gap: 'Poblaciones asiáticas subrepresentadas', severity: 'medium' },
];

const metforminInclusionCriteria = [
  { criterion: 'Adultos ≥60 años con DM2 diagnosticada', included: true },
  { criterion: 'Uso de Metformina ≥12 meses', included: true },
  { criterion: 'Evaluación cognitiva estandarizada (MMSE/MoCA)', included: true },
  { criterion: 'Estudios RCT o cohortes prospectivas', included: true },
  { criterion: 'Seguimiento mínimo de 2 años', included: true },
];

const metforminExclusionCriteria = [
  { criterion: 'Demencia preexistente al inicio del estudio', excluded: true },
  { criterion: 'Uso concomitante de insulina como primera línea', excluded: true },
  { criterion: 'Enfermedad renal crónica estadio IV-V', excluded: true },
  { criterion: 'Estudios transversales o reportes de caso', excluded: true },
  { criterion: 'Sin grupo comparador definido', excluded: true },
];

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
  scopus: `TITLE-ABS-KEY(("metformin" OR "glucophage" OR "dimethylbiguanide")
AND ("alzheimer*" OR "dementia" OR "cognitive decline" OR "neuroprotect*")
AND ("type 2 diabetes" OR "T2DM" OR "NIDDM"))
AND DOCTYPE(ar OR re) AND PUBYEAR > 2014
AND (LANGUAGE(english) OR LANGUAGE(spanish))`,
};

const protocolSections: ProtocolSection[] = [
  { id: '1', title: '1. Título del Estudio', status: 'complete', content: 'Metformina y Riesgo de Enfermedad de Alzheimer en Adultos Mayores con Diabetes Tipo 2: Revisión Sistemática y Meta-análisis' },
  { id: '2', title: '2. Investigador Principal', status: 'complete', content: 'Dr. [Nombre], Departamento de Neurología' },
  { id: '3', title: '3. Justificación Científica', status: 'complete', content: 'La metformina, fármaco de primera línea para DM2, ha mostrado efectos pleotrópicos incluyendo propiedades neuroprotectoras. Estudios preclínicos sugieren modulación de vías de señalización de insulina cerebral y reducción de agregación de tau/amiloide.' },
  { id: '4', title: '4. Pregunta de Investigación (PICOT)', status: 'complete', content: 'En adultos ≥60 años con DM2 (P), ¿el uso de metformina (I) comparado con otros antidiabéticos (C) reduce la incidencia de Alzheimer y deterioro cognitivo (O) durante ≥3 años de seguimiento (T)?' },
  { id: '5', title: '5. Objetivos (Primario/Secundarios)', status: 'complete', content: 'Primario: Evaluar asociación entre uso de metformina e incidencia de EA. Secundarios: Analizar efecto dosis-respuesta, cambios en MMSE, biomarcadores.' },
  { id: '6', title: '6. Diseño del Estudio', status: 'complete', content: 'Revisión sistemática y meta-análisis siguiendo guías PRISMA 2020 y Cochrane Handbook.' },
  { id: '7', title: '7. Criterios de Inclusión', status: 'complete', content: 'Ver tabla de criterios generada por Agente Criteria Designer.' },
  { id: '8', title: '8. Criterios de Exclusión', status: 'complete', content: 'Ver tabla de criterios generada por Agente Criteria Designer.' },
  { id: '9', title: '9. Cálculo de Tamaño Muestral', status: 'warning', content: 'N/A para revisión sistemática. Meta-análisis incluirá análisis de poder post-hoc.' },
  { id: '10', title: '10. Variables y Desenlaces', status: 'complete', content: 'Desenlace primario: Incidencia de EA (HR/OR). Secundarios: Puntuación MMSE, niveles de amiloide-β42 en LCR.' },
  { id: '11', title: '11. Estrategia de Búsqueda', status: 'complete', content: 'Método Yadav 2025 de dos capas aplicado. Ver ecuaciones generadas.' },
  { id: '12', title: '12. Plan de Análisis Estadístico', status: 'complete', content: 'Modelo de efectos aleatorios (DerSimonian-Laird). Heterogeneidad: I², Q-test. Sesgo: funnel plot, Egger test.' },
  { id: '13', title: '13. Consideraciones Éticas', status: 'complete', content: 'Exento de aprobación IRB (datos secundarios publicados). Registro en PROSPERO.' },
  { id: '14', title: '14. Cronograma', status: 'complete', content: 'Búsqueda: 2 semanas. Cribado: 3 semanas. Extracción: 2 semanas. Análisis: 2 semanas. Redacción: 3 semanas.' },
  { id: '15', title: '15. Presupuesto', status: 'warning', content: 'Pendiente: Licencias de bases de datos, software estadístico, servicios de traducción.' },
  { id: '16', title: '16. Referencias Bibliográficas', status: 'complete', content: '1. Ng TP et al. J Alzheimers Dis. 2014\n2. Orkaby AR et al. Neurology. 2017\n3. Yadav S et al. Systematic Reviews. 2025' },
  { id: '17', title: '17. Anexos', status: 'pending', content: 'A incluir: Formularios de extracción, checklist PRISMA, tablas de evidencia GRADE.' },
];

const forestPlotData = [
  { study: 'Ng et al. 2014', or: 0.49, ci_low: 0.25, ci_high: 0.95, weight: 12.3, isPooled: false },
  { study: 'Orkaby et al. 2017', or: 0.67, ci_low: 0.51, ci_high: 0.89, weight: 18.7, isPooled: false },
  { study: 'Kuan et al. 2017', or: 0.76, ci_low: 0.58, ci_high: 0.99, weight: 16.4, isPooled: false },
  { study: 'Samaras et al. 2020', or: 0.82, ci_low: 0.64, ci_high: 1.06, weight: 17.8, isPooled: false },
  { study: 'Zhang et al. 2022', or: 0.58, ci_low: 0.41, ci_high: 0.82, weight: 14.2, isPooled: false },
  { study: 'Chen et al. 2023', or: 0.71, ci_low: 0.55, ci_high: 0.92, weight: 15.6, isPooled: false },
  { study: 'Efecto Combinado', or: 0.68, ci_low: 0.58, ci_high: 0.79, weight: 100, isPooled: true },
];

export default function AgentProtocolReview() {
  const { toast } = useToast();
  const [roiValue, setRoiValue] = useState(25);
  const [activePhase, setActivePhase] = useState<'protocol' | 'execution'>('protocol');
  const [isPhase2Unlocked, setIsPhase2Unlocked] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [ideaInput, setIdeaInput] = useState('Investigar el efecto neuroprotector de la Metformina en la prevención del Alzheimer en pacientes diabéticos tipo 2 mayores de 60 años');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [showProtocolPreview, setShowProtocolPreview] = useState(false);
  const [showApprovalAnimation, setShowApprovalAnimation] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const [prismaBlocks, setPrismaBlocks] = useState<PRISMABlock[]>([
    { label: 'Identificados', count: 0, targetCount: 1372, description: 'Registros de bases de datos' },
    { label: 'Tras Duplicados', count: 0, targetCount: 1063, description: 'Registros únicos' },
    { label: 'Cribados', count: 0, targetCount: 187, description: 'Títulos/Abstracts revisados' },
    { label: 'Texto Completo', count: 0, targetCount: 54, description: 'Artículos evaluados' },
    { label: 'Incluidos', count: 0, targetCount: 18, description: 'Estudios en síntesis cualitativa' },
    { label: 'Meta-análisis', count: 0, targetCount: 12, description: 'Estudios en síntesis cuantitativa' },
  ]);
  
  const [authorVotes, setAuthorVotes] = useState<AuthorVote[]>([
    { name: 'Dr. AI Alpha', avatar: '🤖', vote: 'pending' },
    { name: 'Dr. AI Beta', avatar: '🔬', vote: 'pending' },
    { name: 'Dr. AI Gamma', avatar: '📊', vote: 'pending' },
  ]);

  const [subAgents, setSubAgents] = useState<SubAgent[]>([
    {
      id: 'picot',
      name: 'PICOT Analyst',
      role: 'Estructuración de pregunta clínica',
      icon: <Target className="w-5 h-5" />,
      color: '#DC2626',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'literature',
      name: 'Literature Scout',
      role: 'Identificación de gaps de evidencia',
      icon: <BookOpen className="w-5 h-5" />,
      color: '#0033A0',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'criteria',
      name: 'Criteria Designer',
      role: 'Diseño de criterios I/E',
      icon: <Filter className="w-5 h-5" />,
      color: '#00A651',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'yadav',
      name: 'Yadav Strategist',
      role: 'Sintaxis de búsqueda multicapa',
      icon: <FlaskConical className="w-5 h-5" />,
      color: '#6B21A8',
      isActive: false,
      isProcessing: false,
    },
  ]);

  const categoryColor = 'agent-pharma';
  const bayerBlue = '#0033A0';

  // Scroll audit logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [auditLogs]);

  const addAuditLog = (level: AuditLog['level'], message: string) => {
    setAuditLogs(prev => [...prev, { timestamp: new Date(), level, message }]);
  };

  const handleCopyToClipboard = async (text: string, tab: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Ecuación de búsqueda copiada al portapapeles.',
    });
  };

  const simulatePhase1Orchestration = async () => {
    if (!ideaInput.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una idea de investigación.',
        variant: 'destructive',
      });
      return;
    }

    setIsOrchestrating(true);
    setAgentMessages([]);
    setShowProtocolPreview(false);
    setAuditLogs([]);

    addAuditLog('info', '🚀 Iniciando orquestación multi-agente...');
    addAuditLog('process', `📝 Input recibido: "${ideaInput.substring(0, 60)}..."`);

    // === AGENT 1: PICOT ANALYST ===
    addAuditLog('info', '🎯 Activando Agente PICOT Analyst...');
    setSubAgents(prev => prev.map(a => 
      a.id === 'picot' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 1500));
    addAuditLog('process', 'Extrayendo componentes PICOT del texto de entrada...');
    
    setAgentMessages(prev => [...prev, {
      id: '1',
      agent: 'picot',
      message: 'Analizando la estructura de la pregunta de investigación...',
      timestamp: new Date(),
      type: 'text',
    }]);

    await new Promise(r => setTimeout(r, 2000));
    addAuditLog('success', '✓ Componentes PICOT identificados correctamente');

    setAgentMessages(prev => [...prev, {
      id: '2',
      agent: 'picot',
      message: 'picot-result',
      timestamp: new Date(),
      type: 'picot-result',
    }]);
    
    setSubAgents(prev => prev.map(a => 
      a.id === 'picot' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 1000));

    // === AGENT 2: LITERATURE SCOUT ===
    addAuditLog('info', '📚 Activando Agente Literature Scout...');
    setSubAgents(prev => prev.map(a => 
      a.id === 'literature' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 1500));
    addAuditLog('process', 'Consultando bases de datos de literatura científica...');
    addAuditLog('process', 'Analizando revisiones sistemáticas previas sobre Metformina-Alzheimer...');
    
    setAgentMessages(prev => [...prev, {
      id: '3',
      agent: 'literature',
      message: 'Escaneando literatura existente y comparando con tu propuesta de investigación...',
      timestamp: new Date(),
      type: 'text',
    }]);

    await new Promise(r => setTimeout(r, 2000));
    addAuditLog('warning', '⚠ Detectados 5 gaps de evidencia significativos');

    setAgentMessages(prev => [...prev, {
      id: '4',
      agent: 'literature',
      message: 'gaps',
      timestamp: new Date(),
      type: 'gaps',
    }]);
    
    setSubAgents(prev => prev.map(a => 
      a.id === 'literature' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 1000));

    // === AGENT 3: CRITERIA DESIGNER ===
    addAuditLog('info', '⚙️ Activando Agente Criteria Designer...');
    setSubAgents(prev => prev.map(a => 
      a.id === 'criteria' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 1500));
    addAuditLog('process', 'Generando criterios basados en estructura PICOT...');
    addAuditLog('process', 'Aplicando filtros metodológicos estándar Cochrane...');

    setAgentMessages(prev => [...prev, {
      id: '5',
      agent: 'criteria',
      message: 'Diseñando criterios de elegibilidad basados en el PICOT definido...',
      timestamp: new Date(),
      type: 'text',
    }]);

    await new Promise(r => setTimeout(r, 2000));
    addAuditLog('success', '✓ Tabla de criterios I/E generada (5 inclusión, 5 exclusión)');

    setAgentMessages(prev => [...prev, {
      id: '6',
      agent: 'criteria',
      message: 'criteria-table',
      timestamp: new Date(),
      type: 'criteria-table',
    }]);

    setSubAgents(prev => prev.map(a => 
      a.id === 'criteria' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 1000));

    // === AGENT 4: YADAV STRATEGIST ===
    addAuditLog('info', '🧪 Activando Agente Yadav Strategist...');
    setSubAgents(prev => prev.map(a => 
      a.id === 'yadav' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 1500));
    addAuditLog('process', 'Iniciando mapeo de descriptores MeSH/Emtree...');
    addAuditLog('process', 'Aplicando método Yadav 2025 de dos capas...');
    addAuditLog('process', 'Capa 1: Términos controlados (thesaurus)');
    addAuditLog('process', 'Capa 2: Términos de texto libre (sinónimos)');

    setAgentMessages(prev => [...prev, {
      id: '7',
      agent: 'yadav',
      message: 'Construyendo estrategia de búsqueda optimizada usando método Yadav 2025...',
      timestamp: new Date(),
      type: 'text',
    }]);

    await new Promise(r => setTimeout(r, 2500));
    addAuditLog('success', '✓ Ecuaciones generadas para PubMed, Embase, Cochrane, Scopus');
    addAuditLog('success', '✓ Sintaxis validada - Lista para ejecución');

    setSubAgents(prev => prev.map(a => 
      a.id === 'yadav' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 800));
    
    setShowProtocolPreview(true);
    setIsOrchestrating(false);
    
    addAuditLog('success', '🎉 FASE 1 COMPLETADA - Protocolo generado con éxito');
    addAuditLog('info', '📋 Revise las 17 secciones y apruebe para continuar a Fase 2');
    
    toast({
      title: '✅ Fase 1 Completada',
      description: 'Protocolo listo para revisión. Revisa las 17 secciones antes de aprobar.',
    });
  };

  const handleApproveProtocol = () => {
    setShowApprovalAnimation(true);
    addAuditLog('info', '🔐 Iniciando proceso de aprobación de protocolo...');
    addAuditLog('process', 'Verificando integridad de las 17 secciones...');
    
    setTimeout(() => {
      addAuditLog('success', '✓ Protocolo verificado - Cumple requisitos ICH-GCP');
      addAuditLog('success', '🏅 SELLO DE APROBACIÓN ÉTICA OTORGADO');
      
      setIsPhase2Unlocked(true);
      setActivePhase('execution');
      setShowApprovalAnimation(false);
      
      addAuditLog('info', '🚀 Fase 2 desbloqueada - Iniciando ejecución de búsqueda');
      
      toast({
        title: '🎉 Protocolo Aprobado',
        description: 'Fase 2 desbloqueada. Iniciando ejecución de búsqueda sistemática.',
      });

      // Start PRISMA animation and author voting
      animatePRISMAFlow();
      simulateAuthorVoting();
    }, 2500);
  };

  const animatePRISMAFlow = () => {
    addAuditLog('process', '📊 Iniciando flujo PRISMA dinámico...');
    
    const animateBlock = (index: number) => {
      if (index >= prismaBlocks.length) {
        addAuditLog('success', '✓ Flujo PRISMA completado - 12 estudios incluidos en meta-análisis');
        return;
      }
      
      const targetCount = prismaBlocks[index].targetCount;
      const steps = 20;
      const stepValue = targetCount / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += stepValue;
        if (current >= targetCount) {
          current = targetCount;
          clearInterval(interval);
          
          setPrismaBlocks(prev => prev.map((block, i) => 
            i === index ? { ...block, count: Math.round(current) } : block
          ));
          
          if (index < prismaBlocks.length - 1) {
            addAuditLog('process', `→ ${prismaBlocks[index].label}: ${targetCount} registros procesados`);
          }
          
          setTimeout(() => animateBlock(index + 1), 500);
        } else {
          setPrismaBlocks(prev => prev.map((block, i) => 
            i === index ? { ...block, count: Math.round(current) } : block
          ));
        }
      }, 50);
    };
    
    animateBlock(0);
  };

  const simulateAuthorVoting = () => {
    const articles = ['Zhang et al. 2022 - Metformin cognitive outcomes', 'Chen et al. 2023 - Neuroprotection DM2', 'Kim et al. 2024 - Alzheimer prevention'];
    let articleIdx = 0;

    addAuditLog('info', '👥 Iniciando consenso de revisores IA...');

    const voteInterval = setInterval(() => {
      if (articleIdx >= 3) {
        clearInterval(voteInterval);
        addAuditLog('success', '✓ Consenso completado - 3 artículos evaluados');
        return;
      }

      addAuditLog('process', `📄 Evaluando: ${articles[articleIdx]}`);

      setAuthorVotes([
        { name: 'Dr. AI Alpha', avatar: '🤖', vote: Math.random() > 0.3 ? 'include' : 'exclude' },
        { name: 'Dr. AI Beta', avatar: '🔬', vote: Math.random() > 0.3 ? 'include' : 'exclude' },
        { name: 'Dr. AI Gamma', avatar: '📊', vote: Math.random() > 0.4 ? 'include' : 'exclude' },
      ]);
      
      setCurrentArticleIndex(articleIdx + 1);
      articleIdx++;
    }, 2500);
  };

  const getAgentInfo = (agentId: 'picot' | 'literature' | 'criteria' | 'yadav') => {
    return subAgents.find(a => a.id === agentId)!;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 px-4 bg-background overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(ellipse 100% 60% at 50% 0%, hsl(var(--${categoryColor})), transparent)`
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex justify-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: `hsl(var(--${categoryColor}) / 0.3)`,
                background: `hsl(var(--${categoryColor}) / 0.08)`,
                color: `hsl(var(--${categoryColor}))`
              }}
            >
              <Sparkles className="w-4 h-4" />
              Clinical Research
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{
                background: `hsl(var(--${categoryColor}))`,
                boxShadow: `0 20px 40px -15px hsl(var(--${categoryColor}) / 0.4)`
              }}
            >
              <FileSearch className="w-14 h-14" />
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Clinical Guideline Navigator
            </h1>
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mb-4"
              style={{ background: `${bayerBlue}15`, color: bayerBlue }}
            >
              <Cpu className="w-4 h-4" />
              ORCHESTRATOR MODE
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              A medical research assistant that helps structure clinical or academic projects through clear phases and institutional requirements.
              <br />
              <span className="text-lg">Designed for clean, scientific UX with a guided workflow.</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-12">
            {kpiStats.map((stat, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: `hsl(var(--${categoryColor}))` }}
                >
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 px-8 text-primary-foreground"
              style={{ background: `hsl(var(--${categoryColor}))` }}
              onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="w-4 h-4" />
              Try Live Demo
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8">
              Request Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Intelligent automation in three simple steps
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            <div 
              className="absolute left-6 top-6 bottom-6 w-0.5"
              style={{ background: `linear-gradient(to bottom, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.2))` }}
            />

            <div className="space-y-0">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-6 py-6">
                  <div 
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
                    style={{
                      background: `hsl(var(--${categoryColor}))`,
                      boxShadow: `0 8px 20px -6px hsl(var(--${categoryColor}) / 0.5)`
                    }}
                  >
                    {step.icon || <span className="text-lg">{index + 1}</span>}
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {index < workflowSteps.length - 1 && (
                    <ArrowDown 
                      className="absolute left-[18px] -bottom-3 w-6 h-6 z-20"
                      style={{ color: `hsl(var(--${categoryColor}) / 0.5)` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4 font-medium">Powered By</p>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground shadow-sm"
                >
                  {tech.includes('HIPAA') && <Shield className="w-4 h-4 text-success" />}
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS SECTION */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Seamlessly Integrated
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Zero-Friction Integration via API/RPA. No disruption to your core system.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl px-8 py-6 text-center shadow-sm hover:shadow-md hover:border-border/80 transition-all min-w-[140px]"
              >
                <div className="text-lg font-semibold text-foreground">{integration.name}</div>
              </div>
            ))}
            
            <div 
              className="rounded-xl p-5 flex items-center justify-center text-white shadow-lg"
              style={{
                background: `hsl(var(--${categoryColor}))`,
                boxShadow: `0 15px 30px -10px hsl(var(--${categoryColor}) / 0.4)`
              }}
            >
              <FileSearch className="w-10 h-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ROI SECTION */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Calculate Your ROI
            </h2>
            <p className="text-muted-foreground text-lg">
              See the potential savings for your organization
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-base font-medium text-foreground">
                  Protocols Reviewed Per Year
                </label>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: `hsl(var(--${categoryColor}))` }}
                >
                  {roiValue.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[roiValue]}
                onValueChange={(value) => setRoiValue(value[0])}
                min={5}
                max={100}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>5</span>
                <span>100</span>
              </div>
            </div>

            <div 
              className="text-center p-8 rounded-xl border"
              style={{ 
                background: `hsl(var(--${categoryColor}) / 0.05)`,
                borderColor: `hsl(var(--${categoryColor}) / 0.2)`
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  Estimated Annual Savings
                </p>
              </div>
              <p 
                className="text-4xl md:text-5xl font-bold"
                style={{ color: `hsl(var(--${categoryColor}))` }}
              >
                ${(roiValue * 15000).toLocaleString()} USD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MULTI-AGENT ORCHESTRATION CENTER - 2 PHASES */}
      <section id="live-demo" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Dynamic Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 mb-4"
              style={{
                borderColor: bayerBlue,
                background: `${bayerBlue}10`,
                color: bayerBlue
              }}
            >
              <Zap className="w-4 h-4" />
              Multi-Agent Orchestrator
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Clinical Guideline Navigator: Orchestrator Mode
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Sistema de 2 Fases para Investigación Científica Rigurosa
            </p>
          </div>

          {/* Phase Tabs */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActivePhase('protocol')}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all text-left",
                  activePhase === 'protocol'
                    ? "bg-white shadow-xl border-2"
                    : "bg-muted/50 hover:bg-muted"
                )}
                style={activePhase === 'protocol' ? { borderColor: bayerBlue } : {}}
              >
                <div 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    activePhase === 'protocol' ? "text-white" : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                  style={activePhase === 'protocol' ? { background: bayerBlue } : {}}
                >
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold" style={activePhase === 'protocol' ? { color: bayerBlue } : {}}>
                    Fase 1: Protocolo
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rigor Metodológico (Agentes 1-8)
                  </div>
                </div>
              </button>

              <button
                onClick={() => isPhase2Unlocked && setActivePhase('execution')}
                disabled={!isPhase2Unlocked}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all text-left relative",
                  activePhase === 'execution'
                    ? "bg-white shadow-xl border-2"
                    : isPhase2Unlocked
                      ? "bg-muted/50 hover:bg-muted"
                      : "bg-muted/30 cursor-not-allowed opacity-60"
                )}
                style={activePhase === 'execution' ? { borderColor: '#00A651' } : {}}
              >
                {!isPhase2Unlocked && (
                  <Lock className="absolute top-3 right-3 w-4 h-4 text-muted-foreground" />
                )}
                <div 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    activePhase === 'execution' ? "text-white" : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                  style={activePhase === 'execution' ? { background: '#00A651' } : {}}
                >
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold" style={activePhase === 'execution' ? { color: '#00A651' } : {}}>
                    Fase 2: Ejecución
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isPhase2Unlocked ? 'Acción Científica' : 'Requiere Protocolo Aprobado'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* PHASE 1: PROTOCOL */}
          {activePhase === 'protocol' && (
            <div className="space-y-8">
              {/* Sub-Agents Panel */}
              <div className="bg-muted/20 rounded-2xl p-6 border">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: bayerBlue }} />
                  Agentes en Servicio
                </h3>
                <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
                  {subAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={cn(
                        "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 min-w-[140px]",
                        agent.isActive 
                          ? "bg-white shadow-lg scale-105" 
                          : "bg-white/50 opacity-60"
                      )}
                      style={{
                        borderColor: agent.isActive ? agent.color : 'transparent',
                        boxShadow: agent.isActive ? `0 8px 30px -8px ${agent.color}40` : 'none',
                        borderRadius: '12px'
                      }}
                    >
                      {agent.isProcessing && (
                        <div 
                          className="absolute inset-0 rounded-xl animate-pulse"
                          style={{ background: `${agent.color}15` }}
                        />
                      )}
                      
                      <div 
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-white mb-3 transition-transform",
                          agent.isProcessing && "animate-bounce"
                        )}
                        style={{ background: agent.color }}
                      >
                        {agent.icon}
                      </div>
                      
                      <h4 className="font-semibold text-sm text-foreground text-center leading-tight mb-1">
                        {agent.name}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        {agent.role}
                      </p>
                      
                      <div className={cn(
                        "mt-2 w-2 h-2 rounded-full",
                        agent.isProcessing 
                          ? "animate-ping" 
                          : agent.isActive 
                            ? "bg-emerald-500" 
                            : "bg-muted-foreground/30"
                      )} style={agent.isProcessing ? { background: agent.color } : {}} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Split Screen Workspace */}
              <div 
                className="bg-white border-2 rounded-2xl overflow-hidden min-h-[700px] flex"
                style={{ 
                  borderColor: '#e5e7eb',
                  boxShadow: '0 4px 20px -5px rgba(0,0,0,0.08)',
                  borderRadius: '12px'
                }}
              >
                {/* Left Side - Input Panel */}
                <div className="w-1/2 border-r border-border flex flex-col">
                  <div 
                    className="p-4 border-b font-semibold flex items-center gap-2"
                    style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                  >
                    <Upload className="w-5 h-5" />
                    Input: Idea de Investigación
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div 
                      className="border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-colors hover:border-primary/50 cursor-pointer"
                      style={{ borderColor: '#d1d5db', borderRadius: '12px' }}
                    >
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium text-foreground mb-1">Subir Protocolo Borrador</p>
                      <p className="text-sm text-muted-foreground">PDF, Word o texto plano</p>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="text-sm font-medium text-foreground mb-2">
                        O describe tu idea de investigación:
                      </label>
                      <Textarea
                        placeholder="Ej: Investigar el efecto neuroprotector de la Metformina en la prevención del Alzheimer..."
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        className="flex-1 resize-none text-sm border-border"
                        style={{ borderRadius: '12px', fontFamily: 'system-ui, sans-serif' }}
                      />
                    </div>

                    <Button
                      onClick={simulatePhase1Orchestration}
                      disabled={isOrchestrating || !ideaInput.trim()}
                      className="mt-6 h-14 text-lg font-semibold text-white gap-3 transition-all"
                      style={{ 
                        background: isOrchestrating ? '#6b7280' : bayerBlue,
                        boxShadow: isOrchestrating ? 'none' : `0 8px 25px -5px ${bayerBlue}40`,
                        borderRadius: '12px'
                      }}
                    >
                      {isOrchestrating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Orquestando Agentes...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Analizar Idea
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Side - Agent Output Panel */}
                <div className="w-1/2 flex flex-col bg-muted/10">
                  <div 
                    className="p-4 border-b font-semibold flex items-center gap-2"
                    style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                  >
                    <Cpu className="w-5 h-5" />
                    Output: Actividad de Agentes
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      {agentMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                          <div className="text-center">
                            <Cpu className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p>Los agentes comenzarán a trabajar cuando analices una idea...</p>
                          </div>
                        </div>
                      ) : (
                        agentMessages.map((msg) => {
                          const agent = getAgentInfo(msg.agent);
                          
                          return (
                            <div key={msg.id} className="bg-white rounded-xl p-4 border shadow-sm" style={{ borderRadius: '12px' }}>
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                                  style={{ background: agent.color }}
                                >
                                  {agent.icon}
                                </div>
                                <span className="font-semibold text-sm" style={{ color: agent.color }}>
                                  {agent.name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {msg.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              
                              {msg.type === 'text' && (
                                <p className="text-sm text-foreground">{msg.message}</p>
                              )}
                              
                              {msg.type === 'picot-result' && (
                                <div className="space-y-2 mt-3">
                                  <div className="grid grid-cols-5 gap-2 text-xs">
                                    {Object.entries(metforminPICOT).map(([key, value]) => (
                                      <div key={key} className="p-2 rounded-lg" style={{ background: '#DC262615' }}>
                                        <div className="font-bold uppercase mb-1" style={{ color: '#DC2626' }}>
                                          {key.charAt(0)}
                                        </div>
                                        <div className="text-foreground leading-tight">{value}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {msg.type === 'gaps' && (
                                <div className="space-y-2 mt-3">
                                  {metforminEvidenceGaps.map((gap, idx) => (
                                    <div 
                                      key={idx}
                                      className={cn(
                                        "p-2 rounded-lg text-xs flex items-start gap-2",
                                        gap.severity === 'high' ? "bg-red-50 border-l-4 border-red-500" : "bg-amber-50 border-l-4 border-amber-500"
                                      )}
                                    >
                                      <AlertTriangle className={cn(
                                        "w-4 h-4 shrink-0",
                                        gap.severity === 'high' ? "text-red-500" : "text-amber-500"
                                      )} />
                                      <span className="text-foreground">{gap.gap}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {msg.type === 'criteria-table' && (
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                  <div>
                                    <h5 className="font-semibold text-xs text-emerald-700 mb-2 flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Criterios de Inclusión
                                    </h5>
                                    <div className="space-y-1">
                                      {metforminInclusionCriteria.map((c, idx) => (
                                        <div key={idx} className="text-xs p-1.5 bg-emerald-50 rounded flex items-center gap-1.5">
                                          <Check className="w-3 h-3 text-emerald-600" />
                                          {c.criterion}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-xs text-red-700 mb-2 flex items-center gap-1">
                                      <XCircle className="w-3.5 h-3.5" />
                                      Criterios de Exclusión
                                    </h5>
                                    <div className="space-y-1">
                                      {metforminExclusionCriteria.map((c, idx) => (
                                        <div key={idx} className="text-xs p-1.5 bg-red-50 rounded flex items-center gap-1.5">
                                          <Minus className="w-3 h-3 text-red-600" />
                                          {c.criterion}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}

                      {/* Yadav Search Equations Widget */}
                      {showProtocolPreview && (
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4" style={{ borderRadius: '12px' }}>
                          <div 
                            className="p-3 font-semibold text-sm flex items-center gap-2"
                            style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                          >
                            <Search className="w-4 h-4" />
                            Ecuaciones de Búsqueda - Método Yadav 2025 (Dos Capas)
                          </div>
                          
                          <Tabs defaultValue="pubmed" className="p-4">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                              <TabsTrigger value="pubmed" className="text-xs font-medium">PubMed</TabsTrigger>
                              <TabsTrigger value="embase" className="text-xs font-medium">Embase</TabsTrigger>
                              <TabsTrigger value="cochrane" className="text-xs font-medium">Cochrane</TabsTrigger>
                              <TabsTrigger value="scopus" className="text-xs font-medium">Scopus</TabsTrigger>
                            </TabsList>
                            
                            {(['pubmed', 'embase', 'cochrane', 'scopus'] as const).map((db) => (
                              <TabsContent key={db} value={db}>
                                <div className="relative">
                                  <pre 
                                    className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed"
                                    style={{ maxHeight: 200, fontFamily: 'JetBrains Mono, Consolas, monospace', borderRadius: '12px' }}
                                  >
                                    {metforminSearchEquations[db]}
                                  </pre>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="absolute top-2 right-2 gap-1.5 text-xs"
                                    onClick={() => handleCopyToClipboard(metforminSearchEquations[db], db)}
                                    style={{ borderRadius: '8px' }}
                                  >
                                    {copiedTab === db ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        Copiado
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        Copiar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Protocol Preview & Approval Checkpoint */}
              {showProtocolPreview && (
                <div className="bg-white border-2 rounded-2xl overflow-hidden" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                  <div 
                    className="p-4 border-b font-bold flex items-center justify-between"
                    style={{ background: `${bayerBlue}05` }}
                  >
                    <div className="flex items-center gap-2" style={{ color: bayerBlue }}>
                      <FileText className="w-5 h-5" />
                      Protocol Preview - 17 Secciones Institucionales
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowProtocolModal(true)}
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar Borrador de Protocolo
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                      {protocolSections.map((section) => (
                        <div 
                          key={section.id}
                          className={cn(
                            "p-3 rounded-xl border text-sm flex items-start gap-2",
                            section.status === 'complete' && "bg-emerald-50 border-emerald-200",
                            section.status === 'warning' && "bg-amber-50 border-amber-200",
                            section.status === 'pending' && "bg-gray-50 border-gray-200"
                          )}
                          style={{ borderRadius: '12px' }}
                        >
                          {section.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                          {section.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                          {section.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />}
                          <span className="text-xs font-medium">{section.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Approval Button */}
                    <div className="flex justify-center relative">
                      {showApprovalAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/90 rounded-xl">
                          <div className="text-center animate-bounce">
                            <Award className="w-20 h-20 mx-auto mb-2 text-emerald-500" />
                            <p className="text-xl font-bold text-emerald-600">Sello de Aprobación Ética</p>
                            <p className="text-sm text-muted-foreground">Protocolo validado - Desbloqueando Fase 2...</p>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleApproveProtocol}
                        disabled={isPhase2Unlocked || showApprovalAnimation}
                        className="h-16 px-12 text-lg font-bold text-white gap-3 transition-all"
                        style={{ 
                          background: isPhase2Unlocked ? '#10b981' : '#00A651',
                          boxShadow: '0 8px 25px -5px rgba(0, 166, 81, 0.4)',
                          borderRadius: '12px'
                        }}
                      >
                        {isPhase2Unlocked ? (
                          <>
                            <Unlock className="w-6 h-6" />
                            Protocolo Aprobado - Fase 2 Desbloqueada
                          </>
                        ) : (
                          <>
                            <Award className="w-6 h-6" />
                            ✅ Aprobar Protocolo y Ejecutar Búsqueda
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE 2: EXECUTION */}
          {activePhase === 'execution' && isPhase2Unlocked && (
            <div className="space-y-8">
              {/* PRISMA Flow Diagram */}
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" style={{ color: '#00A651' }} />
                  Diagrama PRISMA - Flujo de Selección Dinámico
                </h3>
                
                <div className="flex flex-col items-center gap-2">
                  {prismaBlocks.map((block, index) => (
                    <div key={index} className="w-full max-w-md">
                      <div 
                        className="p-4 rounded-xl text-center transition-all hover:scale-102"
                        style={{ 
                          background: index === prismaBlocks.length - 1 ? '#00A651' : `${bayerBlue}${15 - index * 2}0`,
                          color: index === prismaBlocks.length - 1 ? 'white' : bayerBlue,
                          borderRadius: '12px'
                        }}
                      >
                        <div className="text-3xl font-bold font-mono">{block.count.toLocaleString()}</div>
                        <div className="font-semibold">{block.label}</div>
                        <div className="text-xs opacity-80">{block.description}</div>
                      </div>
                      {index < prismaBlocks.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowDown className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground ml-2">
                            -{(block.targetCount - prismaBlocks[index + 1].targetCount).toLocaleString()} excluidos
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Authors Consensus Widget */}
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" style={{ color: bayerBlue }} />
                  Consenso de 3 Revisores IA - Artículo #{currentArticleIndex || 1}
                </h3>
                
                <div className="flex justify-center gap-8 mb-6">
                  {authorVotes.map((author, idx) => (
                    <div key={idx} className="text-center">
                      <div 
                        className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 border-4 transition-all",
                          author.vote === 'include' && "border-emerald-500 bg-emerald-50",
                          author.vote === 'exclude' && "border-red-500 bg-red-50",
                          author.vote === 'pending' && "border-gray-300 bg-gray-50 animate-pulse"
                        )}
                      >
                        {author.avatar}
                      </div>
                      <p className="font-semibold text-sm text-foreground">{author.name}</p>
                      <div className={cn(
                        "mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase",
                        author.vote === 'include' && "bg-emerald-100 text-emerald-700",
                        author.vote === 'exclude' && "bg-red-100 text-red-700",
                        author.vote === 'pending' && "bg-gray-100 text-gray-500"
                      )}>
                        {author.vote === 'include' && <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Incluir</span>}
                        {author.vote === 'exclude' && <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Excluir</span>}
                        {author.vote === 'pending' && 'Evaluando...'}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Los revisores IA votan independientemente. Consenso por mayoría (2/3).</p>
                </div>
              </div>

              {/* Forest Plot SVG (Meta-analysis) */}
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Diamond className="w-6 h-6" style={{ color: '#6B21A8' }} />
                  Forest Plot - Meta-análisis de Resultados
                </h3>
                
                {/* SVG Forest Plot */}
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 700 320" className="w-full min-w-[600px]" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {/* Background */}
                    <rect width="700" height="320" fill="white" />
                    
                    {/* Title */}
                    <text x="350" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">
                      Metformina y Riesgo de Enfermedad de Alzheimer (OR, IC 95%)
                    </text>
                    
                    {/* Y-axis labels (studies) */}
                    <g transform="translate(0, 45)">
                      {forestPlotData.map((study, idx) => (
                        <text 
                          key={idx} 
                          x="10" 
                          y={idx * 35 + 15} 
                          fontSize="10" 
                          fill={study.isPooled ? '#6B21A8' : '#374151'}
                          fontWeight={study.isPooled ? 'bold' : 'normal'}
                        >
                          {study.study}
                        </text>
                      ))}
                    </g>
                    
                    {/* Plot area */}
                    <g transform="translate(140, 45)">
                      {/* Grid lines */}
                      <line x1="0" y1="0" x2="0" y2="245" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="150" y1="0" x2="150" y2="245" stroke="#e5e7eb" strokeWidth="1" />
                      <line x1="300" y1="0" x2="300" y2="245" stroke="#e5e7eb" strokeWidth="1" />
                      
                      {/* No-effect line (OR = 1) */}
                      <line x1="150" y1="0" x2="150" y2="245" stroke="#374151" strokeWidth="2" strokeDasharray="4,4" />
                      
                      {/* Studies with CI lines and points */}
                      {forestPlotData.map((study, idx) => {
                        const y = idx * 35 + 15;
                        const scale = (or: number) => ((or - 0.2) / 1.3) * 300;
                        const xOR = scale(study.or);
                        const xLow = scale(study.ci_low);
                        const xHigh = scale(study.ci_high);
                        
                        return (
                          <g key={idx}>
                            {/* CI line */}
                            <line 
                              x1={xLow} 
                              y1={y} 
                              x2={xHigh} 
                              y2={y} 
                              stroke={study.isPooled ? '#6B21A8' : '#0033A0'} 
                              strokeWidth={study.isPooled ? 3 : 2} 
                            />
                            
                            {/* CI caps */}
                            <line x1={xLow} y1={y-4} x2={xLow} y2={y+4} stroke={study.isPooled ? '#6B21A8' : '#0033A0'} strokeWidth="2" />
                            <line x1={xHigh} y1={y-4} x2={xHigh} y2={y+4} stroke={study.isPooled ? '#6B21A8' : '#0033A0'} strokeWidth="2" />
                            
                            {/* Point estimate (diamond for pooled) */}
                            {study.isPooled ? (
                              <polygon 
                                points={`${xOR},${y-10} ${xOR+10},${y} ${xOR},${y+10} ${xOR-10},${y}`}
                                fill="#6B21A8"
                              />
                            ) : (
                              <circle cx={xOR} cy={y} r={Math.sqrt(study.weight) * 1.2} fill="#0033A0" />
                            )}
                          </g>
                        );
                      })}
                      
                      {/* X-axis */}
                      <line x1="0" y1="260" x2="300" y2="260" stroke="#374151" strokeWidth="1" />
                      
                      {/* X-axis labels */}
                      <text x="0" y="278" fontSize="10" fill="#374151" textAnchor="middle">0.2</text>
                      <text x="75" y="278" fontSize="10" fill="#374151" textAnchor="middle">0.5</text>
                      <text x="150" y="278" fontSize="10" fill="#374151" textAnchor="middle">1.0</text>
                      <text x="225" y="278" fontSize="10" fill="#374151" textAnchor="middle">1.3</text>
                      <text x="300" y="278" fontSize="10" fill="#374151" textAnchor="middle">1.5</text>
                      
                      {/* Axis labels */}
                      <text x="50" y="295" fontSize="10" fill="#059669" fontWeight="bold">← Favorece Metformina</text>
                      <text x="250" y="295" fontSize="10" fill="#DC2626" fontWeight="bold" textAnchor="end">Favorece Control →</text>
                    </g>
                    
                    {/* OR values column */}
                    <g transform="translate(480, 45)">
                      <text x="0" y="-10" fontSize="10" fontWeight="bold" fill="#374151">OR [IC 95%]</text>
                      {forestPlotData.map((study, idx) => (
                        <text 
                          key={idx} 
                          x="0" 
                          y={idx * 35 + 15} 
                          fontSize="9" 
                          fill={study.isPooled ? '#6B21A8' : '#374151'}
                          fontWeight={study.isPooled ? 'bold' : 'normal'}
                          fontFamily="monospace"
                        >
                          {study.or.toFixed(2)} [{study.ci_low.toFixed(2)}-{study.ci_high.toFixed(2)}]
                        </text>
                      ))}
                    </g>
                    
                    {/* Weight column */}
                    <g transform="translate(620, 45)">
                      <text x="0" y="-10" fontSize="10" fontWeight="bold" fill="#374151">Peso</text>
                      {forestPlotData.map((study, idx) => (
                        <text 
                          key={idx} 
                          x="0" 
                          y={idx * 35 + 15} 
                          fontSize="9" 
                          fill={study.isPooled ? '#6B21A8' : '#374151'}
                          fontWeight={study.isPooled ? 'bold' : 'normal'}
                        >
                          {study.weight.toFixed(1)}%
                        </text>
                      ))}
                    </g>
                  </svg>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm" style={{ borderRadius: '12px' }}>
                  <p className="font-semibold text-purple-900 mb-1">Resultado del Meta-análisis:</p>
                  <p className="text-purple-800">
                    <strong>OR combinado = 0.68 (IC 95%: 0.58-0.79), p &lt; 0.001.</strong> Heterogeneidad: I² = 28%, 
                    indicando resultados consistentes entre estudios. <strong>El uso de Metformina se asocia con una 
                    reducción del 32% en el riesgo de desarrollar Alzheimer</strong> comparado con otros antidiabéticos.
                    <br /><br />
                    <span className="font-bold text-purple-900">→ Resultado a favor de la intervención (Diamante a la izquierda de la línea de no-efecto)</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AUDIT LOGS CONSOLE */}
      {auditLogs.length > 0 && (
        <section className="bg-slate-900 border-t-2 border-slate-700">
          <div className="container mx-auto max-w-7xl">
            <div className="p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wider">Audit Logs - Consola Técnica</span>
                <span className="text-xs text-slate-500 ml-auto">{auditLogs.length} registros</span>
              </div>
              
              <div 
                className="bg-slate-950 rounded-xl p-4 max-h-48 overflow-y-auto font-mono text-xs"
                style={{ borderRadius: '8px' }}
              >
                {auditLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "py-1 flex gap-3",
                      log.level === 'success' && "text-emerald-400",
                      log.level === 'warning' && "text-amber-400",
                      log.level === 'info' && "text-blue-400",
                      log.level === 'process' && "text-slate-400"
                    )}
                  >
                    <span className="text-slate-600 shrink-0">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Protocol Draft Modal */}
      <Dialog open={showProtocolModal} onOpenChange={setShowProtocolModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg" style={{ color: bayerBlue }}>
              <FileText className="w-5 h-5" />
              Borrador de Protocolo - Documento Estructurado
            </DialogTitle>
            <DialogDescription>
              Revisión completa de las 17 secciones institucionales generadas por el orquestador
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Title Section */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-foreground mb-2" style={{ color: bayerBlue }}>
                  {protocolSections[0].content}
                </h2>
                <p className="text-sm text-muted-foreground">Revisión Sistemática y Meta-análisis | PROSPERO Registration Pending</p>
              </div>
              
              {/* Justificación */}
              <div>
                <h3 className="font-bold text-foreground mb-2">3. Justificación Científica</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{protocolSections[2].content}</p>
              </div>
              
              {/* PICOT */}
              <div>
                <h3 className="font-bold text-foreground mb-2">4. Pregunta de Investigación (PICOT)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{protocolSections[3].content}</p>
                
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {Object.entries(metforminPICOT).map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="font-bold text-lg mb-1" style={{ color: '#DC2626' }}>{key.charAt(0).toUpperCase()}</div>
                      <div className="text-xs text-foreground leading-tight">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Metodología */}
              <div>
                <h3 className="font-bold text-foreground mb-2">6. Diseño del Estudio</h3>
                <p className="text-sm text-muted-foreground">{protocolSections[5].content}</p>
              </div>
              
              {/* Search Equations */}
              <div>
                <h3 className="font-bold text-foreground mb-2">11. Estrategia de Búsqueda (Método Yadav 2025)</h3>
                <div className="bg-slate-900 rounded-xl p-4 mt-2">
                  <p className="text-xs text-slate-400 mb-2">PubMed/MEDLINE:</p>
                  <pre className="text-xs text-slate-100 whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {metforminSearchEquations.pubmed}
                  </pre>
                </div>
              </div>
              
              {/* All sections list */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="font-bold text-foreground mb-3">Todas las secciones del protocolo:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {protocolSections.map((section) => (
                    <div key={section.id} className="flex items-center gap-2 text-sm">
                      {section.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {section.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {section.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                      <span className={cn(
                        section.status === 'pending' && 'text-muted-foreground'
                      )}>{section.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
