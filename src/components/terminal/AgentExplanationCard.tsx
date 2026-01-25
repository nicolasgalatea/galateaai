import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Brain, FileOutput, Loader2 } from 'lucide-react';

interface AgentExplanationCardProps {
  agentName: string;
  agentColor: string;
  isActive: boolean;
  isProcessing: boolean;
  doing: string;
  deliverable: string;
  icon: React.ReactNode;
}

// Typewriter hook for progressive text reveal
const useTypewriter = (text: string, speed: number = 30, isActive: boolean = false) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isActive]);

  return { displayedText, isComplete };
};

export function AgentExplanationCard({
  agentName,
  agentColor,
  isActive,
  isProcessing,
  doing,
  deliverable,
  icon
}: AgentExplanationCardProps) {
  const { displayedText: doingText, isComplete: doingComplete } = useTypewriter(doing, 25, isProcessing);
  const { displayedText: deliverableText } = useTypewriter(deliverable, 20, doingComplete);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-2xl border-2 p-6 shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${agentColor}08, ${agentColor}15)`,
        borderColor: `${agentColor}40`,
        boxShadow: `0 20px 50px -15px ${agentColor}30`
      }}
    >
      {/* Agent Header */}
      <div className="flex items-center gap-4 mb-5">
        <div 
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
          style={{ 
            background: agentColor,
            boxShadow: `0 8px 20px -5px ${agentColor}60`
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-2xl font-bold text-foreground">{agentName}</h4>
          {isProcessing && (
            <div className="flex items-center gap-2 mt-1">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: agentColor }} />
              <span className="text-base font-medium" style={{ color: agentColor }}>
                Procesando...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* What am I doing? */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5" style={{ color: agentColor }} />
          <span className="text-lg font-bold" style={{ color: agentColor }}>
            ¿Qué estoy haciendo?
          </span>
        </div>
        <div 
          className="p-4 rounded-xl bg-white/80 border min-h-[60px]"
          style={{ borderColor: `${agentColor}30` }}
        >
          <p className="text-xl font-medium text-foreground leading-relaxed">
            {doingText}
            {isProcessing && !doingComplete && (
              <span className="inline-block w-0.5 h-5 bg-foreground ml-1 animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* My Deliverable */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileOutput className="w-5 h-5" style={{ color: agentColor }} />
          <span className="text-lg font-bold" style={{ color: agentColor }}>
            Mi Entregable:
          </span>
        </div>
        <div 
          className="p-4 rounded-xl border-2 border-dashed min-h-[60px]"
          style={{ 
            borderColor: `${agentColor}40`,
            background: doingComplete ? `${agentColor}08` : 'transparent'
          }}
        >
          <p className="text-xl font-semibold" style={{ color: doingComplete ? agentColor : '#9ca3af' }}>
            {deliverableText || (doingComplete ? '' : 'Esperando resultado...')}
            {doingComplete && deliverableText.length < deliverable.length && (
              <span className="inline-block w-0.5 h-5 ml-1 animate-pulse" style={{ background: agentColor }} />
            )}
          </p>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ background: agentColor }}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Hook for typewriter effect on results
export function useResultTypewriter(text: string, isActive: boolean, speed: number = 15) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isActive]);

  return { displayedText, isComplete };
}
