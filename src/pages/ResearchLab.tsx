/**
 * ResearchLab — Página principal del Research Lab (10 Fases)
 * ─────────────────────────────────────────────────────────────
 * Fuente de verdad: research_projects (project_id fijo)
 * Realtime: via useResearchProject → cambia de fase automáticamente
 * Renderers especializados: PhaseDefinition, PhaseFINER (radar), PhaseVariableMapping,
 *   PhaseArticles, EvidenceLibrary, PhasePRISMA, PhaseManuscript
 */

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import ResearchDashboard from '@/components/ResearchDashboard';
import galateaLogo from '@/assets/galatea-logo-clean.png';
import santaFeLogo from '@/assets/santa-fe-logo-clean.png';

export default function ResearchLab() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-[hsl(207,60%,30%)] to-[hsl(160,45%,35%)] border-[hsl(207,40%,25%)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={galateaLogo} alt="Galatea" className="h-8 w-auto" />
            <div className="h-6 w-px bg-white/30" />
            <span className="text-white/90 font-semibold text-sm tracking-wide">
              The Research Lab
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] bg-white/20 text-white border-0 hidden sm:flex"
            >
              10 Fases · 14 Agentes
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-white/70 text-xs hidden sm:block">Realtime</span>
            </div>
            <img src={santaFeLogo} alt="Santa Fe" className="h-7 w-auto opacity-80" />
          </div>
        </div>
      </header>

      {/* ── Main Content: ResearchDashboard maneja todo el estado y realtime ── */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <ResearchDashboard />
      </motion.main>
    </div>
  );
}
