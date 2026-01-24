import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Table, ExternalLink, Users, Pill, BarChart2, CheckCircle, 
  AlertCircle, ChevronDown, ChevronUp, Download, Filter,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExtractedStudy {
  id: string;
  pmid: string;
  study: string;
  studyType: 'RCT' | 'Cohort' | 'Case-Control' | 'Cross-sectional';
  population: {
    n: number;
    ageRange: string;
    diabetesDuration?: string;
    country: string;
  };
  intervention: {
    drug: string;
    dose: string;
    duration: string;
  };
  comparator: string;
  outcome: {
    measure: string;
    result: string;
    direction: 'positive' | 'negative' | 'neutral';
    pValue?: string;
    ci95?: string;
  };
  qualityScore: number; // 1-9 Newcastle-Ottawa Scale or similar
  followUp: string;
}

// Sample high-fidelity data for Metformin-Alzheimer
export const metforminExtractedStudies: ExtractedStudy[] = [
  {
    id: '1',
    pmid: '28746836',
    study: 'Kuan et al. (Taiwan)',
    studyType: 'Cohort',
    population: {
      n: 12345,
      ageRange: '≥65 años',
      diabetesDuration: '≥5 años',
      country: 'Taiwan'
    },
    intervention: {
      drug: 'Metformina',
      dose: '500-2000 mg/día',
      duration: 'Continuo'
    },
    comparator: 'Sulfonilureas',
    outcome: {
      measure: 'Incidencia de demencia',
      result: 'HR 0.76',
      direction: 'positive',
      pValue: '0.003',
      ci95: '0.63-0.91'
    },
    qualityScore: 8,
    followUp: '7.2 años (mediana)'
  },
  {
    id: '2',
    pmid: '30688882',
    study: 'Samaras et al. (Australia)',
    studyType: 'RCT',
    population: {
      n: 1547,
      ageRange: '70-90 años',
      country: 'Australia'
    },
    intervention: {
      drug: 'Metformina',
      dose: '850 mg BID',
      duration: '6 años'
    },
    comparator: 'Placebo',
    outcome: {
      measure: 'Cambio MMSE',
      result: '-0.3 puntos/año',
      direction: 'positive',
      pValue: '0.02',
      ci95: '-0.5 a -0.1'
    },
    qualityScore: 9,
    followUp: '6 años'
  },
  {
    id: '3',
    pmid: '29521632',
    study: 'Shi et al. (China)',
    studyType: 'Cohort',
    population: {
      n: 5892,
      ageRange: '60-85 años',
      diabetesDuration: '≥3 años',
      country: 'China'
    },
    intervention: {
      drug: 'Metformina',
      dose: '1000-2500 mg/día',
      duration: 'Variable'
    },
    comparator: 'No metformina',
    outcome: {
      measure: 'Riesgo Alzheimer',
      result: 'OR 0.62',
      direction: 'positive',
      pValue: '<0.001',
      ci95: '0.48-0.79'
    },
    qualityScore: 7,
    followUp: '5.8 años'
  },
  {
    id: '4',
    pmid: '31256789',
    study: 'Orkaby et al. (USA)',
    studyType: 'Cohort',
    population: {
      n: 3456,
      ageRange: '≥75 años',
      country: 'Estados Unidos'
    },
    intervention: {
      drug: 'Metformina',
      dose: 'Variable',
      duration: '≥2 años'
    },
    comparator: 'Otros ADOs',
    outcome: {
      measure: 'Deterioro cognitivo (MoCA)',
      result: 'RR 0.82',
      direction: 'positive',
      pValue: '0.04',
      ci95: '0.68-0.99'
    },
    qualityScore: 7,
    followUp: '4.5 años'
  },
  {
    id: '5',
    pmid: '32456123',
    study: 'López-Suárez (España)',
    studyType: 'Cohort',
    population: {
      n: 2187,
      ageRange: '65-80 años',
      diabetesDuration: '≥10 años',
      country: 'España'
    },
    intervention: {
      drug: 'Metformina',
      dose: '850-1700 mg/día',
      duration: 'Crónico'
    },
    comparator: 'DPP-4 inhibidores',
    outcome: {
      measure: 'Conversión a DCL',
      result: 'HR 0.71',
      direction: 'positive',
      pValue: '0.01',
      ci95: '0.54-0.92'
    },
    qualityScore: 8,
    followUp: '6.1 años'
  },
  {
    id: '6',
    pmid: '28876543',
    study: 'Moore et al. (UK)',
    studyType: 'Cohort',
    population: {
      n: 8765,
      ageRange: '≥60 años',
      country: 'Reino Unido'
    },
    intervention: {
      drug: 'Metformina',
      dose: 'Estándar',
      duration: '≥1 año'
    },
    comparator: 'Insulina',
    outcome: {
      measure: 'Diagnóstico demencia',
      result: 'HR 0.69',
      direction: 'positive',
      pValue: '<0.001',
      ci95: '0.58-0.82'
    },
    qualityScore: 8,
    followUp: '8.2 años'
  }
];

interface DataExtractorTableProps {
  studies?: ExtractedStudy[];
  className?: string;
  onExport?: () => void;
}

export function DataExtractorTable({ 
  studies = metforminExtractedStudies,
  className,
  onExport
}: DataExtractorTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'qualityScore' | 'population' | 'year'>('qualityScore');

  const getDirectionIcon = (direction: ExtractedStudy['outcome']['direction']) => {
    switch (direction) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-[#00D395]" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-[#FF4757]" />;
      case 'neutral': return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'bg-[#00D395]/10 text-[#00D395] border-[#00D395]/30';
    if (score >= 6) return 'bg-[#F7B500]/10 text-[#F7B500] border-[#F7B500]/30';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const sortedStudies = [...studies].sort((a, b) => {
    if (sortBy === 'qualityScore') return b.qualityScore - a.qualityScore;
    if (sortBy === 'population') return b.population.n - a.population.n;
    return 0;
  });

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-[#0097A7]/5 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0097A7]/10 flex items-center justify-center">
              <Table className="w-5 h-5 text-[#0097A7]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Extracción de Datos</h3>
              <p className="text-sm text-gray-500">
                {studies.length} estudios incluidos en síntesis cuantitativa
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-[#0097A7]/20"
              >
                <option value="qualityScore">Ordenar por Calidad</option>
                <option value="population">Ordenar por Población</option>
              </select>
            </div>
            
            {/* Export */}
            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0097A7] text-white rounded-lg text-sm font-medium hover:bg-[#0097A7]/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-[#0097A7]">
              {studies.reduce((sum, s) => sum + s.population.n, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Pacientes totales</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-[#0097A7]">
              {(studies.reduce((sum, s) => sum + s.qualityScore, 0) / studies.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Calidad promedio (NOS)</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-[#00D395]">
              {studies.filter(s => s.outcome.direction === 'positive').length}/{studies.length}
            </div>
            <div className="text-xs text-gray-500">Efecto protector</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-gray-700">
              {studies.filter(s => s.studyType === 'RCT').length}
            </div>
            <div className="text-xs text-gray-500">RCTs incluidos</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Estudio</th>
              <th className="px-4 py-3">Población</th>
              <th className="px-4 py-3">Intervención</th>
              <th className="px-4 py-3">Comparador</th>
              <th className="px-4 py-3">Resultado Crítico</th>
              <th className="px-4 py-3">Calidad</th>
              <th className="px-4 py-3 text-right">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedStudies.map((study) => {
              const isExpanded = expandedId === study.id;
              
              return (
                <>
                  <tr 
                    key={study.id}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : study.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-medium",
                          study.studyType === 'RCT' 
                            ? "bg-[#00D395]/10 text-[#00D395]" 
                            : "bg-blue-50 text-blue-700"
                        )}>
                          {study.studyType}
                        </span>
                        <span className="font-medium text-gray-900 text-sm">{study.study}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">n={study.population.n.toLocaleString()}</span>
                        <span className="text-gray-500">• {study.population.ageRange}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Pill className="w-4 h-4 text-[#0097A7]" />
                        <span className="text-gray-900">{study.intervention.dose}</span>
                      </div>
                      <span className="text-xs text-gray-500">{study.intervention.duration}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{study.comparator}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getDirectionIcon(study.outcome.direction)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {study.outcome.result}
                            </span>
                            {study.outcome.pValue && (
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                parseFloat(study.outcome.pValue) < 0.05 
                                  ? "bg-[#00D395]/10 text-[#00D395]" 
                                  : "bg-gray-100 text-gray-500"
                              )}>
                                p={study.outcome.pValue}
                              </span>
                            )}
                          </div>
                          {study.outcome.ci95 && (
                            <span className="text-xs text-gray-500">
                              IC95%: {study.outcome.ci95}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold border",
                        getQualityColor(study.qualityScore)
                      )}>
                        {study.qualityScore >= 8 ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : study.qualityScore >= 6 ? (
                          <AlertCircle className="w-3.5 h-3.5" />
                        ) : null}
                        {study.qualityScore}/9
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#0097A7] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        PMID:{study.pmid}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 bg-gray-50">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-3 gap-4"
                        >
                          <div className="p-3 bg-white rounded-lg border border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Población Detallada
                            </h4>
                            <p className="text-sm text-gray-900">
                              <strong>n = {study.population.n.toLocaleString()}</strong> pacientes
                            </p>
                            <p className="text-sm text-gray-600">Edad: {study.population.ageRange}</p>
                            {study.population.diabetesDuration && (
                              <p className="text-sm text-gray-600">
                                Duración DM2: {study.population.diabetesDuration}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">País: {study.population.country}</p>
                          </div>
                          
                          <div className="p-3 bg-white rounded-lg border border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Desenlace Primario
                            </h4>
                            <p className="text-sm font-medium text-gray-900">{study.outcome.measure}</p>
                            <p className="text-sm text-gray-600">
                              Resultado: <strong>{study.outcome.result}</strong>
                            </p>
                            {study.outcome.ci95 && (
                              <p className="text-sm text-gray-600">IC 95%: {study.outcome.ci95}</p>
                            )}
                            <p className="text-sm text-gray-600">Seguimiento: {study.followUp}</p>
                          </div>
                          
                          <div className="p-3 bg-white rounded-lg border border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Calidad Metodológica
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn(
                                "px-2 py-1 rounded font-bold text-sm",
                                getQualityColor(study.qualityScore)
                              )}>
                                {study.qualityScore}/9 NOS
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Newcastle-Ottawa Scale para estudios {study.studyType === 'RCT' ? 'experimentales' : 'observacionales'}
                            </p>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
