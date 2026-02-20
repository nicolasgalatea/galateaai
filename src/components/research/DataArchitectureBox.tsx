import { motion } from 'framer-motion';
import { FlaskConical, ArrowRight } from 'lucide-react';
import type { FinerResultsData } from '@/types/domain';
import type { PicoData } from '@/navigator';

interface DataArchitectureBoxProps {
  finerResults: FinerResultsData;
  picoData: PicoData | null;
}

export function DataArchitectureBox({ finerResults, picoData }: DataArchitectureBoxProps) {
  const independentVar = picoData?.I ?? null;
  const dependentVar = picoData?.O ?? null;
  const hypothesis = finerResults.hipotesis ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0D1117] rounded-lg border border-[#21262D] p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-4 h-4 text-[#A78BFA]" />
        <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
          Arquitectura de Datos
        </span>
      </div>

      {/* Variables grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Variable Independiente */}
        <div className="rounded-lg border border-[#00D395]/30 bg-[#00D395]/5 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#00D395] shadow-[0_0_6px_rgba(0,211,149,0.5)]" />
            <span className="text-[10px] font-semibold tracking-wider text-[#00D395] uppercase">
              Variable Independiente
            </span>
          </div>
          <p className="text-sm text-[#E6EDF3] font-medium leading-relaxed">
            {independentVar || 'No definida'}
          </p>
          <span className="text-[9px] text-[#484F58] mt-1 block">Intervencion / Exposicion</span>
        </div>

        {/* Variable Dependiente */}
        <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/5 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_6px_rgba(167,139,250,0.5)]" />
            <span className="text-[10px] font-semibold tracking-wider text-[#A78BFA] uppercase">
              Variable Dependiente
            </span>
          </div>
          <p className="text-sm text-[#E6EDF3] font-medium leading-relaxed">
            {dependentVar || 'No definida'}
          </p>
          <span className="text-[9px] text-[#484F58] mt-1 block">Outcome / Desenlace</span>
        </div>
      </div>

      {/* Relationship arrow */}
      {independentVar && dependentVar && (
        <div className="flex items-center justify-center gap-2 py-2 mb-4">
          <span className="text-[10px] text-[#00D395] font-mono">{independentVar}</span>
          <ArrowRight className="w-4 h-4 text-[#484F58]" />
          <span className="text-[10px] text-[#A78BFA] font-mono">{dependentVar}</span>
        </div>
      )}

      {/* Hypothesis */}
      {hypothesis && (
        <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-3">
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase block mb-1.5">
            Hipotesis Formulada
          </span>
          <p className="text-xs text-[#E6EDF3] leading-relaxed italic">
            &ldquo;{hypothesis}&rdquo;
          </p>
        </div>
      )}
    </motion.div>
  );
}
