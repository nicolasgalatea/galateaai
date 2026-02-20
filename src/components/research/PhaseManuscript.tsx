/**
 * PhaseManuscript — Fase 10
 * Wrapper delgado que delega a ManuscriptEditor (el orquestador real).
 */
import { ManuscriptEditor } from './ManuscriptEditor';

interface PhaseManuscriptProps {
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  projectId?: string;
  onValidate?: () => Promise<void>;
  isSaving?: boolean;
}

export default function PhaseManuscript({
  data,
  userEdits,
  projectId,
}: PhaseManuscriptProps) {
  if (!projectId) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm italic">
          Manuscrito pendiente — se generará al completar todas las fases.
        </p>
      </div>
    );
  }

  // Merge data + userEdits into a single draft object
  const mergedDraft = { ...data, ...userEdits };

  return (
    <ManuscriptEditor
      projectId={projectId}
      manuscriptDraft={mergedDraft}
      currentPhase={10}
    />
  );
}
