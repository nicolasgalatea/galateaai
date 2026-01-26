import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { 
  Send, Play, Download, ExternalLink, Clock, CheckCircle, 
  Loader2, FileText, BookOpen, Award, ChevronDown, ChevronUp,
  RotateCcw, Sparkles, Database, Search, Brain, ClipboardList,
  Target, Timer, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  type: 'info' | 'success' | 'process' | 'data' | 'source';
}

interface Deliverable {
  id: number;
  agentId: number;
  title: string;
  content: string;
  isExpanded: boolean;
}

interface AgentStep {
  delay: number;
  icon: string;
  message: string;
  type: TerminalLog['type'];
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
  blanco: '#FFFFFF',
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
      doing: 'Este agente estructura tu pregunta de investigación usando el marco PICOT (Población, Intervención, Comparador, Outcome, Tiempo).',
      why: 'El marco PICOT es el estándar de oro para formular preguntas de investigación clínica según las guías Cochrane.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 800, icon: '🔍', message: 'Analizando pregunta de investigación...', type: 'process' },
      { delay: 1500, icon: '📚', message: 'Consultando base de datos MeSH...', type: 'source' },
      { delay: 1500, icon: '🧠', message: 'Estructurando marco PICOT...', type: 'process' },
      { delay: 1200, icon: '📋', message: 'Definiendo Población: Adultos >18 años con ICFEp', type: 'data' },
      { delay: 1000, icon: '💊', message: 'Definiendo Intervención: Inhibidores SGLT2', type: 'data' },
      { delay: 1000, icon: '⚖️', message: 'Definiendo Comparador: Placebo o tratamiento estándar', type: 'data' },
      { delay: 1000, icon: '🎯', message: 'Definiendo Outcome: Mortalidad CV, hospitalización', type: 'data' },
      { delay: 1000, icon: '⏱️', message: 'Definiendo Tiempo: Ensayos de los últimos 5 años', type: 'data' },
    ]
  },
  { 
    id: 2, 
    name: 'FINER Validator', 
    description: 'Valida viabilidad del estudio',
    sources: ['Clinical Trials Registry', 'NIH Reporter', 'Grant Databases'],
    explanation: {
      doing: 'Evalúa si tu pregunta es Factible, Interesante, Novedosa, Ética y Relevante.',
      why: 'El criterio FINER asegura que tu investigación valga la pena antes de invertir recursos.',
      estimatedTime: '9 segundos'
    },
    steps: [
      { delay: 1000, icon: '📊', message: 'Evaluando factibilidad del estudio...', type: 'process' },
      { delay: 1500, icon: '🔬', message: 'Verificando disponibilidad de datos en ClinicalTrials.gov...', type: 'source' },
      { delay: 1500, icon: '✨', message: 'Analizando novedad vs literatura existente...', type: 'process' },
      { delay: 1200, icon: '⚖️', message: 'Revisando consideraciones éticas...', type: 'process' },
      { delay: 1500, icon: '🎯', message: 'Calculando relevancia clínica...', type: 'process' },
      { delay: 1300, icon: '📈', message: 'Score FINER: 5/5 - Pregunta altamente viable', type: 'success' },
    ]
  },
  { 
    id: 3, 
    name: 'Literature Scout', 
    description: 'Busca revisiones previas',
    sources: ['Cochrane Library', 'PubMed', 'Embase', 'PROSPERO'],
    explanation: {
      doing: 'Busca revisiones sistemáticas previas para identificar gaps en la literatura.',
      why: 'Evita duplicar esfuerzos y justifica la necesidad de tu nueva revisión.',
      estimatedTime: '11 segundos'
    },
    steps: [
      { delay: 1200, icon: '🔎', message: 'Conectando a Cochrane Library...', type: 'source' },
      { delay: 1800, icon: '📚', message: 'Buscando revisiones sistemáticas existentes...', type: 'process' },
      { delay: 1500, icon: '📖', message: 'Encontradas 8 revisiones previas...', type: 'data' },
      { delay: 1500, icon: '🔍', message: 'Analizando gaps: Falta EMPEROR-Preserved completo...', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Gap identificado: Sin análisis por subgrupos de FEVI...', type: 'data' },
      { delay: 1200, icon: '🌎', message: 'Gap identificado: Datos limitados en población LATAM...', type: 'data' },
      { delay: 1300, icon: '✅', message: 'Conclusión: Justificación sólida para nueva RS', type: 'success' },
    ]
  },
  { 
    id: 4, 
    name: 'Criteria Designer', 
    description: 'Define criterios I/E',
    sources: ['PICOS Framework', 'Cochrane Handbook'],
    explanation: {
      doing: 'Define criterios de inclusión y exclusión precisos para tu revisión.',
      why: 'Criterios claros aseguran reproducibilidad y reducen sesgos de selección.',
      estimatedTime: '8 segundos'
    },
    steps: [
      { delay: 1000, icon: '📋', message: 'Aplicando framework PICOS...', type: 'process' },
      { delay: 1500, icon: '✅', message: 'Criterio inclusión: RCTs fase III...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Criterio inclusión: FEVI ≥50%, seguimiento ≥6 meses...', type: 'data' },
      { delay: 1200, icon: '❌', message: 'Criterio exclusión: Estudios observacionales...', type: 'data' },
      { delay: 1200, icon: '❌', message: 'Criterio exclusión: ICFEr, dosis no estándar...', type: 'data' },
      { delay: 1000, icon: '📝', message: 'Generando tabla de elegibilidad estructurada...', type: 'process' },
    ]
  },
  { 
    id: 5, 
    name: 'PROSPERO Checker', 
    description: 'Verifica registro previo',
    sources: ['PROSPERO Database', 'OSF Registries', 'CRD York'],
    explanation: {
      doing: 'Verifica si existe un protocolo similar registrado en PROSPERO.',
      why: 'El registro previo previene duplicación y aumenta transparencia.',
      estimatedTime: '7 segundos'
    },
    steps: [
      { delay: 1000, icon: '🔗', message: 'Conectando a base PROSPERO...', type: 'source' },
      { delay: 1500, icon: '🔍', message: 'Buscando protocolos similares...', type: 'process' },
      { delay: 1500, icon: '📄', message: 'Encontrados 3 protocolos relacionados...', type: 'data' },
      { delay: 1200, icon: '⚠️', message: 'CRD42023456789: Enfocado en ICFEr (diferente)', type: 'data' },
      { delay: 1300, icon: '✅', message: 'Recomendación: Proceder con registro nuevo', type: 'success' },
    ]
  },
  { 
    id: 6, 
    name: 'Bias Assessor', 
    description: 'Evalúa riesgo de sesgos',
    sources: ['Cochrane RoB 2.0', 'GRADE Handbook', 'ROBINS-I'],
    explanation: {
      doing: 'Planifica la evaluación de riesgo de sesgo usando Cochrane RoB 2.0.',
      why: 'Identificar sesgos potenciales aumenta la validez de tus conclusiones.',
      estimatedTime: '9 segundos'
    },
    steps: [
      { delay: 1200, icon: '⚠️', message: 'Cargando herramienta Cochrane RoB 2.0...', type: 'source' },
      { delay: 1500, icon: '🎲', message: 'Evaluando dominio: Aleatorización → BAJO', type: 'data' },
      { delay: 1300, icon: '👁️', message: 'Evaluando dominio: Cegamiento → BAJO', type: 'data' },
      { delay: 1300, icon: '📉', message: 'Evaluando dominio: Datos incompletos → MODERADO', type: 'data' },
      { delay: 1200, icon: '📝', message: 'Evaluando dominio: Reporte selectivo → BAJO', type: 'data' },
      { delay: 1500, icon: '🛡️', message: 'Generando plan de mitigación de sesgos...', type: 'process' },
    ]
  },
  { 
    id: 7, 
    name: 'Yadav Strategist', 
    description: 'Genera ecuaciones de búsqueda',
    sources: ['PubMed MeSH', 'Embase Emtree', 'Cochrane MeSH'],
    explanation: {
      doing: 'Crea ecuaciones de búsqueda optimizadas para cada base de datos.',
      why: 'Búsquedas bien estructuradas maximizan sensibilidad y especificidad.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 1000, icon: '🔤', message: 'Identificando términos MeSH principales...', type: 'process' },
      { delay: 1500, icon: '📝', message: 'Construyendo ecuación PubMed con operadores booleanos...', type: 'process' },
      { delay: 1500, icon: '💾', message: 'Ecuación PubMed: ("SGLT2"[MeSH] OR "empagliflozin") AND ("Heart Failure"[MeSH])...', type: 'data' },
      { delay: 1500, icon: '🔀', message: 'Adaptando para Embase con Emtree descriptors...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'Configurando filtros: 2019-2025, English/Spanish...', type: 'data' },
      { delay: 1000, icon: '✅', message: 'Estrategia Yadav optimizada lista', type: 'success' },
    ]
  },
  { 
    id: 8, 
    name: 'Protocol Architect', 
    description: 'Estructura el protocolo',
    sources: ['PRISMA-P 2015', 'PROSPERO Guidelines', 'Cochrane Handbook'],
    explanation: {
      doing: 'Ensambla todas las secciones en un protocolo PRISMA-P completo.',
      why: 'Un protocolo estructurado es requisito para registro y publicación.',
      estimatedTime: '8 segundos'
    },
    steps: [
      { delay: 1000, icon: '🏗️', message: 'Iniciando ensamblaje de protocolo PRISMA-P...', type: 'process' },
      { delay: 1200, icon: '✅', message: 'Sección 1-3: Título, registro, antecedentes...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Sección 4-6: Objetivos, métodos, elegibilidad...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Sección 7-9: Búsqueda, extracción, calidad...', type: 'data' },
      { delay: 1200, icon: '✅', message: 'Sección 10: Cronograma y declaraciones...', type: 'data' },
      { delay: 1200, icon: '📋', message: 'Estado: Listo para registro PROSPERO', type: 'success' },
    ]
  },
  { 
    id: 9, 
    name: 'PRISMA Navigator', 
    description: 'Ejecuta flujo PRISMA 2020',
    sources: ['PubMed API', 'Embase API', 'Cochrane Central', 'Web of Science'],
    explanation: {
      doing: 'Ejecuta las búsquedas y genera el diagrama de flujo PRISMA 2020.',
      why: 'El flujo PRISMA documenta transparentemente el proceso de selección.',
      estimatedTime: '12 segundos'
    },
    steps: [
      { delay: 1000, icon: '🚀', message: 'Ejecutando búsqueda en PubMed...', type: 'source' },
      { delay: 1500, icon: '📊', message: 'PubMed: 342 artículos encontrados', type: 'data' },
      { delay: 1200, icon: '🔍', message: 'Ejecutando búsqueda en Embase...', type: 'source' },
      { delay: 1500, icon: '📊', message: 'Embase: 289 artículos encontrados', type: 'data' },
      { delay: 1200, icon: '📚', message: 'Ejecutando búsqueda en Cochrane Central...', type: 'source' },
      { delay: 1500, icon: '📊', message: 'Cochrane: 156 artículos | Otras fuentes: 60', type: 'data' },
      { delay: 1500, icon: '🔄', message: 'Removiendo duplicados: 234 eliminados...', type: 'process' },
      { delay: 1500, icon: '📈', message: 'Total único: 613 → Cribado título/abstract: 124 elegibles', type: 'data' },
    ]
  },
  { 
    id: 10, 
    name: 'Data Extractor', 
    description: 'Extrae datos de estudios',
    sources: ['Full-text PDFs', 'Supplementary Materials', 'ClinicalTrials.gov'],
    explanation: {
      doing: 'Extrae datos cuantitativos de los estudios incluidos.',
      why: 'Datos precisos son esenciales para el meta-análisis.',
      estimatedTime: '11 segundos'
    },
    steps: [
      { delay: 1200, icon: '📄', message: 'Procesando EMPEROR-Preserved (n=5,988)...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'Extrayendo: HR 0.79 (0.69-0.90), seguimiento 26 meses', type: 'data' },
      { delay: 1200, icon: '📄', message: 'Procesando DELIVER (n=6,263)...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'Extrayendo: HR 0.82 (0.73-0.92), seguimiento 28 meses', type: 'data' },
      { delay: 1500, icon: '📄', message: 'Procesando 10 estudios adicionales...', type: 'process' },
      { delay: 1500, icon: '✅', message: 'Total: 12 RCTs, 14,234 participantes, 2,847 eventos', type: 'success' },
    ]
  },
  { 
    id: 11, 
    name: 'Quality Auditor', 
    description: 'Evalúa calidad metodológica',
    sources: ['Cochrane RoB 2.0', 'GRADE Framework', 'RevMan'],
    explanation: {
      doing: 'Evalúa la calidad metodológica de cada estudio incluido.',
      why: 'La calidad afecta la certeza de la evidencia final.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 1200, icon: '🔬', message: 'Aplicando Cochrane RoB 2.0 a 12 estudios...', type: 'process' },
      { delay: 1500, icon: '🟢', message: 'EMPEROR-Preserved: Riesgo BAJO en todos los dominios', type: 'data' },
      { delay: 1500, icon: '🟢', message: 'DELIVER: Riesgo BAJO (algunas preocupaciones D3)', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Resumen: 10/12 estudios con bajo riesgo de sesgo', type: 'data' },
      { delay: 1500, icon: '📈', message: 'Generando funnel plot: Simétrico (p=0.34)', type: 'process' },
      { delay: 1000, icon: '✅', message: 'No hay evidencia de sesgo de publicación', type: 'success' },
    ]
  },
  { 
    id: 12, 
    name: 'Meta-Analyst', 
    description: 'Ejecuta meta-análisis',
    sources: ['R meta package', 'RevMan 5.4', 'Stata metan'],
    explanation: {
      doing: 'Combina los resultados usando modelo de efectos aleatorios.',
      why: 'El meta-análisis proporciona una estimación global del efecto.',
      estimatedTime: '10 segundos'
    },
    steps: [
      { delay: 1200, icon: '📊', message: 'Cargando datos en modelo de efectos aleatorios...', type: 'process' },
      { delay: 1500, icon: '🔢', message: 'Calculando pooled HR con método DerSimonian-Laird...', type: 'process' },
      { delay: 1500, icon: '📈', message: 'Resultado primario: HR 0.80 (IC 95%: 0.73-0.87)', type: 'data' },
      { delay: 1200, icon: '📊', message: 'Heterogeneidad: I² = 18% (BAJA)', type: 'data' },
      { delay: 1500, icon: '🎯', message: 'NNT calculado: 21 pacientes por 2 años', type: 'data' },
      { delay: 1200, icon: '📉', message: 'Generando forest plot con IC por estudio...', type: 'process' },
    ]
  },
  { 
    id: 13, 
    name: 'Evidence Grader', 
    description: 'Califica evidencia GRADE',
    sources: ['GRADE Handbook', 'GRADEpro GDT', 'MAGICapp'],
    explanation: {
      doing: 'Aplica el sistema GRADE para calificar la certeza de la evidencia.',
      why: 'GRADE es el estándar internacional para evaluar calidad de evidencia.',
      estimatedTime: '9 segundos'
    },
    steps: [
      { delay: 1200, icon: '⭐', message: 'Iniciando evaluación GRADE para cada outcome...', type: 'process' },
      { delay: 1500, icon: '📊', message: 'Hospitalización IC + muerte CV: Certeza ALTA ⭐⭐⭐⭐', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Muerte cardiovascular: Certeza MODERADA ⭐⭐⭐', type: 'data' },
      { delay: 1500, icon: '📊', message: 'Calidad de vida (KCCQ): Certeza ALTA ⭐⭐⭐⭐', type: 'data' },
      { delay: 1200, icon: '💪', message: 'Recomendación: FUERTE a favor de SGLT2i en ICFEp', type: 'success' },
    ]
  },
  { 
    id: 14, 
    name: 'Report Generator', 
    description: 'Genera dossier final',
    sources: ['PRISMA 2020', 'Word Templates', 'LaTeX'],
    explanation: {
      doing: 'Ensambla el dossier final con todos los resultados.',
      why: 'El dossier es el producto final listo para publicación o comité.',
      estimatedTime: '8 segundos'
    },
    steps: [
      { delay: 1000, icon: '📝', message: 'Generando resumen ejecutivo...', type: 'process' },
      { delay: 1200, icon: '📊', message: 'Insertando tablas de características...', type: 'process' },
      { delay: 1200, icon: '📈', message: 'Agregando forest plots y figuras...', type: 'process' },
      { delay: 1200, icon: '📚', message: 'Compilando 124 referencias bibliográficas...', type: 'process' },
      { delay: 1200, icon: '📋', message: 'Aplicando formato institucional Santa Fe...', type: 'process' },
      { delay: 1200, icon: '✅', message: 'Dossier de 47 páginas generado exitosamente', type: 'success' },
    ]
  },
];

// =========================================
// AGENT OUTPUTS (Simulated)
// =========================================
const AGENT_OUTPUTS: Record<number, { title: string; content: string }> = {
  1: {
    title: 'Marco PICOT Estructurado',
    content: `**P (Población):** Adultos ≥18 años con insuficiencia cardíaca con fracción de eyección preservada (ICFEp, FEVI ≥50%)

**I (Intervención):** Inhibidores SGLT2 (empagliflozina 10mg, dapagliflozina 10mg)

**C (Comparador):** Placebo o tratamiento estándar

**O (Outcomes):** 
• Primario: Hospitalización por IC + muerte cardiovascular
• Secundarios: Calidad de vida (KCCQ), función renal

**T (Tiempo):** Seguimiento mínimo 12 meses, ensayos 2019-2025`
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
    title: 'Gap Analysis de Literatura',
    content: `**Revisiones sistemáticas previas:** 8 encontradas

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
• RCTs fase III doble ciego
• Adultos con ICFEp (FEVI ≥50%)
• SGLT2i vs placebo/control
• Seguimiento ≥6 meses
• Outcomes CV reportados

**EXCLUSIÓN:**
• Estudios observacionales
• ICFEr o ICFEmr (FEVI <50%)
• Dosis no estándar
• Publicaciones duplicadas`
  },
  5: {
    title: 'Verificación PROSPERO',
    content: `**Búsqueda en PROSPERO:** Completada

**Protocolos similares:** 3 encontrados
• CRD42023456789: Enfocado en ICFEr (diferente)
• CRD42024123456: Solo empagliflozina (más limitado)
• CRD42024789012: En progreso, diferente outcome

**Recomendación:** ✅ Proceder con registro nuevo
**ID sugerido:** CRD42025XXXXXX`
  },
  6: {
    title: 'Evaluación de Sesgos',
    content: `**Herramienta:** Cochrane RoB 2.0

**Riesgos anticipados:**
• Aleatorización: BAJO (RCTs grandes)
• Cegamiento: BAJO (doble ciego típico)
• Datos incompletos: MODERADO
• Reporte selectivo: BAJO
• Otros sesgos: BAJO

**Plan:** Análisis de sensibilidad excluyendo alto riesgo`
  },
  7: {
    title: 'Ecuaciones de Búsqueda',
    content: `**PubMed:**
("SGLT2 inhibitor"[MeSH] OR "empagliflozin" OR "dapagliflozin")
AND ("Heart Failure"[MeSH] OR "HFpEF")
AND ("randomized controlled trial"[pt])
Filters: 2019-2025

**Embase:**
('sodium glucose cotransporter 2 inhibitor'/exp)
AND ('heart failure with preserved ejection fraction'/exp)

**Cochrane:** MeSH descriptors aplicados`
  },
  8: {
    title: 'Estructura del Protocolo',
    content: `**Secciones PRISMA-P completadas:**
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
• PubMed: 342 artículos
• Embase: 289 artículos
• Cochrane: 156 artículos
• Otras fuentes: 60 artículos
• **Total:** 847 artículos

**Cribado:**
• Duplicados removidos: 234
• Título/Abstract excluidos: 489
• Texto completo evaluados: 124

**Incluidos:** 12 RCTs para meta-análisis`
  },
  10: {
    title: 'Datos Extraídos',
    content: `**12 estudios incluidos:**

| Estudio | N | SGLT2i | Seguimiento |
|---------|---|--------|-------------|
| EMPEROR-Preserved | 5,988 | Empa | 26 meses |
| DELIVER | 6,263 | Dapa | 28 meses |
| PRESERVED-HF | 324 | Dapa | 12 semanas |
| + 9 estudios más... |

**Total:** 14,234 participantes
**Eventos:** 2,847 eventos primarios`
  },
  11: {
    title: 'Evaluación de Calidad',
    content: `**Cochrane RoB 2.0 - Resultados:**

| Estudio | Overall Risk |
|---------|-------------|
| EMPEROR-Preserved | 🟢 Bajo |
| DELIVER | 🟢 Bajo |
| PRESERVED-HF | 🟢 Bajo |

**Calidad general:** 10/12 con bajo riesgo
**Funnel plot:** Simétrico (p=0.34)
**Sesgo publicación:** No detectado`
  },
  12: {
    title: 'Resultados Meta-análisis',
    content: `**Outcome primario (Hosp IC + muerte CV):**
• **HR: 0.80 (IC 95%: 0.73-0.87)**
• p < 0.0001
• **I²: 18%** (heterogeneidad baja)
• Modelo: Efectos aleatorios

**Outcomes secundarios:**
• Muerte CV: HR 0.88 (0.77-1.00)
• Hospitalización IC: HR 0.74 (0.67-0.83)
• KCCQ-TSS: +1.8 puntos

**NNT:** 21 pacientes por 2 años`
  },
  13: {
    title: 'Calificación GRADE',
    content: `**Certeza de la evidencia:**

| Outcome | Certeza |
|---------|---------|
| Hosp IC + muerte CV | ⭐⭐⭐⭐ ALTA |
| Muerte CV | ⭐⭐⭐ MODERADA |
| Calidad de vida | ⭐⭐⭐⭐ ALTA |
| Eventos adversos | ⭐⭐⭐⭐ ALTA |

**Recomendación:** FUERTE a favor de SGLT2i`
  },
  14: {
    title: 'Dossier de Evidencia',
    content: `**📋 DOSSIER COMPLETO GENERADO**

**Documento:** Revisión Sistemática y Meta-análisis
**Páginas:** 47
**Formato:** PDF

**Contenido:**
1. Resumen ejecutivo
2. Protocolo PROSPERO
3. Estrategia de búsqueda
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
// PDF GENERATION FUNCTION
// =========================================
const generatePDF = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title page
  doc.setFontSize(24);
  doc.setTextColor(27, 77, 122); // Santa Fe blue
  doc.text('DOSSIER DE EVIDENCIA', pageWidth / 2, 40, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(46, 125, 107); // Santa Fe green
  doc.text('Revisión Sistemática y Meta-análisis', pageWidth / 2, 55, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const title = 'Eficacia de inhibidores SGLT2 en insuficiencia cardíaca';
  const subtitle = 'con fracción de eyección preservada';
  doc.text(title, pageWidth / 2, 80, { align: 'center' });
  doc.text(subtitle, pageWidth / 2, 88, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Generado por: Galatea AI + Fundación Santa Fe de Bogotá', pageWidth / 2, 110, { align: 'center' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 118, { align: 'center' });
  
  // Page 2 - Executive Summary
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(27, 77, 122);
  doc.text('RESUMEN EJECUTIVO', 20, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const summary = [
    'Objetivo: Evaluar la eficacia de inhibidores SGLT2 en ICFEp',
    '',
    'Métodos: Revisión sistemática siguiendo PRISMA 2020',
    'Bases consultadas: PubMed, Embase, Cochrane Central',
    'Estudios incluidos: 12 RCTs (n=14,234 participantes)',
    '',
    'Resultados principales:',
    '• Hazard Ratio: 0.80 (IC 95%: 0.73-0.87)',
    '• Heterogeneidad (I²): 18% - Baja',
    '• NNT: 21 pacientes por 2 años',
    '',
    'Calidad GRADE: ALTA',
    '',
    'Conclusión: Los inhibidores SGLT2 reducen significativamente',
    'el riesgo de hospitalización por IC y muerte CV en pacientes',
    'con ICFEp. Recomendación FUERTE a favor.'
  ];
  
  let y = 35;
  summary.forEach(line => {
    doc.text(line, 20, y);
    y += 7;
  });
  
  // Page 3 - PICOT Framework
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(27, 77, 122);
  doc.text('MARCO PICOT', 20, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const picot = [
    'P (Población): Adultos ≥18 años con ICFEp (FEVI ≥50%)',
    '',
    'I (Intervención): Inhibidores SGLT2',
    '   • Empagliflozina 10mg',
    '   • Dapagliflozina 10mg',
    '',
    'C (Comparador): Placebo o tratamiento estándar',
    '',
    'O (Outcomes):',
    '   • Primario: Hospitalización por IC + muerte CV',
    '   • Secundarios: Calidad de vida, función renal',
    '',
    'T (Tiempo): Seguimiento mínimo 12 meses'
  ];
  
  y = 35;
  picot.forEach(line => {
    doc.text(line, 20, y);
    y += 7;
  });
  
  // Page 4 - Results
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(27, 77, 122);
  doc.text('RESULTADOS DEL META-ANÁLISIS', 20, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const results = [
    'Estudios incluidos: 12 RCTs',
    'Participantes totales: 14,234',
    'Eventos primarios: 2,847',
    '',
    'OUTCOME PRIMARIO (Hosp IC + Muerte CV):',
    '• Hazard Ratio: 0.80',
    '• Intervalo de Confianza 95%: 0.73 - 0.87',
    '• Valor p: < 0.0001',
    '• Heterogeneidad I²: 18% (baja)',
    '',
    'OUTCOMES SECUNDARIOS:',
    '• Muerte CV: HR 0.88 (0.77-1.00)',
    '• Hospitalización IC: HR 0.74 (0.67-0.83)',
    '• KCCQ-TSS: +1.8 puntos (1.2-2.4)',
    '',
    'NNT: 21 pacientes tratados durante 2 años',
    'para prevenir 1 evento'
  ];
  
  y = 35;
  results.forEach(line => {
    doc.text(line, 20, y);
    y += 7;
  });
  
  // Page 5 - GRADE Assessment
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(27, 77, 122);
  doc.text('EVALUACIÓN GRADE', 20, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const grade = [
    'Certeza de la Evidencia por Outcome:',
    '',
    '1. Hospitalización IC + Muerte CV',
    '   Certeza: ALTA (⭐⭐⭐⭐)',
    '   Sin limitaciones serias identificadas',
    '',
    '2. Muerte Cardiovascular',
    '   Certeza: MODERADA (⭐⭐⭐)',
    '   Imprecisión: IC cruza el 1.00',
    '',
    '3. Calidad de Vida (KCCQ)',
    '   Certeza: ALTA (⭐⭐⭐⭐)',
    '   Mejora clínicamente significativa',
    '',
    'RECOMENDACIÓN FINAL:',
    'FUERTE a favor del uso de inhibidores SGLT2',
    'en pacientes con ICFEp'
  ];
  
  y = 35;
  grade.forEach(line => {
    doc.text(line, 20, y);
    y += 7;
  });
  
  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Galatea AI + Fundación Santa Fe de Bogotá | Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
  }
  
  doc.save('Dossier_Evidencia_SGLT2_ICFEp.pdf');
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
  } | null>(null);
  
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
  // MAIN ORCHESTRATION - SLOW & DETAILED
  // =========================================
  const runOrchestration = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const usedQuestion = question.trim() || DEFAULT_QUESTION;
    
    addLog('═══════════════════════════════════════════════════════════', 'info');
    addLog('🚀 INICIANDO ORQUESTACIÓN DE 14 AGENTES ESPECIALIZADOS', 'info');
    addLog('═══════════════════════════════════════════════════════════', 'info');
    addLog(`📋 Pregunta: "${usedQuestion.substring(0, 60)}..."`, 'data');
    
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < AGENTS_CONFIG.length; i++) {
      const agentConfig = AGENTS_CONFIG[i];
      const startTime = Date.now();
      
      // Set active agent and update explanation panel
      setActiveAgentId(agentConfig.id);
      setCurrentExplanation({
        doing: agentConfig.explanation.doing,
        why: agentConfig.explanation.why,
        estimatedTime: agentConfig.explanation.estimatedTime,
        sources: agentConfig.sources,
        agentName: agentConfig.name
      });
      
      // Start processing
      updateAgent(agentConfig.id, { status: 'processing' });
      addLog('', 'info');
      addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
      addLog(`🤖 AGENTE ${agentConfig.id}: ${agentConfig.name.toUpperCase()}`, 'process');
      addLog(`📝 ${agentConfig.description}`, 'info');
      addLog(`📚 Fuentes: ${agentConfig.sources.join(' | ')}`, 'source');
      addLog(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
      
      // Execute each step with its specific delay
      for (const step of agentConfig.steps) {
        await new Promise(r => setTimeout(r, step.delay));
        addLog(`${step.icon} ${step.message}`, step.type);
      }
      
      // Calculate total latency
      const totalLatency = Date.now() - startTime;
      
      // Complete agent
      updateAgent(agentConfig.id, { status: 'completed', latency: totalLatency });
      addLog(`✅ ${agentConfig.name} COMPLETADO (${(totalLatency / 1000).toFixed(1)}s)`, 'success');
      
      // Add to deliverables library
      addDeliverable(agentConfig.id);
      
      // Small pause before next agent
      await new Promise(r => setTimeout(r, 500));
    }

    addLog('', 'info');
    addLog('═══════════════════════════════════════════════════════════', 'info');
    addLog('🎉 ORQUESTACIÓN COMPLETADA - 14/14 AGENTES EJECUTADOS', 'success');
    addLog('📊 Todos los entregables generados exitosamente', 'success');
    addLog('📥 Dossier de evidencia listo para descarga', 'data');
    addLog('═══════════════════════════════════════════════════════════', 'info');
    
    setActiveAgentId(null);
    setCurrentExplanation(null);
    setIsComplete(true);
    
    // Transition to verification after 2s
    setTimeout(() => {
      setPhase('verification');
    }, 2000);
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
      {/* Header with LARGE logos */}
      <header className="flex justify-between items-center p-6">
        <img 
          src={galateaLogo} 
          alt="Galatea AI" 
          className="h-20 lg:h-24"
          style={{ filter: 'brightness(0) invert(1)' }} // Make logo white
        />
        <img 
          src={santaFeLogo} 
          alt="Fundación Santa Fe de Bogotá" 
          className="h-24 lg:h-32 bg-white rounded-xl p-3 shadow-lg" 
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
  // RENDER: EXECUTION PHASE (3 Columns) - WHITE BACKGROUND
  // =========================================
  const renderExecution = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.blanco }}
    >
      {/* Header - White background with Santa Fe colors */}
      <header className="flex justify-between items-center px-6 py-4 border-b-2" style={{ borderColor: COLORS.azulInstitucional }}>
        <div className="flex items-center gap-4">
          <img src={galateaLogo} alt="Galatea AI" className="h-14" />
          <div className="h-8 w-px" style={{ backgroundColor: COLORS.azulInstitucional }} />
          <span className="font-bold text-lg" style={{ color: COLORS.azulInstitucional }}>
            Clinical Guideline Navigator
          </span>
          <span 
            className="px-3 py-1.5 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: COLORS.verdeMedico }}
          >
            14-AGENT ORCHESTRATION
          </span>
        </div>
        <img src={santaFeLogo} alt="Santa Fe" className="h-16" />
      </header>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: Agent List (25%) - White background */}
        <div className="w-1/4 border-r-2 overflow-y-auto p-4" style={{ borderColor: '#E5E7EB' }}>
          <h2 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color: COLORS.azulInstitucional }}>
            <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: COLORS.verdeMedico }} />
            Orquestación de 14 Agentes
          </h2>
          
          <div className="space-y-2">
            {agents.map((agent) => (
              <motion.div
                key={agent.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: agent.id * 0.05 }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  agent.status === 'processing' 
                    ? 'border-blue-500 bg-blue-50' 
                    : agent.status === 'completed'
                    ? 'bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                style={{
                  borderColor: agent.status === 'processing' 
                    ? COLORS.azulInstitucional 
                    : agent.status === 'completed' 
                    ? COLORS.verdeMedico 
                    : '#E5E7EB'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {agent.status === 'pending' && (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                    {agent.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: COLORS.azulInstitucional }} />
                    )}
                    {agent.status === 'completed' && (
                      <CheckCircle className="w-4 h-4" style={{ color: COLORS.verdeMedico }} />
                    )}
                    <span className={`text-sm font-semibold ${
                      agent.status === 'pending' ? 'text-gray-500' : ''
                    }`} style={{ 
                      color: agent.status === 'completed' ? COLORS.verdeMedico :
                             agent.status === 'processing' ? COLORS.azulInstitucional : undefined
                    }}>
                      {agent.id}. {agent.name}
                    </span>
                  </div>
                  {agent.latency && (
                    <span className="text-xs font-medium" style={{ color: COLORS.verdeMedico }}>
                      {(agent.latency / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-6">{agent.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Explanation Panel - Below agent list */}
          {currentExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl border-2"
              style={{ 
                borderColor: COLORS.azulInstitucional,
                backgroundColor: '#F0F7FF'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5" style={{ color: COLORS.azulInstitucional }} />
                <span className="font-bold" style={{ color: COLORS.azulInstitucional }}>
                  {currentExplanation.agentName}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {currentExplanation.doing}
              </p>
              
              <div className="flex items-start gap-2 mb-3">
                <Lightbulb className="w-4 h-4 mt-0.5" style={{ color: COLORS.verdeMedico }} />
                <p className="text-xs text-gray-600">
                  <strong>¿Por qué es importante?</strong> {currentExplanation.why}
                </p>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4" style={{ color: COLORS.azulInstitucional }} />
                <span className="text-xs font-medium" style={{ color: COLORS.azulInstitucional }}>
                  Consultando:
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {currentExplanation.sources.map((source, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-2 py-1 rounded-full bg-white border"
                    style={{ borderColor: COLORS.azulInstitucional, color: COLORS.azulInstitucional }}
                  >
                    {source}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500">
                  Tiempo estimado: {currentExplanation.estimatedTime}
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* CENTER: Terminal (50%) - Dark background for contrast */}
        <div className="w-1/2 flex flex-col border-r-2" style={{ borderColor: '#E5E7EB' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: COLORS.fondoTerminal }}>
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
            style={{ backgroundColor: COLORS.fondoTerminal }}
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
                    log.type === 'source' ? 'text-purple-400' :
                    'text-gray-300'
                  }>
                    {log.message}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Deliverables Library (25%) - White background */}
        <div className="w-1/4 overflow-y-auto p-4 bg-white">
          <h2 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color: COLORS.azulInstitucional }}>
            <BookOpen className="w-5 h-5" style={{ color: COLORS.verdeMedico }} />
            Biblioteca de Evidencia
          </h2>
          
          {deliverables.length === 0 ? (
            <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg border border-gray-200">
              📚 Los entregables aparecerán aquí conforme cada agente complete su tarea...
            </div>
          ) : (
            <div className="space-y-2">
              {deliverables.map((d) => (
                <motion.div
                  key={d.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Card className="border-2 shadow-sm" style={{ borderColor: COLORS.verdeMedico + '40' }}>
                    <CardHeader 
                      className="py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleDeliverable(d.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: COLORS.verdeMedico }} />
                          <CardTitle className="text-sm font-semibold" style={{ color: COLORS.grisTexto }}>
                            {d.title}
                          </CardTitle>
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
                            <div className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto border border-gray-200">
                              {d.content}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-xs h-7">
                                Ver Completo
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-7">
                                Guardar
                              </Button>
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
      className="min-h-screen flex flex-col bg-white"
    >
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 border-b-2" style={{ borderColor: COLORS.azulInstitucional }}>
        <img src={galateaLogo} alt="Galatea AI" className="h-16" />
        <img src={santaFeLogo} alt="Santa Fe" className="h-20" />
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
          <div 
            className="flex items-center gap-3 px-8 py-4 rounded-full shadow-lg"
            style={{ backgroundColor: COLORS.verdeMedico + '15', border: `2px solid ${COLORS.verdeMedico}` }}
          >
            <CheckCircle className="w-8 h-8" style={{ color: COLORS.verdeMedico }} />
            <span className="font-bold text-xl" style={{ color: COLORS.verdeMedico }}>
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
          <div className="bg-white rounded-xl p-4 shadow-lg border-2" style={{ borderColor: COLORS.azulInstitucional }}>
            <img src={santaFeLogo} alt="Santa Fe de Bogotá" className="h-20" />
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border flex items-center gap-3">
            <Award className="w-10 h-10 text-blue-600" />
            <span className="font-bold text-lg text-blue-600">OMS</span>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-purple-600" />
            <span className="font-bold text-lg text-purple-600">Cochrane</span>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-800" />
            <span className="font-bold text-lg text-blue-800">PubMed</span>
          </div>
        </motion.div>

        {/* Results card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="shadow-xl border-2" style={{ borderColor: COLORS.azulInstitucional }}>
            <CardHeader className="text-center pb-4" style={{ backgroundColor: COLORS.azulInstitucional + '08' }}>
              <CardTitle className="text-2xl flex items-center justify-center gap-2" style={{ color: COLORS.azulInstitucional }}>
                📊 Resultados del Meta-Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Key metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl p-5 text-center border-2" style={{ borderColor: COLORS.azulInstitucional, backgroundColor: COLORS.azulInstitucional + '08' }}>
                  <div className="text-4xl font-bold" style={{ color: COLORS.azulInstitucional }}>0.80</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Hazard Ratio</div>
                  <div className="text-xs text-gray-500">IC 95%: 0.73-0.87</div>
                </div>
                <div className="rounded-xl p-5 text-center border-2" style={{ borderColor: COLORS.verdeMedico, backgroundColor: COLORS.verdeMedico + '08' }}>
                  <div className="text-4xl font-bold" style={{ color: COLORS.verdeMedico }}>18%</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Heterogeneidad (I²)</div>
                  <div className="text-xs" style={{ color: COLORS.verdeMedico }}>BAJA</div>
                </div>
                <div className="rounded-xl p-5 text-center border-2" style={{ borderColor: '#F59E0B', backgroundColor: '#FEF3C7' }}>
                  <div className="text-3xl font-bold text-amber-600">⭐⭐⭐⭐</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Calidad GRADE</div>
                  <div className="text-xs text-amber-600">ALTA</div>
                </div>
                <div className="rounded-xl p-5 text-center border-2" style={{ borderColor: COLORS.azulInstitucional, backgroundColor: COLORS.azulInstitucional + '08' }}>
                  <div className="text-4xl font-bold" style={{ color: COLORS.azulInstitucional }}>847→12</div>
                  <div className="text-sm font-medium text-gray-600 mt-1">Artículos</div>
                  <div className="text-xs text-gray-500">Analizados→Incluidos</div>
                </div>
              </div>

              {/* Download buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  onClick={generatePDF}
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold shadow-lg hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: COLORS.verdeMedico }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Descargar Dossier Completo (PDF)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg font-semibold border-2"
                  style={{ borderColor: COLORS.azulInstitucional, color: COLORS.azulInstitucional }}
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
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
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
