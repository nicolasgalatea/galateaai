import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ExternalLink, Search, X, AlertTriangle } from 'lucide-react';
import type { ProjectReference } from '@/types/domain';

interface ReferencesPanelProps {
  references: ProjectReference[];
  onInsertCitation: (citationKey: number) => void;
  /** Citation keys that are in the bibliography but not cited in the text */
  uncitedKeys?: Set<number>;
}

type FilterMode = 'all' | 'year' | 'journal';

export function ReferencesPanel({ references, onInsertCitation, uncitedKeys }: ReferencesPanelProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = useMemo(() => {
    if (filterMode === 'all' || !filterQuery.trim()) return references;

    const q = filterQuery.trim().toLowerCase();

    if (filterMode === 'year') {
      return references.filter((r) => r.year != null && String(r.year).includes(q));
    }

    // journal
    return references.filter(
      (r) => r.journal != null && r.journal.toLowerCase().includes(q),
    );
  }, [references, filterMode, filterQuery]);

  // Collect unique years and journals for quick-pick
  const uniqueYears = useMemo(
    () => [...new Set(references.map((r) => r.year).filter((y): y is number => y != null))].sort((a, b) => b - a),
    [references],
  );

  const uniqueJournals = useMemo(
    () => [...new Set(references.map((r) => r.journal).filter((j): j is string => j != null))].sort(),
    [references],
  );

  const clearFilter = () => {
    setFilterMode('all');
    setFilterQuery('');
  };

  if (references.length === 0) {
    return (
      <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4 h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Referencias
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-[#484F58]">
          <BookOpen className="w-8 h-8 mb-3" />
          <p className="text-sm text-center">
            Las referencias apareceran aqui cuando el agente las identifique
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#A78BFA] shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Referencias
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22]">
          <span className="text-[10px] text-[#8B949E]">
            {filtered.length === references.length ? 'TOTAL:' : `${filtered.length}/`}
          </span>
          <span className="text-sm font-bold font-mono text-[#E6EDF3]">{references.length}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-3 py-2 border-b border-[#21262D] space-y-2">
        {/* Mode toggle */}
        <div className="flex items-center gap-1">
          {(['all', 'year', 'journal'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setFilterMode(mode);
                setFilterQuery('');
              }}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                filterMode === mode
                  ? 'bg-[#A78BFA]/20 text-[#A78BFA]'
                  : 'text-[#484F58] hover:text-[#8B949E] hover:bg-[#161B22]'
              }`}
            >
              {mode === 'all' ? 'Todos' : mode === 'year' ? 'Ano' : 'Revista'}
            </button>
          ))}
        </div>

        {/* Search input (shown when filtering by year or journal) */}
        {filterMode !== 'all' && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#484F58]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={filterMode === 'year' ? 'Buscar por ano...' : 'Buscar por revista...'}
              className="w-full pl-7 pr-7 py-1.5 rounded bg-[#161B22] border border-[#21262D] text-[11px] text-[#E6EDF3] placeholder:text-[#484F58] outline-none focus:border-[#A78BFA]/50"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={clearFilter}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#484F58] hover:text-[#8B949E]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Quick-pick chips */}
        {filterMode === 'year' && !filterQuery && uniqueYears.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {uniqueYears.slice(0, 8).map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setFilterQuery(String(year))}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {filterMode === 'journal' && !filterQuery && uniqueJournals.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-[60px] overflow-hidden">
            {uniqueJournals.slice(0, 6).map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setFilterQuery(j)}
                className="px-2 py-0.5 rounded text-[10px] bg-[#161B22] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors truncate max-w-[150px]"
              >
                {j}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reference list */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-[#484F58]">
              <Search className="w-5 h-5 mb-2" />
              <p className="text-[11px]">Sin resultados para este filtro</p>
            </div>
          ) : (
            filtered.map((ref) => {
              const isUncited = uncitedKeys?.has(ref.citation_key) ?? false;
              return (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => onInsertCitation(ref.citation_key)}
                  className={`w-full text-left p-3 rounded transition-colors group ${
                    isUncited
                      ? 'bg-[#F7B500]/5 border border-[#F7B500]/20 hover:bg-[#F7B500]/10'
                      : 'bg-[#161B22] hover:bg-[#21262D]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-mono font-bold mt-0.5 shrink-0 ${
                      isUncited ? 'text-[#F7B500]' : 'text-[#00BCFF]'
                    }`}>
                      [{ref.citation_key}]
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#E6EDF3] font-medium leading-snug line-clamp-2">
                        {ref.title}
                      </p>
                      {ref.authors && (
                        <p className="text-[10px] text-[#8B949E] mt-1 truncate">{ref.authors}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {isUncited && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#F7B500]/10 text-[#F7B500]">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Sin citar
                          </span>
                        )}
                        {ref.journal && (
                          <span className="text-[10px] text-[#484F58] italic truncate max-w-[140px]">
                            {ref.journal}
                          </span>
                        )}
                        {ref.year && (
                          <span className="text-[10px] font-mono text-[#484F58]">{ref.year}</span>
                        )}
                        {ref.doi && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00BCFF]/10 text-[#00BCFF]">
                            DOI
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {ref.pmid && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00D395]/10 text-[#00D395]">
                            PMID
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#484F58] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click para insertar [{ref.citation_key}] en el editor
                  </p>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
