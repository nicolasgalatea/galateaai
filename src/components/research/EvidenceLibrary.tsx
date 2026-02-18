/**
 * EvidenceLibrary — Fase 7 (y cualquier fase que requiera referencias)
 * ─────────────────────────────────────────────────────────────────────
 * • Suscripción Realtime a `project_references` — los artículos aparecen
 *   uno a uno conforme el Agente n8n los inserta.
 * • Formato de citación Vancouver (Autores. Título. Revista. Año; PMID).
 * • Badge verde con PMID verificado + enlace a PubMed.
 * • Skeleton animado si la tabla está vacía y la fase activa es 7.
 * • Animación "slide-in" suave por cada nueva referencia (sin parpadeo).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ExternalLink, CheckCircle, Clock, Filter,
  Search, Users, Calendar, Microscope, AlertCircle, RefreshCw,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProjectReference {
  id: string;
  pmid: string;
  title: string;
  authors?: string | null;
  journal?: string | null;
  year?: number | null;
  doi?: string | null;
  abstract?: string | null;
  inclusion_status?: string | null;
  exclusion_reason?: string | null;
  relevance_score?: number | null;
  phase_used?: number | null;
  url?: string | null;
  created_at: string;
}

type InclusionFilter = 'all' | 'pending' | 'included' | 'excluded';

interface EvidenceLibraryProps {
  projectId: string;        // ID del research_project (UUID)
  currentPhase?: number;    // Para mostrar skeleton en fase 7
  isExecuting?: boolean;    // n8n está corriendo → mostramos spinner
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  included: {
    label: 'Incluido',
    classes: 'bg-[hsl(142_76%_36%/0.12)] text-[hsl(142,76%,28%)] border-[hsl(142,76%,36%/0.4)]',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  excluded: {
    label: 'Excluido',
    classes: 'bg-[hsl(0_72%_51%/0.1)] text-[hsl(0,72%,42%)] border-[hsl(0,72%,51%/0.3)]',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  pending: {
    label: 'Pendiente',
    classes: 'bg-[hsl(45_93%_47%/0.12)] text-[hsl(45,80%,30%)] border-[hsl(45,93%,47%/0.4)]',
    icon: <Clock className="w-3 h-3" />,
  },
} as const;

function getStatusConfig(status?: string | null) {
  if (status === 'included') return STATUS_CONFIG.included;
  if (status === 'excluded') return STATUS_CONFIG.excluded;
  return STATUS_CONFIG.pending;
}

/** Format Vancouver citation: Authors. Title. Journal. Year. */
function formatVancouver(ref: ProjectReference): string {
  const parts: string[] = [];
  if (ref.authors) parts.push(ref.authors.trim().replace(/\.$/, '') + '.');
  if (ref.title)   parts.push(ref.title.trim().replace(/\.$/, '') + '.');
  if (ref.journal) parts.push(ref.journal.trim().replace(/\.$/, '') + '.');
  if (ref.year)    parts.push(String(ref.year) + '.');
  return parts.join(' ');
}

function getRelevanceColor(score?: number | null): string {
  if (!score) return 'hsl(var(--muted-foreground))';
  if (score >= 0.8) return 'hsl(142 76% 36%)';
  if (score >= 0.6) return 'hsl(45 80% 38%)';
  return 'hsl(0 72% 51%)';
}

// ── Reference Card ────────────────────────────────────────────────────────────

function ReferenceCard({
  ref: reference,
  isNew,
}: {
  ref: ProjectReference;
  isNew: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = getStatusConfig(reference.inclusion_status);
  const vancouver = formatVancouver(reference);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, backgroundColor: 'hsl(142 76% 36% / 0.08)' }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: isNew
          ? ['hsl(142 76% 36% / 0.12)', 'hsl(142 76% 36% / 0)', 'hsl(var(--card))']
          : 'hsl(var(--card))',
      }}
      transition={{
        duration: 0.45,
        backgroundColor: { duration: 1.6, ease: 'easeOut' },
      }}
      className={cn(
        'rounded-lg border transition-colors group',
        'border-[hsl(var(--border))]',
        isNew && 'ring-1 ring-[hsl(142_76%_36%/0.4)]',
      )}
    >
      {/* ── Card Header ── */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* PMID Badge */}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 mt-0.5"
            aria-label={`Abrir PMID ${reference.pmid} en PubMed`}
          >
            <Badge className="gap-1 font-mono text-[11px] px-2 py-0.5 bg-[hsl(142_76%_36%/0.12)] text-[hsl(142,76%,28%)] border border-[hsl(142_76%_36%/0.4)] hover:bg-[hsl(142_76%_36%/0.22)] transition-colors cursor-pointer">
              <CheckCircle className="w-3 h-3" />
              PMID: {reference.pmid}
              <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70" />
            </Badge>
          </a>

          {/* Inclusion Status Badge */}
          <Badge
            className={cn(
              'shrink-0 mt-0.5 gap-1 text-[10px] border',
              statusCfg.classes,
            )}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </Badge>

          {/* Relevance Score */}
          {reference.relevance_score != null && (
            <span
              className="shrink-0 mt-0.5 text-[10px] font-semibold tabular-nums"
              style={{ color: getRelevanceColor(reference.relevance_score) }}
              title="Puntuación de relevancia (0–1)"
            >
              {Math.round(reference.relevance_score * 100)}% rel.
            </span>
          )}

          {/* Phase badge */}
          {reference.phase_used && (
            <span className="shrink-0 mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent-foreground))] border border-[hsl(var(--accent)/0.25)] font-medium">
              Fase {reference.phase_used}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="mt-3 text-sm font-semibold text-[hsl(var(--foreground))] leading-snug">
          {reference.title}
        </h4>

        {/* Vancouver citation line */}
        <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed italic">
          {vancouver}
        </p>

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[hsl(var(--muted-foreground))]">
          {reference.authors && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {reference.authors.split(',').slice(0, 2).join(',').trim()}
              {reference.authors.split(',').length > 2 && ' et al.'}
            </span>
          )}
          {reference.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {reference.year}
            </span>
          )}
          {reference.journal && (
            <span className="flex items-center gap-1">
              <Microscope className="w-3 h-3" />
              {reference.journal}
            </span>
          )}
        </div>

        {/* Exclusion reason */}
        {reference.exclusion_reason && (
          <p className="mt-2 text-[11px] text-[hsl(0,72%,42%)] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {reference.exclusion_reason}
          </p>
        )}

        {/* Abstract toggle */}
        {reference.abstract && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[11px] text-[hsl(var(--primary))] hover:underline underline-offset-2 font-medium"
          >
            {expanded ? 'Ocultar abstract ↑' : 'Ver abstract ↓'}
          </button>
        )}
      </div>

      {/* Abstract panel */}
      <AnimatePresence>
        {expanded && reference.abstract && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[hsl(var(--border))]">
              <p className="pt-3 text-xs text-[hsl(var(--foreground))] leading-relaxed">
                {reference.abstract}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────

function EvidenceSkeleton() {
  return (
    <div className="space-y-3" aria-label="Cargando referencias...">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12 }}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3"
        >
          <div className="flex gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </motion.div>
      ))}
      <div className="flex items-center gap-2 pt-1 text-xs text-[hsl(var(--muted-foreground))] animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin" />
        Agente buscando artículos en PubMed...
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function EvidenceLibrary({
  projectId,
  currentPhase = 0,
  isExecuting = false,
  className,
}: EvidenceLibraryProps) {
  const [references, setReferences] = useState<ProjectReference[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<InclusionFilter>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const newIdTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Mark a reference as "new" for 2.5s then remove highlight ──────────────
  const markAsNew = useCallback((id: string) => {
    setNewIds((prev) => new Set(prev).add(id));
    const existing = newIdTimers.current.get(id);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      newIdTimers.current.delete(id);
    }, 2500);
    newIdTimers.current.set(id, timer);
  }, []);

  // ── Initial fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);

    supabase
      .from('project_references')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setReferences(data as ProjectReference[]);
        }
        setIsLoading(false);
      });
  }, [projectId]);

  // ── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    channelRef.current = supabase
      .channel(`evidence_library_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_references',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newRef = payload.new as ProjectReference;
          setReferences((prev) => {
            // Avoid duplicates
            if (prev.some((r) => r.id === newRef.id)) return prev;
            return [...prev, newRef];
          });
          markAsNew(newRef.id);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_references',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const updated = payload.new as ProjectReference;
          setReferences((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r)),
          );
          markAsNew(updated.id);
        },
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Clear all highlight timers
      newIdTimers.current.forEach((t) => clearTimeout(t));
      newIdTimers.current.clear();
    };
  }, [projectId, markAsNew]);

  // ── Derived: filtered list ────────────────────────────────────────────────
  const filtered = references.filter((r) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending'  && (!r.inclusion_status || r.inclusion_status === 'pending')) ||
      (filter === 'included' && r.inclusion_status === 'included') ||
      (filter === 'excluded' && r.inclusion_status === 'excluded');

    if (!matchesFilter) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    return (
      r.title?.toLowerCase().includes(q) ||
      r.authors?.toLowerCase().includes(q) ||
      r.journal?.toLowerCase().includes(q) ||
      r.pmid?.includes(q)
    );
  });

  // Stats
  const stats = {
    total:    references.length,
    included: references.filter((r) => r.inclusion_status === 'included').length,
    excluded: references.filter((r) => r.inclusion_status === 'excluded').length,
    pending:  references.filter((r) => !r.inclusion_status || r.inclusion_status === 'pending').length,
  };

  // ── Empty + loading state for phase 7 ────────────────────────────────────
  const showSkeleton =
    isLoading || (references.length === 0 && currentPhase === 7 && isExecuting);

  if (showSkeleton) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">
            Biblioteca de Evidencia
          </h3>
        </div>
        <EvidenceSkeleton />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-semibold text-[hsl(var(--primary))]">
            Biblioteca de Evidencia
          </h3>
          {isExecuting && (
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Actualizando…
            </span>
          )}
        </div>

        {/* Stats pills */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
              filter === 'all'
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                : 'bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)]',
            )}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilter('included')}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
              filter === 'included'
                ? 'bg-[hsl(142_76%_36%)] text-white border-[hsl(142,76%,36%)]'
                : 'bg-[hsl(142_76%_36%/0.1)] text-[hsl(142,76%,28%)] border-[hsl(142_76%_36%/0.3)] hover:bg-[hsl(142_76%_36%/0.2)]',
            )}
          >
            ✓ Incluidos ({stats.included})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
              filter === 'pending'
                ? 'bg-[hsl(45_93%_47%)] text-[hsl(210,11%,15%)] border-[hsl(45,93%,47%)]'
                : 'bg-[hsl(45_93%_47%/0.1)] text-[hsl(45,80%,30%)] border-[hsl(45_93%_47%/0.3)] hover:bg-[hsl(45_93%_47%/0.2)]',
            )}
          >
            ⏳ Pendientes ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('excluded')}
            className={cn(
              'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
              filter === 'excluded'
                ? 'bg-[hsl(0_72%_51%)] text-white border-[hsl(0,72%,51%)]'
                : 'bg-[hsl(0_72%_51%/0.1)] text-[hsl(0,72%,42%)] border-[hsl(0_72%_51%/0.3)] hover:bg-[hsl(0_72%_51%/0.2)]',
            )}
          >
            ✗ Excluidos ({stats.excluded})
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, autores, revista o PMID…"
          className="pl-8 h-8 text-xs bg-[hsl(var(--card))] border-[hsl(var(--border))]"
        />
      </div>

      {/* ── Reference list ── */}
      {filtered.length === 0 && !showSkeleton ? (
        <div className="py-10 flex flex-col items-center gap-3 text-center text-[hsl(var(--muted-foreground))]">
          <BookOpen className="w-8 h-8 opacity-30" />
          <p className="text-sm">
            {references.length === 0
              ? 'Sin referencias aún — el agente está buscando en PubMed.'
              : 'Sin resultados para el filtro activo.'}
          </p>
          {references.length === 0 && currentPhase === 7 && !isExecuting && (
            <p className="text-xs opacity-60">
              Los artículos aparecerán aquí en tiempo real cuando el Agente 7 los encuentre.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {filtered.map((ref) => (
              <ReferenceCard
                key={ref.id}
                ref={ref}
                isNew={newIds.has(ref.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer summary ── */}
      {references.length > 0 && (
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-right">
          {stats.included}/{stats.total} referencias incluidas · Formato Vancouver · Validación PMID ✓
        </p>
      )}
    </div>
  );
}
