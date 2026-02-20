import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface MethodologyDisplayProps {
  data: Record<string, unknown> | null;
  isProcessing: boolean;
  onApprove?: () => void;
  showApproveButton?: boolean;
}

interface PICORow {
  element: string;
  label: string;
  value: string;
  color: string;
}

const PICO_LABELS: Omit<PICORow, 'value'>[] = [
  { element: 'P', label: 'Población', color: 'hsl(207, 60%, 45%)' },
  { element: 'I', label: 'Intervención', color: 'hsl(160, 50%, 40%)' },
  { element: 'C', label: 'Comparación', color: 'hsl(35, 70%, 50%)' },
  { element: 'O', label: 'Outcome', color: 'hsl(280, 50%, 50%)' },
  { element: 'T', label: 'Tiempo', color: 'hsl(207, 45%, 55%)' },
];

function extractPICOValue(picoData: Record<string, unknown>, element: string, label: string): string {
  // Try multiple key formats from n8n agent output
  const keys = [
    element.toLowerCase(),
    label.toLowerCase(),
    element,
    label,
    // Common n8n output patterns
    `pico_${element.toLowerCase()}`,
  ];
  for (const key of keys) {
    if (picoData[key] && typeof picoData[key] === 'string') return picoData[key] as string;
    if (picoData[key] && typeof picoData[key] === 'object') return JSON.stringify(picoData[key]);
  }
  return '—';
}

export function MethodologyDisplay({ data, isProcessing, onApprove, showApproveButton = false }: MethodologyDisplayProps) {
  if (isProcessing && !data) {
    return (
      <Card className="border border-border bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <ClipboardList className="w-5 h-5" />
            Fase 2-3 — Tabla PICO & Metodología
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'hsl(207, 60%, 45%)' }} />
            Procesando con IA...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // Extract pico_data from multiple possible structures
  const picoData = (data.pico_data ?? data.pico ?? data) as Record<string, unknown>;
  const rows: PICORow[] = PICO_LABELS.map((label) => ({
    ...label,
    value: extractPICOValue(picoData, label.element, label.label),
  }));

  // Extract the final research question
  const preguntaFinal =
    (data.pregunta_final as string) ??
    (data.research_question as string) ??
    (data.final_question as string) ??
    null;

  const methodologyNotes =
    (data.methodology_notes as string) ??
    (data.notas_metodologicas as string) ??
    null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white border border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: 'hsl(207, 60%, 35%)' }}>
            <ClipboardList className="w-5 h-5" />
            Fase 2-3 — Tabla PICO & Metodología
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {/* PICO Table — Medical Paper style */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-14 font-bold text-xs uppercase tracking-wider">Elem.</TableHead>
                  <TableHead className="w-36 font-bold text-xs uppercase tracking-wider">Componente</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <motion.tr
                    key={row.element}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="py-3">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: row.color }}
                      >
                        {row.element}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm py-3">{row.label}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3 leading-relaxed">{row.value}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pregunta Final — highlighted box */}
          {preguntaFinal && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5 p-4 rounded-md border"
              style={{
                backgroundColor: 'hsl(207, 60%, 97%)',
                borderColor: 'hsl(207, 50%, 85%)',
              }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(207, 60%, 40%)' }}>
                Pregunta Final de Investigación
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(207, 60%, 25%)' }}>
                {preguntaFinal}
              </p>
            </motion.div>
          )}

          {/* Methodology Notes */}
          {methodologyNotes && (
            <div className="mt-4 p-3 rounded-md bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Notas metodológicas:</strong> {methodologyNotes}
              </p>
            </div>
          )}

          {/* Approve Button */}
          {showApproveButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-end"
            >
              <Button
                onClick={onApprove}
                className="gap-2"
                style={{ backgroundColor: 'hsl(160, 45%, 35%)', color: 'white' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar Metodología
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
