import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileX, AlertCircle, Users, Beaker, BarChart2, 
  ChevronDown, ChevronUp, ExternalLink, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExcludedArticle {
  id: string;
  pmid?: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  exclusionReason: ExclusionReason;
  details?: string;
  phase: 'screening' | 'fulltext' | 'quality';
}

export type ExclusionReason = 
  | 'sample_size'
  | 'bias_detected'
  | 'wrong_population'
  | 'wrong_intervention'
  | 'wrong_outcome'
  | 'duplicate'
  | 'no_comparator'
  | 'language'
  | 'study_design'
  | 'incomplete_data';

const exclusionReasonLabels: Record<ExclusionReason, { label: string; icon: React.ReactNode; color: string }> = {
  sample_size: { label: 'Muestra Insuficiente', icon: <Users className="w-3.5 h-3.5" />, color: '#F7B500' },
  bias_detected: { label: 'Sesgo Detectado', icon: <AlertCircle className="w-3.5 h-3.5" />, color: '#FF4757' },
  wrong_population: { label: 'Población No Elegible', icon: <Users className="w-3.5 h-3.5" />, color: '#8B5CF6' },
  wrong_intervention: { label: 'Intervención Diferente', icon: <Beaker className="w-3.5 h-3.5" />, color: '#00BCFF' },
  wrong_outcome: { label: 'Desenlace No Relevante', icon: <BarChart2 className="w-3.5 h-3.5" />, color: '#F97316' },
  duplicate: { label: 'Duplicado', icon: <FileX className="w-3.5 h-3.5" />, color: '#6B7280' },
  no_comparator: { label: 'Sin Grupo Control', icon: <Users className="w-3.5 h-3.5" />, color: '#EC4899' },
  language: { label: 'Idioma No Incluido', icon: <FileX className="w-3.5 h-3.5" />, color: '#6B7280' },
  study_design: { label: 'Diseño No Elegible', icon: <AlertCircle className="w-3.5 h-3.5" />, color: '#EF4444' },
  incomplete_data: { label: 'Datos Incompletos', icon: <AlertCircle className="w-3.5 h-3.5" />, color: '#F7B500' }
};

const phaseLabels = {
  screening: 'Cribado Título/Abstract',
  fulltext: 'Evaluación Texto Completo',
  quality: 'Evaluación de Calidad'
};

// Sample data for Metformin-Alzheimer study
export const metforminExcludedArticles: ExcludedArticle[] = [
  {
    id: '1',
    pmid: '32145789',
    title: 'Metformin use and cognitive function in elderly diabetic patients: A cross-sectional analysis',
    authors: 'Wang L, Chen H, Zhang Y, et al.',
    journal: 'Diabetes Care',
    year: 2020,
    exclusionReason: 'study_design',
    details: 'Estudio transversal - no permite evaluar causalidad temporal',
    phase: 'fulltext'
  },
  {
    id: '2',
    pmid: '31987654',
    title: 'Anti-diabetic medications and dementia risk: A hospital-based study',
    authors: 'Kim JS, Park SW, Lee JH',
    journal: 'J Korean Med Sci',
    year: 2019,
    exclusionReason: 'sample_size',
    details: 'n=47 pacientes, poder estadístico insuficiente (β<0.80)',
    phase: 'fulltext'
  },
  {
    id: '3',
    pmid: '33456123',
    title: 'Cognitive outcomes in insulin-treated vs metformin-treated patients',
    authors: 'Martinez A, Rodriguez B, García C',
    journal: 'Endocrine',
    year: 2021,
    exclusionReason: 'wrong_population',
    details: 'Incluye pacientes <50 años (36% de la muestra)',
    phase: 'screening'
  },
  {
    id: '4',
    pmid: '30876543',
    title: 'Biguanides and neuroprotection: Mechanistic insights',
    authors: 'Patel N, Thompson R, Williams K',
    journal: 'Molecular Neurobiology',
    year: 2018,
    exclusionReason: 'wrong_outcome',
    details: 'Desenlaces moleculares, no clínicos (MMSE/MoCA)',
    phase: 'fulltext'
  },
  {
    id: '5',
    pmid: '29765432',
    title: 'Diabetes treatment patterns and Alzheimer risk',
    authors: 'Suzuki T, Yamamoto K, Tanaka M',
    journal: 'J Alzheimers Dis',
    year: 2017,
    exclusionReason: 'no_comparator',
    details: 'Solo grupo metformina, sin comparador activo',
    phase: 'quality'
  },
  {
    id: '6',
    pmid: '34567890',
    title: 'Metformin and cognitive decline: Interim analysis of ongoing RCT',
    authors: 'Brown E, Johnson M, Davis P',
    journal: 'BMJ Open',
    year: 2022,
    exclusionReason: 'incomplete_data',
    details: 'Análisis intermedio, seguimiento <2 años completado',
    phase: 'quality'
  },
  {
    id: '7',
    pmid: '31234567',
    title: 'Antidiabetic drugs and neurodegeneration in rats',
    authors: 'Li X, Wang Y, Zhou Z',
    journal: 'Neuropharmacology',
    year: 2019,
    exclusionReason: 'wrong_population',
    details: 'Estudio en modelo animal (ratas Wistar)',
    phase: 'screening'
  },
  {
    id: '8',
    pmid: '32654321',
    title: 'Observational study of dementia in diabetics with selection bias',
    authors: 'Anderson J, Taylor R, Clark S',
    journal: 'Age Ageing',
    year: 2020,
    exclusionReason: 'bias_detected',
    details: 'Sesgo de selección grave: excluidos pacientes con comorbilidades',
    phase: 'quality'
  }
];

interface ExcludedArticlesTableProps {
  articles?: ExcludedArticle[];
  className?: string;
}

export function ExcludedArticlesTable({ 
  articles = metforminExcludedArticles,
  className 
}: ExcludedArticlesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPhase, setFilterPhase] = useState<string | null>(null);
  const [filterReason, setFilterReason] = useState<ExclusionReason | null>(null);

  const filteredArticles = articles.filter(article => {
    if (filterPhase && article.phase !== filterPhase) return false;
    if (filterReason && article.exclusionReason !== filterReason) return false;
    return true;
  });

  // Count by reason
  const reasonCounts = articles.reduce((acc, article) => {
    acc[article.exclusionReason] = (acc[article.exclusionReason] || 0) + 1;
    return acc;
  }, {} as Record<ExclusionReason, number>);

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF4757]/10 flex items-center justify-center">
              <FileX className="w-5 h-5 text-[#FF4757]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Artículos Excluidos</h3>
              <p className="text-sm text-gray-500">
                {filteredArticles.length} de {articles.length} artículos con razones documentadas
              </p>
            </div>
          </div>
          
          {/* Phase Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterPhase || ''}
              onChange={(e) => setFilterPhase(e.target.value || null)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#0097A7]/20 focus:border-[#0097A7]"
            >
              <option value="">Todas las fases</option>
              <option value="screening">Cribado</option>
              <option value="fulltext">Texto Completo</option>
              <option value="quality">Calidad</option>
            </select>
          </div>
        </div>

        {/* Reason Summary Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(reasonCounts).map(([reason, count]) => {
            const reasonInfo = exclusionReasonLabels[reason as ExclusionReason];
            const isActive = filterReason === reason;
            return (
              <button
                key={reason}
                onClick={() => setFilterReason(isActive ? null : reason as ExclusionReason)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                  isActive 
                    ? "bg-gray-800 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <span style={{ color: isActive ? 'white' : reasonInfo.color }}>{reasonInfo.icon}</span>
                <span>{reasonInfo.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px]",
                  isActive ? "bg-white/20" : "bg-gray-200"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">PMID</th>
              <th className="px-4 py-3">Estudio</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Fase</th>
              <th className="px-4 py-3">Razón de Exclusión</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredArticles.map((article) => {
              const reasonInfo = exclusionReasonLabels[article.exclusionReason];
              const isExpanded = expandedId === article.id;
              
              return (
                <motion.tr 
                  key={article.id}
                  layout
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    {article.pmid && (
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-[#0097A7] hover:underline flex items-center gap-1"
                      >
                        {article.pmid}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-sm">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {article.authors} • <span className="italic">{article.journal}</span>
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{article.year}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      article.phase === 'screening' ? "bg-blue-50 text-blue-700" :
                      article.phase === 'fulltext' ? "bg-purple-50 text-purple-700" :
                      "bg-orange-50 text-orange-700"
                    )}>
                      {phaseLabels[article.phase]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80"
                      style={{ 
                        backgroundColor: `${reasonInfo.color}15`,
                        color: reasonInfo.color
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : article.id)}
                    >
                      {reasonInfo.icon}
                      {reasonInfo.label}
                      {article.details && (
                        isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                      )}
                    </div>
                    {isExpanded && article.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2"
                        style={{ borderColor: reasonInfo.color }}
                      >
                        {article.details}
                      </motion.div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={article.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#0097A7] hover:underline"
                    >
                      Ver en PubMed
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredArticles.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No hay artículos que coincidan con los filtros seleccionados
        </div>
      )}
    </div>
  );
}
