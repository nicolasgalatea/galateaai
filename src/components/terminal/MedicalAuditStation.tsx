import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, BookOpen, Filter, FlaskConical, BarChart3, FileSearch,
  Table, FileText, Download, CheckCircle, AlertCircle, Clock,
  ChevronRight, Award, Shield, Microscope, TrendingUp, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentEvidenceCard, AgentEvidence, ClinicalReference } from './AgentEvidenceCard';
import { ExcludedArticlesTable } from './ExcludedArticlesTable';
import { DataExtractorTable } from './DataExtractorTable';
import { PDFReportViewer } from './PDFReportViewer';
import { AnimatedPRISMAFlow } from './AnimatedPRISMAFlow';

interface MedicalAuditStationProps {
  isVisible: boolean;
  ideaInput: string;
  onClose?: () => void;
}

// Sample agent evidence data for Metformin study
const createAgentEvidenceData = (): AgentEvidence[] => [
  {
    agentId: 'picot',
    agentName: 'Agente PICOT Analyst',
    agentIcon: <Target className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 340,
    summary: 'Componentes PICOT extraídos y validados correctamente',
    methodology: 'Análisis semántico de la pregunta de investigación mediante NLP clínico, mapeando a estructura P-I-C-O-T estandarizada.',
    confidenceScore: 96,
    validationStandard: 'Formato FINER validado',
    references: [
      {
        id: '1',
        type: 'guideline',
        identifier: 'Cochrane-PICO-2021',
        title: 'Cochrane Handbook for Systematic Reviews: Defining Review Questions',
        authors: 'Higgins JPT, Thomas J, Chandler J, et al.',
        year: 2021,
        validationNote: 'Estructura PICOT conforme a estándares Cochrane'
      }
    ]
  },
  {
    agentId: 'literature',
    agentName: 'Agente Literature Scout',
    agentIcon: <BookOpen className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 890,
    summary: '5 gaps de evidencia identificados en la literatura existente',
    methodology: 'Búsqueda automatizada en PROSPERO, Cochrane Library y bases de revisiones sistemáticas para detectar vacíos de conocimiento.',
    confidenceScore: 88,
    validationStandard: 'Gap Analysis validado',
    references: [
      {
        id: '2',
        type: 'pmid',
        identifier: '32876543',
        title: 'Metformin and cognitive function: A systematic review of existing evidence',
        authors: 'Campbell JM, Stephenson MD, de Courten B, et al.',
        journal: 'Diabetes Obes Metab',
        year: 2017,
        validationNote: 'Meta-análisis previo identificado como referencia base'
      },
      {
        id: '3',
        type: 'cochrane',
        identifier: 'CD011505',
        title: 'Antidiabetic agents for prevention of dementia in diabetes mellitus',
        authors: 'Areosa Sastre A, Vernooij RW, González-Colaço Harmand M',
        year: 2020,
        validationNote: 'Revisión Cochrane más reciente sobre el tema'
      }
    ]
  },
  {
    agentId: 'criteria',
    agentName: 'Agente Criteria Designer',
    agentIcon: <Filter className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 445,
    summary: 'Tabla de criterios I/E generada con 5 criterios de inclusión y 5 de exclusión',
    methodology: 'Generación de criterios de elegibilidad basados en PICOT, aplicando filtros metodológicos del Cochrane Handbook v6.3.',
    confidenceScore: 94,
    validationStandard: 'Cochrane Handbook v6.3',
    references: [
      {
        id: '4',
        type: 'guideline',
        identifier: 'Cochrane-Handbook-6.3',
        title: 'Cochrane Handbook for Systematic Reviews of Interventions version 6.3',
        authors: 'Higgins JPT, Thomas J, Chandler J, et al.',
        year: 2022,
        url: 'https://training.cochrane.org/handbook',
        validationNote: 'Capítulo 3: Defining the criteria for including studies'
      }
    ]
  },
  {
    agentId: 'yadav',
    agentName: 'Agente Yadav Strategist',
    agentIcon: <FlaskConical className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 680,
    summary: 'Ecuaciones de búsqueda generadas para 4 bases de datos (PubMed, Embase, Cochrane, Scopus)',
    methodology: 'Método de dos capas Yadav 2025: Capa 1 con términos controlados (MeSH/Emtree) y Capa 2 con texto libre, combinados con operadores booleanos optimizados.',
    confidenceScore: 98,
    validationStandard: 'Estrategia validada según estándar Cochrane v2.0',
    references: [
      {
        id: '5',
        type: 'pmid',
        identifier: '38456789',
        title: 'A two-layer systematic search strategy for comprehensive literature retrieval in medical research',
        authors: 'Yadav H, Bhardwaj R, et al.',
        journal: 'J Med Libr Assoc',
        year: 2025,
        validationNote: 'Metodología de referencia para construcción de ecuaciones'
      },
      {
        id: '6',
        type: 'guideline',
        identifier: 'PRESS-2016',
        title: 'PRESS Peer Review of Electronic Search Strategies: 2015 Guideline Statement',
        authors: 'McGowan J, Sampson M, Salzwedel DM, et al.',
        journal: 'J Clin Epidemiol',
        year: 2016,
        validationNote: 'Checklist de validación de sintaxis aplicado'
      }
    ]
  },
  {
    agentId: 'prisma',
    agentName: 'Agente PRISMA Flow',
    agentIcon: <BarChart3 className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 520,
    summary: '1,372 registros identificados → 12 estudios incluidos en meta-análisis',
    methodology: 'Generación automática del diagrama de flujo PRISMA 2020 con conteo de artículos en cada fase y documentación de razones de exclusión.',
    confidenceScore: 92,
    validationStandard: 'PRISMA 2020 Statement',
    references: [
      {
        id: '7',
        type: 'doi',
        identifier: '10.1136/bmj.n71',
        title: 'The PRISMA 2020 statement: an updated guideline for reporting systematic reviews',
        authors: 'Page MJ, McKenzie JE, Bossuyt PM, et al.',
        journal: 'BMJ',
        year: 2021,
        validationNote: 'Diagrama conforme a plantilla oficial PRISMA 2020'
      }
    ]
  },
  {
    agentId: 'extractor',
    agentName: 'Agente Data Extractor',
    agentIcon: <Table className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 780,
    summary: '6 estudios extraídos con datos de población, intervención, desenlaces y calidad',
    methodology: 'Extracción estructurada siguiendo el formato Cochrane Data Collection Form, con evaluación de calidad mediante Newcastle-Ottawa Scale.',
    confidenceScore: 95,
    validationStandard: 'Newcastle-Ottawa Scale (NOS)',
    references: [
      {
        id: '8',
        type: 'guideline',
        identifier: 'NOS-2024',
        title: 'The Newcastle-Ottawa Scale (NOS) for assessing the quality of nonrandomised studies',
        authors: 'Wells GA, Shea B, O\'Connell D, et al.',
        year: 2024,
        url: 'http://www.ohri.ca/programs/clinical_epidemiology/oxford.asp',
        validationNote: 'Escala aplicada a todos los estudios observacionales'
      }
    ]
  },
  {
    agentId: 'forest',
    agentName: 'Agente Meta-Analysis',
    agentIcon: <TrendingUp className="w-5 h-5" />,
    status: 'completed',
    completedAt: new Date(),
    latencyMs: 920,
    summary: 'HR pooled 0.74 (IC95%: 0.67-0.82) - Efecto protector significativo',
    methodology: 'Meta-análisis de efectos aleatorios (DerSimonian-Laird), con evaluación de heterogeneidad (I²) y análisis de sensibilidad.',
    confidenceScore: 97,
    validationStandard: 'GRADE Assessment',
    references: [
      {
        id: '9',
        type: 'pmid',
        identifier: '19892566',
        title: 'Random-effects meta-analysis of incidence and prevalence data',
        authors: 'DerSimonian R, Kacker R',
        journal: 'Stat Med',
        year: 2007,
        validationNote: 'Método estadístico aplicado para síntesis cuantitativa'
      }
    ]
  }
];

export function MedicalAuditStation({ isVisible, ideaInput, onClose }: MedicalAuditStationProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'agents' | 'excluded' | 'data' | 'prisma'>('overview');
  const [agentData] = useState<AgentEvidence[]>(createAgentEvidenceData);
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [isPRISMAAnimating, setIsPRISMAAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedAgents, setCompletedAgents] = useState(0);

  // Simulate agent progression
  useEffect(() => {
    if (!isVisible) return;
    
    setIsLoading(true);
    setCompletedAgents(0);
    
    const interval = setInterval(() => {
      setCompletedAgents(prev => {
        if (prev >= agentData.length) {
          clearInterval(interval);
          setIsLoading(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isVisible, agentData.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-50"
    >
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0097A7] to-[#00D395] rounded-xl flex items-center justify-center">
              <Microscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Estación de Auditoría Médica</h1>
              <p className="text-xs text-gray-500">Clinical Guideline Navigator • Galatea AI</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="ml-8 flex items-center gap-3">
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0097A7] to-[#00D395]"
                initial={{ width: 0 }}
                animate={{ width: `${(completedAgents / agentData.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {completedAgents}/{agentData.length} agentes completados
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Generate Report Button */}
          {completedAgents >= agentData.length && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowPDFViewer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0097A7] to-[#00D395] text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              <FileText className="w-4 h-4" />
              Generar Reporte Bayer-Galatea
            </motion.button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex gap-1">
          {[
            { id: 'overview', label: 'Resumen', icon: <CheckCircle className="w-4 h-4" /> },
            { id: 'agents', label: 'Agentes & Evidencia', icon: <Target className="w-4 h-4" /> },
            { id: 'prisma', label: 'PRISMA Flow', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'excluded', label: 'Artículos Excluidos', icon: <FileSearch className="w-4 h-4" /> },
            { id: 'data', label: 'Extracción de Datos', icon: <Table className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                activeSection === tab.id
                  ? "text-[#0097A7]"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab.icon}
              {tab.label}
              {activeSection === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0097A7]"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 h-[calc(100vh-112px)]">
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              {/* Research Question Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#0097A7]/10 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#0097A7]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Pregunta de Investigación</h2>
                    <p className="text-xl text-gray-700 italic">"{ideaInput}"</p>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-3xl font-bold text-[#0097A7]">1,372</div>
                  <div className="text-sm text-gray-500">Artículos Identificados</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-3xl font-bold text-[#0097A7]">12</div>
                  <div className="text-sm text-gray-500">Incluidos en Meta-análisis</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-3xl font-bold text-[#00D395]">94.2%</div>
                  <div className="text-sm text-gray-500">Convergencia Multi-AI</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-3xl font-bold text-gray-900">HR 0.74</div>
                  <div className="text-sm text-gray-500">Efecto Protector (IC95%: 0.67-0.82)</div>
                </div>
              </div>

              {/* Gold Standard Badge */}
              <div className="bg-gradient-to-r from-[#00D395]/10 to-[#0097A7]/10 rounded-xl border-2 border-[#00D395] p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Award className="w-8 h-8 text-[#00D395]" />
                  <h3 className="text-2xl font-bold text-[#00D395]">GOLD STANDARD CONSENSUS</h3>
                  <Award className="w-8 h-8 text-[#00D395]" />
                </div>
                <p className="text-gray-600">
                  Triple verificación independiente superada • Alta reproducibilidad confirmada
                </p>
                <div className="flex items-center justify-center gap-6 mt-4">
                  {['Galatea AI', 'Audit GPT', 'Audit Gemini'].map((engine) => (
                    <div key={engine} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00D395]" />
                      <span className="text-sm font-medium text-gray-700">{engine}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Agentes & Evidencia Clínica</h2>
                <div className="text-sm text-gray-500">
                  Haz clic en "View Source" para ver las referencias clínicas
                </div>
              </div>
              
              {agentData.slice(0, completedAgents).map((agent) => (
                <AgentEvidenceCard
                  key={agent.agentId}
                  evidence={agent}
                  isExpanded={expandedAgentId === agent.agentId}
                  onToggle={() => setExpandedAgentId(
                    expandedAgentId === agent.agentId ? null : agent.agentId
                  )}
                />
              ))}
              
              {completedAgents < agentData.length && (
                <div className="flex items-center justify-center p-6 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="animate-spin w-6 h-6 border-2 border-[#0097A7] border-t-transparent rounded-full mr-3" />
                  <span className="text-gray-600">Procesando agentes...</span>
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'prisma' && (
            <motion.div
              key="prisma"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Diagrama PRISMA 2020</h2>
                <button
                  onClick={() => setIsPRISMAAnimating(true)}
                  disabled={isPRISMAAnimating}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                    isPRISMAAnimating
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#0097A7] text-white hover:bg-[#0097A7]/90"
                  )}
                >
                  <Play className="w-4 h-4" />
                  {isPRISMAAnimating ? 'Animando...' : 'Animar Flujo'}
                </button>
              </div>
              
              <AnimatedPRISMAFlow 
                isAnimating={isPRISMAAnimating}
                onComplete={() => setIsPRISMAAnimating(false)}
              />
            </motion.div>
          )}

          {activeSection === 'excluded' && (
            <motion.div
              key="excluded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <ExcludedArticlesTable />
            </motion.div>
          )}

          {activeSection === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto"
            >
              <DataExtractorTable />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PDF Report Viewer */}
      <PDFReportViewer
        isOpen={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
        reportData={{
          title: 'Metformina y Neuroprotección en Pacientes con DM2',
          researchQuestion: ideaInput,
          generatedAt: new Date(),
          totalStudies: 1372,
          metaAnalysisStudies: 12,
          validationScore: 94.2
        }}
      />
    </motion.div>
  );
}
