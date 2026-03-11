import { useState, useRef, useEffect } from 'react';
import { ExternalLink, X, BookOpen, User, Calendar, FileText } from 'lucide-react';
import type { ProjectReference } from '@/types/domain';

interface ReferenceTooltipProps {
  reference: ProjectReference;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

/**
 * Formatea una referencia en estilo Vancouver.
 * Ej: "García-López A, Martínez B. Título del artículo. Journal Name. 2024;12(3):45-52. doi:10.1234/xyz"
 */
function formatVancouver(ref: ProjectReference): string {
  const parts: string[] = [];
  if (ref.authors) parts.push(ref.authors.replace(/,\s*$/, '') + '.');
  if (ref.title) parts.push(ref.title.replace(/\.\s*$/, '') + '.');
  if (ref.journal) parts.push(ref.journal + '.');
  if (ref.year) parts.push(String(ref.year) + '.');
  if (ref.doi) parts.push(`doi:${ref.doi}`);
  return parts.join(' ');
}

export function ReferenceTooltip({ reference, onClose, anchorRect }: ReferenceTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Position the tooltip relative to the clicked citation
  useEffect(() => {
    if (!anchorRect || !tooltipRef.current) return;
    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;

    // Keep within viewport
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportW - 8) left = viewportW - tooltipRect.width - 8;
    if (top + tooltipRect.height > viewportH - 8) {
      top = anchorRect.top - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  }, [anchorRect]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const doiUrl = reference.doi
    ? reference.doi.startsWith('http')
      ? reference.doi
      : `https://doi.org/${reference.doi}`
    : null;

  const pmidUrl = reference.pmid
    ? `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`
    : null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] w-[380px] rounded-xl border border-[#30363D] bg-[#161B22] shadow-2xl shadow-black/50 animate-in fade-in-0 zoom-in-95 duration-150"
      style={{ top: position.top, left: position.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-[#00BCFF]">
            [{reference.citation_key}]
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Referencia
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-[#484F58] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Title */}
        <div className="flex items-start gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#8B949E] mt-0.5 shrink-0" />
          <p className="text-xs text-[#E6EDF3] font-medium leading-snug">
            {reference.title}
          </p>
        </div>

        {/* Authors */}
        {reference.authors && (
          <div className="flex items-start gap-2">
            <User className="w-3.5 h-3.5 text-[#8B949E] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#8B949E] leading-snug">
              {reference.authors}
            </p>
          </div>
        )}

        {/* Journal + Year */}
        <div className="flex items-center gap-3">
          {reference.journal && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-[#8B949E]" />
              <span className="text-[11px] text-[#8B949E] italic">{reference.journal}</span>
            </div>
          )}
          {reference.year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[#8B949E]" />
              <span className="text-[11px] font-mono text-[#8B949E]">{reference.year}</span>
            </div>
          )}
        </div>

        {/* Vancouver format */}
        <div className="px-3 py-2 rounded-lg bg-[#0D1117] border border-[#21262D]">
          <p className="text-[10px] font-semibold tracking-wider text-[#484F58] uppercase mb-1">
            Formato Vancouver
          </p>
          <p className="text-[11px] text-[#E6EDF3] leading-relaxed">
            {formatVancouver(reference)}
          </p>
        </div>

        {/* DOI & PMID links */}
        <div className="flex items-center gap-2 pt-1">
          {doiUrl && (
            <a
              href={doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium bg-[#00BCFF]/10 text-[#00BCFF] hover:bg-[#00BCFF]/20 transition-colors"
            >
              DOI
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {pmidUrl && (
            <a
              href={pmidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-medium bg-[#00D395]/10 text-[#00D395] hover:bg-[#00D395]/20 transition-colors"
            >
              PubMed
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {!doiUrl && !pmidUrl && (
            <span className="text-[10px] text-[#484F58] italic">
              Sin enlaces externos disponibles
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
