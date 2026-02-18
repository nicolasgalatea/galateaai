/**
 * ReferencesPanel
 * ───────────────
 * Panel lateral sticky que muestra las referencias bibliográficas del proyecto.
 * Al hacer clic en un artículo, llama a onInsertCitation(text) para insertar
 * la cita en el editor Tiptap.
 * - Filtro de búsqueda
 * - Badge de status (included / pending / excluded)
 * - Formato Vancouver corto para la cita insertada
 * - Animación de highlight al insertar
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, CheckCircle, Clock, AlertCircle, Plus,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectReference } from '@/components/research/EvidenceLibrary';

interface ReferencesPanelProps {
  projectId: string;
  onInsertCitation: (text: string) => void;
}

function getStatusIcon(status?: string | null) {
  if (status === 'included') return <CheckCircle className="w-3 h-3 text-[hsl(142,76%,36%)]" />;
  if (status === 'excluded') return <AlertCircle className="w-3 h-3 text-destructive" />;
  return <Clock className="w-3 h-3 text-[hsl(var(--warning))]" />;
}

/** Vancouver short: Authors. Journal. Year. */
function vancouverShort(ref: ProjectReference): string {
  const authors = ref.authors
    ? ref.authors.split(',').slice(0, 2).join(', ') + (ref.authors.split(',').length > 2 ? ' et al.' : '')
    : 'Anon.';
  return `${authors}. ${ref.journal || ref.title.substring(0, 40)}. ${ref.year ?? ''}`;
}

export default function ReferencesPanel({ projectId, onInsertCitation }: ReferencesPanelProps) {
  const [references, setReferences] = useState<ProjectReference[]>([]);
  const [search, setSearch] = useState('');
  const [justInserted, setJustInserted] = useState<string | null>(null);

  // Load references
  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      const { data } = await supabase
        .from('project_references')
        .select('*')
        .eq('project_id', projectId)
        .neq('inclusion_status', 'excluded')
        .order('created_at', { ascending: false })
        .limit(200);
      if (data) setReferences(data as ProjectReference[]);
    };
    load();

    // Realtime
    const channel = supabase
      .channel(`refs_panel_${projectId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'project_references',
        filter: `project_id=eq.${projectId}`,
      }, () => { load(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  const handleInsert = useCallback((ref: ProjectReference) => {
    const citation = vancouverShort(ref);
    onInsertCitation(citation);
    setJustInserted(ref.id);
    setTimeout(() => setJustInserted(null), 1800);
  }, [onInsertCitation]);

  const filtered = references.filter(r =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.authors || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.journal || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card rounded-t-lg sticky top-0 z-10">
        <BookOpen className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Referencias
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
          {filtered.length}
        </span>
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-border bg-card">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar…"
            className="pl-7 h-7 text-xs bg-background"
          />
        </div>
      </div>

      {/* Hint */}
      <p className="px-3 pt-2 pb-1 text-[10px] text-muted-foreground italic">
        Clic en un artículo para insertar la cita en el editor.
      </p>

      {/* Reference list */}
      <div className="flex-1 overflow-y-auto space-y-1 px-2 pb-4">
        <AnimatePresence initial={false}>
          {filtered.map((ref, idx) => (
            <motion.button
              key={ref.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02, duration: 0.2 }}
              onClick={() => handleInsert(ref)}
              className={cn(
                'w-full text-left p-2.5 rounded-lg border transition-all duration-200 group',
                justInserted === ref.id
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5',
              )}
            >
              {/* Title */}
              <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 mb-1.5">
                {ref.title}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-0.5">
                  {getStatusIcon(ref.inclusion_status)}
                </span>
                {ref.year && (
                  <span className="text-[10px] text-muted-foreground">{ref.year}</span>
                )}
                {ref.journal && (
                  <span className="text-[10px] text-muted-foreground italic truncate max-w-[100px]">
                    {ref.journal}
                  </span>
                )}
                {/* Insert indicator */}
                <span className={cn(
                  'ml-auto flex items-center gap-0.5 text-[10px] font-medium transition-opacity',
                  justInserted === ref.id
                    ? 'text-primary opacity-100'
                    : 'text-muted-foreground opacity-0 group-hover:opacity-100',
                )}>
                  <Plus className="w-2.5 h-2.5" />
                  {justInserted === ref.id ? '¡Insertada!' : 'Insertar'}
                </span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs italic">
              {search ? 'Sin resultados' : 'Las referencias aparecerán al completar la Fase 7.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
