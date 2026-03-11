import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Play, FileText } from 'lucide-react';
import type { ResearchProject } from '@/types/domain';
import type { ResearchLabAgent } from '@/config/researchLabAgents';

// ═══════════════════════════════════════════════════════════════════════
// Etiquetas de fase para el badge de estado
// ═══════════════════════════════════════════════════════════════════════
export const PHASE_LABELS: Record<number, string> = {
  0: 'Fase 0: Inicio',
  1: 'Fase 1: Planteamiento',
  2: 'Fase 2: Contexto Regional',
  3: 'Fase 3: PICOT',
  4: 'Fase 4: Test FINER',
  5: 'Fase 5: Hipotesis',
  6: 'Fase 6: Estructura',
  7: 'Fase 7: Ecuacion Booleana',
  8: 'Fase 8: Protocolo',
  9: 'Fase 9: Manuscrito',
  10: 'Fase 10: Completado',
};

interface DashboardHeaderProps {
  /** Proyecto de research_projects (Realtime) — fuente de verdad para el titulo */
  researchProject: ResearchProject | null | undefined;
  /** Titulo fallback del proyecto legacy (agent_projects) */
  legacyTitle?: string;
  /** Fase activa que la UI muestra */
  activeViewPhase: number;
  /** Agente v2 activo (Research Lab) */
  activeAgent: ResearchLabAgent | undefined;
  /** Agente legacy activo */
  legacyAgentName?: string;
  /** Estado de ejecucion */
  isExecuting: boolean;
  /** Step del agente legacy (para el boton) */
  currentAgentStep: number;
  /** Fase del proyecto legacy */
  projectPhase: string;
  /** Callbacks */
  onExecuteAgent: () => void;
  onShowApproval: () => void;
}

export function DashboardHeader({
  researchProject,
  legacyTitle,
  activeViewPhase,
  activeAgent,
  legacyAgentName,
  isExecuting,
  currentAgentStep,
  projectPhase,
  onExecuteAgent,
  onShowApproval,
}: DashboardHeaderProps) {
  // Titulo principal: researchProject.title (Realtime) > legacyTitle > fallback
  const title = researchProject?.title ?? legacyTitle ?? 'Nueva Investigacion';
  const phaseLabel = PHASE_LABELS[activeViewPhase] ?? `Fase ${activeViewPhase}`;
  const projectCode = researchProject?.project_code;

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          {projectCode && (
            <span className="text-xs font-mono font-bold text-[#A78BFA] bg-[#A78BFA]/10 px-2 py-0.5 rounded">
              {projectCode}
            </span>
          )}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <motion.span
            key={activeViewPhase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              activeViewPhase === 0
                ? 'bg-gray-100 text-gray-600'
                : activeViewPhase >= 10
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
            }`}
          >
            {phaseLabel}
          </motion.span>
        </div>
        <p className="text-sm text-gray-500">
          {activeAgent
            ? activeAgent.displayNameEs
            : legacyAgentName ?? 'Completado'}
        </p>
      </div>

      {projectPhase !== 'COMPLETED' && projectPhase !== 'AWAITING_APPROVAL' && (
        <Button
          onClick={onExecuteAgent}
          disabled={isExecuting}
          className="bg-[#0091DF] hover:bg-[#007FC4]"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Ejecutando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Ejecutar Agente {currentAgentStep}
            </>
          )}
        </Button>
      )}

      {projectPhase === 'AWAITING_APPROVAL' && (
        <Button
          onClick={onShowApproval}
          className="bg-[#89BA17] hover:bg-[#78A315]"
        >
          <FileText className="w-4 h-4 mr-2" />
          Revisar y Aprobar
        </Button>
      )}
    </div>
  );
}
