import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Edit3, Check, ChevronDown, ChevronRight, Lock, 
  Brain, Target, BookOpen, Filter, FlaskConical, AlertTriangle, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'table';
  agent?: string;
  agentColor?: string;
  title?: string;
  content: string;
  isLocked?: boolean;
  isEditing?: boolean;
}

interface DocumentEditorProps {
  blocks?: DocumentBlock[];
  onBlockUpdate?: (blockId: string, content: string) => void;
}

const defaultBlocks: DocumentBlock[] = [
  {
    id: '1',
    type: 'heading',
    title: 'Fundamentación Científica',
    content: '## Planteamiento del Problema',
    isLocked: false,
  },
  {
    id: '2',
    type: 'paragraph',
    agent: 'Problem Architect',
    agentColor: '#00BCFF',
    content: 'La metformina, fármaco de primera línea para el tratamiento de la diabetes mellitus tipo 2 (DM2), ha demostrado en estudios preclínicos propiedades que trascienden su efecto hipoglucemiante. Sin embargo, existe una brecha significativa en la comprensión de su potencial neuroprotector en poblaciones humanas geriátricas.',
    isLocked: false,
  },
  {
    id: '3',
    type: 'paragraph',
    agent: 'Literature Scout',
    agentColor: '#00D395',
    content: 'A pesar de más de dos décadas de investigación observacional, no existe un consenso definitivo sobre si el uso crónico de metformina modifica el riesgo de desarrollar enfermedad de Alzheimer (EA) en pacientes con DM2. Los estudios existentes presentan resultados contradictorios, con algunos reportando efectos protectores (OR: 0.4-0.7) y otros sin asociación significativa.',
    isLocked: false,
  },
  {
    id: '4',
    type: 'heading',
    title: 'PICOT Analysis',
    content: '## Pregunta de Investigación Estructurada',
    isLocked: true,
  },
  {
    id: '5',
    type: 'table',
    agent: 'PICOT Analyst',
    agentColor: '#FF6B9D',
    content: JSON.stringify({
      P: 'Adultos ≥60 años con DM2',
      I: 'Metformina 500-2000mg/día',
      C: 'Otros antidiabéticos orales',
      O: 'Incidencia de Alzheimer',
      T: 'Seguimiento ≥3 años'
    }),
    isLocked: true,
  },
  {
    id: '6',
    type: 'code',
    agent: 'Yadav Strategist',
    agentColor: '#F7B500',
    title: 'PubMed Search Strategy',
    content: `("Metformin"[MeSH] OR "Metformin"[tw])
AND ("Alzheimer Disease"[MeSH] OR "Cognitive Dysfunction"[MeSH])
AND ("Diabetes Mellitus, Type 2"[MeSH])
AND ("Cohort Studies"[MeSH] OR "Randomized Controlled Trial"[pt])
Filters: Humans, 2015-2025, Age: 60+`,
    isLocked: true,
  },
];

const getAgentIcon = (agent?: string) => {
  switch (agent) {
    case 'Problem Architect': return <Brain className="w-3 h-3" />;
    case 'Literature Scout': return <BookOpen className="w-3 h-3" />;
    case 'PICOT Analyst': return <Target className="w-3 h-3" />;
    case 'Criteria Designer': return <Filter className="w-3 h-3" />;
    case 'Yadav Strategist': return <FlaskConical className="w-3 h-3" />;
    default: return <Sparkles className="w-3 h-3" />;
  }
};

export function DocumentEditor({ blocks = defaultBlocks, onBlockUpdate }: DocumentEditorProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<string[]>(blocks.map(b => b.id));
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [localContent, setLocalContent] = useState<Record<string, string>>({});

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const startEditing = (block: DocumentBlock) => {
    if (block.isLocked) return;
    setEditingBlock(block.id);
    setLocalContent(prev => ({ ...prev, [block.id]: block.content }));
  };

  const saveEdit = (blockId: string) => {
    onBlockUpdate?.(blockId, localContent[blockId] || '');
    setEditingBlock(null);
  };

  const renderBlockContent = (block: DocumentBlock) => {
    if (block.type === 'table') {
      try {
        const data = JSON.parse(block.content);
        return (
          <div className="grid grid-cols-5 gap-2 text-[10px]">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="p-2 bg-[#161B22] rounded border border-[#21262D]">
                <div className="font-bold text-[#00BCFF] mb-1">{key}</div>
                <div className="text-[#E6EDF3]">{value as string}</div>
              </div>
            ))}
          </div>
        );
      } catch {
        return <p className="text-[#E6EDF3]">{block.content}</p>;
      }
    }

    if (block.type === 'code') {
      return (
        <pre className="text-[10px] font-mono text-[#8B949E] bg-[#0A0E14] p-3 rounded overflow-x-auto whitespace-pre-wrap">
          {block.content}
        </pre>
      );
    }

    return (
      <p className="text-[11px] leading-relaxed text-[#E6EDF3]">
        {block.content}
      </p>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0D1117] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#00BCFF]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Live Document
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-[#484F58]">
          <span>Metformin_Alzheimer_Protocol_v2.1</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D395]" />
          <span className="text-[#00D395]">SAVED</span>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 terminal-scroll">
        {blocks.map((block) => (
          <motion.div
            key={block.id}
            layout
            className={cn(
              "rounded border overflow-hidden transition-all",
              editingBlock === block.id 
                ? "border-[#00BCFF] shadow-[0_0_15px_rgba(0,188,255,0.2)]"
                : "border-[#21262D] hover:border-[#484F58]"
            )}
          >
            {/* Block Header */}
            <div
              className="flex items-center gap-2 px-3 py-2 bg-[#161B22] cursor-pointer"
              onClick={() => toggleBlock(block.id)}
            >
              {expandedBlocks.includes(block.id) ? (
                <ChevronDown className="w-3 h-3 text-[#484F58]" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#484F58]" />
              )}

              {block.title && (
                <span className="text-[11px] font-semibold text-[#E6EDF3]">
                  {block.title}
                </span>
              )}

              {block.agent && (
                <div 
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] ml-auto"
                  style={{ 
                    backgroundColor: `${block.agentColor}15`,
                    color: block.agentColor
                  }}
                >
                  {getAgentIcon(block.agent)}
                  <span className="font-semibold">{block.agent}</span>
                </div>
              )}

              <div className="flex items-center gap-1 ml-2">
                {block.isLocked ? (
                  <Lock className="w-3 h-3 text-[#484F58]" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingBlock === block.id) {
                        saveEdit(block.id);
                      } else {
                        startEditing(block);
                      }
                    }}
                    className="p-1 rounded hover:bg-[#21262D] transition-colors"
                  >
                    {editingBlock === block.id ? (
                      <Check className="w-3 h-3 text-[#00D395]" />
                    ) : (
                      <Edit3 className="w-3 h-3 text-[#484F58]" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Block Content */}
            {expandedBlocks.includes(block.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-3 bg-[#0D1117]"
              >
                {editingBlock === block.id ? (
                  <textarea
                    value={localContent[block.id] || block.content}
                    onChange={(e) => setLocalContent(prev => ({ 
                      ...prev, 
                      [block.id]: e.target.value 
                    }))}
                    className="w-full min-h-[100px] bg-[#0A0E14] border border-[#21262D] rounded p-3 text-[11px] text-[#E6EDF3] focus:outline-none focus:border-[#00BCFF] resize-y"
                  />
                ) : (
                  renderBlockContent(block)
                )}

                {/* Source reference for agent blocks */}
                {block.agent && !editingBlock && (
                  <div className="mt-2 pt-2 border-t border-[#21262D] flex items-center gap-1 text-[9px] text-[#484F58]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>AI-generated content • Review for accuracy</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161B22] border-t border-[#21262D] text-[9px]">
        <div className="flex items-center gap-3 text-[#484F58]">
          <span>{blocks.length} blocks</span>
          <span>•</span>
          <span>{blocks.filter(b => b.agent).length} AI-generated</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#484F58]">Last edit: just now</span>
        </div>
      </div>
    </div>
  );
}
