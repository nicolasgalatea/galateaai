import { useMemo } from 'react';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SubmissionTrackerProps {
  /** ISO date string when the submission was sent */
  submissionDate: string;
  /** Current status: pending | corrections | approved */
  status: string;
  /** Label for the entity (e.g. "Subdireccion de Estudios Clinicos") */
  label: string;
}

export function SubmissionTracker({ submissionDate, status, label }: SubmissionTrackerProps) {
  const { days, hours } = useMemo(() => {
    const sent = new Date(submissionDate).getTime();
    const now = Date.now();
    const diffMs = now - sent;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    return {
      days: Math.floor(totalHours / 24),
      hours: totalHours % 24,
    };
  }, [submissionDate]);

  // Color coding based on days elapsed
  const getBarColor = () => {
    if (status === 'approved') return 'bg-[#00D395]';
    if (status === 'corrections') return 'bg-[#F7B500]';
    if (days > 30) return 'bg-[#FF4757]';
    if (days > 15) return 'bg-[#F7B500]';
    return 'bg-[#00BCFF]';
  };

  const getStatusIcon = () => {
    if (status === 'approved') return <CheckCircle2 className="w-4 h-4 text-[#00D395]" />;
    if (status === 'corrections') return <AlertTriangle className="w-4 h-4 text-[#F7B500]" />;
    return <Clock className="w-4 h-4 text-[#00BCFF]" />;
  };

  const getStatusLabel = () => {
    if (status === 'approved') return 'Aprobado';
    if (status === 'corrections') return 'Correcciones solicitadas';
    return 'En espera de respuesta';
  };

  // Progress bar — 45 calendar days is the typical max
  const progressPct = Math.min((days / 45) * 100, 100);

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs font-medium text-[#E6EDF3]">{label}</span>
        </div>
        <span className="text-[10px] text-[#8B949E]">
          Enviado: {new Date(submissionDate).toLocaleDateString('es-CO')}
        </span>
      </div>

      {/* Days counter */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${
            status === 'approved' ? 'text-[#00D395]' : days > 30 ? 'text-[#FF4757]' : 'text-[#E6EDF3]'
          }`}>
            {days}
          </span>
          <span className="text-[10px] text-[#8B949E]">dias</span>
          {hours > 0 && (
            <>
              <span className="text-sm font-mono text-[#484F58]">{hours}</span>
              <span className="text-[10px] text-[#484F58]">hrs</span>
            </>
          )}
        </div>
        <div className="flex-1">
          <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status label */}
      <div className={`text-[11px] font-medium ${
        status === 'approved'
          ? 'text-[#00D395]'
          : status === 'corrections'
            ? 'text-[#F7B500]'
            : 'text-[#8B949E]'
      }`}>
        {getStatusLabel()}
      </div>
    </div>
  );
}
