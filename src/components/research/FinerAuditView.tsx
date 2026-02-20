import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinerRadarChart } from './FinerRadarChart';
import { DataArchitectureBox } from './DataArchitectureBox';
import type { FinerOutput } from '@/types/domain';
import type { PicoData } from '@/navigator';

export interface FinerAuditViewProps {
  finerOutput: FinerOutput | null;
  picoData: PicoData | null;
  currentPhase: number;
  isFinerApproved: boolean;
  onNextPhase?: () => void;
}

export function FinerAuditView({
  finerOutput,
  picoData,
  currentPhase,
  isFinerApproved,
  onNextPhase,
}: FinerAuditViewProps) {
  if (!finerOutput?.finer_scores) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-[#8B949E]">
        <div className="w-8 h-8 border-2 border-[#8B949E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Esperando resultados FINER...</p>
      </div>
    );
  }

  const isPhase4 = currentPhase === 4;
  const isPhase5 = currentPhase >= 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Phase 4: Full radar + gate */}
      {isPhase4 && (
        <>
          <FinerRadarChart scores={finerOutput.finer_scores} />

          {/* Recommendations */}
          {finerOutput.recomendaciones && (
            <div className="bg-[#161B22] rounded-lg border border-[#21262D] p-3">
              <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase block mb-1.5">
                Recomendaciones
              </span>
              <p className="text-xs text-[#E6EDF3] leading-relaxed whitespace-pre-wrap">
                {finerOutput.recomendaciones}
              </p>
            </div>
          )}

          {/* Alert banner when not approved */}
          {!finerOutput.aprobado && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-lg border border-[#FF4757]/30 bg-[#FF4757]/10 p-3"
            >
              <AlertTriangle className="w-5 h-5 text-[#FF4757] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#FF4757]">
                  Revision Metodologica Requerida
                </p>
                <p className="text-xs text-[#FF4757]/80 mt-1">
                  La pregunta de investigacion no cumple los criterios FINER minimos. Revise las recomendaciones y ajuste antes de continuar.
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Phase 5: Compact radar + Data Architecture */}
      {isPhase5 && (
        <>
          <FinerRadarChart scores={finerOutput.finer_scores} compact />
          <DataArchitectureBox
            finerResults={{
              finer_scores: finerOutput.finer_scores,
              aprobado: finerOutput.aprobado,
              recomendaciones: finerOutput.recomendaciones ?? undefined,
              hipotesis: finerOutput.hipotesis ?? undefined,
            }}
            picoData={picoData}
          />
        </>
      )}

      {/* Next Phase button */}
      {onNextPhase && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={onNextPhase}
            disabled={!isFinerApproved}
            className="bg-[#00D395] hover:bg-[#00B880] text-[#0D1117] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente Fase
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
