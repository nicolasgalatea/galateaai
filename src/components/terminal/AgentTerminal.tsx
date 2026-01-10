import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, ChevronRight, Pause, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'process' | 'system';
  agent?: string;
  message: string;
  data?: Record<string, unknown>;
}

interface AgentTerminalProps {
  logs?: TerminalLog[];
  isPaused?: boolean;
  onTogglePause?: () => void;
  onClear?: () => void;
}

const defaultLogs: TerminalLog[] = [
  { id: '1', timestamp: new Date(), level: 'system', message: 'Galatea AI Terminal v2.1.0 initialized' },
  { id: '2', timestamp: new Date(), level: 'info', agent: 'ORCHESTRATOR', message: 'Multi-agent system ready' },
  { id: '3', timestamp: new Date(), level: 'process', agent: 'PICOT', message: 'Analyzing research question structure...' },
  { id: '4', timestamp: new Date(), level: 'success', agent: 'PICOT', message: 'PICOT components extracted successfully', data: { P: 'Adults ≥60y T2DM', I: 'Metformin', C: 'Other OADs', O: 'Alzheimer risk', T: '≥3 years' } },
  { id: '5', timestamp: new Date(), level: 'info', agent: 'LITERATURE', message: 'Initiating systematic search across databases' },
  { id: '6', timestamp: new Date(), level: 'process', agent: 'LITERATURE', message: 'Querying PubMed API...' },
  { id: '7', timestamp: new Date(), level: 'success', agent: 'LITERATURE', message: 'PubMed: 342 results in 1.24s' },
  { id: '8', timestamp: new Date(), level: 'warning', agent: 'CRITERIA', message: 'Potential bias detected in exclusion criteria' },
];

const getLevelColor = (level: TerminalLog['level']) => {
  switch (level) {
    case 'success': return '#00D395';
    case 'warning': return '#F7B500';
    case 'error': return '#FF4757';
    case 'process': return '#00BCFF';
    case 'system': return '#8B949E';
    default: return '#E6EDF3';
  }
};

const getLevelPrefix = (level: TerminalLog['level']) => {
  switch (level) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '✗';
    case 'process': return '◌';
    case 'system': return '▸';
    default: return '›';
  }
};

export function AgentTerminal({ 
  logs = defaultLogs,
  isPaused = false,
  onTogglePause,
  onClear
}: AgentTerminalProps) {
  const [displayedLogs, setDisplayedLogs] = useState<TerminalLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);

  useEffect(() => {
    if (!isPaused) {
      setDisplayedLogs(logs);
    }
  }, [logs, isPaused]);

  useEffect(() => {
    if (isAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs, isAutoScroll]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0E14] overflow-hidden font-mono text-[11px]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-[#00BCFF]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Agent Terminal
          </span>
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
            <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
            <div className="w-2 h-2 rounded-full bg-[#28C840]" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onTogglePause}
            className="p-1.5 rounded hover:bg-[#21262D] transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="w-3 h-3 text-[#00D395]" />
            ) : (
              <Pause className="w-3 h-3 text-[#8B949E]" />
            )}
          </button>
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-[#21262D] transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3 h-3 text-[#8B949E]" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-1 terminal-scroll"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
          setIsAutoScroll(isAtBottom);
        }}
      >
        <AnimatePresence mode="popLayout">
          {displayedLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              className="group"
            >
              <div className="flex items-start gap-2 py-0.5 hover:bg-[#161B22]/50 rounded px-1 -mx-1">
                {/* Timestamp */}
                <span className="text-[#484F58] shrink-0">
                  [{formatTime(log.timestamp)}]
                </span>

                {/* Level indicator */}
                <span style={{ color: getLevelColor(log.level) }} className="shrink-0">
                  {getLevelPrefix(log.level)}
                </span>

                {/* Agent badge */}
                {log.agent && (
                  <span className="px-1.5 py-0.5 bg-[#21262D] rounded text-[9px] text-[#8B949E] shrink-0">
                    {log.agent}
                  </span>
                )}

                {/* Message */}
                <span style={{ color: getLevelColor(log.level) }} className="flex-1">
                  {log.message}
                </span>
              </div>

              {/* JSON data if present */}
              {log.data && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="ml-6 mt-1 p-2 bg-[#0D1117] rounded border border-[#21262D] overflow-x-auto"
                >
                  <pre className="text-[10px] text-[#8B949E]">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Cursor */}
        <div className="flex items-center gap-2 text-[#00BCFF]">
          <ChevronRight className="w-3 h-3" />
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-4 bg-[#00BCFF]"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161B22] border-t border-[#21262D] text-[9px]">
        <div className="flex items-center gap-3">
          <span className="text-[#8B949E]">
            {displayedLogs.length} entries
          </span>
          {isPaused && (
            <span className="px-1.5 py-0.5 bg-[#F7B500]/20 text-[#F7B500] rounded">
              PAUSED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D395] animate-pulse" />
          <span className="text-[#8B949E]">LIVE</span>
        </div>
      </div>
    </div>
  );
}
