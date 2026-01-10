import { useState } from 'react';
import { 
  ChevronRight, ChevronDown, FileText, CheckCircle, AlertCircle, 
  Clock, Lock, Unlock, Target, BookOpen, Filter, FlaskConical,
  Brain, Microscope, BarChart3, Shield, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtocolPhase {
  id: string;
  number: number;
  title: string;
  status: 'complete' | 'active' | 'warning' | 'pending' | 'locked';
  children?: ProtocolPhase[];
}

interface ProtocolNavigatorProps {
  activePhaseId: string;
  onPhaseSelect: (phaseId: string) => void;
}

const phases: ProtocolPhase[] = [
  {
    id: 'phase-1',
    number: 1,
    title: 'FASE 1: ARQUITECTURA',
    status: 'active',
    children: [
      { id: '1-1', number: 1, title: 'Fundamentación Científica', status: 'complete' },
      { id: '1-2', number: 2, title: 'Planteamiento del Problema', status: 'complete' },
      { id: '1-3', number: 3, title: 'Justificación', status: 'complete' },
      { id: '1-4', number: 4, title: 'Marco Conceptual', status: 'complete' },
      { id: '1-5', number: 5, title: 'PICOT Analysis', status: 'complete' },
      { id: '1-6', number: 6, title: 'Literature Scout', status: 'complete' },
      { id: '1-7', number: 7, title: 'Criteria Design', status: 'warning' },
      { id: '1-8', number: 8, title: 'Yadav Strategist', status: 'active' },
    ]
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'FASE 2: EJECUCIÓN',
    status: 'locked',
    children: [
      { id: '2-1', number: 9, title: 'PRISMA Flow', status: 'pending' },
      { id: '2-2', number: 10, title: 'Data Extraction', status: 'pending' },
      { id: '2-3', number: 11, title: 'Quality Assessment', status: 'pending' },
      { id: '2-4', number: 12, title: 'Meta-Analysis', status: 'pending' },
    ]
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'FASE 3: VALIDACIÓN',
    status: 'locked',
    children: [
      { id: '3-1', number: 13, title: 'Reproducibility Audit', status: 'pending' },
      { id: '3-2', number: 14, title: 'Multi-AI Consensus', status: 'pending' },
      { id: '3-3', number: 15, title: 'Gap Analysis', status: 'pending' },
      { id: '3-4', number: 16, title: 'Certificate Export', status: 'pending' },
    ]
  },
];

const getStatusIcon = (status: ProtocolPhase['status']) => {
  switch (status) {
    case 'complete':
      return <CheckCircle className="w-3.5 h-3.5 text-[#00D395]" />;
    case 'active':
      return <div className="w-3 h-3 rounded-full bg-[#00BCFF] animate-pulse" />;
    case 'warning':
      return <AlertCircle className="w-3.5 h-3.5 text-[#F7B500]" />;
    case 'locked':
      return <Lock className="w-3.5 h-3.5 text-[#484F58]" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-[#484F58]" />;
  }
};

const getLedColor = (status: ProtocolPhase['status']) => {
  switch (status) {
    case 'complete': return 'bg-[#00D395] shadow-[0_0_8px_rgba(0,211,149,0.5)]';
    case 'active': return 'bg-[#00BCFF] shadow-[0_0_8px_rgba(0,188,255,0.5)] animate-pulse';
    case 'warning': return 'bg-[#F7B500] shadow-[0_0_8px_rgba(247,181,0,0.5)]';
    default: return 'bg-[#484F58]';
  }
};

export function ProtocolNavigator({ activePhaseId, onPhaseSelect }: ProtocolNavigatorProps) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['phase-1']);

  const toggleExpand = (phaseId: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0D1117] overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-[#21262D] bg-[#161B22]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#00BCFF]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Protocol Navigator
          </span>
        </div>
      </div>

      {/* Phase Tree */}
      <div className="flex-1 overflow-y-auto py-2 terminal-scroll">
        {phases.map((phase) => (
          <div key={phase.id} className="mb-1">
            {/* Parent Phase */}
            <button
              onClick={() => toggleExpand(phase.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors",
                "hover:bg-[#21262D]",
                expandedPhases.includes(phase.id) && "bg-[#21262D]/50"
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", getLedColor(phase.status))} />
              
              {expandedPhases.includes(phase.id) ? (
                <ChevronDown className="w-3 h-3 text-[#8B949E]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#8B949E]" />
              )}
              
              <span className={cn(
                "text-[11px] font-semibold tracking-wide",
                phase.status === 'locked' ? "text-[#484F58]" : "text-[#E6EDF3]"
              )}>
                {phase.title}
              </span>
              
              {phase.status === 'locked' && (
                <Lock className="w-3 h-3 text-[#484F58] ml-auto" />
              )}
            </button>

            {/* Children */}
            {expandedPhases.includes(phase.id) && phase.children && (
              <div className="ml-4 border-l border-[#21262D]">
                {phase.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onPhaseSelect(child.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors",
                      "hover:bg-[#21262D]",
                      activePhaseId === child.id && "bg-[#00BCFF]/10 border-l-2 border-l-[#00BCFF]"
                    )}
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full ml-1", getLedColor(child.status))} />
                    
                    <span className="text-[10px] text-[#484F58] font-mono w-4">
                      {String(child.number).padStart(2, '0')}
                    </span>
                    
                    <span className={cn(
                      "text-[11px] flex-1 truncate",
                      child.status === 'pending' || child.status === 'locked' 
                        ? "text-[#484F58]" 
                        : activePhaseId === child.id 
                          ? "text-[#00BCFF]"
                          : "text-[#E6EDF3]"
                    )}>
                      {child.title}
                    </span>
                    
                    {getStatusIcon(child.status)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-3 border-t border-[#21262D] bg-[#161B22]">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[14px] font-bold text-[#00D395]">7</div>
            <div className="text-[9px] text-[#484F58] uppercase">Complete</div>
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#00BCFF]">1</div>
            <div className="text-[9px] text-[#484F58] uppercase">Active</div>
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#F7B500]">1</div>
            <div className="text-[9px] text-[#484F58] uppercase">Warning</div>
          </div>
        </div>
      </div>
    </div>
  );
}
