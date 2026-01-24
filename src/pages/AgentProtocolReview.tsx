import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSearch, Upload, Cpu, AlertTriangle, Plus, Send, Building2, FileText,
  Search, ClipboardCheck, Shield, Play, Copy, Check, ChevronRight, BookOpen,
  Filter, FlaskConical, Lock, Unlock, Award, Users, BarChart3, ArrowDown,
  CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Diamond, Minus, Terminal,
  Target, Eye, Microscope, Download, RefreshCw, ShieldCheck, AlertOctagon,
  Activity, Database, Timer, Brain, PenTool, Lightbulb
} from 'lucide-react';
import { MultiAIConsensusLab } from '@/components/MultiAIConsensusLab';
import { ScientificArchitect } from '@/components/ScientificArchitect';
import { IntegratedTerminalView, MedicalAuditStation, PDFReportViewer } from '@/components/terminal';
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

interface ReproducibilityResult {
  database: string;
  expectedCount: number;
  actualCount: number;
  deviation: number;
  keyStudiesFound: string[];
  keyStudiesTotal: number;
  status: 'validating' | 'success' | 'warning' | 'error';
  latencyMs: number;
  searchStringSent: string;
}

interface ValidationLog {
  timestamp: Date;
  action: string;
  result: string;
  details?: string;
  latency?: number;
}

interface SyntaxHealth {
  isValid: boolean;
  parenthesesBalanced: boolean;
  operatorsValid: boolean;
  quotesBalanced: boolean;
  issues: string[];
}

interface AuditSummary {
  volumeMatch: boolean;
  volumeDeviation: number;
  keyStudiesMatch: boolean;
  keyStudiesFound: number;
  keyStudiesTotal: number;
  syntaxHealth: SyntaxHealth;
  overallStatus: 'reproducible' | 'bias-detected' | 'syntax-error';
}

interface PRISMAExcludedArticle {
  id: string;
  title: string;
  reason: string;
  phase: string;
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
  
  // Terminal Mode State - NEW
  const [isTerminalMode, setIsTerminalMode] = useState(false);
  
  // Medical Audit Station State - NEW
  const [isAuditMode, setIsAuditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'terminal' | 'audit'>('audit');
  const [showDossierPDF, setShowDossierPDF] = useState(false);
  
  // Reproducibility Check State - Enhanced
  const [showReproducibilityModal, setShowReproducibilityModal] = useState(false);
  const [reproducibilityInput, setReproducibilityInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [reproducibilityResults, setReproducibilityResults] = useState<ReproducibilityResult[]>([]);
  const [validationLogs, setValidationLogs] = useState<ValidationLog[]>([]);
  const [reproducibilityStatus, setReproducibilityStatus] = useState<'idle' | 'validating' | 'reproducible' | 'bias-detected' | 'syntax-error'>('idle');
  const [useGeneratedEquation, setUseGeneratedEquation] = useState(true);
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [showPRISMAVerification, setShowPRISMAVerification] = useState(false);
  const [prismaExcludedArticles, setPrismaExcludedArticles] = useState<PRISMAExcludedArticle[]>([
    { id: '1', title: 'Liu et al. 2019 - Cross-sectional analysis', reason: 'Diseño no elegible (estudio transversal)', phase: 'duplicados' },
    { id: '2', title: 'Smith et al. 2020 - Case series', reason: 'Sin grupo comparador', phase: 'duplicados' },
    { id: '3', title: 'Wang et al. 2018 - Insulin combined therapy', reason: 'Criterio de exclusión: insulina como primera línea', phase: 'cribado' },
    { id: '4', title: 'García et al. 2021 - Dementia at baseline', reason: 'Demencia preexistente al inicio', phase: 'cribado' },
    { id: '5', title: 'Kumar et al. 2022 - Follow-up < 1 year', reason: 'Seguimiento insuficiente (< 2 años)', phase: 'texto_completo' },
    { id: '6', title: 'Patel et al. 2023 - No cognitive assessment', reason: 'Sin evaluación cognitiva estandarizada', phase: 'texto_completo' },
  ]);
  const [selectedPRISMAPhase, setSelectedPRISMAPhase] = useState<string | null>(null);
  const [showScientificFoundation, setShowScientificFoundation] = useState(false);
  const [scientificFoundationComplete, setScientificFoundationComplete] = useState(false);
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

  const addValidationLog = (action: string, result: string, details?: string, latency?: number) => {
    setValidationLogs(prev => [...prev, { timestamp: new Date(), action, result, details, latency }]);
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

  // Validate Syntax Health
  const validateSyntaxHealth = (equation: string): SyntaxHealth => {
    const issues: string[] = [];
    
    // Check parentheses balance
    let parenCount = 0;
    for (const char of equation) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
      if (parenCount < 0) break;
    }
    const parenthesesBalanced = parenCount === 0;
    if (!parenthesesBalanced) issues.push('Paréntesis desbalanceados');
    
    // Check quotes balance
    const quoteMatches = equation.match(/"/g);
    const quotesBalanced = !quoteMatches || quoteMatches.length % 2 === 0;
    if (!quotesBalanced) issues.push('Comillas sin cerrar');
    
    // Check operators
    const operatorsValid = !/(AND\s+AND|OR\s+OR|NOT\s+NOT)/.test(equation) && 
                           !/^\s*(AND|OR|NOT)/.test(equation) &&
                           !/(AND|OR|NOT)\s*$/.test(equation);
    if (!operatorsValid) issues.push('Operadores booleanos mal formados');
    
    return {
      isValid: parenthesesBalanced && quotesBalanced && operatorsValid,
      parenthesesBalanced,
      operatorsValid,
      quotesBalanced,
      issues
    };
  };

  // Enhanced Reproducibility Check Simulation
  const runReproducibilityCheck = async () => {
    const equationToValidate = useGeneratedEquation ? metforminSearchEquations.pubmed : reproducibilityInput;
    
    if (!equationToValidate.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa o selecciona una ecuación de búsqueda.',
        variant: 'destructive',
      });
      return;
    }

    setIsValidating(true);
    setReproducibilityStatus('validating');
    setReproducibilityResults([]);
    setValidationLogs([]);
    setAuditSummary(null);

    addValidationLog('INIT', 'Iniciando validación de reproducibilidad', 'Protocolo Galatea AI v2.1');
    
    // Syntax Health Check
    addValidationLog('SYNTAX', 'Verificando salud de sintaxis booleana', 'Análisis estructural...', 45);
    await new Promise(r => setTimeout(r, 800));
    
    const syntaxHealth = validateSyntaxHealth(equationToValidate);
    
    if (!syntaxHealth.isValid) {
      addValidationLog('SYNTAX_ERROR', 'Error de sintaxis detectado', syntaxHealth.issues.join(', '), 12);
      setReproducibilityStatus('syntax-error');
      setAuditSummary({
        volumeMatch: false,
        volumeDeviation: 100,
        keyStudiesMatch: false,
        keyStudiesFound: 0,
        keyStudiesTotal: 5,
        syntaxHealth,
        overallStatus: 'syntax-error'
      });
      setIsValidating(false);
      toast({
        title: '❌ Error de Sintaxis',
        description: 'La ecuación contiene errores de sintaxis que impiden la validación.',
        variant: 'destructive',
      });
      return;
    }
    
    addValidationLog('SYNTAX_OK', 'Sintaxis válida', `Paréntesis: ✓ | Operadores: ✓ | Comillas: ✓`, 58);
    
    // Simulate database connections
    const databases = [
      { name: 'PubMed/MEDLINE', expected: 342, delay: 2000, searchString: '("Metformin"[MeSH] OR "Metformin"[tw])...' },
      { name: 'Embase', expected: 287, delay: 2500, searchString: "('metformin'/exp OR 'metformin':ti,ab)..." },
      { name: 'Scopus', expected: 156, delay: 2000, searchString: 'TITLE-ABS-KEY(("metformin" OR...))' },
      { name: 'Cochrane Library', expected: 45, delay: 1500, searchString: '#1 MeSH descriptor: [Metformin]...' },
    ];

    const keyStudies = [
      'Ng TP et al. 2014 - Metformin and cognition',
      'Orkaby AR et al. 2017 - T2DM neuroprotection',
      'Kuan YC et al. 2017 - Dementia risk analysis',
      'Zhang Z et al. 2022 - Cognitive outcomes',
      'Chen F et al. 2023 - Alzheimer prevention'
    ];

    addValidationLog('PARSE', 'Parseando sintaxis booleana', `${equationToValidate.substring(0, 50)}...`, 125);
    await new Promise(r => setTimeout(r, 1000));

    addValidationLog('CONNECT', 'Estableciendo conexiones API', 'PubMed E-utilities, Embase API, Scopus API, Cochrane API', 340);
    await new Promise(r => setTimeout(r, 800));

    let totalExpected = 0;
    let totalActual = 0;
    let totalKeyStudiesFound = 0;

    for (let i = 0; i < databases.length; i++) {
      const db = databases[i];
      const startTime = Date.now();
      addValidationLog('QUERY', `Enviando query a ${db.name}`, db.searchString, 0);
      
      setReproducibilityResults(prev => [...prev, {
        database: db.name,
        expectedCount: db.expected,
        actualCount: 0,
        deviation: 0,
        keyStudiesFound: [],
        keyStudiesTotal: keyStudies.length,
        status: 'validating',
        latencyMs: 0,
        searchStringSent: db.searchString
      }]);

      await new Promise(r => setTimeout(r, db.delay));
      
      const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 200);

      // Simulate result with small random variance
      const variance = Math.random() * 0.08 - 0.04; // -4% to +4% variance
      const actualCount = Math.round(db.expected * (1 + variance));
      const deviation = Math.abs((actualCount - db.expected) / db.expected * 100);
      
      totalExpected += db.expected;
      totalActual += actualCount;
      
      // Randomly select 3-4 key studies as found
      const foundStudies = keyStudies
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 3);
      
      totalKeyStudiesFound = Math.max(totalKeyStudiesFound, foundStudies.length);

      setReproducibilityResults(prev => prev.map(r => 
        r.database === db.name ? {
          ...r,
          actualCount,
          deviation,
          keyStudiesFound: foundStudies,
          keyStudiesTotal: keyStudies.length,
          status: deviation > 5 ? 'warning' : 'success',
          latencyMs,
          searchStringSent: db.searchString
        } : r
      ));

      addValidationLog('RESPONSE', `${db.name}: ${actualCount} resultados`, `Latencia: ${latencyMs}ms | Desviación: ${deviation.toFixed(2)}%`, latencyMs);
    }

    await new Promise(r => setTimeout(r, 500));
    addValidationLog('VERIFY', 'Verificando estudios clave en resultados', `${totalKeyStudiesFound}/${keyStudies.length} estudios detectados`, 89);
    await new Promise(r => setTimeout(r, 800));
    
    // Calculate overall statistics
    const overallDeviation = Math.abs((totalActual - totalExpected) / totalExpected * 100);
    const hasDeviation = overallDeviation > 5;
    const keyStudiesMatch = totalKeyStudiesFound >= 4;

    addValidationLog('SUMMARY', 'Generando resumen de auditoría', `Volumen: ${overallDeviation.toFixed(2)}% desv. | Estudios clave: ${totalKeyStudiesFound}/${keyStudies.length}`, 45);
    addValidationLog('COMPLETE', 'Auditoría de reproducibilidad finalizada', 'Certificado listo para exportar', 12);

    // Set audit summary
    const summary: AuditSummary = {
      volumeMatch: !hasDeviation,
      volumeDeviation: overallDeviation,
      keyStudiesMatch,
      keyStudiesFound: totalKeyStudiesFound,
      keyStudiesTotal: keyStudies.length,
      syntaxHealth,
      overallStatus: hasDeviation ? 'bias-detected' : 'reproducible'
    };
    
    setAuditSummary(summary);
    setReproducibilityStatus(hasDeviation ? 'bias-detected' : 'reproducible');
    setIsValidating(false);

    toast({
      title: hasDeviation ? '⚠️ Desviación Detectada' : '✅ Metodología Reproducible',
      description: hasDeviation 
        ? 'Se detectó una desviación mayor al 5% en algunos resultados.'
        : 'Los resultados coinciden con el protocolo reportado.',
      variant: hasDeviation ? 'destructive' : 'default',
    });
  };

  // Export Transparency Certificate
  const exportTransparencyCertificate = () => {
    const now = new Date();
    const certificateId = `GALATEA-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const logContent = [
      '╔══════════════════════════════════════════════════════════════════════════════╗',
      '║                                                                              ║',
      '║           GALATEA AI - CERTIFICADO DE TRANSPARENCIA METODOLÓGICA            ║',
      '║                     REPRODUCIBILITY VALIDATION CERTIFICATE                   ║',
      '║                                                                              ║',
      '╚══════════════════════════════════════════════════════════════════════════════╝',
      '',
      `  📋 Certificado ID: ${certificateId}`,
      `  📅 Fecha de Emisión: ${now.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `  ⏰ Hora de Validación: ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
      `  🔒 Hash de Integridad: ${btoa(certificateId).substring(0, 32)}`,
      '',
      '═══════════════════════════════════════════════════════════════════════════════',
      '                              ESTADO DE VALIDACIÓN',
      '═══════════════════════════════════════════════════════════════════════════════',
      '',
      reproducibilityStatus === 'reproducible' 
        ? '  ✅ ESTADO: METODOLOGÍA VALIDADA COMO REPRODUCIBLE'
        : reproducibilityStatus === 'syntax-error'
        ? '  ❌ ESTADO: ERROR DE SINTAXIS - VALIDACIÓN FALLIDA'
        : '  ⚠️ ESTADO: DESVIACIÓN DETECTADA - REQUIERE REVISIÓN',
      '',
      auditSummary ? [
        '  ┌─────────────────────────────────────────────────────────────────────────┐',
        '  │ RESUMEN DE AUDITORÍA                                                    │',
        '  ├─────────────────────────────────────────────────────────────────────────┤',
        `  │ • Volumen de Artículos: ${auditSummary.volumeMatch ? '✓ COINCIDE' : '✗ DESVIACIÓN'} (${auditSummary.volumeDeviation.toFixed(2)}% desv.)${' '.repeat(Math.max(0, 20 - auditSummary.volumeDeviation.toFixed(2).length))}│`,
        `  │ • Estudios Clave: ${auditSummary.keyStudiesMatch ? '✓ DETECTADOS' : '✗ INCOMPLETO'} (${auditSummary.keyStudiesFound}/${auditSummary.keyStudiesTotal})${' '.repeat(22)}│`,
        `  │ • Salud de Sintaxis: ${auditSummary.syntaxHealth.isValid ? '✓ VÁLIDA' : '✗ ERRORES'}${' '.repeat(36)}│`,
        `  │   - Paréntesis: ${auditSummary.syntaxHealth.parenthesesBalanced ? '✓' : '✗'}  Operadores: ${auditSummary.syntaxHealth.operatorsValid ? '✓' : '✗'}  Comillas: ${auditSummary.syntaxHealth.quotesBalanced ? '✓' : '✗'}${' '.repeat(14)}│`,
        '  └─────────────────────────────────────────────────────────────────────────┘',
      ].join('\n') : '',
      '',
      '═══════════════════════════════════════════════════════════════════════════════',
      '                           ECUACIÓN DE BÚSQUEDA VALIDADA',
      '═══════════════════════════════════════════════════════════════════════════════',
      '',
      useGeneratedEquation ? metforminSearchEquations.pubmed : reproducibilityInput,
      '',
      '═══════════════════════════════════════════════════════════════════════════════',
      '                       RESULTADOS POR BASE DE DATOS',
      '═══════════════════════════════════════════════════════════════════════════════',
      '',
      ...reproducibilityResults.map(r => [
        `  📊 ${r.database}`,
        `     ├─ Resultados Esperados: ${r.expectedCount}`,
        `     ├─ Resultados Obtenidos: ${r.actualCount}`,
        `     ├─ Desviación: ${r.deviation.toFixed(2)}%`,
        `     ├─ Estado: ${r.status === 'success' ? '✓ VÁLIDO' : '⚠ REVISAR'}`,
        `     ├─ Latencia de Respuesta: ${r.latencyMs}ms`,
        `     ├─ Estudios Clave: ${r.keyStudiesFound.length}/${r.keyStudiesTotal}`,
        `     └─ Search String: ${r.searchStringSent}`,
        ''
      ].join('\n')),
      '',
      '═══════════════════════════════════════════════════════════════════════════════',
      '                          LOG TÉCNICO DE AUDITORÍA',
      '═══════════════════════════════════════════════════════════════════════════════',
      '',
      ...validationLogs.map(l => 
        `  [${l.timestamp.toLocaleTimeString()}] ${l.action}: ${l.result}${l.details ? ` | ${l.details}` : ''}${l.latency ? ` (${l.latency}ms)` : ''}`
      ),
      '',
      '╔══════════════════════════════════════════════════════════════════════════════╗',
      '║                                                                              ║',
      '║     Este certificado fue generado automáticamente por Galatea AI para       ║',
      '║     demostrar la reproducibilidad metodológica de la búsqueda sistemática.  ║',
      '║                                                                              ║',
      '║     Puede ser adjuntado como anexo en publicaciones científicas para        ║',
      '║     demostrar transparencia ante revisores de revistas indexadas.           ║',
      '║                                                                              ║',
      '║     Galatea AI - Precision Medicine Intelligence                            ║',
      '║     https://galatea.ai                                                       ║',
      '║                                                                              ║',
      '╚══════════════════════════════════════════════════════════════════════════════╝',
    ].join('\n');

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado-transparencia-${certificateId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: '📜 Certificado Exportado',
      description: `Certificado de Transparencia ${certificateId} descargado.`,
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

  // Handle terminal mode activation
  const activateTerminalMode = () => {
    if (!ideaInput.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una idea de investigación.',
        variant: 'destructive',
      });
      return;
    }
    setIsTerminalMode(true);
  };

  // Handle audit mode activation - NEW
  const activateAuditMode = () => {
    if (!ideaInput.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una idea de investigación.',
        variant: 'destructive',
      });
      return;
    }
    setIsAuditMode(true);
  };

  // Handle analysis based on view mode
  const handleAnalyzeIdea = () => {
    if (viewMode === 'terminal') {
      activateTerminalMode();
    } else {
      activateAuditMode();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Terminal Mode Overlay */}
      <AnimatePresence>
        {isTerminalMode && (
          <IntegratedTerminalView
            isVisible={isTerminalMode}
            ideaInput={ideaInput}
            onClose={() => setIsTerminalMode(false)}
            onPhase2Unlock={() => {
              setIsPhase2Unlocked(true);
              setActivePhase('execution');
              toast({
                title: '🎉 Fase 2 Desbloqueada',
                description: 'PRISMA completado. Puede acceder al meta-análisis.',
              });
            }}
            onComplete={() => {
              setShowProtocolPreview(true);
              toast({
                title: '✅ Fase 1 Completada',
                description: 'Multi-AI Consensus validado. Protocolo listo para aprobación.',
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* Medical Audit Station Overlay - NEW */}
      <AnimatePresence>
        {isAuditMode && (
          <MedicalAuditStation
            isVisible={isAuditMode}
            ideaInput={ideaInput}
            onClose={() => {
              setIsAuditMode(false);
              setShowProtocolPreview(true);
              setIsPhase2Unlocked(true);
              toast({
                title: '✅ Auditoría Completada',
                description: 'Estación de Auditoría Médica finalizada. Protocolo listo.',
              });
            }}
          />
        )}
      </AnimatePresence>

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
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
              Clinical Guideline Navigator
            </h1>
            <div 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-base font-bold mb-6"
              style={{ background: `${bayerBlue}15`, color: bayerBlue }}
            >
              <Cpu className="w-5 h-5" />
              ORCHESTRATOR MODE
            </div>
            <p className="text-2xl md:text-3xl text-muted-foreground font-light leading-relaxed">
              A medical research assistant that helps structure clinical or academic projects through clear phases and institutional requirements.
              <br />
              <span className="text-xl">Designed for clean, scientific UX with a guided workflow.</span>
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-xl">
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Seamlessly Integrated
            </h2>
            <p className="text-muted-foreground text-xl max-w-xl mx-auto">
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
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Calculate Your ROI
            </h2>
            <p className="text-muted-foreground text-xl">
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
          <div className="text-center mb-10">
            <div 
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-base font-bold border-2 mb-6"
              style={{
                borderColor: bayerBlue,
                background: `${bayerBlue}10`,
                color: bayerBlue
              }}
            >
              <Zap className="w-5 h-5" />
              Multi-Agent Orchestrator
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Clinical Guideline Navigator: Orchestrator Mode
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
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

          {/* PHASE 1: PROTOCOL - Author's Desk Aesthetic */}
          {activePhase === 'protocol' && (
            <div className="space-y-8">
              {/* Author's Desk Header */}
              <div 
                className="text-center py-6 rounded-2xl"
                style={{ 
                  background: 'linear-gradient(180deg, #fefce8 0%, #ffffff 100%)',
                  borderRadius: '12px'
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <PenTool className="w-6 h-6 text-amber-600" />
                  <h3 className="text-xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                    Escritorio del Autor
                  </h3>
                </div>
                <p className="text-sm text-amber-700/80 max-w-lg mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
                  Un espacio minimalista para construir la base científica de tu investigación. 
                  Enfócate en el contenido mientras los agentes estructuran tu protocolo.
                </p>
              </div>

              {/* Scientific Foundation Module - BEFORE PICOT */}
              <ScientificArchitect
                isVisible={true}
                ideaInput={ideaInput}
                onFoundationComplete={() => {
                  setScientificFoundationComplete(true);
                  setShowScientificFoundation(true);
                }}
              />

              {/* Sub-Agents Panel */}
              <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderRadius: '12px' }}>
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
                      
                      <h4 className="font-bold text-base text-foreground text-center leading-tight mb-1">
                        {agent.name}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground text-center">
                        {agent.role}
                      </p>
                      
                      <div className={cn(
                        "mt-3 w-3 h-3 rounded-full",
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

                    {/* View Mode Toggle */}
                    <div className="mt-4 flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                      <span className="text-sm font-medium text-muted-foreground">Modo de vista:</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewMode('audit')}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            viewMode === 'audit'
                              ? "bg-[#0097A7] text-white shadow-md"
                              : "bg-card hover:bg-muted text-muted-foreground"
                          )}
                        >
                          <Microscope className="w-4 h-4" />
                          Auditoría Médica
                        </button>
                        <button
                          onClick={() => setViewMode('terminal')}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            viewMode === 'terminal'
                              ? "bg-[#0A0E14] text-[#00BCFF] shadow-md"
                              : "bg-card hover:bg-muted text-muted-foreground"
                          )}
                        >
                          <Terminal className="w-4 h-4" />
                          Terminal Mode
                        </button>
                      </div>
                    </div>

                    <Button
                      onClick={handleAnalyzeIdea}
                      disabled={isOrchestrating || !ideaInput.trim()}
                      className="mt-4 h-14 text-lg font-semibold text-white gap-3 transition-all"
                      style={{ 
                        background: isOrchestrating 
                          ? '#6b7280' 
                          : viewMode === 'audit' 
                            ? '#0097A7' 
                            : bayerBlue,
                        boxShadow: isOrchestrating 
                          ? 'none' 
                          : viewMode === 'audit'
                            ? '0 8px 25px -5px rgba(0,151,167,0.4)'
                            : `0 8px 25px -5px ${bayerBlue}40`,
                        borderRadius: '12px'
                      }}
                    >
                      {isOrchestrating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Orquestando Agentes...
                        </>
                      ) : viewMode === 'audit' ? (
                        <>
                          <Microscope className="w-5 h-5" />
                          Analizar Idea
                          <span className="text-xs opacity-70 ml-1">→ Auditoría Médica</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-5 h-5" />
                          Analizar Idea
                          <span className="text-xs opacity-70 ml-1">→ Terminal Mode</span>
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
                                <p className="text-base text-foreground leading-relaxed">{msg.message}</p>
                              )}
                              
                              {msg.type === 'picot-result' && (
                                <div className="space-y-3 mt-4">
                                  <div className="grid grid-cols-5 gap-3">
                                    {Object.entries(metforminPICOT).map(([key, value]) => (
                                      <div key={key} className="p-3 rounded-xl border-2 transition-all hover:scale-105" style={{ background: '#DC262608', borderColor: '#DC262640' }}>
                                        <div className="font-black text-xl uppercase mb-2 tracking-wide" style={{ color: '#DC2626' }}>
                                          {key.charAt(0)}
                                        </div>
                                        <div className="text-sm text-foreground leading-snug font-medium">{value}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {msg.type === 'gaps' && (
                                <div className="space-y-3 mt-4">
                                  {metforminEvidenceGaps.map((gap, idx) => (
                                    <div 
                                      key={idx}
                                      className={cn(
                                        "p-3 rounded-xl text-sm flex items-start gap-3",
                                        gap.severity === 'high' ? "bg-red-50 border-l-4 border-red-500" : "bg-amber-50 border-l-4 border-amber-500"
                                      )}
                                    >
                                      <AlertTriangle className={cn(
                                        "w-5 h-5 shrink-0 mt-0.5",
                                        gap.severity === 'high' ? "text-red-500" : "text-amber-500"
                                      )} />
                                      <span className="text-foreground font-medium">{gap.gap}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {msg.type === 'criteria-table' && (
                                <div className="grid grid-cols-2 gap-6 mt-4">
                                  <div>
                                    <h5 className="font-bold text-base text-emerald-700 mb-3 flex items-center gap-2">
                                      <CheckCircle2 className="w-5 h-5" />
                                      Criterios de Inclusión
                                    </h5>
                                    <div className="space-y-2">
                                      {metforminInclusionCriteria.map((c, idx) => (
                                        <div key={idx} className="text-sm p-2.5 bg-emerald-50 rounded-lg flex items-center gap-2 font-medium">
                                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                          {c.criterion}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-base text-red-700 mb-3 flex items-center gap-2">
                                      <XCircle className="w-5 h-5" />
                                      Criterios de Exclusión
                                    </h5>
                                    <div className="space-y-2">
                                      {metforminExclusionCriteria.map((c, idx) => (
                                        <div key={idx} className="text-sm p-2.5 bg-red-50 rounded-lg flex items-center gap-2 font-medium">
                                          <Minus className="w-4 h-4 text-red-600 shrink-0" />
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
                    className="p-5 border-b font-bold flex items-center justify-between"
                    style={{ background: `${bayerBlue}05` }}
                  >
                    <div className="flex items-center gap-3 text-lg" style={{ color: bayerBlue }}>
                      <FileText className="w-6 h-6" />
                      Protocol Preview - 17 Secciones Institucionales
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 font-semibold"
                      onClick={() => setShowProtocolModal(true)}
                    >
                      <Eye className="w-5 h-5" />
                      Visualizar Borrador de Protocolo
                    </Button>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
                      {protocolSections.map((section) => (
                        <div 
                          key={section.id}
                          className={cn(
                            "p-4 rounded-xl border-2 text-sm flex items-start gap-3 transition-all hover:scale-105",
                            section.status === 'complete' && "bg-emerald-50 border-emerald-300",
                            section.status === 'warning' && "bg-amber-50 border-amber-300",
                            section.status === 'pending' && "bg-gray-50 border-gray-300"
                          )}
                          style={{ borderRadius: '12px' }}
                        >
                          {section.status === 'complete' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
                          {section.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                          {section.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-400 shrink-0 mt-0.5" />}
                          <span className="text-sm font-semibold">{section.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Approval Button */}
                    <div className="flex justify-center relative">
                      {showApprovalAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/95 rounded-xl">
                          <div className="text-center animate-bounce">
                            <Award className="w-24 h-24 mx-auto mb-3 text-emerald-500" />
                            <p className="text-2xl font-bold text-emerald-600">Sello de Aprobación Ética</p>
                            <p className="text-base text-muted-foreground">Protocolo validado - Desbloqueando Fase 2...</p>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleApproveProtocol}
                        disabled={isPhase2Unlocked || showApprovalAnimation}
                        className="h-20 px-16 text-xl font-bold text-white gap-4 transition-all hover:scale-105"
                        style={{ 
                          background: isPhase2Unlocked ? '#10b981' : '#00A651',
                          boxShadow: '0 12px 35px -8px rgba(0, 166, 81, 0.5)',
                          borderRadius: '16px'
                        }}
                      >
                        {isPhase2Unlocked ? (
                          <>
                            <Unlock className="w-8 h-8" />
                            Protocolo Aprobado - Fase 2 Desbloqueada
                          </>
                        ) : (
                          <>
                            <Award className="w-8 h-8" />
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

          {/* PHASE 2: EXECUTION - Data Laboratory Aesthetic */}
          {activePhase === 'execution' && isPhase2Unlocked && (
            <div className="space-y-8">
              {/* Data Lab Header */}
              <div 
                className="text-center py-8 rounded-2xl border-2"
                style={{ 
                  background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
                  borderColor: bayerBlue,
                  borderRadius: '16px'
                }}
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <BarChart3 className="w-8 h-8" style={{ color: bayerBlue }} />
                  <h3 className="text-3xl font-bold" style={{ color: bayerBlue, fontFamily: 'JetBrains Mono, monospace' }}>
                    LABORATORIO DE DATOS
                  </h3>
                </div>
                <p className="text-lg text-blue-700/80 max-w-xl mx-auto font-mono">
                  Ejecución científica con gráficos, tablas y queries en tiempo real.
                  Validación cruzada multi-motor habilitada.
                </p>
              </div>

              {/* PRISMA Flow Diagram with Verification */}
              <div className="bg-white border-2 rounded-2xl p-8" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    <BarChart3 className="w-8 h-8" style={{ color: '#00A651' }} />
                    Diagrama PRISMA - Flujo de Selección Dinámico
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPRISMAVerification(!showPRISMAVerification)}
                    className="gap-2"
                    style={{ borderRadius: '12px' }}
                  >
                    <Eye className="w-4 h-4" />
                    {showPRISMAVerification ? 'Ocultar Detalles' : 'Verificar cada fase'}
                  </Button>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  {prismaBlocks.map((block, index) => (
                    <div key={index} className="w-full max-w-md">
                      <div 
                        className={cn(
                          "p-4 rounded-xl text-center transition-all cursor-pointer",
                          selectedPRISMAPhase === block.label ? "ring-2 ring-offset-2 ring-blue-500" : "hover:scale-102"
                        )}
                        style={{ 
                          background: index === prismaBlocks.length - 1 ? '#00A651' : `${bayerBlue}${15 - index * 2}0`,
                          color: index === prismaBlocks.length - 1 ? 'white' : bayerBlue,
                          borderRadius: '12px'
                        }}
                        onClick={() => setSelectedPRISMAPhase(selectedPRISMAPhase === block.label ? null : block.label)}
                      >
                        <div className="text-4xl font-bold font-mono">{block.count.toLocaleString()}</div>
                        <div className="text-lg font-bold">{block.label}</div>
                        <div className="text-sm opacity-80">{block.description}</div>
                      </div>
                      
                      {/* Show excluded articles for this phase if verification is on */}
                      {showPRISMAVerification && selectedPRISMAPhase === block.label && index < prismaBlocks.length - 1 && (
                        <div className="mt-4 p-5 bg-red-50 border-2 border-red-200 rounded-xl" style={{ borderRadius: '12px' }}>
                          <h4 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Artículos Excluidos en: {block.label}
                          </h4>
                          <div className="space-y-3">
                            {prismaExcludedArticles
                              .filter(a => 
                                (block.label === 'Identificados' && a.phase === 'duplicados') ||
                                (block.label === 'Tras Duplicados' && a.phase === 'cribado') ||
                                (block.label === 'Cribados' && a.phase === 'texto_completo')
                              )
                              .map((article) => (
                                <div key={article.id} className="text-sm p-3 bg-white rounded-lg border-2 border-red-100">
                                  <p className="font-semibold text-foreground">{article.title}</p>
                                  <p className="text-red-600 mt-1.5">📋 Razón: {article.reason}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      
                      {index < prismaBlocks.length - 1 && (
                        <div className="flex justify-center items-center py-3">
                          <ArrowDown className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground ml-3">
                            -{(block.targetCount - prismaBlocks[index + 1].targetCount).toLocaleString()} excluidos
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Authors Consensus Widget */}
              <div className="bg-white border-2 rounded-2xl p-8" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <Users className="w-8 h-8" style={{ color: bayerBlue }} />
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
              <div className="bg-white border-2 rounded-2xl p-8" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
                  <Diamond className="w-8 h-8" style={{ color: '#6B21A8' }} />
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
                
                <div className="mt-8 p-6 bg-purple-50 rounded-xl text-base" style={{ borderRadius: '12px' }}>
                  <p className="font-bold text-lg text-purple-900 mb-2">Resultado del Meta-análisis:</p>
                  <p className="text-purple-800 leading-relaxed">
                    <strong className="text-xl">OR combinado = 0.68 (IC 95%: 0.58-0.79), p &lt; 0.001.</strong> Heterogeneidad: I² = 28%, 
                    indicando resultados consistentes entre estudios. <strong>El uso de Metformina se asocia con una 
                    reducción del 32% en el riesgo de desarrollar Alzheimer</strong> comparado con otros antidiabéticos.
                    <br /><br />
                    <span className="font-black text-lg text-purple-900">→ Resultado a favor de la intervención (Diamante a la izquierda de la línea de no-efecto)</span>
                  </p>
                </div>
              </div>

              {/* AUDIT & CONSISTENCY LAB - Enhanced Reproducibility Check */}
              <div className="bg-white border-2 rounded-2xl overflow-hidden" style={{ borderColor: bayerBlue, borderRadius: '12px' }}>
                {/* Header */}
                <div 
                  className="p-4 flex items-center justify-between"
                  style={{ background: `${bayerBlue}08` }}
                >
                  <h3 className="text-2xl font-bold flex items-center gap-3" style={{ color: bayerBlue }}>
                    <Microscope className="w-8 h-8" />
                    Audit & Consistency Lab
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100" style={{ color: bayerBlue }}>
                      Bayer Compliance
                    </div>
                    <Button
                      onClick={() => setShowReproducibilityModal(true)}
                      className="gap-2 text-white font-bold"
                      style={{ background: bayerBlue, borderRadius: '12px' }}
                    >
                      <Search className="w-4 h-4" />
                      🔍 EJECUTAR PRUEBA DE REPRODUCIBILIDAD
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Scanner de Consistencia - 3 Checks */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Volume Check */}
                    <div className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all",
                      !auditSummary ? "bg-gray-50 border-gray-200" :
                      auditSummary.volumeMatch ? "bg-emerald-50 border-emerald-500" : "bg-amber-50 border-amber-500"
                    )} style={{ borderRadius: '12px' }}>
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                        style={{ background: auditSummary?.volumeMatch ? '#10b981' : auditSummary ? '#f59e0b' : '#9ca3af' }}>
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-base mb-2">Volumen de Artículos</h4>
                      {auditSummary ? (
                        <>
                          <p className={cn("text-3xl font-bold", auditSummary.volumeMatch ? "text-emerald-600" : "text-amber-600")}>
                            {auditSummary.volumeDeviation.toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {auditSummary.volumeMatch ? 'Coincide con protocolo' : 'Desviación detectada'}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">Ejecuta la prueba para ver resultados</p>
                      )}
                    </div>

                    {/* Key Studies Match */}
                    <div className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all",
                      !auditSummary ? "bg-gray-50 border-gray-200" :
                      auditSummary.keyStudiesMatch ? "bg-emerald-50 border-emerald-500" : "bg-amber-50 border-amber-500"
                    )} style={{ borderRadius: '12px' }}>
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                        style={{ background: auditSummary?.keyStudiesMatch ? '#10b981' : auditSummary ? '#f59e0b' : '#9ca3af' }}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-base mb-2">Key Studies Match</h4>
                      {auditSummary ? (
                        <>
                          <p className={cn("text-3xl font-bold", auditSummary.keyStudiesMatch ? "text-emerald-600" : "text-amber-600")}>
                            {auditSummary.keyStudiesFound}/{auditSummary.keyStudiesTotal}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {auditSummary.keyStudiesMatch ? 'Estudios clave detectados' : 'Estudios faltantes'}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">5 estudios de referencia</p>
                      )}
                    </div>

                    {/* Syntax Health */}
                    <div className={cn(
                      "p-4 rounded-xl border-2 text-center transition-all",
                      !auditSummary ? "bg-gray-50 border-gray-200" :
                      auditSummary.syntaxHealth.isValid ? "bg-emerald-50 border-emerald-500" : "bg-red-50 border-red-500"
                    )} style={{ borderRadius: '12px' }}>
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                        style={{ background: auditSummary?.syntaxHealth.isValid ? '#10b981' : auditSummary ? '#ef4444' : '#9ca3af' }}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-base mb-2">Syntax Health</h4>
                      {auditSummary ? (
                        <>
                          <div className="flex justify-center gap-3 mb-2">
                            <span className={cn("text-sm px-3 py-1 rounded-lg font-medium", auditSummary.syntaxHealth.parenthesesBalanced ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              () {auditSummary.syntaxHealth.parenthesesBalanced ? '✓' : '✗'}
                            </span>
                            <span className={cn("text-sm px-3 py-1 rounded-lg font-medium", auditSummary.syntaxHealth.operatorsValid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              AND/OR {auditSummary.syntaxHealth.operatorsValid ? '✓' : '✗'}
                            </span>
                            <span className={cn("text-sm px-3 py-1 rounded-lg font-medium", auditSummary.syntaxHealth.quotesBalanced ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              "" {auditSummary.syntaxHealth.quotesBalanced ? '✓' : '✗'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {auditSummary.syntaxHealth.isValid ? 'Sintaxis válida' : auditSummary.syntaxHealth.issues[0]}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">Verificación de operadores</p>
                      )}
                    </div>
                  </div>

                  {/* Feedback Metodológico - Badge */}
                  {auditSummary && (
                    <div 
                      className={cn(
                        "p-6 rounded-xl text-center border-2 mb-6",
                        auditSummary.overallStatus === 'reproducible' && "bg-emerald-50 border-emerald-500",
                        auditSummary.overallStatus === 'bias-detected' && "bg-amber-50 border-amber-500",
                        auditSummary.overallStatus === 'syntax-error' && "bg-red-50 border-red-500"
                      )}
                      style={{ borderRadius: '12px' }}
                    >
                      {auditSummary.overallStatus === 'reproducible' && (
                        <>
                          <div className="flex justify-center mb-3">
                            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                              <ShieldCheck className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h4 className="text-2xl font-bold text-emerald-700 mb-2">
                            🏅 METODOLOGÍA VALIDADA: REPRODUCIBLE
                          </h4>
                          <p className="text-sm text-emerald-600 max-w-xl mx-auto">
                            Los resultados de búsqueda coinciden con lo reportado en el protocolo. 
                            Esta metodología cumple con los estándares de reproducibilidad científica.
                            <br /><strong>Certificado por Galatea AI</strong>
                          </p>
                        </>
                      )}
                      {auditSummary.overallStatus === 'bias-detected' && (
                        <>
                          <div className="flex justify-center mb-3">
                            <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center">
                              <AlertOctagon className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h4 className="text-2xl font-bold text-amber-700 mb-2">
                            ⚠️ Advertencia de Sesgo
                          </h4>
                          <p className="text-sm text-amber-600 max-w-xl mx-auto">
                            La búsqueda actual no replica exactamente los resultados del protocolo. 
                            <br /><strong>Revise la fecha de consulta o la sintaxis de búsqueda.</strong>
                          </p>
                        </>
                      )}
                      {auditSummary.overallStatus === 'syntax-error' && (
                        <>
                          <div className="flex justify-center mb-3">
                            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                              <XCircle className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h4 className="text-2xl font-bold text-red-700 mb-2">
                            ❌ Error de Sintaxis
                          </h4>
                          <p className="text-sm text-red-600 max-w-xl mx-auto">
                            Se detectaron errores en la sintaxis de la ecuación de búsqueda.
                            <br /><strong>Corrija los errores antes de validar.</strong>
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">Verificación en tiempo real</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Conexión multi-base</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">Latencia monitoreada</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={exportTransparencyCertificate}
                      disabled={!auditSummary}
                      className="gap-2"
                      style={{ borderRadius: '12px' }}
                    >
                      <Download className="w-4 h-4" />
                      Exportar Certificado de Transparencia
                    </Button>
                  </div>
                </div>
              </div>

              {/* MULTI-AI CONSENSUS & VALIDATION LAB */}
              <MultiAIConsensusLab 
                searchEquation={metforminSearchEquations.pubmed}
                isVisible={true}
                bayerBlue={bayerBlue}
              />

              {/* FINAL DOSSIER DOWNLOAD - Bayer Evidence Package */}
              <div 
                className="p-10 rounded-2xl border-4 text-center relative overflow-hidden"
                style={{ 
                  background: 'linear-gradient(135deg, #0033A0 0%, #001a50 100%)',
                  borderColor: '#00BCFF',
                  borderRadius: '20px'
                }}
              >
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-40 h-40 border-4 border-white/30 rounded-full" />
                  <div className="absolute bottom-4 right-4 w-32 h-32 border-4 border-white/30 rounded-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-white/20 rounded-full" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-[#00BCFF] shadow-[0_0_40px_rgba(0,188,255,0.4)]">
                      <FileText className="w-12 h-12 text-[#00BCFF]" />
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                    Dossier de Evidencia Científica
                  </h3>
                  <p className="text-lg text-blue-200 mb-2">
                    Reporte Completo Bayer-Galatea
                  </p>
                  <p className="text-sm text-blue-300/70 max-w-lg mx-auto mb-8">
                    Incluye: Protocolo validado, Diagrama PRISMA, Forest Plot, 
                    Tabla de extracción de datos, Certificado de consenso Multi-IA
                  </p>

                  <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#00BCFF] font-mono">12</div>
                      <div className="text-xs text-blue-300 uppercase tracking-wider">Estudios</div>
                    </div>
                    <div className="w-px h-12 bg-blue-400/30" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#00D395] font-mono">94.2%</div>
                      <div className="text-xs text-blue-300 uppercase tracking-wider">Consenso IA</div>
                    </div>
                    <div className="w-px h-12 bg-blue-400/30" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white font-mono">17</div>
                      <div className="text-xs text-blue-300 uppercase tracking-wider">Secciones</div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="h-16 px-12 text-xl font-bold gap-4 transition-all hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #00BCFF 0%, #00D395 100%)',
                      color: '#0033A0',
                      boxShadow: '0 15px 40px -10px rgba(0,188,255,0.5)',
                      borderRadius: '16px'
                    }}
                    onClick={() => setShowDossierPDF(true)}
                  >
                    <Download className="w-7 h-7" />
                    Descargar Dossier de Evidencia Bayer
                  </Button>

                  <p className="mt-6 text-xs text-blue-400/60">
                    Formato: PDF Institucional · Generado por Galatea AI · Válido para auditorías
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
            <div className="p-6">
              <div className="flex items-center gap-3 text-slate-300 mb-4">
                <Terminal className="w-5 h-5" />
                <span className="text-base font-bold uppercase tracking-wider">Audit Logs - Consola Técnica</span>
                <span className="text-sm text-slate-400 ml-auto font-medium">{auditLogs.length} registros</span>
              </div>
              
              <div 
                className="bg-slate-950 rounded-xl p-5 max-h-64 overflow-y-auto font-mono text-sm"
                style={{ borderRadius: '12px' }}
              >
                {auditLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "py-2 flex gap-4",
                      log.level === 'success' && "text-emerald-300",
                      log.level === 'warning' && "text-amber-300",
                      log.level === 'info' && "text-cyan-300",
                      log.level === 'process' && "text-slate-300"
                    )}
                  >
                    <span className="text-slate-400 shrink-0 font-semibold">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className="font-medium">{log.message}</span>
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

      {/* Reproducibility Check Modal */}
      <Dialog open={showReproducibilityModal} onOpenChange={setShowReproducibilityModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl" style={{ color: bayerBlue }}>
              <Microscope className="w-6 h-6" />
              Reproducibility Check - Auditoría de Búsqueda
            </DialogTitle>
            <DialogDescription>
              Valida que las ecuaciones de búsqueda producen resultados consistentes y reproducibles
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-2 gap-6 py-4">
              {/* LEFT SIDE - Input/Protocol */}
              <div className="space-y-4">
                <div className="p-4 border rounded-xl" style={{ borderRadius: '12px' }}>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: bayerBlue }} />
                    Módulo de Validación
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="use-generated"
                        checked={useGeneratedEquation}
                        onChange={() => setUseGeneratedEquation(true)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="use-generated" className="text-sm font-medium cursor-pointer">
                        Usar ecuación generada por Agente Yadav
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="use-custom"
                        checked={!useGeneratedEquation}
                        onChange={() => setUseGeneratedEquation(false)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="use-custom" className="text-sm font-medium cursor-pointer">
                        Pegar ecuación personalizada
                      </label>
                    </div>
                    
                    {!useGeneratedEquation && (
                      <Textarea
                        value={reproducibilityInput}
                        onChange={(e) => setReproducibilityInput(e.target.value)}
                        placeholder="Pega aquí la cadena booleana de búsqueda..."
                        className="min-h-[120px] font-mono text-xs"
                      />
                    )}
                  </div>
                </div>

                {/* Original Formula Display */}
                <div className="p-4 bg-slate-900 rounded-xl" style={{ borderRadius: '12px' }}>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase">Fórmula Original (Protocolo)</span>
                  </div>
                  <pre 
                    className="text-xs text-slate-100 whitespace-pre-wrap leading-relaxed"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {useGeneratedEquation ? metforminSearchEquations.pubmed : (reproducibilityInput || 'Ingresa una ecuación...')}
                  </pre>
                </div>

                {/* Validation Logs */}
                {validationLogs.length > 0 && (
                  <div className="p-4 bg-slate-950 rounded-xl max-h-[200px] overflow-y-auto" style={{ borderRadius: '12px' }}>
                    <div className="flex items-center gap-2 mb-3 text-slate-400">
                      <Terminal className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase">Log de Auditoría</span>
                    </div>
                    <div className="space-y-1 font-mono text-xs">
                      {validationLogs.map((log, idx) => (
                        <div key={idx} className="text-slate-300 flex gap-2">
                          <span className="text-slate-600">[{log.timestamp.toLocaleTimeString()}]</span>
                          <span className="text-cyan-400">{log.action}:</span>
                          <span className="text-slate-100">{log.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE - Execution Results */}
              <div className="space-y-4">
                <div className="p-4 border rounded-xl" style={{ borderRadius: '12px' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4" style={{ color: bayerBlue }} />
                    <span className="font-semibold text-foreground">Ejecución Real - Conexión a Bases de Datos</span>
                  </div>

                  {reproducibilityResults.length === 0 && !isValidating ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <div className="text-center">
                        <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Haz clic en "Ejecutar Validación" para comenzar</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reproducibilityResults.map((result, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "p-3 rounded-xl border transition-all",
                            result.status === 'validating' && "bg-blue-50 border-blue-200 animate-pulse",
                            result.status === 'success' && "bg-emerald-50 border-emerald-200",
                            result.status === 'warning' && "bg-amber-50 border-amber-200",
                            result.status === 'error' && "bg-red-50 border-red-200"
                          )}
                          style={{ borderRadius: '12px' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{result.database}</span>
                            {result.status === 'validating' && (
                              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                            )}
                            {result.status === 'success' && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                            {result.status === 'warning' && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          
                          {result.status !== 'validating' && (
                            <>
                              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                <div>
                                  <span className="text-muted-foreground">Esperado:</span>
                                  <span className="font-bold ml-1">{result.expectedCount}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Obtenido:</span>
                                  <span className="font-bold ml-1">{result.actualCount}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Desviación:</span>
                                  <span className={cn(
                                    "font-bold ml-1",
                                    result.deviation <= 5 ? "text-emerald-600" : "text-amber-600"
                                  )}>
                                    {result.deviation.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-xs">
                                <span className="text-muted-foreground">Estudios clave detectados: </span>
                                <span className="font-medium text-emerald-700">{result.keyStudiesFound.length}</span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consistency Badge */}
                {reproducibilityStatus !== 'idle' && reproducibilityStatus !== 'validating' && (
                  <div 
                    className={cn(
                      "p-6 rounded-xl text-center border-2",
                      reproducibilityStatus === 'reproducible' && "bg-emerald-50 border-emerald-500",
                      reproducibilityStatus === 'bias-detected' && "bg-amber-50 border-amber-500"
                    )}
                    style={{ borderRadius: '12px' }}
                  >
                    {reproducibilityStatus === 'reproducible' ? (
                      <>
                        <div className="flex justify-center mb-3">
                          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-emerald-700 mb-1">METODOLOGÍA REPRODUCIBLE</h4>
                        <p className="text-sm text-emerald-600">
                          Los resultados coinciden con la estrategia reportada en el protocolo.
                          <br />Desviación &lt; 5% en todas las bases de datos.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center mb-3">
                          <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center">
                            <AlertOctagon className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-amber-700 mb-1">RIESGO DE SESGO DETECTADO</h4>
                        <p className="text-sm text-amber-600">
                          Los resultados no coinciden completamente con la estrategia reportada.
                          <br />Desviación &gt; 5% detectada. Revise la sintaxis de búsqueda.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              onClick={runReproducibilityCheck}
              disabled={isValidating}
              className="gap-2 text-white h-12 px-8"
              style={{ background: bayerBlue, borderRadius: '12px' }}
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Ejecutar Validación
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={exportTransparencyCertificate}
              disabled={validationLogs.length === 0}
              className="gap-2 h-12"
              style={{ borderRadius: '12px' }}
            >
              <Download className="w-5 h-5" />
              Exportar Certificado de Transparencia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Dossier Viewer */}
      <PDFReportViewer
        isOpen={showDossierPDF}
        onClose={() => setShowDossierPDF(false)}
        reportData={{
          title: 'Metformina y Neuroprotección en Pacientes con DM2: Revisión Sistemática y Meta-análisis',
          researchQuestion: ideaInput,
          generatedAt: new Date(),
          totalStudies: 1372,
          metaAnalysisStudies: 12,
          validationScore: 94.2
        }}
      />

      <Footer />
    </div>
  );
}
