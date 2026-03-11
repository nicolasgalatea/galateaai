import { useState, Fragment, type MouseEvent as ReactMouseEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Edit3, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useReferencesContext } from '@/contexts/ReferencesContext';

/**
 * Clickable citation badge [N] — opens reference tooltip on click.
 */
function CitationBadge({ citationKey }: { citationKey: number }) {
  const refsCtx = useReferencesContext();
  const hasRef = !!refsCtx.getReference(citationKey);

  const handleClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    refsCtx.showReferenceTooltip(citationKey, rect);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center px-1 py-0 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
        hasRef
          ? 'bg-[#00BCFF]/15 text-[#00BCFF] hover:bg-[#00BCFF]/25'
          : 'bg-gray-200 text-gray-500 cursor-default'
      }`}
      title={hasRef ? `Ver referencia [${citationKey}]` : `Referencia [${citationKey}] no encontrada`}
    >
      [{citationKey}]
    </button>
  );
}

/** Replaces [N] in text children with clickable CitationBadge components. */
function processChildrenWithCitations(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') {
    const parts = children.split(/(\[\d+\])/g);
    if (parts.length === 1) return children;
    return (
      <>
        {parts.map((part, i) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) return <CitationBadge key={i} citationKey={parseInt(match[1], 10)} />;
          return <Fragment key={i}>{part}</Fragment>;
        })}
      </>
    );
  }
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <Fragment key={i}>{processChildrenWithCitations(child)}</Fragment>
    ));
  }
  return children;
}

interface EditableRichFieldProps {
  label: string;
  value: string;
  fieldKey: string;
  phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  onLocalChange: () => void;
}

function EditableRichField({ label, value, fieldKey, phaseKey, onSave, onLocalChange }: EditableRichFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    await onSave(phaseKey, fieldKey, editValue);
    setEditing(false);
    onLocalChange();
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-primary">{label}</label>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
          placeholder={`Escribe ${label.toLowerCase()} en Markdown...`}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="gap-1">
            <Save className="w-3 h-3" /> Guardar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditValue(value); }}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-primary">{label}</label>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2"
          onClick={() => setEditing(true)}
        >
          <Edit3 className="w-3 h-3 mr-1" /> Editar
        </Button>
      </div>
      {value ? (
        <div className="prose prose-sm max-w-none text-foreground">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 leading-relaxed">{processChildrenWithCitations(children)}</p>,
              li: ({ children }) => <li>{processChildrenWithCitations(children)}</li>,
            }}
          >{value}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">Sin datos — esperando respuesta de la IA.</p>
      )}
    </div>
  );
}

// ── PICO Table (Phase 3) ──
function PICOTable({
  pico,
  phaseKey,
  onSave,
  onLocalChange,
}: {
  pico: Record<string, string>;
  phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  onLocalChange: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const rows = [
    { key: 'population', label: 'Población (P)', icon: '👥' },
    { key: 'intervention', label: 'Intervención (I)', icon: '💊' },
    { key: 'comparison', label: 'Comparación (C)', icon: '⚖️' },
    { key: 'outcome', label: 'Desenlace (O)', icon: '🎯' },
    { key: 'time', label: 'Tiempo (T)', icon: '⏱️' },
  ];

  const handleSave = async (key: string) => {
    await onSave(phaseKey, `pico_${key}`, editValue);
    setEditing(null);
    onLocalChange();
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
        📋 Tabla PICOT Interactiva
      </h4>
      <div className="border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5">
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-40 font-semibold">Componente</TableHead>
              <TableHead className="font-semibold">Descripción</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableCell className="text-center text-lg">{row.icon}</TableCell>
                <TableCell className="font-medium text-sm">{row.label}</TableCell>
                <TableCell>
                  {editing === row.key ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button size="sm" className="h-8 px-2" onClick={() => handleSave(row.key)}>
                        <Save className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm">{pico[row.key] || '—'}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editing !== row.key && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => { setEditing(row.key); setEditValue(pico[row.key] || ''); }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Main Phase 1-3 Renderer ──
export default function PhaseDefinition({
  phaseNumber,
  data,
  userEdits,
  phaseKey,
  onSave,
  onLocalChange,
}: {
  phaseNumber: number;
  data: Record<string, unknown>;
  userEdits: Record<string, unknown>;
  phaseKey: string;
  onSave: (phaseKey: string, field: string, value: unknown) => Promise<void>;
  onLocalChange: () => void;
}) {
  const merged = { ...data, ...userEdits };

  // Phase 3: PICOT table
  if (phaseNumber === 3) {
    const pico: Record<string, string> = {
      population: (merged.pico_population || merged.population || '') as string,
      intervention: (merged.pico_intervention || merged.intervention || '') as string,
      comparison: (merged.pico_comparison || merged.comparison || '') as string,
      outcome: (merged.pico_outcome || merged.outcome || '') as string,
      time: (merged.pico_time || merged.time || '') as string,
    };

    return (
      <div className="space-y-6">
        <PICOTable pico={pico} phaseKey={phaseKey} onSave={onSave} onLocalChange={onLocalChange} />
        <EditableRichField
          label="Hipótesis"
          value={(merged.hypothesis || merged.hipotesis || '') as string}
          fieldKey="hypothesis"
          phaseKey={phaseKey}
          onSave={onSave}
          onLocalChange={onLocalChange}
        />
        <EditableRichField
          label="Notas del Investigador"
          value={(merged.notes || '') as string}
          fieldKey="notes"
          phaseKey={phaseKey}
          onSave={onSave}
          onLocalChange={onLocalChange}
        />
      </div>
    );
  }

  // Check if PICOT fields exist in phase 1 data (from n8n output)
  const hasPICOT = phaseNumber === 1 && (
    merged.population || merged.intervention || merged.comparison || merged.outcome ||
    merged.Población || merged.Intervención || merged.Comparación || merged.Outcome ||
    merged.P || merged.I || merged.C || merged.O
  );

  if (hasPICOT) {
    const pico: Record<string, string> = {
      population: (merged.population || merged.Población || merged.P || '') as string,
      intervention: (merged.intervention || merged.Intervención || merged.I || '') as string,
      comparison: (merged.comparison || merged.Comparación || merged.C || '') as string,
      outcome: (merged.outcome || merged.Outcome || merged.O || '') as string,
      time: (merged.time || merged.Tiempo || merged.T || '') as string,
    };

    return (
      <div className="space-y-6">
        {merged.research_question && (
          <EditableRichField
            label="Pregunta de Investigación"
            value={(merged.research_question || '') as string}
            fieldKey="research_question"
            phaseKey={phaseKey}
            onSave={onSave}
            onLocalChange={onLocalChange}
          />
        )}
        <PICOTable pico={pico} phaseKey={phaseKey} onSave={onSave} onLocalChange={onLocalChange} />
        {(merged.problem || merged.justification) && (
          <>
            <EditableRichField
              label="Problema Clínico"
              value={(merged.problem || '') as string}
              fieldKey="problem"
              phaseKey={phaseKey}
              onSave={onSave}
              onLocalChange={onLocalChange}
            />
            <EditableRichField
              label="Justificación"
              value={(merged.justification || '') as string}
              fieldKey="justification"
              phaseKey={phaseKey}
              onSave={onSave}
              onLocalChange={onLocalChange}
            />
          </>
        )}
        <EditableRichField
          label="Notas del Investigador"
          value={(merged.notes || '') as string}
          fieldKey="notes"
          phaseKey={phaseKey}
          onSave={onSave}
          onLocalChange={onLocalChange}
        />
      </div>
    );
  }

  // Phase 1-2: Rich text fields
  const fieldMap: Record<number, { key: string; label: string }[]> = {
    1: [
      { key: 'research_question', label: 'Pregunta de Investigación' },
      { key: 'problem', label: 'Problema Clínico' },
      { key: 'justification', label: 'Justificación' },
    ],
    2: [
      { key: 'research_question', label: 'Pregunta Estructurada' },
      { key: 'background', label: 'Contexto' },
      { key: 'gap_analysis', label: 'Gap en la Literatura' },
    ],
  };

  const fields = fieldMap[phaseNumber] || [
    { key: 'content', label: 'Contenido' },
  ];

  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <EditableRichField
          key={f.key}
          label={f.label}
          value={(merged[f.key] || '') as string}
          fieldKey={f.key}
          phaseKey={phaseKey}
          onSave={onSave}
          onLocalChange={onLocalChange}
        />
      ))}
      <EditableRichField
        label="Notas del Investigador"
        value={(merged.notes || '') as string}
        fieldKey="notes"
        phaseKey={phaseKey}
        onSave={onSave}
        onLocalChange={onLocalChange}
      />
    </div>
  );
}
