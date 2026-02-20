import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, FileText, CheckCircle, AlertTriangle, 
  ChevronDown, ChevronUp, BookOpen, Award, Microscope,
  Link2, Clock, Users, Beaker
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClinicalReference {
  id: string;
  type: 'pmid' | 'doi' | 'guideline' | 'cochrane';
  identifier: string;
  title: string;
  authors?: string;
  journal?: string;
  year?: number;
  url?: string;
  validationNote?: string;
}

export interface AgentEvidence {
  agentId: string;
  agentName: string;
  agentIcon: React.ReactNode;
  status: 'pending' | 'running' | 'completed' | 'warning';
  completedAt?: Date;
  latencyMs?: number;
  summary: string;
  methodology?: string;
  references: ClinicalReference[];
  validationStandard?: string;
  confidenceScore?: number;
}

interface AgentEvidenceCardProps {
  evidence: AgentEvidence;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const getReferenceIcon = (type: ClinicalReference['type']) => {
  switch (type) {
    case 'pmid': return <FileText className="w-3.5 h-3.5" />;
    case 'doi': return <Link2 className="w-3.5 h-3.5" />;
    case 'guideline': return <BookOpen className="w-3.5 h-3.5" />;
    case 'cochrane': return <Microscope className="w-3.5 h-3.5" />;
  }
};

const getReferenceUrl = (ref: ClinicalReference): string => {
  if (ref.url) return ref.url;
  switch (ref.type) {
    case 'pmid': return `https://pubmed.ncbi.nlm.nih.gov/${ref.identifier}/`;
    case 'doi': return `https://doi.org/${ref.identifier}`;
    case 'cochrane': return `https://www.cochranelibrary.com/cdsr/doi/${ref.identifier}`;
    default: return '#';
  }
};

export function AgentEvidenceCard({ evidence, isExpanded, onToggle }: AgentEvidenceCardProps) {
  const [showReferences, setShowReferences] = useState(false);

  const statusColors = {
    pending: { bg: 'bg-[#21262D]', text: 'text-[#8B949E]', border: 'border-[#30363D]' },
    running: { bg: 'bg-[#00BCFF]/10', text: 'text-[#00BCFF]', border: 'border-[#00BCFF]/50' },
    completed: { bg: 'bg-[#00D395]/10', text: 'text-[#00D395]', border: 'border-[#00D395]/50' },
    warning: { bg: 'bg-[#F7B500]/10', text: 'text-[#F7B500]', border: 'border-[#F7B500]/50' }
  };

  const colors = statusColors[evidence.status];

  return (
    <motion.div
      layout
      className={cn(
        "rounded-lg border transition-all duration-300",
        colors.border,
        evidence.status === 'completed' ? "bg-white" : "bg-[#FAFBFC]"
      )}
    >
      {/* Card Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Agent Icon */}
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              colors.bg
            )}>
              <span className={colors.text}>{evidence.agentIcon}</span>
            </div>

            {/* Agent Info */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{evidence.agentName}</h4>
                {evidence.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-[#00D395]" />
                )}
                {evidence.status === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-[#F7B500]" />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{evidence.summary}</p>
            </div>
          </div>

          {/* Status & Metrics */}
          <div className="flex flex-col items-end gap-1">
            {evidence.latencyMs && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{evidence.latencyMs}ms</span>
              </div>
            )}
            {evidence.confidenceScore && (
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                evidence.confidenceScore >= 90 ? "bg-[#00D395]/10 text-[#00D395]" :
                evidence.confidenceScore >= 70 ? "bg-[#F7B500]/10 text-[#F7B500]" :
                "bg-gray-100 text-gray-600"
              )}>
                {evidence.confidenceScore}% confianza
              </div>
            )}
          </div>
        </div>

        {/* Validation Standard Badge */}
        {evidence.validationStandard && evidence.status === 'completed' && (
          <div className="mt-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00BCFF]" />
            <span className="text-sm font-medium text-[#00BCFF]">
              {evidence.validationStandard}
            </span>
          </div>
        )}

        {/* View Source Button */}
        {evidence.status === 'completed' && evidence.references.length > 0 && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowReferences(!showReferences);
            }}
            className={cn(
              "mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              showReferences 
                ? "bg-[#0097A7] text-white" 
                : "bg-[#0097A7]/10 text-[#0097A7] hover:bg-[#0097A7]/20"
            )}
          >
            <BookOpen className="w-4 h-4" />
            View Source ({evidence.references.length})
            {showReferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </motion.button>
        )}
      </div>

      {/* References Panel */}
      <AnimatePresence>
        {showReferences && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="pt-4 space-y-3">
                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Referencias Clínicas
                </h5>
                
                {evidence.references.map((ref) => (
                  <div 
                    key={ref.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#0097A7]/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                        {getReferenceIcon(ref.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#0097A7] bg-[#0097A7]/10 px-1.5 py-0.5 rounded">
                            {ref.type.toUpperCase()}: {ref.identifier}
                          </span>
                          {ref.year && (
                            <span className="text-xs text-gray-400">{ref.year}</span>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                          {ref.title}
                        </p>
                        
                        {ref.authors && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {ref.authors}
                          </p>
                        )}
                        
                        {ref.journal && (
                          <p className="text-xs text-gray-400 italic">{ref.journal}</p>
                        )}
                        
                        {ref.validationNote && (
                          <p className="text-xs text-[#00D395] mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {ref.validationNote}
                          </p>
                        )}
                      </div>
                      
                      <a
                        href={getReferenceUrl(ref)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-[#0097A7]/10 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 text-[#0097A7]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Methodology Note */}
              {evidence.methodology && (
                <div className="mt-4 p-3 bg-[#00BCFF]/5 border border-[#00BCFF]/20 rounded-lg">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#00BCFF] mb-1">
                    <Beaker className="w-3.5 h-3.5" />
                    Metodología Aplicada
                  </div>
                  <p className="text-sm text-gray-700">{evidence.methodology}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
