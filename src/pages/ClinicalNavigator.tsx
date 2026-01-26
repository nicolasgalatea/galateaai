import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { 
  Send, Play, Download, ExternalLink, Clock, CheckCircle, 
  Loader2, FileText, BookOpen, Award, ChevronDown, ChevronUp,
  RotateCcw, Sparkles, Database, Search, Brain, ClipboardList,
  Target, Timer, Lightbulb, Link, Save, Eye, Hand, Users, Heart, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import galateaLogo from '@/assets/galatea-logo-clean.png';
import santaFeLogo from '@/assets/santa-fe-logo-clean.png';
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
  type: 'info' | 'success' | 'process' | 'data' | 'source';
}

interface Deliverable {
  id: number;
  agentId: number;
  title: string;
  content: string;
  sources: SourceReference[];
  isExpanded: boolean;
}

interface AgentStep {
  delay: number;
  icon: string;
  message: string;
  type: TerminalLog['type'];
}

interface SourceReference {
  name: string;
  url: string;
  identifier?: string; // DOI or PMID
}

// =========================================
// AGENT DIALOGUE MESSAGES
// =========================================
const AGENT_DIALOGUES: Record<number, string> = {
  1: "Estoy estructurando tu pregunta con el marco PICOT...",
  2: "Validando que tu investigación sea viable y ética...",
  3: "Buscando revisiones previas en la literatura...",
  4: "Definiendo criterios de inclusión y exclusión...",
  5: "Verificando en PROSPERO si existe protocolo similar...",
  6: "Planificando evaluación de riesgo de sesgo...",
  7: "Construyendo ecuación de búsqueda MeSH...",
  8: "Ensamblando protocolo PRISMA-P completo...",
  9: "Ejecutando búsqueda en PubMed y Cochrane...",
  10: "Extrayendo datos de los estudios incluidos...",
  11: "Evaluando calidad metodológica...",
  12: "Calculando meta-análisis...",
  13: "Calificando evidencia con GRADE...",
  14: "Generando dossier científico...",
};

const FINAL_DIALOGUE = "¡Listo! Analicé 847 artículos. Los SGLT2 reducen hospitalizaciones en 20%.";

// =========================================
// CONSTANTS - SANTA FE COLORS
// =========================================
const COLORS = {
  azulInstitucional: '#1B4D7A',
  verdeMedico: '#2E7D6B',
  azulClaro: '#4A90A4',
  fondoTerminal: '#0A1628',
  grisTexto: '#333333',
  grisClaro: '#E5E7EB',
  blanco: '#FFFFFF',
};

// =========================================
// REAL SCIENTIFIC SOURCES WITH DOIs/PMIDs
// =========================================
const SCIENTIFIC_SOURCES: Record<number, SourceReference[]> = {
  1: [
    { name: 'Cochrane Handbook 6.3', url: 'https://training.cochrane.org/handbook', identifier: 'ISBN: 978-1-119-53660-4' },
    { name: 'PubMed MeSH Database', url: 'https://www.ncbi.nlm.nih.gov/mesh/', identifier: 'NIH/NLM' },
    { name: 'PRISMA 2020 Statement', url: 'https://doi.org/10.1136/bmj.n71', identifier: 'doi:10.1136/bmj.n71' },
    { name: 'Oxford CEBM', url: 'https://www.cebm.ox.ac.uk/', identifier: 'University of Oxford' },
  ],
  2: [
    { name: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov/', identifier: 'NIH/NLM' },
    { name: 'NIH Reporter', url: 'https://reporter.nih.gov/', identifier: 'NIH' },
    { name: 'PROSPERO Registry', url: 'https://www.crd.york.ac.uk/prospero/', identifier: 'CRD York' },
  ],
  3: [
    { name: 'Cochrane Library', url: 'https://www.cochranelibrary.com/', identifier: 'Wiley' },
    { name: 'PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/', identifier: 'NIH/NLM' },
    { name: 'Embase', url: 'https://www.embase.com/', identifier: 'Elsevier' },
    { name: 'PROSPERO', url: 'https://www.crd.york.ac.uk/prospero/', identifier: 'CRD42024' },
  ],
  4: [
    { name: 'PICOS Framework - Cochrane', url: 'https://training.cochrane.org/handbook/current/chapter-02', identifier: 'Cochrane Ch.2' },
    { name: 'ESC HF Guidelines 2021', url: 'https://doi.org/10.1093/eurheartj/ehab368', identifier: 'PMID: 34447992' },
  ],
  5: [
    { name: 'PROSPERO Database', url: 'https://www.crd.york.ac.uk/prospero/', identifier: 'CRD York' },
    { name: 'OSF Registries', url: 'https://osf.io/registries', identifier: 'OSF' },
  ],
  6: [
    { name: 'Cochrane RoB 2.0 Tool', url: 'https://www.riskofbias.info/', identifier: 'Cochrane' },
    { name: 'GRADE Handbook', url: 'https://gdt.gradepro.org/app/handbook/handbook.html', identifier: 'GRADE WG' },
    { name: 'ROBINS-I Tool', url: 'https://www.riskofbias.info/welcome/home/current-version-of-robins-i', identifier: 'Cochrane' },
  ],
  7: [
    { name: 'PubMed Search Builder', url: 'https://pubmed.ncbi.nlm.nih.gov/advanced/', identifier: 'NIH/NLM' },
    { name: 'Embase Emtree', url: 'https://www.embase.com/info/emtree', identifier: 'Elsevier' },
    { name: 'Cochrane MeSH', url: 'https://www.cochranelibrary.com/', identifier: 'Wiley' },
  ],
  8: [
    { name: 'PRISMA-P 2015 Checklist', url: 'https://doi.org/10.1136/bmj.g7647', identifier: 'doi:10.1136/bmj.g7647' },
    { name: 'PROSPERO Guidelines', url: 'https://www.crd.york.ac.uk/prospero/', identifier: 'CRD York' },
  ],
  9: [
    { name: 'PubMed API', url: 'https://www.ncbi.nlm.nih.gov/home/develop/api/', identifier: 'E-utilities' },
    { name: 'Cochrane CENTRAL', url: 'https://www.cochranelibrary.com/central', identifier: 'Wiley' },
    { name: 'Web of Science', url: 'https://www.webofscience.com/', identifier: 'Clarivate' },
  ],
  10: [
    { name: 'EMPEROR-Preserved Trial', url: 'https://doi.org/10.1056/NEJMoa2107038', identifier: 'PMID: 34449189' },
    { name: 'DELIVER Trial', url: 'https://doi.org/10.1056/NEJMoa2206286', identifier: 'PMID: 36027570' },
    { name: 'PRESERVED-HF Trial', url: 'https://doi.org/10.1001/jama.2022.3645', identifier: 'PMID: 35285884' },
  ],
  11: [
    { name: 'Cochrane RoB 2.0', url: 'https://www.riskofbias.info/', identifier: 'v2.0' },
    { name: 'RevMan 5.4', url: 'https://training.cochrane.org/online-learning/core-software/revman', identifier: 'Cochrane' },
  ],
  12: [
    { name: 'R meta package', url: 'https://cran.r-project.org/web/packages/meta/', identifier: 'CRAN' },
    { name: 'RevMan 5.4', url: 'https://training.cochrane.org/online-learning/core-software/revman', identifier: 'Cochrane' },
    { name: 'Stata metan', url: 'https://www.stata.com/', identifier: 'StataCorp' },
  ],
  13: [
    { name: 'GRADE Handbook', url: 'https://gdt.gradepro.org/app/handbook/handbook.html', identifier: 'GRADE WG' },
    { name: 'GRADEpro GDT', url: 'https://www.gradepro.org/', identifier: 'McMaster' },
    { name: 'MAGICapp', url: 'https://magicevidence.org/', identifier: 'MAGIC Evidence' },
  ],
  14: [
    { name: 'PRISMA 2020', url: 'https://doi.org/10.1136/bmj.n71', identifier: 'doi:10.1136/bmj.n71' },
    { name: 'EQUATOR Network', url: 'https://www.equator-network.org/', identifier: 'EQUATOR' },
  ],
};

// =========================================
// 14 AGENTS CONFIGURATION WITH DETAILED STEPS
// =========================================
const AGENTS_CONFIG: (Omit<Agent, 'status' | 'latency'> & { 
  steps: AgentStep[]; 
  sources: string[];
  explanation: {
    doing: string;
    why: string;
    estimatedTime: string;
  };
})[] = [
  { 
    id: 1, 
    name: 'PICOT Builder', 
    description: 'Estructura la pregunta clínica',
    sources: ['MeSH Database', 'PubMed Terminology', 'SNOMED-CT'],
    explanation: {
      doing: 'Estructurando tu pregunta de investigación usando el marco PICOT (Población, Intervención, Comparador, Outcome, Tiempo) según el Cochrane Handbook 6.3.',
      why: 'El marco PICOT es el estándar de oro para formular preguntas de investigación clínica. Permite definir claramente los elementos de tu pregunta para una búsqueda sistemática efectiva.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 800, icon: '🔍', message: 'Analizando pregunta de investigación...', type: 'process' },
      { delay: 1500, icon: '📚', message: 'Consultando base de datos MeSH (mesh.ncbi.nlm.nih.gov)...', type: 'source' },
      { delay: 1500, icon: '🧠', message: 'Aplicando Cochrane Handbook 6.3 - Capítulo 2...', type: 'source' },
      { delay: 1200, icon: '📋', message: 'Definiendo Población: Adultos ≥18 años con ICFEp (FEVI ≥50%) según ESC 2021', type: 'data' },
      { delay: 1000, icon: '💊', message: 'Definiendo Intervención: Empagliflozina 10mg, Dapagliflozina 10mg (SGLT2i)', type: 'data' },
      { delay: 1000, icon: '⚖️', message: 'Definiendo Comparador: Placebo o tratamiento estándar sin SGLT2i', type: 'data' },
      { delay: 1000, icon: '🎯', message: 'Definiendo Outcome: Compuesto muerte CV + hospitalización IC (primario)', type: 'data' },
      { delay: 1000, icon: '⏱️', message: 'Definiendo Tiempo: RCTs publicados 2019-2024, seguimiento ≥12 meses', type: 'data' },
    ]
  },
  { 
    id: 2, 
    name: 'FINER Validator', 
    description: 'Valida viabilidad del estudio',
    sources: ['Clinical Trials Registry', 'NIH Reporter', 'Grant Databases'],
    explanation: {
      doing: 'Evaluando si tu pregunta cumple criterios FINER: Factible, Interesante, Novedosa, Ética y Relevante.',
      why: 'El criterio FINER, desarrollado por Hulley et al., asegura que tu investigación es viable y vale la pena antes de invertir recursos significativos.',
      estimatedTime: '9 segundos'
    },
    steps: [
      { delay: 1000, icon: '📊', message: 'Evaluando factibilidad del estudio...', type: 'process' },
      { delay: 1500, icon: '🔬', message: 'Consultando ClinicalTrials.gov para estudios similares...', type: 'source' },
      { delay: 1500, icon: '✨', message: 'Analizando novedad: Buscando gaps en literatura Cochrane...', type: 'process' },
      { delay: 1200, icon: '⚖️', message: 'Verificando consideraciones éticas: Estudios con aprobación IRB existentes', type: 'process' },
      { delay: 1500, icon: '🎯', message: 'Calculando relevancia clínica: Impacto potencial en guías ESC/AHA', type: 'process' },
      { delay: 1300, icon: '📈', message: 'Score FINER: 5/5 - Pregunta altamente viable para revisión sistemática', type: 'success' },
    ]
  },
  { 
    id: 3, 
    name: 'Literature Scout', 
    description: 'Busca revisiones previas',
    sources: ['Cochrane Library', 'PubMed', 'Embase', 'PROSPERO'],
    explanation: {
      doing: 'Buscando revisiones sistemáticas y meta-análisis previos en bases de datos especializadas para identificar gaps en la literatura.',
      why: 'Identificar revisiones existentes evita duplicar esfuerzos y permite justificar científicamente la necesidad de tu nueva revisión.',
      estimatedTime: '11 segundos'
    },
    steps: [
      { delay: 1200, icon: '🔎', message: 'Conectando a Cochrane Library (cochranelibrary.com)...', type: 'source' },
      { delay: 1800, icon: '📚', message: 'Buscando: "SGLT2 inhibitor" AND "heart failure" AND "preserved ejection"...', type: 'process' },
      { delay: 1500, icon: '📖', message: 'Cochrane: 5 revisiones encontradas, última actualización 2023...', type: 'data' },
      { delay: 1500, icon: '🔍', message: 'Gap: Ninguna RS incluye datos completos de EMPEROR-Preserved + DELIVER', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Gap: Falta análisis por subgrupos de FEVI (50-60% vs >60%)', type: 'data' },
      { delay: 1200, icon: '🌎', message: 'Gap: Datos limitados en población latinoamericana y asiática', type: 'data' },
      { delay: 1300, icon: '✅', message: 'Conclusión: Justificación sólida para nueva RS actualizada', type: 'success' },
    ]
  },
  { 
    id: 4, 
    name: 'Criteria Designer', 
    description: 'Define criterios I/E',
    sources: ['PICOS Framework', 'Cochrane Handbook'],
    explanation: {
      doing: 'Definiendo criterios de inclusión y exclusión precisos basados en el framework PICOS y las guías Cochrane.',
      why: 'Criterios claros y explícitos aseguran reproducibilidad, reducen sesgos de selección y permiten que otros investigadores repliquen tu revisión.',
      estimatedTime: '8 segundos'
    },
    steps: [
      { delay: 1000, icon: '📋', message: 'Aplicando framework PICOS (Cochrane Handbook Cap. 3)...', type: 'process' },
      { delay: 1500, icon: '✅', message: 'Inclusión: RCTs fase III doble ciego, ≥100 participantes...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Inclusión: ICFEp (FEVI ≥50% según criterios ESC 2021), seguimiento ≥6 meses...', type: 'data' },
      { delay: 1200, icon: '❌', message: 'Exclusión: Estudios observacionales, series de casos, reportes...', type: 'data' },
      { delay: 1200, icon: '❌', message: 'Exclusión: ICFEr/ICFEmr (FEVI <50%), dosis no estándar de SGLT2i...', type: 'data' },
      { delay: 1000, icon: '📝', message: 'Generando tabla de elegibilidad estructurada PRISMA-compliant...', type: 'process' },
    ]
  },
  { 
    id: 5, 
    name: 'PROSPERO Checker', 
    description: 'Verifica registro previo',
    sources: ['PROSPERO Database', 'OSF Registries', 'CRD York'],
    explanation: {
      doing: 'Verificando en PROSPERO y otras bases si existe un protocolo similar ya registrado.',
      why: 'El registro previo de protocolos previene duplicación de esfuerzos, aumenta la transparencia y es requisito para publicación en muchas revistas.',
      estimatedTime: '7 segundos'
    },
    steps: [
      { delay: 1000, icon: '🔗', message: 'Conectando a PROSPERO (crd.york.ac.uk/prospero)...', type: 'source' },
      { delay: 1500, icon: '🔍', message: 'Query: SGLT2 AND heart failure AND preserved ejection...', type: 'process' },
      { delay: 1500, icon: '📄', message: 'Encontrados 4 protocolos relacionados...', type: 'data' },
      { delay: 1200, icon: '⚠️', message: 'CRD42023456789: Enfocado en ICFEr solamente (diferente población)', type: 'data' },
      { delay: 1300, icon: '✅', message: 'Recomendación: Proceder con registro nuevo - ID sugerido: CRD42025XXXXXX', type: 'success' },
    ]
  },
  { 
    id: 6, 
    name: 'Bias Assessor', 
    description: 'Evalúa riesgo de sesgos',
    sources: ['Cochrane RoB 2.0', 'GRADE Handbook', 'ROBINS-I'],
    explanation: {
      doing: 'Planificando la evaluación de riesgo de sesgo usando la herramienta Cochrane Risk of Bias 2.0 para RCTs.',
      why: 'Identificar y documentar sesgos potenciales es crítico para determinar la certeza de la evidencia y la validez de las conclusiones.',
      estimatedTime: '9 segundos'
    },
    steps: [
      { delay: 1200, icon: '⚠️', message: 'Cargando herramienta Cochrane RoB 2.0 (riskofbias.info)...', type: 'source' },
      { delay: 1500, icon: '🎲', message: 'Dominio 1 - Aleatorización: Evaluación planificada → Bajo riesgo esperado', type: 'data' },
      { delay: 1300, icon: '👁️', message: 'Dominio 2 - Desviaciones: Doble ciego típico en estudios SGLT2i', type: 'data' },
      { delay: 1300, icon: '📉', message: 'Dominio 3 - Datos faltantes: Revisar ITT vs per-protocol', type: 'data' },
      { delay: 1200, icon: '📝', message: 'Dominio 4-5 - Medición y reporte selectivo: Verificar protocolo original', type: 'data' },
      { delay: 1500, icon: '🛡️', message: 'Plan de mitigación: Análisis de sensibilidad excluyendo alto riesgo', type: 'process' },
    ]
  },
  { 
    id: 7, 
    name: 'Yadav Strategist', 
    description: 'Genera ecuaciones de búsqueda',
    sources: ['PubMed MeSH', 'Embase Emtree', 'Cochrane MeSH'],
    explanation: {
      doing: 'Creando ecuaciones de búsqueda optimizadas para cada base de datos usando términos MeSH, Emtree y operadores booleanos.',
      why: 'Búsquedas bien estructuradas maximizan sensibilidad (encontrar todos los estudios relevantes) y especificidad (minimizar ruido).',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 1000, icon: '🔤', message: 'Identificando términos MeSH principales en PubMed...', type: 'process' },
      { delay: 1500, icon: '📝', message: 'PubMed: ("Sodium-Glucose Transporter 2 Inhibitors"[MeSH] OR "SGLT2"...)', type: 'data' },
      { delay: 1500, icon: '💾', message: '...AND ("Heart Failure"[MeSH] OR "HFpEF") AND "randomized controlled trial"[pt]', type: 'data' },
      { delay: 1500, icon: '🔀', message: 'Adaptando para Embase: /sodium glucose cotransporter 2 inhibitor/exp...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'Filtros: 2019-2025, English OR Spanish, Humans, Adult', type: 'data' },
      { delay: 1000, icon: '✅', message: 'Estrategia de búsqueda optimizada para 4 bases de datos', type: 'success' },
    ]
  },
  { 
    id: 8, 
    name: 'Protocol Architect', 
    description: 'Estructura el protocolo',
    sources: ['PRISMA-P 2015', 'PROSPERO Guidelines', 'Cochrane Handbook'],
    explanation: {
      doing: 'Ensamblando todas las secciones en un protocolo completo siguiendo PRISMA-P 2015 (Preferred Reporting Items for Systematic Reviews - Protocols).',
      why: 'Un protocolo estructurado según PRISMA-P es requisito para registro PROSPERO y aumenta la probabilidad de aceptación en revistas de alto impacto.',
      estimatedTime: '8 segundos'
    },
    steps: [
      { delay: 1000, icon: '🏗️', message: 'Iniciando ensamblaje según checklist PRISMA-P 2015...', type: 'process' },
      { delay: 1200, icon: '✅', message: 'Secciones 1-3: Título registrado, identificación PROSPERO, contacto...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Secciones 4-6: Justificación, objetivos PICO, criterios elegibilidad...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Secciones 7-9: Fuentes de información, estrategia búsqueda, selección...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Secciones 10-17: Extracción datos, RoB, síntesis, meta-análisis, GRADE...', type: 'data' },
      { delay: 1200, icon: '📋', message: 'Protocolo 100% completo - Listo para registro PROSPERO', type: 'success' },
    ]
  },
  { 
    id: 9, 
    name: 'PRISMA Navigator', 
    description: 'Ejecuta flujo PRISMA 2020',
    sources: ['PubMed API', 'Embase API', 'Cochrane Central', 'Web of Science'],
    explanation: {
      doing: 'Ejecutando las búsquedas sistemáticas en todas las bases de datos y generando el diagrama de flujo PRISMA 2020 con conteos exactos.',
      why: 'El flujo PRISMA 2020 documenta transparentemente cada etapa del proceso de selección, permitiendo evaluar la exhaustividad de la revisión.',
      estimatedTime: '12 segundos'
    },
    steps: [
      { delay: 1000, icon: '🚀', message: 'Ejecutando búsqueda en PubMed via E-utilities API...', type: 'source' },
      { delay: 1500, icon: '📊', message: 'PubMed: 342 artículos identificados', type: 'data' },
      { delay: 1200, icon: '🔍', message: 'Ejecutando búsqueda en Embase...', type: 'source' },
      { delay: 1500, icon: '📊', message: 'Embase: 289 artículos identificados', type: 'data' },
      { delay: 1200, icon: '📚', message: 'Ejecutando búsqueda en Cochrane CENTRAL + Web of Science...', type: 'source' },
      { delay: 1500, icon: '📊', message: 'Cochrane: 156 artículos | WoS: 60 artículos | Total: 847', type: 'data' },
      { delay: 1500, icon: '🔄', message: 'Deduplicación con EndNote/Covidence: 234 duplicados removidos', type: 'process' },
      { delay: 1500, icon: '📈', message: 'Screening: 613 únicos → Título/Abstract: 124 → Texto completo: 18 → Incluidos: 12', type: 'data' },
    ]
  },
  { 
    id: 10, 
    name: 'Data Extractor', 
    description: 'Extrae datos de estudios',
    sources: ['Full-text PDFs', 'Supplementary Materials', 'ClinicalTrials.gov'],
    explanation: {
      doing: 'Extrayendo datos cuantitativos de los 12 estudios incluidos usando formularios estandarizados de extracción.',
      why: 'La extracción sistemática de datos asegura que la información sea comparable y pueda combinarse en el meta-análisis.',
      estimatedTime: '11 segundos'
    },
    steps: [
      { delay: 1200, icon: '📄', message: 'EMPEROR-Preserved (Anker et al. NEJM 2021, PMID: 34449189)...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'n=5,988 | Empa 10mg | HR 0.79 (0.69-0.90) | Seguimiento 26 meses', type: 'data' },
      { delay: 1200, icon: '📄', message: 'DELIVER (Solomon et al. NEJM 2022, PMID: 36027570)...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'n=6,263 | Dapa 10mg | HR 0.82 (0.73-0.92) | Seguimiento 28 meses', type: 'data' },
      { delay: 1500, icon: '📄', message: 'Procesando 10 estudios adicionales (PRESERVED-HF, etc.)...', type: 'process' },
      { delay: 1500, icon: '✅', message: 'Total extraído: 12 RCTs, n=14,234 participantes, 2,847 eventos', type: 'success' },
    ]
  },
  { 
    id: 11, 
    name: 'Quality Auditor', 
    description: 'Evalúa calidad metodológica',
    sources: ['Cochrane RoB 2.0', 'GRADE Framework', 'RevMan'],
    explanation: {
      doing: 'Evaluando la calidad metodológica de cada estudio incluido usando Cochrane RoB 2.0 y generando gráficos de riesgo de sesgo.',
      why: 'La evaluación de calidad determina cuánta confianza podemos tener en los resultados y si es apropiado combinar estudios.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 1200, icon: '🔬', message: 'Aplicando Cochrane RoB 2.0 a 12 estudios incluidos...', type: 'process' },
      { delay: 1500, icon: '🟢', message: 'EMPEROR-Preserved: Bajo riesgo en 5/5 dominios (industria pero cegado)', type: 'data' },
      { delay: 1500, icon: '🟢', message: 'DELIVER: Bajo riesgo (algunas preocupaciones en D3 - 4% pérdida)', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Resumen global: 10/12 bajo riesgo, 2/12 algunas preocupaciones', type: 'data' },
      { delay: 1500, icon: '📈', message: 'Funnel plot generado: Simétrico (Egger p=0.34) - Sin sesgo publicación', type: 'process' },
      { delay: 1000, icon: '✅', message: 'Conclusión: Calidad metodológica alta, apto para meta-análisis', type: 'success' },
    ]
  },
  { 
    id: 12, 
    name: 'Meta-Analyst', 
    description: 'Ejecuta meta-análisis',
    sources: ['R meta package', 'RevMan 5.4', 'Stata metan'],
    explanation: {
      doing: 'Combinando los resultados de los 12 estudios usando modelo de efectos aleatorios DerSimonian-Laird para obtener una estimación global.',
      why: 'El meta-análisis proporciona una estimación ponderada del efecto, aumentando el poder estadístico y la precisión de las conclusiones.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 1200, icon: '📊', message: 'Cargando datos en modelo de efectos aleatorios (R meta package)...', type: 'process' },
      { delay: 1500, icon: '🔢', message: 'Método: DerSimonian-Laird, varianza entre estudios τ² = 0.003...', type: 'process' },
      { delay: 1500, icon: '📈', message: 'Resultado primario: HR 0.80 (IC 95%: 0.73-0.87), p < 0.0001', type: 'data' },
      { delay: 1200, icon: '📊', message: 'Heterogeneidad: I² = 18% (baja), Q = 13.4 (p=0.27)', type: 'data' },
      { delay: 1500, icon: '🎯', message: 'NNT = 21 (IC 95%: 16-32) pacientes tratados 2 años por evento evitado', type: 'data' },
      { delay: 1200, icon: '📉', message: 'Generando forest plot con IC por estudio y diamante pooled...', type: 'process' },
    ]
  },
  { 
    id: 13, 
    name: 'Evidence Grader', 
    description: 'Califica evidencia GRADE',
    sources: ['GRADE Handbook', 'GRADEpro GDT', 'MAGICapp'],
    explanation: {
      doing: 'Aplicando el sistema GRADE (Grading of Recommendations Assessment, Development and Evaluation) para calificar la certeza de la evidencia.',
      why: 'GRADE es el estándar internacional adoptado por >100 organizaciones (incluyendo OMS, Cochrane) para evaluar calidad de evidencia y fuerza de recomendaciones.',
      estimatedTime: '9 segundos'
    },
    steps: [
      { delay: 1200, icon: '⭐', message: 'Iniciando evaluación GRADE con GRADEpro GDT...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'Outcome 1 (Hosp IC + muerte CV): Alta certeza ⭐⭐⭐⭐ (RCTs, sin downgrades)', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Outcome 2 (Muerte CV aislada): Moderada ⭐⭐⭐ (IC cruza 1.0, imprecisión)', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Outcome 3 (Calidad vida KCCQ): Alta certeza ⭐⭐⭐⭐ (diferencia clínica)', type: 'data' },
      { delay: 1200, icon: '💪', message: 'Recomendación: FUERTE a favor de SGLT2i en ICFEp (alta certeza)', type: 'success' },
    ]
  },
  { 
    id: 14, 
    name: 'Report Generator', 
    description: 'Genera dossier final',
    sources: ['PRISMA 2020', 'Word Templates', 'LaTeX'],
    explanation: {
      doing: 'Ensamblando el dossier final de evidencia con todos los resultados, figuras, tablas y referencias en formato publicación.',
      why: 'El dossier es el producto final listo para comité de ética, publicación en revista científica o presentación a autoridades sanitarias.',
      estimatedTime: '8 segundos'
    },
    steps: [
      { delay: 1000, icon: '📝', message: 'Generando resumen ejecutivo (1,500 palabras)...', type: 'process' },
      { delay: 1200, icon: '📊', message: 'Insertando tablas de características de estudios (PRISMA 2020)...', type: 'process' },
      { delay: 1200, icon: '📈', message: 'Agregando forest plots, funnel plots y flujo PRISMA...', type: 'process' },
      { delay: 1200, icon: '📚', message: 'Compilando 124 referencias en formato Vancouver con DOIs...', type: 'process' },
      { delay: 1200, icon: '📋', message: 'Aplicando formato institucional Fundación Santa Fe de Bogotá...', type: 'process' },
      { delay: 1200, icon: '✅', message: 'Dossier de 47 páginas generado - LISTO PARA DESCARGA', type: 'success' },
    ]
  },
];

// =========================================
// ENHANCED AGENT OUTPUTS WITH REAL SOURCES
// =========================================
const AGENT_OUTPUTS: Record<number, { title: string; content: string }> = {
  1: {
    title: 'Marco PICOT Estructurado',
    content: `👥 POBLACIÓN (P):
Adultos ≥18 años con diagnóstico confirmado de insuficiencia cardíaca con fracción de eyección preservada (ICFEp), definida como FEVI ≥50% según criterios de la European Society of Cardiology (ESC) 2021.
📎 Fuente: doi.org/10.1093/eurheartj/ehab368 (PMID: 34447992)

💊 INTERVENCIÓN (I):
Inhibidores del cotransportador sodio-glucosa tipo 2 (SGLT2i):
• Empagliflozina 10mg una vez al día
• Dapagliflozina 10mg una vez al día
📎 Fuente: PubMed PMID: 34449189, PMID: 36027570

⚖️ COMPARADOR (C):
Placebo o tratamiento estándar optimizado sin inhibidor SGLT2. Se permite terapia de base incluyendo diuréticos, IECA/ARA-II, betabloqueantes.
📎 Fuente: Cochrane Heart Group standards

🎯 OUTCOME (O):
• Primario: Compuesto de muerte cardiovascular + primera hospitalización por insuficiencia cardíaca
• Secundarios: Mortalidad CV aislada, hospitalizaciones totales, calidad de vida (KCCQ-TSS), función renal (eGFR slope)
📎 Fuente: Cochrane Heart Group outcomes taxonomy

⏱️ TIEMPO (T):
Ensayos clínicos aleatorizados publicados entre enero 2019 y diciembre 2024, con seguimiento mínimo de 12 meses.
📎 Fuente: PRISMA 2020 Guidelines (doi:10.1136/bmj.n71)`
  },
  2: {
    title: 'Validación FINER',
    content: `✅ FACTIBLE (Feasible):
• >15 RCTs fase III publicados y disponibles
• Datos accesibles en repositorios públicos
• No requiere aprobación IRB adicional (datos secundarios)
📎 Fuente: ClinicalTrials.gov búsqueda NCT

✅ INTERESANTE (Interesting):
• Alta relevancia clínica actual: ICFEp representa 50% de casos de IC
• Brecha terapéutica histórica: primer tratamiento efectivo
📎 Fuente: JACC 2023 epidemiology review

✅ NOVEDOSO (Novel):
• Gaps identificados en RS previas (ver Agente 3)
• Ninguna RS incluye ambos trials pivotales completos
📎 Fuente: Cochrane Library search 2024

✅ ÉTICO (Ethical):
• Análisis de datos ya aprobados por IRB original
• Sin intervención adicional en pacientes
📎 Fuente: Hulley et al. FINER criteria

✅ RELEVANTE (Relevant):
• Impacto directo en guías clínicas ESC/AHA/HFSA
• Potencial de cambiar práctica clínica global
📎 Fuente: ESC Guidelines Committee

📊 SCORE FINER: 5/5 - Pregunta ALTAMENTE VIABLE`
  },
  3: {
    title: 'Gap Analysis de Literatura',
    content: `📚 REVISIONES SISTEMÁTICAS PREVIAS IDENTIFICADAS: 8

GAPS CRÍTICOS ENCONTRADOS:

1️⃣ Datos incompletos de trials pivotales
• Ninguna RS incluye EMPEROR-Preserved + DELIVER completos
• Última RS Cochrane: Mayo 2023 (pre-DELIVER final)
📎 Fuente: Cochrane Library CD013416

2️⃣ Análisis de subgrupos insuficiente
• Falta estratificación por FEVI (50-60% vs >60%)
• Sin análisis por diabetes vs no diabetes
📎 Fuente: PROSPERO search CRD42023*

3️⃣ Representación geográfica limitada
• 85% datos de Europa/Norteamérica
• Datos LATAM/Asia subrepresentados
📎 Fuente: Baseline tables EMPEROR/DELIVER

4️⃣ Outcomes secundarios
• Sin meta-análisis de seguridad renal (eGFR)
• Falta síntesis de calidad de vida (KCCQ)
📎 Fuente: Systematic search Embase

✅ CONCLUSIÓN: Justificación sólida para nueva revisión sistemática actualizada que llene estos gaps metodológicos.`
  },
  4: {
    title: 'Criterios de Elegibilidad',
    content: `✅ CRITERIOS DE INCLUSIÓN:

Diseño del estudio:
• Ensayos clínicos aleatorizados (RCTs) fase III
• Doble ciego, controlados con placebo
• Tamaño muestral ≥100 participantes
📎 Fuente: Cochrane Handbook 6.3, Capítulo 3

Participantes:
• Adultos ≥18 años
• ICFEp confirmada (FEVI ≥50%, criterios ESC 2021)
• NT-proBNP ≥300 pg/mL o BNP ≥100 pg/mL
📎 Fuente: ESC HF Guidelines doi:10.1093/eurheartj/ehab368

Intervención:
• SGLT2i a dosis estándar (Empa 10mg, Dapa 10mg)
• Duración mínima de tratamiento: 6 meses

Outcomes:
• Reporte de outcome compuesto CV primario
• Datos suficientes para calcular HR con IC 95%

❌ CRITERIOS DE EXCLUSIÓN:

• Estudios observacionales, cohortes, registros
• ICFEr o ICFEmr (FEVI <50%)
• Estudios en población pediátrica
• Dosis no estándar o experimentales
• Publicaciones duplicadas o subestudios
• Idiomas diferentes a inglés/español
📎 Fuente: PRISMA-P 2015 Checklist`
  },
  5: {
    title: 'Verificación PROSPERO',
    content: `🔍 BÚSQUEDA EN PROSPERO COMPLETADA

Query: (SGLT2 OR empagliflozin OR dapagliflozin) AND (heart failure) AND (preserved ejection OR HFpEF)

📄 PROTOCOLOS SIMILARES IDENTIFICADOS: 4

1. CRD42023456789
   • Título: SGLT2i in Heart Failure with Reduced EF
   • Estado: Completado
   • ⚠️ Diferente: Enfocado en ICFEr (FEVI <40%)

2. CRD42024123456
   • Título: Empagliflozin monotherapy in HFpEF
   • Estado: En progreso
   • ⚠️ Más limitado: Solo empagliflozina

3. CRD42024789012
   • Título: Cardiorenal outcomes with SGLT2i
   • Estado: En progreso
   • ⚠️ Diferente outcome: Enfocado en función renal

4. CRD42022111222
   • Título: SGLT2i safety in elderly HFpEF
   • Estado: Abandonado
   • ⚠️ Población específica: Solo >75 años

✅ RECOMENDACIÓN: Proceder con NUEVO registro
📋 ID sugerido: CRD42025XXXXXX
📎 Fuente: crd.york.ac.uk/prospero (acceso: ${new Date().toLocaleDateString('es-ES')})`
  },
  6: {
    title: 'Evaluación de Sesgos (RoB 2.0)',
    content: `🛡️ HERRAMIENTA: Cochrane Risk of Bias 2.0
📎 Fuente: riskofbias.info

DOMINIOS EVALUADOS POR ESTUDIO:

D1 - Proceso de aleatorización:
• EMPEROR: 🟢 Bajo (aleatorización centralizada IVRS)
• DELIVER: 🟢 Bajo (estratificada por diabetes)
📎 Protocolo: NCT03057951, NCT03619213

D2 - Desviaciones del protocolo:
• Todos: 🟢 Bajo (doble ciego mantenido)

D3 - Datos de outcome faltantes:
• EMPEROR: 🟢 Bajo (1.8% pérdida seguimiento)
• DELIVER: 🟡 Algunas preocupaciones (4.2% pérdida)

D4 - Medición del outcome:
• Todos: 🟢 Bajo (adjudicación ciega por comité)

D5 - Selección de resultados reportados:
• Todos: 🟢 Bajo (pre-registro ClinicalTrials.gov)

📊 RESUMEN GLOBAL:
• 10/12 estudios: Bajo riesgo de sesgo
• 2/12 estudios: Algunas preocupaciones (D3)

📈 PLAN DE SENSIBILIDAD:
• Análisis excluyendo estudios con preocupaciones
• Meta-regresión por % pérdida de seguimiento`
  },
  7: {
    title: 'Estrategia de Búsqueda Sistemática',
    content: `🔍 ESTRATEGIA YADAV OPTIMIZADA

═══ PubMed/MEDLINE ═══
("Sodium-Glucose Transporter 2 Inhibitors"[Mesh] OR "SGLT2 inhibitor*"[tiab] OR "empagliflozin"[tiab] OR "dapagliflozin"[tiab] OR "canagliflozin"[tiab] OR "ertugliflozin"[tiab])
AND
("Heart Failure"[Mesh] OR "heart failure"[tiab] OR "cardiac failure"[tiab] OR "HFpEF"[tiab] OR "preserved ejection fraction"[tiab])
AND
("randomized controlled trial"[pt] OR "controlled clinical trial"[pt] OR "randomized"[tiab])
📎 Filtros: 2019-2025, Humans, Adult, English OR Spanish

═══ Embase (via Ovid) ═══
('sodium glucose cotransporter 2 inhibitor'/exp OR 'empagliflozin'/exp OR 'dapagliflozin'/exp)
AND
('heart failure with preserved ejection fraction'/exp OR 'diastolic heart failure'/exp)
AND
('randomized controlled trial'/exp)

═══ Cochrane CENTRAL ═══
MeSH descriptor: [Sodium-Glucose Transporter 2 Inhibitors]
AND MeSH descriptor: [Heart Failure]
Filtro: Trials

═══ Web of Science ═══
TS=(SGLT2 AND "heart failure" AND "preserved" AND randomized)

📊 Resultados esperados: 800-900 artículos
📎 Fuente: Search strategies validated by medical librarian`
  },
  8: {
    title: 'Protocolo PRISMA-P Completo',
    content: `📋 CHECKLIST PRISMA-P 2015 COMPLETADO

SECCIÓN ADMINISTRATIVA:
✅ Item 1 - Título: "Efficacy and Safety of SGLT2 Inhibitors in Heart Failure with Preserved Ejection Fraction: A Systematic Review and Meta-Analysis"
✅ Item 2 - Registro: PROSPERO CRD42025XXXXXX (pendiente)
✅ Item 3 - Autores: Galatea AI Research Team
✅ Item 4 - Enmiendas: Procedimiento documentado

INTRODUCCIÓN:
✅ Item 5 - Justificación: Gap analysis completado
✅ Item 6 - Objetivos: PICO definido

MÉTODOS:
✅ Item 7 - Criterios elegibilidad: PICOS framework
✅ Item 8 - Fuentes información: 4 bases de datos
✅ Item 9 - Estrategia búsqueda: Peer-reviewed
✅ Item 10 - Selección estudios: 2 revisores independientes
✅ Item 11 - Extracción datos: Formulario estandarizado
✅ Item 12 - Variables: HR, IC 95%, eventos, n
✅ Item 13 - RoB: Cochrane RoB 2.0
✅ Item 14 - Síntesis: Meta-análisis efectos aleatorios
✅ Item 15 - Meta-bias: Funnel plot, Egger test
✅ Item 16 - Certeza evidencia: GRADE framework
✅ Item 17 - Cronograma: 12 semanas estimadas

📎 Fuente: doi:10.1136/bmj.g7647 (PRISMA-P 2015)
📎 Estado: LISTO PARA REGISTRO PROSPERO`
  },
  9: {
    title: 'Flujo PRISMA 2020',
    content: `📊 DIAGRAMA DE FLUJO PRISMA 2020

═══ IDENTIFICACIÓN ═══
Registros identificados de bases de datos:
├── PubMed/MEDLINE: 342
├── Embase: 289
├── Cochrane CENTRAL: 156
└── Web of Science: 60
📎 Total bases de datos: 847

Registros de otras fuentes:
├── ClinicalTrials.gov: 45
├── Referencias de RS previas: 12
└── Expertos contactados: 3
📎 Total otras fuentes: 60

═══ CRIBADO ═══
Registros antes de deduplicación: 907
Duplicados removidos (EndNote): 234
────────────────────────────
Registros cribados (título/abstract): 673
Excluidos en cribado: 549
├── No RCT: 234
├── Población incorrecta: 189
├── Intervención diferente: 98
└── Outcome no relevante: 28

═══ ELEGIBILIDAD ═══
Reportes buscados para texto completo: 124
No recuperables: 6
────────────────────────────
Reportes evaluados texto completo: 118
Excluidos texto completo: 106
├── FEVI <50%: 45
├── Seguimiento <6 meses: 32
├── Dosis no estándar: 18
└── Datos insuficientes: 11

═══ INCLUIDOS ═══
✅ Estudios en RS: 12 RCTs
✅ Estudios en meta-análisis: 12

📎 Fuente: PRISMA 2020 Flow Diagram Template (prisma-statement.org)`
  },
  10: {
    title: 'Tabla de Extracción de Datos',
    content: `📊 CARACTERÍSTICAS DE ESTUDIOS INCLUIDOS (12 RCTs)

┌────────────────────────────────────────────────────────────┐
│ ESTUDIO          │ N      │ SGLT2i │ HR (95% CI)  │ Seg.  │
├────────────────────────────────────────────────────────────┤
│ EMPEROR-Preserved│ 5,988  │ Empa   │ 0.79 (0.69-0.90)│ 26m  │
│ PMID: 34449189   │        │ 10mg   │ p<0.001        │      │
├────────────────────────────────────────────────────────────┤
│ DELIVER          │ 6,263  │ Dapa   │ 0.82 (0.73-0.92)│ 28m  │
│ PMID: 36027570   │        │ 10mg   │ p<0.001        │      │
├────────────────────────────────────────────────────────────┤
│ PRESERVED-HF     │ 324    │ Dapa   │ N/A (short-term)│ 12w  │
│ PMID: 35285884   │        │ 10mg   │ KCCQ primary   │      │
├────────────────────────────────────────────────────────────┤
│ + 9 estudios adicionales (ver Suplemento)                  │
└────────────────────────────────────────────────────────────┘

📈 RESUMEN POOLED:
• Participantes totales: 14,234
• Eventos primarios (IC+muerte CV): 2,847
• Edad media ponderada: 72.4 años
• % Mujeres: 44.8%
• % Diabetes: 49.2%
• FEVI media: 54.3%
• NT-proBNP media: 994 pg/mL

📎 Fuentes: NEJM, JAMA, European Heart Journal
📎 Datos suplementarios: ClinicalTrials.gov`
  },
  11: {
    title: 'Evaluación de Calidad Metodológica',
    content: `🔬 RESULTADOS COCHRANE RoB 2.0

═══ TRAFFIC LIGHT PLOT ═══

Estudio              │ D1 │ D2 │ D3 │ D4 │ D5 │ Overall
─────────────────────┼────┼────┼────┼────┼────┼─────────
EMPEROR-Preserved    │ 🟢 │ 🟢 │ 🟢 │ 🟢 │ 🟢 │ 🟢 Bajo
DELIVER              │ 🟢 │ 🟢 │ 🟡 │ 🟢 │ 🟢 │ 🟡 Algunas
PRESERVED-HF         │ 🟢 │ 🟢 │ 🟢 │ 🟢 │ 🟢 │ 🟢 Bajo
[9 estudios más...]  │    │    │    │    │    │

📊 RESUMEN:
• Bajo riesgo: 10/12 (83.3%)
• Algunas preocupaciones: 2/12 (16.7%)
• Alto riesgo: 0/12 (0%)

═══ SESGO DE PUBLICACIÓN ═══
📈 Funnel Plot: Distribución simétrica
📊 Test de Egger: p = 0.34 (no significativo)
📊 Test de Begg: p = 0.42 (no significativo)
📊 Trim-and-fill: 0 estudios faltantes estimados

✅ CONCLUSIÓN: No hay evidencia de sesgo de publicación. Calidad metodológica global ALTA.

📎 Fuente: RevMan 5.4, Cochrane RoB 2.0 tool`
  },
  12: {
    title: 'Resultados del Meta-Análisis',
    content: `📊 META-ANÁLISIS DE EFECTOS ALEATORIOS

═══ OUTCOME PRIMARIO ═══
Hospitalización por IC + Muerte Cardiovascular

Modelo: DerSimonian-Laird (efectos aleatorios)
────────────────────────────────────────────
📈 Hazard Ratio pooled: 0.80
📈 IC 95%: 0.73 - 0.87
📈 Valor p: < 0.0001
📈 Z-score: 5.42

═══ HETEROGENEIDAD ═══
• I² = 18% (BAJA heterogeneidad)
• Tau² = 0.003
• Q = 13.4, df = 11, p = 0.27
• Prediction interval: 0.68 - 0.94

═══ OUTCOMES SECUNDARIOS ═══
1. Muerte cardiovascular aislada:
   HR 0.88 (0.77-1.00), p=0.054, I²=0%

2. Primera hospitalización por IC:
   HR 0.74 (0.67-0.83), p<0.001, I²=22%

3. Calidad de vida (KCCQ-TSS):
   MD +1.8 puntos (1.2-2.4), p<0.001

═══ NNT (Number Needed to Treat) ═══
🎯 NNT = 21 (IC 95%: 16-32)
Interpretación: Tratar 21 pacientes durante 2 años previene 1 evento del outcome compuesto.

📎 Fuente: Análisis con R meta package v6.0
📎 Forest plot disponible en PDF`
  },
  13: {
    title: 'Evaluación GRADE',
    content: `⭐ CALIFICACIÓN GRADE DE CERTEZA

═══ TABLA SUMMARY OF FINDINGS ═══

OUTCOME 1: Hospitalización IC + Muerte CV
┌─────────────────────────────────────────────────────────┐
│ Certeza inicial: ALTA (RCTs)                            │
│ Riesgo de sesgo: No downgrade (bajo riesgo)             │
│ Inconsistencia: No downgrade (I²=18%)                   │
│ Imprecisión: No downgrade (IC estrecho)                 │
│ Indirectness: No downgrade (población directa)          │
│ Sesgo publicación: No downgrade (funnel simétrico)      │
├─────────────────────────────────────────────────────────┤
│ CERTEZA FINAL: ⭐⭐⭐⭐ ALTA                             │
│ HR: 0.80 (0.73-0.87) | ARR: 4.8% | NNT: 21              │
└─────────────────────────────────────────────────────────┘

OUTCOME 2: Muerte Cardiovascular
│ CERTEZA FINAL: ⭐⭐⭐ MODERADA                           │
│ Downgrade: Imprecisión (IC cruza 1.0)                   │

OUTCOME 3: Calidad de vida (KCCQ)
│ CERTEZA FINAL: ⭐⭐⭐⭐ ALTA                             │
│ Diferencia clínicamente significativa (>1.5 puntos)     │

═══ RECOMENDACIÓN CLÍNICA ═══
💪 FUERTE a favor del uso de inhibidores SGLT2 en pacientes con ICFEp

📎 Fuente: GRADEpro GDT, GRADE Handbook
📎 Metodología: gradeworkinggroup.org`
  },
  14: {
    title: 'Dossier de Evidencia Generado',
    content: `📋 DOSSIER COMPLETO DE EVIDENCIA CIENTÍFICA

═══ INFORMACIÓN DEL DOCUMENTO ═══
Título: Revisión Sistemática y Meta-análisis: Eficacia de SGLT2i en ICFEp
Páginas: 47
Formato: PDF (ISO 32000-2)
Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}

═══ ESTRUCTURA DEL DOCUMENTO ═══
📄 Sección 1: Portada institucional (Galatea + Santa Fe)
📄 Sección 2: Resumen ejecutivo (español e inglés)
📄 Sección 3: Marco PICOT y justificación
📄 Sección 4: Estrategia de búsqueda completa
📄 Sección 5: Diagrama PRISMA 2020
📄 Sección 6: Tabla de características de estudios
📄 Sección 7: Evaluación riesgo de sesgo (RoB 2.0)
📄 Sección 8: Forest plot principal
📄 Sección 9: Análisis de sensibilidad
📄 Sección 10: Funnel plot y sesgo publicación
📄 Sección 11: Tabla GRADE Summary of Findings
📄 Sección 12: Discusión e implicaciones clínicas
📄 Sección 13: Conclusiones y recomendaciones
📄 Sección 14: Referencias (124 citas, formato Vancouver)
📄 Apéndices: Protocolos, ecuaciones búsqueda, datos crudos

═══ VALIDACIONES ═══
✅ Cumple PRISMA 2020 checklist (27/27 items)
✅ Registrable en PROSPERO
✅ Formato compatible con NEJM, Lancet, JAMA
✅ Branding institucional aplicado

📥 ESTADO: LISTO PARA DESCARGA`
  },
};

// =========================================
// DEFAULT DEMO QUESTION
// =========================================
const DEFAULT_QUESTION = "¿Cuál es la eficacia y seguridad de los inhibidores SGLT2 (empagliflozina, dapagliflozina) en pacientes con insuficiencia cardíaca con fracción de eyección preservada comparado con placebo, medido por hospitalización y mortalidad cardiovascular?";

// =========================================
// ENHANCED PDF GENERATION (30+ pages)
// =========================================
const generateComprehensivePDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  
  const addHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Galatea AI + Fundación Santa Fe de Bogotá', margin, 10);
    doc.text('Dossier de Evidencia Científica', pageWidth - margin, 10, { align: 'right' });
  };
  
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  // ===== PAGE 1: COVER =====
  doc.setFillColor(27, 77, 122);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text('DOSSIER DE EVIDENCIA', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Revisión Sistemática y Meta-análisis', pageWidth / 2, 48, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(46, 125, 107);
  doc.text('Eficacia y Seguridad de Inhibidores SGLT2', pageWidth / 2, 85, { align: 'center' });
  doc.text('en Insuficiencia Cardíaca con Fracción de', pageWidth / 2, 95, { align: 'center' });
  doc.text('Eyección Preservada (ICFEp)', pageWidth / 2, 105, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('Generado por:', pageWidth / 2, 140, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(27, 77, 122);
  doc.text('Galatea AI Research Engine', pageWidth / 2, 150, { align: 'center' });
  doc.text('Fundación Santa Fe de Bogotá', pageWidth / 2, 160, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth / 2, 190, { align: 'center' });
  doc.text('Versión: 1.0', pageWidth / 2, 200, { align: 'center' });
  doc.text('Confidencial - Solo para uso institucional', pageWidth / 2, 210, { align: 'center' });

  // ===== PAGE 2: TABLE OF CONTENTS =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(20);
  doc.setTextColor(27, 77, 122);
  doc.text('ÍNDICE DE CONTENIDOS', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const toc = [
    { title: '1. Resumen Ejecutivo', page: 3 },
    { title: '2. Introducción y Justificación', page: 5 },
    { title: '3. Objetivos', page: 7 },
    { title: '4. Métodos', page: 8 },
    { title: '   4.1 Marco PICOT', page: 8 },
    { title: '   4.2 Criterios de Elegibilidad', page: 9 },
    { title: '   4.3 Estrategia de Búsqueda', page: 10 },
    { title: '   4.4 Evaluación de Calidad', page: 11 },
    { title: '5. Resultados', page: 12 },
    { title: '   5.1 Flujo PRISMA', page: 12 },
    { title: '   5.2 Características de Estudios', page: 14 },
    { title: '   5.3 Riesgo de Sesgo', page: 16 },
    { title: '   5.4 Meta-análisis', page: 18 },
    { title: '   5.5 Análisis de Sensibilidad', page: 20 },
    { title: '6. Evaluación GRADE', page: 22 },
    { title: '7. Discusión', page: 24 },
    { title: '8. Conclusiones', page: 27 },
    { title: '9. Referencias', page: 28 },
    { title: 'Apéndices', page: 32 },
  ];
  
  let y = 45;
  toc.forEach(item => {
    doc.text(item.title, margin, y);
    doc.text(item.page.toString(), pageWidth - margin, y, { align: 'right' });
    y += 8;
  });

  // ===== PAGE 3-4: EXECUTIVE SUMMARY =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('1. RESUMEN EJECUTIVO', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  const execSummary = [
    'CONTEXTO',
    'La insuficiencia cardíaca con fracción de eyección preservada (ICFEp) representa',
    'aproximadamente el 50% de todos los casos de insuficiencia cardíaca. Históricamente,',
    'no existían tratamientos que mejoraran los outcomes cardiovasculares en esta población.',
    'Los inhibidores del cotransportador sodio-glucosa tipo 2 (SGLT2i) han emergido como',
    'una nueva opción terapéutica con evidencia de beneficio en ensayos recientes.',
    '',
    'OBJETIVO',
    'Evaluar la eficacia y seguridad de los inhibidores SGLT2 (empagliflozina, dapagliflozina)',
    'en pacientes con ICFEp (FEVI ≥50%) comparado con placebo, medido por el outcome',
    'compuesto de hospitalización por IC y muerte cardiovascular.',
    '',
    'MÉTODOS',
    'Revisión sistemática siguiendo las guías PRISMA 2020. Búsqueda en PubMed, Embase,',
    'Cochrane Central y Web of Science. Meta-análisis de efectos aleatorios utilizando',
    'el método DerSimonian-Laird. Evaluación de calidad con Cochrane RoB 2.0 y GRADE.',
    '',
    'RESULTADOS PRINCIPALES',
    '• 12 RCTs incluidos (n = 14,234 participantes)',
    '• Hazard Ratio pooled: 0.80 (IC 95%: 0.73-0.87), p < 0.0001',
    '• Heterogeneidad baja (I² = 18%)',
    '• NNT: 21 pacientes tratados durante 2 años',
    '• Sin evidencia de sesgo de publicación',
    '',
    'CERTEZA DE LA EVIDENCIA (GRADE)',
    '• Outcome primario (Hosp IC + muerte CV): ALTA ⭐⭐⭐⭐',
    '• Muerte cardiovascular aislada: MODERADA ⭐⭐⭐',
    '• Calidad de vida (KCCQ): ALTA ⭐⭐⭐⭐',
  ];
  
  y = 42;
  execSummary.forEach(line => {
    if (line === 'CONTEXTO' || line === 'OBJETIVO' || line === 'MÉTODOS' || 
        line === 'RESULTADOS PRINCIPALES' || line === 'CERTEZA DE LA EVIDENCIA (GRADE)') {
      doc.setFontSize(12);
      doc.setTextColor(27, 77, 122);
      doc.text(line, margin, y);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.text(line, margin, y);
    }
    y += lineHeight;
    if (y > 270) {
      doc.addPage();
      addHeader();
      y = 30;
    }
  });
  
  // Continue executive summary
  doc.addPage();
  addHeader();
  
  doc.setFontSize(12);
  doc.setTextColor(27, 77, 122);
  doc.text('CONCLUSIÓN', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const conclusion1 = [
    'Los inhibidores SGLT2 reducen significativamente el riesgo del outcome compuesto',
    'de hospitalización por IC y muerte cardiovascular en pacientes con ICFEp, con',
    'una reducción relativa del riesgo del 20% (HR 0.80). La evidencia es de alta',
    'certeza según GRADE.',
    '',
    'RECOMENDACIÓN CLÍNICA',
    'Recomendación FUERTE a favor del uso de inhibidores SGLT2 (empagliflozina o',
    'dapagliflozina 10mg/día) en pacientes con ICFEp sintomática, independientemente',
    'de la presencia de diabetes mellitus.',
    '',
    'IMPLICACIONES PARA LA PRÁCTICA',
    '• Iniciar SGLT2i en todo paciente con ICFEp sintomática',
    '• Beneficio consistente en subgrupos (con/sin diabetes, diferentes rangos FEVI)',
    '• Perfil de seguridad favorable con monitoreo estándar',
    '• Actualización necesaria de guías institucionales',
  ];
  
  y = 42;
  conclusion1.forEach(line => {
    if (line === 'RECOMENDACIÓN CLÍNICA' || line === 'IMPLICACIONES PARA LA PRÁCTICA') {
      doc.setFontSize(12);
      doc.setTextColor(46, 125, 107);
      doc.text(line, margin, y);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.text(line, margin, y);
    }
    y += lineHeight;
  });

  // ===== PAGE 5-6: INTRODUCTION =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('2. INTRODUCCIÓN Y JUSTIFICACIÓN', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const intro = [
    'ANTECEDENTES',
    '',
    'La insuficiencia cardíaca (IC) afecta a más de 64 millones de personas en todo el',
    'mundo y representa una de las principales causas de hospitalización y mortalidad',
    'cardiovascular. La IC con fracción de eyección preservada (ICFEp), definida como',
    'IC con FEVI ≥50%, constituye aproximadamente la mitad de todos los casos de IC',
    'y su prevalencia está aumentando debido al envejecimiento poblacional.',
    '',
    'Históricamente, ningún tratamiento había demostrado mejorar los outcomes',
    'cardiovasculares en pacientes con ICFEp. Los ensayos con IECA/ARA-II, beta-',
    'bloqueantes y antagonistas de aldosterona mostraron resultados neutros o',
    'inconsistentes en esta población.',
    '',
    'Los inhibidores del cotransportador sodio-glucosa tipo 2 (SGLT2i), inicialmente',
    'desarrollados como antidiabéticos, han demostrado beneficios cardiovasculares',
    'inesperados en múltiples ensayos clínicos. Los estudios EMPEROR-Preserved',
    '(empagliflozina) y DELIVER (dapagliflozina) representan los primeros ensayos',
    'positivos en ICFEp.',
    '',
    'JUSTIFICACIÓN DE ESTA REVISIÓN',
    '',
    'A pesar de la evidencia creciente, persisten gaps importantes:',
    '',
    '1. Las revisiones sistemáticas previas no incluyen datos completos de ambos',
    '   trials pivotales (EMPEROR-Preserved + DELIVER)',
    '',
    '2. Falta análisis de subgrupos por rango de FEVI (50-60% vs >60%)',
    '',
    '3. Representación limitada de poblaciones latinoamericanas y asiáticas',
    '',
    '4. Necesidad de síntesis actualizada para informar guías clínicas',
    '',
    'Esta revisión sistemática y meta-análisis busca llenar estos gaps metodológicos',
    'y proporcionar evidencia de alta calidad para la toma de decisiones clínicas.',
  ];
  
  y = 42;
  intro.forEach(line => {
    if (line === 'ANTECEDENTES' || line === 'JUSTIFICACIÓN DE ESTA REVISIÓN') {
      doc.setFontSize(12);
      doc.setTextColor(27, 77, 122);
      doc.text(line, margin, y);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.text(line, margin, y);
    }
    y += lineHeight;
    if (y > 270) {
      doc.addPage();
      addHeader();
      y = 30;
    }
  });

  // ===== PAGE 7: OBJECTIVES =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('3. OBJETIVOS', margin, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(27, 77, 122);
  doc.text('OBJETIVO PRIMARIO', margin, 45);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.text('Evaluar la eficacia de los inhibidores SGLT2 versus placebo en reducir el', margin, 55);
  doc.text('outcome compuesto de hospitalización por IC y muerte cardiovascular en', margin, 62);
  doc.text('pacientes con ICFEp.', margin, 69);
  
  doc.setFontSize(12);
  doc.setTextColor(27, 77, 122);
  doc.text('OBJETIVOS SECUNDARIOS', margin, 85);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const objectives = [
    '1. Evaluar el efecto sobre mortalidad cardiovascular aislada',
    '2. Evaluar el efecto sobre primera hospitalización por IC',
    '3. Evaluar el efecto sobre calidad de vida (KCCQ-TSS)',
    '4. Evaluar el perfil de seguridad y eventos adversos',
    '5. Realizar análisis de subgrupos pre-especificados:',
    '   • Por presencia de diabetes mellitus',
    '   • Por rango de FEVI (50-60% vs >60%)',
    '   • Por región geográfica',
    '   • Por tipo de SGLT2i (empagliflozina vs dapagliflozina)',
  ];
  
  y = 95;
  objectives.forEach(line => {
    doc.text(line, margin, y);
    y += lineHeight;
  });

  // ===== PAGE 8-11: METHODS =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('4. MÉTODOS', margin, 30);
  
  doc.setFontSize(14);
  doc.text('4.1 Marco PICOT', margin, 45);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const picot = [
    'POBLACIÓN (P):',
    'Adultos ≥18 años con diagnóstico confirmado de insuficiencia cardíaca con',
    'fracción de eyección preservada (ICFEp), definida como FEVI ≥50% según',
    'criterios de la European Society of Cardiology (ESC) 2021.',
    '',
    'INTERVENCIÓN (I):',
    'Inhibidores del cotransportador sodio-glucosa tipo 2 (SGLT2i):',
    '• Empagliflozina 10mg una vez al día',
    '• Dapagliflozina 10mg una vez al día',
    '',
    'COMPARADOR (C):',
    'Placebo o tratamiento estándar optimizado sin inhibidor SGLT2.',
    '',
    'OUTCOMES (O):',
    'Primario: Compuesto de muerte cardiovascular + primera hospitalización por IC',
    'Secundarios:',
    '• Mortalidad CV aislada',
    '• Hospitalizaciones totales por IC',
    '• Calidad de vida (KCCQ-TSS)',
    '• Función renal (cambio en eGFR)',
    '• Eventos adversos serios',
    '',
    'TIEMPO (T):',
    'Ensayos clínicos aleatorizados publicados entre enero 2019 y diciembre 2024,',
    'con seguimiento mínimo de 12 meses.',
  ];
  
  y = 55;
  picot.forEach(line => {
    if (line.includes('(P):') || line.includes('(I):') || line.includes('(C):') || 
        line.includes('(O):') || line.includes('(T):')) {
      doc.setFontSize(11);
      doc.setTextColor(46, 125, 107);
      doc.text(line, margin, y);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.text(line, margin, y);
    }
    y += lineHeight;
  });

  // Continue methods...
  doc.addPage();
  addHeader();
  
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 122);
  doc.text('4.2 Criterios de Elegibilidad', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  const criteria = [
    'CRITERIOS DE INCLUSIÓN:',
    '',
    '• Diseño: Ensayos clínicos aleatorizados (RCTs) fase III, doble ciego',
    '• Tamaño: ≥100 participantes',
    '• Población: Adultos con ICFEp (FEVI ≥50% según criterios ESC 2021)',
    '• Intervención: SGLT2i a dosis estándar (empagliflozina o dapagliflozina 10mg)',
    '• Comparador: Placebo o tratamiento estándar',
    '• Seguimiento: ≥6 meses',
    '• Outcomes: Reporte de outcome compuesto CV con datos para HR e IC 95%',
    '• Idioma: Inglés o español',
    '',
    'CRITERIOS DE EXCLUSIÓN:',
    '',
    '• Estudios observacionales, cohortes, series de casos, reportes de casos',
    '• ICFEr o ICFEmr (FEVI <50%)',
    '• Población pediátrica (<18 años)',
    '• Dosis no estándar o experimentales de SGLT2i',
    '• Publicaciones duplicadas o subestudios sin datos originales',
    '• Estudios en curso sin resultados finales publicados',
  ];
  
  y = 42;
  criteria.forEach(line => {
    if (line === 'CRITERIOS DE INCLUSIÓN:' || line === 'CRITERIOS DE EXCLUSIÓN:') {
      doc.setTextColor(27, 77, 122);
      doc.text(line, margin, y);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.text(line, margin, y);
    }
    y += lineHeight;
  });

  // ===== PAGE: RESULTS - ENHANCED PRISMA FLOW DIAGRAM =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('5. RESULTADOS', margin, 30);
  
  doc.setFontSize(14);
  doc.text('5.1 Diagrama de Flujo PRISMA 2020', margin, 45);
  
  // PRISMA Diagram - Enhanced visual layout
  const centerX = pageWidth / 2;
  const boxWidth = 75;
  const boxHeight = 22;
  
  // === IDENTIFICATION SECTION ===
  doc.setFillColor(27, 77, 122);
  doc.rect(margin, 55, pageWidth - 2*margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('IDENTIFICACIÓN', centerX, 60, { align: 'center' });
  
  // Databases box
  doc.setDrawColor(27, 77, 122);
  doc.setLineWidth(1);
  doc.setFillColor(240, 248, 255);
  doc.rect(margin + 5, 68, boxWidth, boxHeight + 10, 'FD');
  doc.setTextColor(27, 77, 122);
  doc.setFontSize(9);
  doc.text('Registros de bases de datos', margin + 5 + boxWidth/2, 75, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('PubMed: 342', margin + 10, 83);
  doc.text('Embase: 289', margin + 10, 89);
  doc.text('Cochrane: 156', margin + 10, 95);
  doc.text('Web of Science: 60', margin + 50, 83);
  doc.text('Total: 847', margin + 50, 89);
  
  // Other sources box
  doc.setFillColor(240, 248, 255);
  doc.rect(pageWidth - margin - boxWidth - 5, 68, boxWidth, boxHeight + 10, 'FD');
  doc.setTextColor(27, 77, 122);
  doc.setFontSize(9);
  doc.text('Otras fuentes', pageWidth - margin - boxWidth/2 - 5, 75, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('ClinicalTrials.gov: 45', pageWidth - margin - boxWidth, 83);
  doc.text('Referencias: 12', pageWidth - margin - boxWidth, 89);
  doc.text('Expertos: 3', pageWidth - margin - boxWidth, 95);
  
  // Arrow down
  doc.setDrawColor(27, 77, 122);
  doc.setLineWidth(1.5);
  doc.line(centerX, 100, centerX, 108);
  doc.setFillColor(27, 77, 122);
  doc.triangle(centerX - 3, 108, centerX + 3, 108, centerX, 114, 'F');
  
  // Duplicates removed box
  doc.setFillColor(255, 243, 224);
  doc.setDrawColor(255, 152, 0);
  doc.rect(centerX - boxWidth/2, 118, boxWidth, 18, 'FD');
  doc.setTextColor(255, 152, 0);
  doc.setFontSize(9);
  doc.text('Duplicados removidos', centerX, 125, { align: 'center' });
  doc.text('n = 234', centerX, 132, { align: 'center' });
  
  // Arrow down
  doc.setDrawColor(27, 77, 122);
  doc.line(centerX, 136, centerX, 142);
  doc.setFillColor(27, 77, 122);
  doc.triangle(centerX - 3, 142, centerX + 3, 142, centerX, 148, 'F');
  
  // === SCREENING SECTION ===
  doc.setFillColor(74, 144, 164);
  doc.rect(margin, 150, pageWidth - 2*margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('CRIBADO', centerX, 155, { align: 'center' });
  
  // Screened box
  doc.setFillColor(232, 245, 253);
  doc.setDrawColor(74, 144, 164);
  doc.rect(margin + 10, 162, boxWidth, boxHeight, 'FD');
  doc.setTextColor(74, 144, 164);
  doc.setFontSize(9);
  doc.text('Registros cribados', margin + 10 + boxWidth/2, 171, { align: 'center' });
  doc.text('(título/abstract)', margin + 10 + boxWidth/2, 178, { align: 'center' });
  doc.setFontSize(11);
  doc.text('n = 673', margin + 10 + boxWidth/2, 182, { align: 'center' });
  
  // Excluded box (right)
  doc.setFillColor(255, 235, 238);
  doc.setDrawColor(244, 67, 54);
  doc.rect(pageWidth - margin - boxWidth - 10, 162, boxWidth, boxHeight, 'FD');
  doc.setTextColor(244, 67, 54);
  doc.setFontSize(9);
  doc.text('Excluidos en cribado', pageWidth - margin - boxWidth/2 - 10, 171, { align: 'center' });
  doc.setFontSize(11);
  doc.text('n = 549', pageWidth - margin - boxWidth/2 - 10, 180, { align: 'center' });
  
  // Arrow from screened to excluded
  doc.setDrawColor(244, 67, 54);
  doc.setLineWidth(1);
  doc.line(margin + 10 + boxWidth, 173, pageWidth - margin - boxWidth - 10, 173);
  
  // Arrow down
  doc.setDrawColor(27, 77, 122);
  doc.setLineWidth(1.5);
  doc.line(margin + 10 + boxWidth/2, 184, margin + 10 + boxWidth/2, 195);
  doc.setFillColor(27, 77, 122);
  doc.triangle(margin + 10 + boxWidth/2 - 3, 195, margin + 10 + boxWidth/2 + 3, 195, margin + 10 + boxWidth/2, 201, 'F');
  
  // === ELIGIBILITY SECTION ===
  doc.setFillColor(27, 77, 122);
  doc.rect(margin, 203, pageWidth - 2*margin, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('ELEGIBILIDAD', centerX, 208, { align: 'center' });
  
  // Full text assessed box
  doc.setFillColor(232, 245, 253);
  doc.setDrawColor(27, 77, 122);
  doc.rect(margin + 10, 215, boxWidth, boxHeight, 'FD');
  doc.setTextColor(27, 77, 122);
  doc.setFontSize(9);
  doc.text('Texto completo evaluado', margin + 10 + boxWidth/2, 224, { align: 'center' });
  doc.setFontSize(11);
  doc.text('n = 124', margin + 10 + boxWidth/2, 233, { align: 'center' });
  
  // Excluded with reasons box (right)
  doc.setFillColor(255, 235, 238);
  doc.setDrawColor(244, 67, 54);
  doc.rect(pageWidth - margin - boxWidth - 30, 215, boxWidth + 20, boxHeight + 15, 'FD');
  doc.setTextColor(244, 67, 54);
  doc.setFontSize(9);
  doc.text('Excluidos (n = 112)', pageWidth - margin - boxWidth/2 - 20, 222, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text('FEVI <50%: 45', pageWidth - margin - boxWidth - 25, 230);
  doc.text('Seguimiento <6m: 32', pageWidth - margin - boxWidth - 25, 237);
  doc.text('Dosis no estándar: 18', pageWidth - margin - boxWidth - 25, 244);
  doc.text('Datos insuficientes: 17', pageWidth - margin - boxWidth - 25, 251);
  
  // Arrow from assessed to excluded
  doc.setDrawColor(244, 67, 54);
  doc.setLineWidth(1);
  doc.line(margin + 10 + boxWidth, 226, pageWidth - margin - boxWidth - 30, 226);
  
  // Arrow down
  doc.setDrawColor(46, 125, 107);
  doc.setLineWidth(1.5);
  doc.line(margin + 10 + boxWidth/2, 237, margin + 10 + boxWidth/2, 255);
  doc.setFillColor(46, 125, 107);
  doc.triangle(margin + 10 + boxWidth/2 - 3, 255, margin + 10 + boxWidth/2 + 3, 255, margin + 10 + boxWidth/2, 261, 'F');
  
  // === INCLUDED SECTION ===
  doc.setFillColor(46, 125, 107);
  doc.rect(margin + 10, 263, boxWidth + 30, boxHeight + 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('ESTUDIOS INCLUIDOS', margin + 10 + (boxWidth + 30)/2, 273, { align: 'center' });
  doc.setFontSize(14);
  doc.text('12 RCTs', margin + 10 + (boxWidth + 30)/2, 283, { align: 'center' });
  
  // Participants box
  doc.setFillColor(232, 245, 233);
  doc.setDrawColor(46, 125, 107);
  doc.rect(margin + boxWidth + 50, 263, boxWidth, boxHeight + 5, 'FD');
  doc.setTextColor(46, 125, 107);
  doc.setFontSize(10);
  doc.text('Total participantes', margin + boxWidth + 50 + boxWidth/2, 275, { align: 'center' });
  doc.setFontSize(12);
  doc.text('n = 14,234', margin + boxWidth + 50 + boxWidth/2, 285, { align: 'center' });

  // ===== PAGE: FOREST PLOT =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 122);
  doc.text('5.3 Forest Plot - Meta-análisis del Outcome Primario', margin, 30);
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text('Outcome: Hospitalización por IC + Muerte Cardiovascular', margin, 38);
  
  // Forest plot studies data
  const forestData = [
    { study: 'EMPEROR-Preserved 2021', hr: 0.79, ciLow: 0.69, ciHigh: 0.90, weight: 28.5, n: 5988 },
    { study: 'DELIVER 2022', hr: 0.82, ciLow: 0.73, ciHigh: 0.92, weight: 31.2, n: 6263 },
    { study: 'PRESERVED-HF 2021', hr: 0.84, ciLow: 0.64, ciHigh: 1.10, weight: 8.4, n: 324 },
    { study: 'Santos-Gallego 2021', hr: 0.72, ciLow: 0.48, ciHigh: 1.08, weight: 4.2, n: 84 },
    { study: 'Ejiri 2020', hr: 0.88, ciLow: 0.61, ciHigh: 1.27, weight: 5.1, n: 160 },
    { study: 'Tanaka 2020', hr: 0.76, ciLow: 0.52, ciHigh: 1.11, weight: 4.8, n: 128 },
    { study: 'Soga 2022', hr: 0.85, ciLow: 0.65, ciHigh: 1.11, weight: 7.5, n: 245 },
    { study: 'EMBRACE-HF 2021', hr: 0.91, ciLow: 0.68, ciHigh: 1.22, weight: 5.8, n: 140 },
    { study: 'Hwang 2022', hr: 0.78, ciLow: 0.56, ciHigh: 1.09, weight: 4.5, n: 178 },
  ];
  
  // Draw forest plot header
  const plotLeft = margin;
  const plotRight = pageWidth - margin;
  const studyColWidth = 55;
  const hrColWidth = 25;
  const ciColWidth = 35;
  const weightColWidth = 20;
  const plotAreaLeft = margin + studyColWidth + 5;
  const plotAreaRight = pageWidth - margin - 50;
  const plotAreaWidth = plotAreaRight - plotAreaLeft;
  
  // Header row
  let plotY = 48;
  doc.setFillColor(27, 77, 122);
  doc.rect(plotLeft, plotY, plotRight - plotLeft, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Estudio', plotLeft + 2, plotY + 7);
  doc.text('HR', plotAreaRight + 5, plotY + 7);
  doc.text('IC 95%', plotAreaRight + 25, plotY + 7);
  doc.text('Peso %', plotRight - 15, plotY + 7, { align: 'center' });
  
  plotY += 12;
  
  // Draw reference line at HR = 1.0
  const hrToX = (hr: number) => {
    const logHr = Math.log(hr);
    const minLog = Math.log(0.4);
    const maxLog = Math.log(1.6);
    return plotAreaLeft + ((logHr - minLog) / (maxLog - minLog)) * plotAreaWidth;
  };
  
  const refLineX = hrToX(1.0);
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(refLineX, plotY, refLineX, plotY + forestData.length * 12 + 20);
  
  // Draw each study
  forestData.forEach((study, idx) => {
    const y = plotY + idx * 12;
    
    // Alternate row background
    if (idx % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(plotLeft, y - 2, plotRight - plotLeft, 12, 'F');
    }
    
    // Study name
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.text(study.study, plotLeft + 2, y + 5);
    
    // HR value
    doc.text(study.hr.toFixed(2), plotAreaRight + 5, y + 5);
    
    // CI
    doc.text(`${study.ciLow.toFixed(2)}-${study.ciHigh.toFixed(2)}`, plotAreaRight + 20, y + 5);
    
    // Weight
    doc.text(study.weight.toFixed(1), plotRight - 15, y + 5, { align: 'center' });
    
    // Draw CI line
    const xLow = hrToX(study.ciLow);
    const xHigh = hrToX(study.ciHigh);
    const xMid = hrToX(study.hr);
    
    doc.setDrawColor(27, 77, 122);
    doc.setLineWidth(0.5);
    doc.line(xLow, y + 3, xHigh, y + 3);
    
    // Draw square (size proportional to weight)
    const squareSize = Math.sqrt(study.weight) * 0.8;
    doc.setFillColor(27, 77, 122);
    doc.rect(xMid - squareSize/2, y + 3 - squareSize/2, squareSize, squareSize, 'F');
  });
  
  // Draw pooled estimate (diamond)
  plotY += forestData.length * 12 + 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(plotLeft, plotY - 2, plotRight - plotLeft, 14, 'F');
  
  doc.setTextColor(46, 125, 107);
  doc.setFontSize(9);
  doc.text('POOLED (Random Effects)', plotLeft + 2, plotY + 7);
  doc.text('0.80', plotAreaRight + 5, plotY + 7);
  doc.text('0.73-0.87', plotAreaRight + 20, plotY + 7);
  doc.text('100', plotRight - 15, plotY + 7, { align: 'center' });
  
  // Draw diamond for pooled estimate
  const diamondX = hrToX(0.80);
  const diamondLow = hrToX(0.73);
  const diamondHigh = hrToX(0.87);
  doc.setFillColor(46, 125, 107);
  doc.triangle(diamondLow, plotY + 5, diamondX, plotY + 1, diamondX, plotY + 9, 'F');
  doc.triangle(diamondHigh, plotY + 5, diamondX, plotY + 1, diamondX, plotY + 9, 'F');
  
  // X-axis labels
  plotY += 20;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(7);
  doc.text('0.5', hrToX(0.5), plotY, { align: 'center' });
  doc.text('0.7', hrToX(0.7), plotY, { align: 'center' });
  doc.text('1.0', hrToX(1.0), plotY, { align: 'center' });
  doc.text('1.3', hrToX(1.3), plotY, { align: 'center' });
  doc.text('1.5', hrToX(1.5), plotY, { align: 'center' });
  
  // Labels
  plotY += 8;
  doc.setFontSize(8);
  doc.text('Favorece SGLT2i', hrToX(0.6), plotY, { align: 'center' });
  doc.text('Favorece Placebo', hrToX(1.3), plotY, { align: 'center' });
  
  // Heterogeneity stats
  plotY += 15;
  doc.setFontSize(9);
  doc.setTextColor(27, 77, 122);
  doc.text('Estadísticos de heterogeneidad:', margin, plotY);
  doc.setTextColor(60, 60, 60);
  doc.text('I² = 18% (baja)  |  Tau² = 0.003  |  Q = 13.4, df = 11, p = 0.27', margin, plotY + 8);
  
  // ===== PAGE: FUNNEL PLOT =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 122);
  doc.text('5.4 Funnel Plot - Evaluación de Sesgo de Publicación', margin, 30);
  
  // Draw funnel plot axes
  const funnelCenterX = pageWidth / 2;
  const funnelTop = 50;
  const funnelBottom = 180;
  const funnelWidth = 120;
  
  // Y-axis (Standard Error)
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(margin + 20, funnelTop, margin + 20, funnelBottom);
  doc.text('Error estándar', margin + 5, funnelTop + 60, { angle: 90 });
  
  // X-axis (Log HR)
  doc.line(margin + 20, funnelBottom, pageWidth - margin - 20, funnelBottom);
  doc.text('Log Hazard Ratio', funnelCenterX, funnelBottom + 15, { align: 'center' });
  
  // Draw funnel shape
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(funnelCenterX, funnelTop + 10, margin + 40, funnelBottom - 5);
  doc.line(funnelCenterX, funnelTop + 10, pageWidth - margin - 40, funnelBottom - 5);
  
  // Draw reference line at pooled estimate (solid line)
  doc.setDrawColor(46, 125, 107);
  doc.setLineWidth(0.5);
  doc.line(funnelCenterX - 15, funnelTop, funnelCenterX - 15, funnelBottom);
  
  // Plot study points
  const funnelPoints = [
    { x: funnelCenterX - 20, y: funnelTop + 30 }, // EMPEROR
    { x: funnelCenterX - 12, y: funnelTop + 25 }, // DELIVER
    { x: funnelCenterX - 8, y: funnelTop + 80 },
    { x: funnelCenterX - 25, y: funnelTop + 95 },
    { x: funnelCenterX - 5, y: funnelTop + 90 },
    { x: funnelCenterX - 22, y: funnelTop + 85 },
    { x: funnelCenterX - 10, y: funnelTop + 75 },
    { x: funnelCenterX + 5, y: funnelTop + 88 },
    { x: funnelCenterX - 18, y: funnelTop + 92 },
  ];
  
  doc.setFillColor(27, 77, 122);
  funnelPoints.forEach(point => {
    doc.circle(point.x, point.y, 3, 'F');
  });
  
  // Egger test result
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Test de Egger: p = 0.34 (sin evidencia de asimetría)', margin + 20, funnelBottom + 30);
  doc.text('Conclusión: No se detecta sesgo de publicación significativo', margin + 20, funnelBottom + 40);
  
  // Legend
  doc.setFillColor(27, 77, 122);
  doc.circle(margin + 25, funnelBottom + 55, 3, 'F');
  doc.text('= Estudio individual', margin + 32, funnelBottom + 57);
  doc.setDrawColor(46, 125, 107);
  doc.setLineWidth(1);
  doc.line(margin + 80, funnelBottom + 55, margin + 100, funnelBottom + 55);
  doc.text('= Estimación pooled (HR 0.80)', margin + 105, funnelBottom + 57);

  // ===== PAGE: META-ANALYSIS RESULTS =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(14);
  doc.setTextColor(27, 77, 122);
  doc.text('5.4 Resultados del Meta-análisis', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  const maResults = [
    'OUTCOME PRIMARIO: Hospitalización por IC + Muerte Cardiovascular',
    '',
    'Modelo estadístico: Efectos aleatorios (DerSimonian-Laird)',
    '',
    '┌──────────────────────────────────────────────────────────────┐',
    '│  Hazard Ratio pooled: 0.80                                   │',
    '│  Intervalo de confianza 95%: 0.73 - 0.87                     │',
    '│  Valor p: < 0.0001                                           │',
    '│  Z-score: 5.42                                               │',
    '└──────────────────────────────────────────────────────────────┘',
    '',
    'HETEROGENEIDAD:',
    '• I² = 18% (heterogeneidad BAJA)',
    '• Tau² = 0.003',
    '• Q de Cochran = 13.4, df = 11, p = 0.27',
    '• Intervalo de predicción: 0.68 - 0.94',
    '',
    'INTERPRETACIÓN CLÍNICA:',
    '• Reducción relativa del riesgo: 20%',
    '• NNT (Number Needed to Treat): 21 (IC 95%: 16-32)',
    '• Beneficio absoluto: 4.8 eventos evitados por 100 pacientes-año',
    '',
    'OUTCOMES SECUNDARIOS:',
    '',
    '1. Muerte cardiovascular aislada:',
    '   HR 0.88 (IC 95%: 0.77-1.00), p = 0.054',
    '   Heterogeneidad: I² = 0%',
    '',
    '2. Primera hospitalización por IC:',
    '   HR 0.74 (IC 95%: 0.67-0.83), p < 0.001',
    '   Heterogeneidad: I² = 22%',
    '',
    '3. Calidad de vida (KCCQ-TSS):',
    '   Diferencia media: +1.8 puntos (IC 95%: 1.2-2.4), p < 0.001',
    '   Clínicamente significativo (>1.5 puntos)',
  ];
  
  y = 42;
  maResults.forEach(line => {
    if (line.includes('OUTCOME PRIMARIO') || line.includes('HETEROGENEIDAD') || 
        line.includes('INTERPRETACIÓN') || line.includes('OUTCOMES SECUNDARIOS')) {
      doc.setFontSize(11);
      doc.setTextColor(27, 77, 122);
      doc.text(line, margin, y);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.setFontSize(10);
      doc.text(line, margin, y);
    }
    y += 6.5;
    if (y > 275) {
      doc.addPage();
      addHeader();
      y = 30;
    }
  });

  // ===== PAGE: GRADE ASSESSMENT =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('6. EVALUACIÓN GRADE', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  const grade = [
    'TABLA: Summary of Findings (GRADE)',
    '',
    '┌────────────────────────────────────────────────────────────────┐',
    '│ Outcome                    │ Certeza │ Efecto (HR)  │ NNT    │',
    '├────────────────────────────────────────────────────────────────┤',
    '│ Hosp IC + Muerte CV        │ ALTA    │ 0.80 (0.73-0.87) │ 21 │',
    '│ Muerte CV aislada          │ MODERADA│ 0.88 (0.77-1.00) │ 67 │',
    '│ Hospitalización IC         │ ALTA    │ 0.74 (0.67-0.83) │ 17 │',
    '│ Calidad vida (KCCQ)        │ ALTA    │ +1.8 puntos      │ N/A│',
    '└────────────────────────────────────────────────────────────────┘',
    '',
    'JUSTIFICACIÓN GRADE - Outcome Primario:',
    '',
    '• Riesgo de sesgo: No downgrade',
    '  - 10/12 estudios con bajo riesgo de sesgo',
    '',
    '• Inconsistencia: No downgrade',
    '  - I² = 18%, heterogeneidad baja',
    '',
    '• Imprecisión: No downgrade',
    '  - IC 95% no cruza 1.0, >400 eventos',
    '',
    '• Indirectness: No downgrade',
    '  - Población, intervención y outcomes directamente aplicables',
    '',
    '• Sesgo de publicación: No downgrade',
    '  - Funnel plot simétrico, Egger p = 0.34',
    '',
    'CERTEZA FINAL: ⭐⭐⭐⭐ ALTA',
    '',
    'RECOMENDACIÓN: FUERTE a favor del uso de SGLT2i en ICFEp',
  ];
  
  y = 42;
  grade.forEach(line => {
    doc.text(line, margin, y);
    y += 6.5;
  });

  // ===== PAGE: CONCLUSIONS =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('8. CONCLUSIONES', margin, 30);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  const conclusions = [
    'CONCLUSIÓN PRINCIPAL',
    '',
    'Esta revisión sistemática y meta-análisis de 12 RCTs con 14,234 participantes',
    'demuestra que los inhibidores SGLT2 reducen significativamente el riesgo del',
    'outcome compuesto de hospitalización por IC y muerte cardiovascular en pacientes',
    'con insuficiencia cardíaca con fracción de eyección preservada.',
    '',
    'El beneficio observado (HR 0.80, IC 95%: 0.73-0.87) es consistente a través de',
    'diferentes subgrupos, incluyendo pacientes con y sin diabetes, y diferentes',
    'rangos de FEVI. La evidencia es de alta certeza según GRADE.',
    '',
    'IMPLICACIONES CLÍNICAS',
    '',
    '1. Los SGLT2i deben considerarse como tratamiento de primera línea en ICFEp',
    '2. El beneficio se observa independientemente del estado de diabetes',
    '3. El perfil de seguridad es favorable con monitoreo estándar',
    '4. El NNT de 21 indica un beneficio clínicamente relevante',
    '',
    'IMPLICACIONES PARA GUÍAS CLÍNICAS',
    '',
    'Estos hallazgos apoyan la inclusión de inhibidores SGLT2 en las guías de',
    'práctica clínica para el manejo de ICFEp, con una recomendación fuerte',
    'basada en evidencia de alta calidad.',
    '',
    'NECESIDADES DE INVESTIGACIÓN FUTURA',
    '',
    '• Estudios en subgrupos específicos (FEVI >60%, pacientes >80 años)',
    '• Comparación directa entre empagliflozina y dapagliflozina',
    '• Datos de seguimiento a largo plazo (>5 años)',
    '• Estudios de implementación y costo-efectividad',
  ];
  
  y = 42;
  conclusions.forEach(line => {
    if (line === 'CONCLUSIÓN PRINCIPAL' || line === 'IMPLICACIONES CLÍNICAS' ||
        line === 'IMPLICACIONES PARA GUÍAS CLÍNICAS' || line === 'NECESIDADES DE INVESTIGACIÓN FUTURA') {
      doc.setFontSize(12);
      doc.setTextColor(27, 77, 122);
      doc.text(line, margin, y);
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
    } else {
      doc.text(line, margin, y);
    }
    y += lineHeight;
  });

  // ===== PAGES: REFERENCES =====
  doc.addPage();
  addHeader();
  
  doc.setFontSize(18);
  doc.setTextColor(27, 77, 122);
  doc.text('9. REFERENCIAS', margin, 30);
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  
  const refs = [
    '1. Anker SD, Butler J, Filippatos G, et al. Empagliflozin in Heart Failure with a',
    '   Preserved Ejection Fraction. N Engl J Med. 2021;385(16):1451-1461.',
    '   doi:10.1056/NEJMoa2107038. PMID: 34449189.',
    '',
    '2. Solomon SD, McMurray JJV, Claggett B, et al. Dapagliflozin in Heart Failure',
    '   with Mildly Reduced or Preserved Ejection Fraction. N Engl J Med. 2022;387(12):',
    '   1089-1098. doi:10.1056/NEJMoa2206286. PMID: 36027570.',
    '',
    '3. McDonagh TA, Metra M, Adamo M, et al. 2021 ESC Guidelines for the diagnosis',
    '   and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):',
    '   3599-3726. doi:10.1093/eurheartj/ehab368. PMID: 34447992.',
    '',
    '4. Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an',
    '   updated guideline for reporting systematic reviews. BMJ. 2021;372:n71.',
    '   doi:10.1136/bmj.n71. PMID: 33782057.',
    '',
    '5. Sterne JAC, Savović J, Page MJ, et al. RoB 2: a revised tool for assessing',
    '   risk of bias in randomised trials. BMJ. 2019;366:l4898.',
    '   doi:10.1136/bmj.l4898. PMID: 31462531.',
    '',
    '6. Guyatt GH, Oxman AD, Vist GE, et al. GRADE: an emerging consensus on rating',
    '   quality of evidence and strength of recommendations. BMJ. 2008;336(7650):',
    '   924-926. doi:10.1136/bmj.39489.470347.AD. PMID: 18436948.',
    '',
    '7. Higgins JPT, Thomas J, Chandler J, et al. Cochrane Handbook for Systematic',
    '   Reviews of Interventions version 6.3. Cochrane, 2022.',
    '   Available from: www.training.cochrane.org/handbook.',
    '',
    '8. Nassif ME, Windsor SL, Borlaug BA, et al. The SGLT2 inhibitor dapagliflozin',
    '   in heart failure with preserved ejection fraction: a multicenter randomized',
    '   trial. Nat Med. 2021;27(11):1954-1960. doi:10.1038/s41591-021-01536-x.',
    '   PMID: 34711976.',
    '',
    '9. Vaduganathan M, Docherty KF, Claggett BL, et al. SGLT-2 inhibitors in patients',
    '   with heart failure: a comprehensive meta-analysis of five randomised controlled',
    '   trials. Lancet. 2022;400(10354):757-767. doi:10.1016/S0140-6736(22)01429-5.',
    '   PMID: 36041474.',
    '',
    '10. Borlaug BA, Kitzman DW. Heart failure with preserved ejection fraction:',
    '    pathophysiology, diagnosis, and treatment. Eur Heart J. 2020;41(3):219-226.',
    '    doi:10.1093/eurheartj/ehz824. PMID: 31808534.',
    '',
    '[Referencias 11-124 disponibles en anexo digital]',
  ];
  
  y = 42;
  refs.forEach(line => {
    doc.text(line, margin, y);
    y += 5.5;
    if (y > 275) {
      doc.addPage();
      addHeader();
      y = 30;
    }
  });

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(i, pageCount);
  }
  
  doc.save('Dossier_Evidencia_SGLT2_ICFEp_Completo.pdf');
};

// =========================================
// MAIN COMPONENT
// =========================================
export default function ClinicalNavigator() {
  const [phase, setPhase] = useState<DemoPhase>('landing');
  const [question, setQuestion] = useState('');
  const [agents, setAgents] = useState<Agent[]>(
    AGENTS_CONFIG.map(a => ({ id: a.id, name: a.name, description: a.description, status: 'pending' as const, output: '' }))
  );
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<{
    doing: string;
    why: string;
    estimatedTime: string;
    sources: string[];
    agentName: string;
    progress: number;
  } | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  
  // Human-in-the-Loop modal state
  const [showHumanValidationModal, setShowHumanValidationModal] = useState(false);
  const [showProtocolReview, setShowProtocolReview] = useState(false);
  const humanValidationResolveRef = useRef<(() => void) | null>(null);
  
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
    const sources = SCIENTIFIC_SOURCES[agentId] || [];
    if (output) {
      const newDeliverable: Deliverable = {
        id: agentId,
        agentId,
        title: output.title,
        content: output.content,
        sources,
        isExpanded: false,
      };
      setDeliverables(prev => [...prev, newDeliverable]);
      setSelectedDeliverable(newDeliverable);
    }
  };

  // =========================================
  // MAIN ORCHESTRATION - SLOW & DETAILED
  // =========================================
  const runOrchestration = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const usedQuestion = question.trim() || DEFAULT_QUESTION;
    
    await new Promise(r => setTimeout(r, 500));

    for (let i = 0; i < AGENTS_CONFIG.length; i++) {
      const agentConfig = AGENTS_CONFIG[i];
      const startTime = Date.now();
      const totalSteps = agentConfig.steps.length;
      
      // Set active agent and update explanation panel
      setActiveAgentId(agentConfig.id);
      setSelectedDeliverable(null);
      setCurrentExplanation({
        doing: agentConfig.explanation.doing,
        why: agentConfig.explanation.why,
        estimatedTime: agentConfig.explanation.estimatedTime,
        sources: agentConfig.sources,
        agentName: agentConfig.name,
        progress: 0
      });
      
      // Start processing
      updateAgent(agentConfig.id, { status: 'processing' });
      
      // Execute each step with its specific delay
      for (let stepIdx = 0; stepIdx < agentConfig.steps.length; stepIdx++) {
        const step = agentConfig.steps[stepIdx];
        await new Promise(r => setTimeout(r, step.delay));
        
        // Update progress
        setCurrentExplanation(prev => prev ? {
          ...prev,
          progress: Math.round(((stepIdx + 1) / totalSteps) * 100)
        } : null);
      }
      
      // Calculate total latency
      const totalLatency = Date.now() - startTime;
      
      // Complete agent
      updateAgent(agentConfig.id, { status: 'completed', latency: totalLatency });
      
      // Add to deliverables library
      addDeliverable(agentConfig.id);
      setCurrentExplanation(null);
      
      // Show deliverable for 5 seconds before next agent
      await new Promise(r => setTimeout(r, 5000));
      
      // ========== HUMAN-IN-THE-LOOP PAUSE AFTER AGENT 8 ==========
      if (agentConfig.id === 8) {
        setShowHumanValidationModal(true);
        // Wait for user to click "Continue"
        await new Promise<void>(resolve => {
          humanValidationResolveRef.current = resolve;
        });
        setShowHumanValidationModal(false);
        setShowProtocolReview(false);
      }
    }

    setActiveAgentId(null);
    setCurrentExplanation(null);
    setIsComplete(true);
    
    // Give user 10 seconds to navigate deliverables before verification
    setTimeout(() => {
      setPhase('verification');
    }, 10000);
  };
  
  // Handle continue from Human-in-the-Loop modal
  const handleContinueToPhase2 = () => {
    if (humanValidationResolveRef.current) {
      humanValidationResolveRef.current();
      humanValidationResolveRef.current = null;
    }
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
    setAgents(AGENTS_CONFIG.map(a => ({ id: a.id, name: a.name, description: a.description, status: 'pending' as const, output: '' })));
    setTerminalLogs([]);
    setDeliverables([]);
    setActiveAgentId(null);
    setCurrentExplanation(null);
    setSelectedDeliverable(null);
    setIsComplete(false);
    setShowHumanValidationModal(false);
    setShowProtocolReview(false);
    hasStartedRef.current = false;
  };
  
  // Phase 1 deliverables (for Human-in-the-Loop review)
  const phase1Deliverables = deliverables.filter(d => d.agentId <= 8);

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
      {/* Header with LARGE logos - clean PNG with transparent backgrounds */}
      <header className="flex justify-between items-center p-6">
        <img 
          src={galateaLogo} 
          alt="Galatea AI" 
          className="h-24 lg:h-32"
        />
        <img 
          src={santaFeLogo} 
          alt="Fundación Santa Fe de Bogotá" 
          className="h-20 lg:h-28" 
        />
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
  // RENDER: EXECUTION PHASE - NEW LAYOUT
  // =========================================
  const renderExecution = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.blanco }}
    >
      {/* Header - White background with Santa Fe colors - LARGER LOGOS */}
      <header className="flex justify-between items-center px-6 py-4 border-b-2" style={{ borderColor: COLORS.azulInstitucional }}>
        <div className="flex items-center gap-4">
          <img src={galateaLogo} alt="Galatea AI" className="h-20" />
          <div className="h-10 w-px" style={{ backgroundColor: COLORS.azulInstitucional }} />
          <span className="font-bold text-xl" style={{ color: COLORS.azulInstitucional }}>
            Clinical Guideline Navigator
          </span>
          <span 
            className="px-3 py-1.5 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: COLORS.verdeMedico }}
          >
            14-AGENT ORCHESTRATION
          </span>
        </div>
        <img src={santaFeLogo} alt="Fundación Santa Fe de Bogotá" className="h-16" />
      </header>

      {/* 3-Column Layout: Left 20% | Center 60% | Right 20% */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN (20%): Agent List */}
        <div className="w-1/5 border-r overflow-y-auto p-3 bg-white" style={{ borderColor: COLORS.grisClaro }}>
          <h2 className="font-bold mb-3 flex items-center gap-2 text-sm" style={{ color: COLORS.azulInstitucional }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.verdeMedico }} />
            14 Agentes
          </h2>
          
          <div className="space-y-1.5">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: agent.id * 0.03 }}
                className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  agent.status === 'processing' ? 'border-2' : ''
                }`}
                style={{
                  borderColor: agent.status === 'processing' 
                    ? COLORS.azulInstitucional 
                    : agent.status === 'completed' 
                    ? COLORS.verdeMedico 
                    : COLORS.grisClaro,
                  backgroundColor: agent.status === 'processing' 
                    ? '#EBF5FF' 
                    : agent.status === 'completed' 
                    ? '#ECFDF5' 
                    : '#F9FAFB'
                }}
                onClick={() => {
                  const d = deliverables.find(del => del.agentId === agent.id);
                  if (d) setSelectedDeliverable(d);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {agent.status === 'pending' && <Clock className="w-3 h-3 text-gray-400" />}
                    {agent.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" style={{ color: COLORS.azulInstitucional }} />}
                    {agent.status === 'completed' && <CheckCircle className="w-3 h-3" style={{ color: COLORS.verdeMedico }} />}
                    <span className={`font-medium ${agent.status === 'pending' ? 'text-gray-500' : ''}`} 
                      style={{ color: agent.status === 'completed' ? COLORS.verdeMedico : 
                               agent.status === 'processing' ? COLORS.azulInstitucional : undefined }}>
                      {agent.id}. {agent.name}
                    </span>
                  </div>
                  {agent.latency && (
                    <span className="text-[10px] font-medium" style={{ color: COLORS.verdeMedico }}>
                      {(agent.latency / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Deliverables Library */}
          {deliverables.length > 0 && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: COLORS.grisClaro }}>
              <h3 className="font-bold mb-2 text-xs flex items-center gap-1.5" style={{ color: COLORS.azulInstitucional }}>
                <BookOpen className="w-3 h-3" style={{ color: COLORS.verdeMedico }} />
                Biblioteca ({deliverables.length})
              </h3>
              <div className="space-y-1">
                {deliverables.map(d => (
                  <div 
                    key={d.id}
                    onClick={() => setSelectedDeliverable(d)}
                    className={`p-2 rounded border text-xs cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-1.5 ${
                      selectedDeliverable?.id === d.id ? 'border-2' : ''
                    }`}
                    style={{ 
                      borderColor: selectedDeliverable?.id === d.id ? COLORS.verdeMedico : COLORS.grisClaro
                    }}
                  >
                    <FileText className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.verdeMedico }} />
                    <span className="truncate" style={{ color: COLORS.grisTexto }}>{d.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN (80%): Main Content - Explanation or Deliverable - NO TERMINAL */}
        <div className="w-4/5 flex flex-col overflow-y-auto bg-white">
          <ScrollArea className="flex-1 p-8">
            <AnimatePresence mode="wait">
              {/* Show Agent Explanation while processing */}
              {currentExplanation && !selectedDeliverable && (
                <motion.div
                  key="explanation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-4xl mx-auto"
                >
                  {/* Document-style header */}
                  <div className="border-b-4 pb-6 mb-8" style={{ borderColor: COLORS.azulInstitucional }}>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: COLORS.verdeMedico }}>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      PROCESANDO
                    </div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.azulInstitucional }}>
                      Agente {activeAgentId}: {currentExplanation.agentName}
                    </h1>
                    <p className="text-lg" style={{ color: COLORS.grisTexto }}>
                      {AGENTS_CONFIG.find(a => a.id === activeAgentId)?.description}
                    </p>
                  </div>

                  {/* Document-style sections */}
                  <div className="space-y-8">
                    <section>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.azulInstitucional }}>
                        <ClipboardList className="w-5 h-5" />
                        Descripción del Proceso
                      </h2>
                      <div className="pl-7 border-l-4" style={{ borderColor: COLORS.azulInstitucional }}>
                        <p className="text-lg leading-relaxed" style={{ color: COLORS.grisTexto }}>
                          {currentExplanation.doing}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.verdeMedico }}>
                        <Lightbulb className="w-5 h-5" />
                        Importancia Metodológica
                      </h2>
                      <div className="pl-7 border-l-4" style={{ borderColor: COLORS.verdeMedico }}>
                        <p className="text-lg leading-relaxed" style={{ color: COLORS.grisTexto }}>
                          {currentExplanation.why}
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.azulInstitucional }}>
                        <Database className="w-5 h-5" />
                        Fuentes Consultadas
                      </h2>
                      <div className="grid grid-cols-2 gap-3 pl-7">
                        {currentExplanation.sources.map((source, idx) => (
                          <div 
                            key={idx}
                            className="p-3 rounded-lg border flex items-center gap-2"
                            style={{ borderColor: COLORS.grisClaro, backgroundColor: '#F9FAFB' }}
                          >
                            <ExternalLink className="w-4 h-4" style={{ color: COLORS.azulInstitucional }} />
                            <span className="font-medium" style={{ color: COLORS.azulInstitucional }}>{source}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Progress section */}
                    <section className="pt-6 border-t" style={{ borderColor: COLORS.grisClaro }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Timer className="w-5 h-5" style={{ color: COLORS.grisTexto }} />
                          <span className="font-medium text-lg" style={{ color: COLORS.grisTexto }}>
                            Tiempo estimado: {currentExplanation.estimatedTime}
                          </span>
                        </div>
                        <span className="font-bold text-2xl" style={{ color: COLORS.azulInstitucional }}>
                          {currentExplanation.progress}%
                        </span>
                      </div>
                      <div className="w-full h-6 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.grisClaro }}>
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: COLORS.azulInstitucional }}
                          initial={{ width: 0 }}
                          animate={{ width: `${currentExplanation.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </section>
                  </div>
                </motion.div>
              )}

              {/* Show Selected Deliverable - DOCUMENT STYLE */}
              {selectedDeliverable && (
                <motion.div
                  key={`deliverable-${selectedDeliverable.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-4xl mx-auto"
                >
                  {/* Document-style header */}
                  <div className="border-b-4 pb-6 mb-8" style={{ borderColor: COLORS.verdeMedico }}>
                    <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: COLORS.verdeMedico }}>
                      <CheckCircle className="w-4 h-4" />
                      ENTREGABLE COMPLETADO
                    </div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: COLORS.azulInstitucional }}>
                      {selectedDeliverable.title}
                    </h1>
                    <p className="text-lg" style={{ color: COLORS.grisTexto }}>
                      Generado por Agente {selectedDeliverable.agentId} • {AGENTS_CONFIG.find(a => a.id === selectedDeliverable.agentId)?.name}
                    </p>
                  </div>

                  {/* Document content with structure */}
                  <div className="prose prose-lg max-w-none mb-8">
                    <div 
                      className="p-8 rounded-xl border-2 bg-white shadow-sm"
                      style={{ borderColor: COLORS.grisClaro }}
                    >
                      {/* Parse content and render with structure */}
                      {selectedDeliverable.content.split('\n\n').map((paragraph, idx) => {
                        // Check if it's a header-like line
                        if (paragraph.startsWith('═══') || paragraph.includes('═══')) {
                          const title = paragraph.replace(/═/g, '').trim();
                          return (
                            <h3 key={idx} className="text-xl font-bold mt-6 mb-4 flex items-center gap-2" style={{ color: COLORS.azulInstitucional }}>
                              <div className="w-1 h-6 rounded-full" style={{ backgroundColor: COLORS.verdeMedico }} />
                              {title}
                            </h3>
                          );
                        }
                        // Check if it starts with emoji
                        if (/^[👥💊⚖️🎯⏱️✅❌📊📚📋🔍📎📄🟢🟡⭐💪🔬🎲👁️📝🛡️📈🌳🔤💾🔀🏗️🚀🔗📖🔎⚠️✨🔬✓🌎]/.test(paragraph)) {
                          return (
                            <div key={idx} className="mb-4 p-4 rounded-lg border" style={{ borderColor: COLORS.grisClaro, backgroundColor: '#F9FAFB' }}>
                              <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: COLORS.grisTexto }}>
                                {paragraph}
                              </p>
                            </div>
                          );
                        }
                        // Regular paragraph
                        return (
                          <p key={idx} className="text-base leading-relaxed mb-4 whitespace-pre-wrap" style={{ color: COLORS.grisTexto }}>
                            {paragraph}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scientific Sources */}
                  {selectedDeliverable.sources.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.azulInstitucional }}>
                        <Link className="w-5 h-5" />
                        Referencias Científicas
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedDeliverable.sources.map((source, idx) => (
                          <a 
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                            style={{ borderColor: COLORS.grisClaro }}
                          >
                            <div className="flex items-center gap-3">
                              <ExternalLink className="w-4 h-4" style={{ color: COLORS.azulInstitucional }} />
                              <span className="font-medium" style={{ color: COLORS.azulInstitucional }}>{source.name}</span>
                            </div>
                            {source.identifier && (
                              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${COLORS.verdeMedico}15`, color: COLORS.verdeMedico }}>
                                {source.identifier}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-4 pt-6 border-t" style={{ borderColor: COLORS.grisClaro }}>
                    <Button variant="outline" className="flex-1 h-14 text-lg" style={{ borderColor: COLORS.azulInstitucional, color: COLORS.azulInstitucional }}>
                      <Save className="w-5 h-5 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 text-lg" style={{ borderColor: COLORS.azulInstitucional, color: COLORS.azulInstitucional }}>
                      <Download className="w-5 h-5 mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Empty state */}
              {!currentExplanation && !selectedDeliverable && (
                <div className="flex items-center justify-center h-full text-center p-12">
                  <div className="max-w-md">
                    <Brain className="w-20 h-20 mx-auto mb-6" style={{ color: COLORS.grisClaro }} />
                    <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.azulInstitucional }}>
                      Esperando Selección
                    </h3>
                    <p className="text-lg" style={{ color: COLORS.grisTexto }}>
                      Selecciona un agente o entregable de la biblioteca para ver los detalles
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      </div>

      {/* FLOATING VIRTUAL AGENT - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
      >
        {/* Dialogue Bubble */}
        <motion.div
          key={activeAgentId || 'idle'}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white rounded-2xl px-4 py-3 shadow-xl border-2 max-w-xs"
          style={{ borderColor: COLORS.azulInstitucional }}
        >
          <p className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>
            {activeAgentId ? AGENT_DIALOGUES[activeAgentId] : "Orquestando análisis científico..."}
          </p>
          {/* Triangle pointer */}
          <div 
            className="absolute right-0 bottom-4 w-3 h-3 bg-white border-r-2 border-b-2 transform translate-x-1.5 rotate-[-45deg]"
            style={{ borderColor: COLORS.azulInstitucional }}
          />
        </motion.div>

        {/* Agent Avatar */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-xl cursor-pointer"
          style={{ borderColor: COLORS.verdeMedico }}
        >
          <img 
            src={agentAvatar} 
            alt="Galatea AI Agent" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>

      {/* ========== HUMAN-IN-THE-LOOP MODAL ========== */}
      <AnimatePresence>
        {showHumanValidationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
              style={{ border: `3px solid ${COLORS.azulInstitucional}` }}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b" style={{ backgroundColor: COLORS.azulInstitucional + '08', borderColor: COLORS.grisClaro }}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: COLORS.azulInstitucional }}
                  >
                    <Hand className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: COLORS.azulInstitucional }}>
                      ✋ Punto de Validación Humana
                    </h2>
                    <p className="text-sm" style={{ color: COLORS.grisTexto }}>
                      La Fase 1 (Protocolo) está completa
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                <p className="text-lg mb-6" style={{ color: COLORS.grisTexto }}>
                  Se han generado <strong>8 entregables</strong> del protocolo de investigación:
                </p>

                {/* Show Protocol Review or Deliverables List */}
                {showProtocolReview ? (
                  <div className="max-h-[40vh] overflow-y-auto space-y-3 mb-6">
                    {phase1Deliverables.map((d) => (
                      <div 
                        key={d.id} 
                        className="p-4 rounded-lg border-2 bg-white"
                        style={{ borderColor: COLORS.verdeMedico }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5" style={{ color: COLORS.verdeMedico }} />
                          <span className="font-bold" style={{ color: COLORS.azulInstitucional }}>
                            {d.title}
                          </span>
                        </div>
                        <pre className="text-xs whitespace-pre-wrap overflow-hidden" style={{ color: COLORS.grisTexto }}>
                          {d.content.substring(0, 300)}...
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      'Marco PICOT',
                      'Validación FINER', 
                      'Gap Analysis',
                      'Criterios de Elegibilidad',
                      'Verificación PROSPERO',
                      'Plan de Evaluación de Sesgos',
                      'Estrategia de Búsqueda',
                      'Protocolo PRISMA-P'
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-3 rounded-lg"
                        style={{ backgroundColor: COLORS.verdeMedico + '10' }}
                      >
                        <CheckCircle className="w-4 h-4" style={{ color: COLORS.verdeMedico }} />
                        <span className="font-medium" style={{ color: COLORS.grisTexto }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-base mb-6" style={{ color: COLORS.grisTexto }}>
                  ¿Desea revisar el protocolo antes de continuar con la búsqueda y el meta-análisis?
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowProtocolReview(!showProtocolReview)}
                    variant="outline"
                    className="flex-1 h-14 text-lg font-semibold border-2"
                    style={{ borderColor: COLORS.azulInstitucional, color: COLORS.azulInstitucional }}
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    {showProtocolReview ? 'Ocultar Protocolo' : 'Revisar Protocolo'}
                  </Button>
                  <Button
                    onClick={handleContinueToPhase2}
                    className="flex-1 h-14 text-lg font-semibold text-white"
                    style={{ backgroundColor: COLORS.verdeMedico }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continuar con Fase 2
                  </Button>
                </div>

                {/* Disclaimer */}
                <div 
                  className="mt-6 p-4 rounded-lg flex items-start gap-3"
                  style={{ backgroundColor: COLORS.azulInstitucional + '08' }}
                >
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.azulInstitucional }} />
                  <p className="text-sm" style={{ color: COLORS.azulInstitucional }}>
                    <strong>En un entorno real</strong>, el investigador revisaría y aprobaría el protocolo antes de ejecutar búsquedas costosas en bases de datos científicas.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // =========================================
  // RENDER: VERIFICATION PHASE - NEW DESIGN
  // =========================================
  const renderVerification = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.blanco }}
    >
      {/* Header with completion time */}
      <header 
        className="px-8 py-4"
        style={{ background: `linear-gradient(135deg, ${COLORS.azulInstitucional} 0%, ${COLORS.verdeMedico} 100%)` }}
      >
        <div className="flex justify-between items-center mb-4">
          <img src={galateaLogo} alt="Galatea AI" className="h-16" />
          <img src={santaFeLogo} alt="Fundación Santa Fe de Bogotá" className="h-14" />
        </div>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <CheckCircle className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">
              ✅ ANÁLISIS COMPLETADO EN 3:47 MINUTOS
            </span>
          </motion.div>
          <p className="text-white/80 mt-2 text-lg">
            Método tradicional: 3-6 meses | <strong>Ahorro: 99.9% del tiempo</strong>
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* 6 METRIC CARDS */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Card 1: Hazard Ratio */}
            <div 
              className="rounded-2xl p-6 text-center border-2 bg-white shadow-lg"
              style={{ borderColor: COLORS.azulInstitucional }}
            >
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.grisTexto }}>📊 Hazard Ratio</div>
              <div className="text-5xl font-bold mb-2" style={{ color: COLORS.azulInstitucional }}>0.80</div>
              <div className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>(IC 95%: 0.73-0.87)</div>
              <div className="mt-3 text-sm px-3 py-1 rounded-full inline-block" style={{ backgroundColor: COLORS.azulInstitucional + '15', color: COLORS.azulInstitucional }}>
                Reducción 20% en eventos CV
              </div>
            </div>

            {/* Card 2: Heterogeneidad */}
            <div 
              className="rounded-2xl p-6 text-center border-2 bg-white shadow-lg"
              style={{ borderColor: COLORS.verdeMedico }}
            >
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.grisTexto }}>📈 Heterogeneidad</div>
              <div className="text-5xl font-bold mb-2" style={{ color: COLORS.verdeMedico }}>I² = 18%</div>
              <div className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>(BAJA)</div>
              <div className="mt-3 text-sm px-3 py-1 rounded-full inline-block" style={{ backgroundColor: COLORS.verdeMedico + '15', color: COLORS.verdeMedico }}>
                Resultados consistentes
              </div>
            </div>

            {/* Card 3: Calidad GRADE */}
            <div 
              className="rounded-2xl p-6 text-center border-2 bg-white shadow-lg"
              style={{ borderColor: '#F59E0B' }}
            >
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.grisTexto }}>⭐ Calidad GRADE</div>
              <div className="text-4xl font-bold mb-2 text-amber-500">⭐⭐⭐⭐</div>
              <div className="text-2xl font-bold text-amber-600">ALTA</div>
              <div className="mt-3 text-sm px-3 py-1 rounded-full inline-block bg-amber-100 text-amber-700">
                Confianza alta en hallazgos
              </div>
            </div>

            {/* Card 4: Artículos */}
            <div 
              className="rounded-2xl p-6 text-center border-2 bg-white shadow-lg"
              style={{ borderColor: COLORS.azulInstitucional }}
            >
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.grisTexto }}>📚 Artículos</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold" style={{ color: COLORS.grisTexto }}>847</span>
                <span className="text-2xl" style={{ color: COLORS.verdeMedico }}>→</span>
                <span className="text-4xl font-bold" style={{ color: COLORS.verdeMedico }}>12</span>
              </div>
              <div className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>identificados → incluidos</div>
            </div>

            {/* Card 5: Participantes */}
            <div 
              className="rounded-2xl p-6 text-center border-2 bg-white shadow-lg"
              style={{ borderColor: COLORS.azulInstitucional }}
            >
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.grisTexto }}>👥 Participantes</div>
              <div className="text-5xl font-bold mb-2" style={{ color: COLORS.azulInstitucional }}>14,234</div>
              <div className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>pacientes en los análisis</div>
            </div>

            {/* Card 6: NNT */}
            <div 
              className="rounded-2xl p-6 text-center border-2 bg-white shadow-lg"
              style={{ borderColor: COLORS.verdeMedico }}
            >
              <div className="text-lg font-semibold mb-2" style={{ color: COLORS.grisTexto }}>💊 NNT</div>
              <div className="text-5xl font-bold mb-2" style={{ color: COLORS.verdeMedico }}>21</div>
              <div className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>pacientes para prevenir 1 evento</div>
            </div>
          </motion.div>

          {/* CLINICAL CONCLUSION CARD */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border-2 bg-white shadow-xl overflow-hidden mb-8"
            style={{ borderColor: COLORS.verdeMedico }}
          >
            <div className="px-8 py-4" style={{ backgroundColor: COLORS.verdeMedico }}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-6 h-6" />
                🏥 CONCLUSIÓN CLÍNICA
              </h3>
            </div>
            <div className="p-8">
              <p className="text-xl leading-relaxed mb-6" style={{ color: COLORS.grisTexto }}>
                Los inhibidores SGLT2 (empagliflozina/dapagliflozina) <strong style={{ color: COLORS.verdeMedico }}>REDUCEN significativamente</strong> el riesgo de hospitalización por insuficiencia cardíaca y muerte cardiovascular en pacientes con ICFEp.
              </p>
              
              <div className="p-5 rounded-xl mb-6" style={{ backgroundColor: COLORS.azulInstitucional + '08' }}>
                <div className="flex items-start gap-3">
                  <ClipboardList className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.azulInstitucional }} />
                  <div>
                    <span className="font-bold text-lg" style={{ color: COLORS.azulInstitucional }}>RECOMENDACIÓN:</span>
                    <p className="text-lg" style={{ color: COLORS.grisTexto }}>
                      Considerar SGLT2i como tratamiento de primera línea en pacientes con ICFEp, independientemente de la presencia de diabetes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
                <div className="flex items-start gap-3">
                  <Activity className="w-6 h-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold text-lg text-amber-700">⚠️ ALERTA CLÍNICA:</span>
                    <p className="text-base text-amber-800">
                      Se identificó beneficio aún mayor en el subgrupo de pacientes diabéticos (HR 0.72). Considerar análisis estratificado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* DOWNLOAD BUTTON */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-8"
          >
            <Button
              onClick={generateComprehensivePDF}
              size="lg"
              className="h-16 px-12 text-xl font-bold shadow-xl hover:scale-[1.02] transition-transform text-white"
              style={{ backgroundColor: COLORS.verdeMedico }}
            >
              <Download className="w-6 h-6 mr-3" />
              📥 Descargar Dossier Completo (PDF 47 páginas)
            </Button>
          </motion.div>

          {/* RESET BUTTON */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Button
              onClick={handleReset}
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Iniciar Nueva Investigación
            </Button>
          </motion.div>
        </div>
      </div>

      {/* FLOATING VIRTUAL AGENT - Celebration Mode */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
      >
        {/* Celebration Dialogue Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="bg-white rounded-2xl px-5 py-4 shadow-xl border-2 max-w-sm"
          style={{ borderColor: COLORS.verdeMedico }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" style={{ color: COLORS.verdeMedico }} />
            <span className="font-bold" style={{ color: COLORS.verdeMedico }}>¡Análisis Completado!</span>
          </div>
          <p className="text-sm font-medium" style={{ color: COLORS.grisTexto }}>
            {FINAL_DIALOGUE}
          </p>
          {/* Triangle pointer */}
          <div 
            className="absolute right-0 bottom-5 w-3 h-3 bg-white border-r-2 border-b-2 transform translate-x-1.5 rotate-[-45deg]"
            style={{ borderColor: COLORS.verdeMedico }}
          />
        </motion.div>

        {/* Agent Avatar - Celebrating */}
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, 3, -3, 0]
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-xl"
          style={{ borderColor: COLORS.verdeMedico }}
        >
          <img 
            src={agentAvatar} 
            alt="Galatea AI Agent Celebrating" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </motion.div>
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
