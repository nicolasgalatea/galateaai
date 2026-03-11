import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GanttTask {
  id: string;
  name: string;
  startWeek: number;
  durationWeeks: number;
  color: string;
}

interface GanttChartProps {
  initialTasks: GanttTask[];
  totalWeeks?: number;
  onSave: (tasks: GanttTask[]) => void;
  title?: string;
}

const COLORS = ['#00BCFF', '#A78BFA', '#00D395', '#F7B500', '#FF6B9D', '#FF4757', '#36D399'];

export function GanttChart({
  initialTasks,
  totalWeeks = 24,
  onSave,
  title = 'Cronograma',
}: GanttChartProps) {
  const [tasks, setTasks] = useState<GanttTask[]>(initialTasks);
  const [isDirty, setIsDirty] = useState(false);

  const weeks = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i + 1), [totalWeeks]);

  const addTask = useCallback(() => {
    const newTask: GanttTask = {
      id: crypto.randomUUID(),
      name: `Actividad ${tasks.length + 1}`,
      startWeek: 1,
      durationWeeks: 4,
      color: COLORS[tasks.length % COLORS.length],
    };
    setTasks((prev) => [...prev, newTask]);
    setIsDirty(true);
  }, [tasks.length]);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setIsDirty(true);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<GanttTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    setIsDirty(true);
  }, []);

  const handleSave = () => {
    onSave(tasks);
    setIsDirty(false);
  };

  const handleExportCSV = () => {
    const header = 'Actividad,Semana inicio,Duracion (semanas)';
    const body = tasks.map((t) => `"${t.name}",${t.startWeek},${t.durationWeeks}`).join('\n');
    const csv = header + '\n' + body;
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cronograma.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-[#00BCFF]" />
          <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
            {title}
          </span>
          <span className="text-[10px] text-[#484F58]">{tasks.length} actividades</span>
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
            CSV
          </Button>
        </div>
      </div>

      {/* Gantt grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week header */}
          <div className="flex border-b border-[#21262D]">
            <div className="w-48 shrink-0 px-3 py-2 text-[10px] font-semibold text-[#8B949E] uppercase bg-[#161B22]">
              Actividad
            </div>
            <div className="flex-1 flex">
              {weeks.map((w) => (
                <div
                  key={w}
                  className="flex-1 min-w-[28px] px-0.5 py-2 text-center text-[9px] font-mono text-[#484F58] border-l border-[#21262D]/50 bg-[#161B22]"
                >
                  S{w}
                </div>
              ))}
            </div>
            <div className="w-8 shrink-0 bg-[#161B22]" />
          </div>

          {/* Task rows */}
          {tasks.map((task) => (
            <div key={task.id} className="flex border-b border-[#21262D] hover:bg-[#161B22]/50 group">
              {/* Task name (editable) */}
              <div className="w-48 shrink-0 px-2 py-1.5 flex items-center">
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, { name: e.target.value })}
                  className="w-full px-1 py-0.5 rounded bg-transparent text-[11px] text-[#E6EDF3]
                    border border-transparent focus:border-[#A78BFA]/50 focus:bg-[#161B22]
                    outline-none transition-colors"
                />
              </div>

              {/* Gantt bars */}
              <div className="flex-1 flex relative py-1.5">
                {weeks.map((w) => (
                  <div
                    key={w}
                    className="flex-1 min-w-[28px] border-l border-[#21262D]/20 cursor-pointer"
                    onClick={() => {
                      // Click to set start week
                      updateTask(task.id, { startWeek: w });
                    }}
                  />
                ))}
                {/* Bar overlay */}
                <motion.div
                  layout
                  className="absolute top-1.5 h-[calc(100%-12px)] rounded-md"
                  style={{
                    left: `${((task.startWeek - 1) / totalWeeks) * 100}%`,
                    width: `${(task.durationWeeks / totalWeeks) * 100}%`,
                    backgroundColor: task.color,
                    opacity: 0.8,
                  }}
                >
                  {/* Drag handles for duration */}
                  <div
                    className="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-white/20 rounded-r-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startDuration = task.durationWeeks;
                      const barWidth = (e.currentTarget.parentElement?.parentElement?.clientWidth ?? 800) / totalWeeks;

                      const onMove = (ev: MouseEvent) => {
                        const diff = Math.round((ev.clientX - startX) / barWidth);
                        const newDuration = Math.max(1, Math.min(totalWeeks - task.startWeek + 1, startDuration + diff));
                        updateTask(task.id, { durationWeeks: newDuration });
                      };
                      const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                      };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}
                  />
                  <span className="text-[9px] text-white font-medium px-1 truncate block leading-[22px]">
                    {task.durationWeeks}sem
                  </span>
                </motion.div>
              </div>

              {/* Delete */}
              <div className="w-8 shrink-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="p-1 rounded text-[#484F58] opacity-0 group-hover:opacity-100 hover:text-[#FF4757] hover:bg-[#FF4757]/10 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add task */}
      <div className="px-4 py-2 border-t border-[#21262D]">
        <button
          type="button"
          onClick={addTask}
          className="flex items-center gap-1 text-[10px] text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
        >
          <Plus className="w-3 h-3" />
          Agregar actividad
        </button>
      </div>
    </div>
  );
}
