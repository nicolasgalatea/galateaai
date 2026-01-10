import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtocolNavigator } from './ProtocolNavigator';
import { DocumentEditor } from './DocumentEditor';
import { AgentTerminal } from './AgentTerminal';
import { ConsistencyRadar } from './ConsistencyRadar';
import { MultiAIConsensusGrid } from './MultiAIConsensusGrid';
import { AnimatedPRISMAFlow } from './AnimatedPRISMAFlow';
import { 
  Maximize2, Minimize2, Settings, Wifi, WifiOff, 
  Shield, Award, Download, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './TerminalTheme.css';

interface ClinicalTerminalProps {
  className?: string;
}

export function ClinicalTerminal({ className }: ClinicalTerminalProps) {
  const [activePhaseId, setActivePhaseId] = useState('1-8');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState<'radar' | 'consensus' | 'prisma'>('radar');

  return (
    <div className={cn(
      "terminal-theme terminal-base terminal-noise",
      "flex flex-col",
      isFullscreen ? "fixed inset-0 z-50" : "min-h-[800px] rounded-lg overflow-hidden border border-[#21262D]",
      className
    )}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <span className="text-[11px] font-semibold text-[#E6EDF3] tracking-wide">
            GALATEA AI • Clinical Guideline Navigator
          </span>
          <span className="px-2 py-0.5 bg-[#00BCFF]/20 text-[#00BCFF] rounded text-[9px] font-bold">
            TERMINAL MODE
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0D1117] rounded">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-[#00D395]" />
                <span className="text-[9px] text-[#00D395]">ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-[#FF4757]" />
                <span className="text-[9px] text-[#FF4757]">OFFLINE</span>
              </>
            )}
          </div>
          <button className="p-1.5 hover:bg-[#21262D] rounded transition-colors">
            <Settings className="w-4 h-4 text-[#8B949E]" />
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-[#21262D] rounded transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[#8B949E]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[#8B949E]" />
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Navigator */}
        <div className="w-64 border-r border-[#21262D] flex-shrink-0">
          <ProtocolNavigator 
            activePhaseId={activePhaseId}
            onPhaseSelect={setActivePhaseId}
          />
        </div>

        {/* Center Panel - Document Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <DocumentEditor />
        </div>

        {/* Right Panel - Terminal + Widgets */}
        <div className="w-96 border-l border-[#21262D] flex flex-col flex-shrink-0">
          {/* Visualization Tabs */}
          <div className="flex border-b border-[#21262D] bg-[#161B22]">
            {[
              { id: 'radar', label: 'Radar' },
              { id: 'consensus', label: 'Consensus' },
              { id: 'prisma', label: 'PRISMA' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                  activeTab === tab.id
                    ? "text-[#00BCFF] border-b-2 border-[#00BCFF] bg-[#00BCFF]/5"
                    : "text-[#484F58] hover:text-[#8B949E]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Widget Content */}
          <div className="flex-1 overflow-y-auto p-3 terminal-scroll">
            {activeTab === 'radar' && <ConsistencyRadar />}
            {activeTab === 'consensus' && <MultiAIConsensusGrid />}
            {activeTab === 'prisma' && <AnimatedPRISMAFlow />}
          </div>

          {/* Terminal */}
          <div className="h-64 border-t border-[#21262D]">
            <AgentTerminal />
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#161B22] border-t border-[#21262D]">
        <div className="flex items-center gap-4 text-[9px]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D395] animate-pulse" />
            <span className="text-[#8B949E]">4 Agents Active</span>
          </div>
          <span className="text-[#484F58]">|</span>
          <span className="text-[#8B949E]">Phase 1: Architecture</span>
          <span className="text-[#484F58]">|</span>
          <span className="text-[#8B949E]">Step 8/16</span>
        </div>
        <div className="flex items-center gap-3 text-[9px]">
          <div className="flex items-center gap-1.5 text-[#00D395]">
            <Shield className="w-3 h-3" />
            <span>ICH-GCP Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00BCFF]">
            <Award className="w-3 h-3" />
            <span>PROSPERO Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
