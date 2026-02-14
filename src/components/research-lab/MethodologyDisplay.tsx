import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface MethodologyDisplayProps {
  data: Record<string, unknown> | null;
  isProcessing: boolean;
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

export function MethodologyDisplay({ data, isProcessing }: MethodologyDisplayProps) {
  if (isProcessing && !data) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-muted-foreground" />
            Fase 2-3 — Tabla PICO
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

  const picoData = (data.pico as Record<string, string>) ?? {};
  const rows: PICORow[] = PICO_LABELS.map((label) => ({
    ...label,
    value: picoData[label.element.toLowerCase()] ?? picoData[label.label.toLowerCase()] ?? '—',
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: 'hsl(207, 60%, 35%)' }}>
            <ClipboardList className="w-5 h-5" />
            Fase 2-3 — Tabla PICO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 font-bold">Elem.</TableHead>
                <TableHead className="w-32">Componente</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.element}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold text-white"
                      style={{ backgroundColor: row.color }}
                    >
                      {row.element}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{row.label}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.value}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>

          {data.methodology_notes && (
            <div className="mt-4 p-3 rounded-md bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Notas metodológicas:</strong> {String(data.methodology_notes)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
