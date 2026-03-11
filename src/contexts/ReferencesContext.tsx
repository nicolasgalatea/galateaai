import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ProjectReference } from '@/types/domain';
import { ReferenceTooltip } from '@/components/research/ReferenceTooltip';

interface ReferencesContextValue {
  /** All references for the current project */
  references: ProjectReference[];
  /** Update the reference list (called by hooks that fetch references) */
  setReferences: (refs: ProjectReference[]) => void;
  /** Lookup a reference by its citation_key number */
  getReference: (citationKey: number) => ProjectReference | undefined;
  /** Show the reference tooltip for a given citation key, anchored to a DOM rect */
  showReferenceTooltip: (citationKey: number, anchorRect: DOMRect) => void;
}

const ReferencesContext = createContext<ReferencesContextValue | null>(null);

export function ReferencesProvider({ children }: { children: React.ReactNode }) {
  const [references, setReferences] = useState<ProjectReference[]>([]);
  const [activeTooltip, setActiveTooltip] = useState<{
    reference: ProjectReference;
    anchorRect: DOMRect;
  } | null>(null);

  const refMap = useMemo(() => {
    const map = new Map<number, ProjectReference>();
    for (const ref of references) {
      map.set(ref.citation_key, ref);
    }
    return map;
  }, [references]);

  const getReference = useCallback(
    (citationKey: number) => refMap.get(citationKey),
    [refMap],
  );

  const showReferenceTooltip = useCallback(
    (citationKey: number, anchorRect: DOMRect) => {
      const ref = refMap.get(citationKey);
      if (ref) {
        setActiveTooltip({ reference: ref, anchorRect });
      }
    },
    [refMap],
  );

  const closeTooltip = useCallback(() => setActiveTooltip(null), []);

  const value = useMemo<ReferencesContextValue>(
    () => ({ references, setReferences, getReference, showReferenceTooltip }),
    [references, setReferences, getReference, showReferenceTooltip],
  );

  return (
    <ReferencesContext.Provider value={value}>
      {children}
      {activeTooltip && (
        <ReferenceTooltip
          reference={activeTooltip.reference}
          anchorRect={activeTooltip.anchorRect}
          onClose={closeTooltip}
        />
      )}
    </ReferencesContext.Provider>
  );
}

export function useReferencesContext() {
  const ctx = useContext(ReferencesContext);
  if (!ctx) {
    throw new Error('useReferencesContext must be used within a ReferencesProvider');
  }
  return ctx;
}
