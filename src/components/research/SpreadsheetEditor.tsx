import { useState, useCallback } from 'react';
import { Plus, Trash2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpreadsheetEditorProps {
  /** Column headers */
  columns: string[];
  /** Initial data: array of row objects keyed by column name */
  initialData: Record<string, string>[];
  /** Called when data changes */
  onSave: (data: Record<string, string>[]) => void;
  /** Title for the spreadsheet */
  title: string;
  /** Allow adding/removing rows */
  editable?: boolean;
}

export function SpreadsheetEditor({
  columns,
  initialData,
  onSave,
  title,
  editable = true,
}: SpreadsheetEditorProps) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    initialData.length > 0 ? initialData : [Object.fromEntries(columns.map((c) => [c, '']))],
  );
  const [isDirty, setIsDirty] = useState(false);

  const updateCell = useCallback((rowIdx: number, col: string, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[rowIdx] = { ...next[rowIdx], [col]: value };
      return next;
    });
    setIsDirty(true);
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, Object.fromEntries(columns.map((c) => [c, '']))]);
    setIsDirty(true);
  }, [columns]);

  const removeRow = useCallback((idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  }, []);

  const handleSave = () => {
    onSave(rows);
    setIsDirty(false);
  };

  const handleExportCSV = () => {
    const header = columns.join(',');
    const body = rows.map((r) => columns.map((c) => `"${(r[c] || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00D395] shadow-[0_0_8px_rgba(0,211,149,0.5)]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            {title}
          </span>
          <span className="text-[10px] text-[#484F58]">{rows.length} filas</span>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-[#00D395] hover:bg-[#00B880] text-[#0D1117] text-xs h-7"
            >
              <Save className="w-3 h-3 mr-1" />
              Guardar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="border-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] text-xs h-7"
          >
            <Download className="w-3 h-3 mr-1" />
            Excel/CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#21262D] bg-[#161B22]">
              <th className="w-8 px-2 py-2 text-center text-[10px] text-[#484F58]">#</th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              {editable && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-[#21262D] hover:bg-[#161B22] transition-colors"
              >
                <td className="px-2 py-1 text-center text-[10px] font-mono text-[#484F58]">
                  {rowIdx + 1}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-1 py-1">
                    <input
                      type="text"
                      value={row[col] || ''}
                      onChange={(e) => updateCell(rowIdx, col, e.target.value)}
                      className="w-full px-2 py-1 rounded bg-transparent text-[#E6EDF3] text-xs
                        border border-transparent focus:border-[#A78BFA]/50 focus:bg-[#161B22]
                        outline-none transition-colors placeholder:text-[#484F58]"
                      placeholder="..."
                      readOnly={!editable}
                    />
                  </td>
                ))}
                {editable && (
                  <td className="px-1 py-1">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIdx)}
                      className="p-1 rounded text-[#484F58] hover:text-[#FF4757] hover:bg-[#FF4757]/10 transition-colors"
                      title="Eliminar fila"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      {editable && (
        <div className="px-4 py-2 border-t border-[#21262D]">
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1 text-[10px] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
          >
            <Plus className="w-3 h-3" />
            Agregar fila
          </button>
        </div>
      )}
    </div>
  );
}
