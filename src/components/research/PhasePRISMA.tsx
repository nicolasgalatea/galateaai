import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface PRISMAData {
  identified: number;
  screened: number;
  eligible: number;
  included: number;
  duplicates_removed?: number;
  excluded_screening?: number;
  excluded_eligibility?: number;
}

function FlowBox({
  label,
  count,
  color,
  delay,
}: {
  label: string;
  count: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`p-4 rounded-lg border-2 text-center ${color}`}
    >
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs font-medium mt-1">{label}</div>
    </motion.div>
  );
}

function ExclusionBranch({ label, count, delay }: { label: string; count: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-2 text-sm"
    >
      <div className="w-8 h-px bg-destructive/40" />
      <div className="px-3 py-1.5 rounded border border-destructive/30 bg-destructive/5 text-destructive text-xs font-medium">
        −{count} {label}
      </div>
    </motion.div>
  );
}

export default function PhasePRISMA({
  data,
  userEdits,
}: {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
}) {
  const merged = { ...data, ...userEdits };

  const prisma: PRISMAData = {
    identified: Number(merged.identified || merged.identificados || 0),
    screened: Number(merged.screened || merged.cribados || 0),
    eligible: Number(merged.eligible || merged.elegibles || 0),
    included: Number(merged.included || merged.incluidos || 0),
    duplicates_removed: Number(merged.duplicates_removed || merged.duplicados || 0),
    excluded_screening: Number(merged.excluded_screening || merged.excluidos_cribado || 0),
    excluded_eligibility: Number(merged.excluded_eligibility || merged.excluidos_elegibilidad || 0),
  };

  const hasData = prisma.identified > 0;

  if (!hasData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm italic">Diagrama PRISMA pendiente — esperando ejecución de la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-primary text-center">
        Diagrama de Flujo PRISMA 2020
      </h4>

      <div className="flex flex-col items-center gap-2 py-4">
        {/* Identification */}
        <FlowBox
          label="Registros identificados"
          count={prisma.identified}
          color="border-primary/50 bg-primary/5"
          delay={0}
        />
        <ArrowDown className="w-4 h-4 text-muted-foreground" />

        {/* Duplicates removed (side branch) */}
        <div className="flex items-center gap-4">
          <FlowBox
            label="Después de eliminar duplicados"
            count={prisma.screened}
            color="border-accent/50 bg-accent/5"
            delay={0.2}
          />
          {prisma.duplicates_removed > 0 && (
            <ExclusionBranch label="duplicados" count={prisma.duplicates_removed} delay={0.3} />
          )}
        </div>
        <ArrowDown className="w-4 h-4 text-muted-foreground" />

        {/* Screening */}
        <div className="flex items-center gap-4">
          <FlowBox
            label="Evaluados a texto completo"
            count={prisma.eligible}
            color="border-accent/50 bg-accent/5"
            delay={0.4}
          />
          {prisma.excluded_screening > 0 && (
            <ExclusionBranch label="excluidos por título/abstract" count={prisma.excluded_screening} delay={0.5} />
          )}
        </div>
        <ArrowDown className="w-4 h-4 text-muted-foreground" />

        {/* Eligibility */}
        <div className="flex items-center gap-4">
          <FlowBox
            label="Estudios incluidos"
            count={prisma.included}
            color="border-emerald-500/50 bg-emerald-50/50"
            delay={0.6}
          />
          {prisma.excluded_eligibility > 0 && (
            <ExclusionBranch label="excluidos por criterios" count={prisma.excluded_eligibility} delay={0.7} />
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="text-center text-xs text-muted-foreground border-t pt-3">
        Tasa de inclusión: {prisma.identified > 0 ? ((prisma.included / prisma.identified) * 100).toFixed(1) : 0}%
      </div>
    </div>
  );
}
