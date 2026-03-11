import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubmissionTracker } from './SubmissionTracker';

interface InstitutionalRouteWizardProps {
  projectCode: string;
  projectTitle: string;
  /** Date when the submission to Subdireccion was sent (ISO string) */
  submissionDate: string | null;
  /** Status from Subdireccion: pending | corrections | approved */
  subdireccionStatus: string;
  /** Status from Comite de Etica: pending | corrections | approved */
  comiteEticaStatus: string;
  onUpdateSubmissionDate: (date: string) => void;
  onUpdateStatus: (step: 'subdireccion' | 'comite_etica', status: string) => void;
}

type RouteChoice = 'exhaustive' | 'direct' | null;

const STEPS = [
  { id: 'route', label: 'Ruta', icon: Building2 },
  { id: 'submission', label: 'Sometimiento', icon: Send },
  { id: 'subdireccion', label: 'Subdireccion', icon: FileCheck },
  { id: 'comite', label: 'Comite Etica', icon: CheckCircle2 },
  { id: 'redcap', label: 'REDCap', icon: ExternalLink },
] as const;

export function InstitutionalRouteWizard({
  projectCode,
  projectTitle,
  submissionDate,
  subdireccionStatus,
  comiteEticaStatus,
  onUpdateSubmissionDate,
  onUpdateStatus,
}: InstitutionalRouteWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [routeChoice, setRouteChoice] = useState<RouteChoice>(null);

  const handleSendEmail = (to: string, subject: string) => {
    const body = encodeURIComponent(
      `Proyecto: ${projectCode}\nTitulo: ${projectTitle}\n\nAdjunto los documentos del protocolo para revision.`,
    );
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank');
  };

  const handleMarkSubmitted = () => {
    const now = new Date().toISOString();
    onUpdateSubmissionDate(now);
    setCurrentStep(2);
  };

  return (
    <div className="rounded-lg border border-[#21262D] bg-[#0D1117] p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-4 h-4 text-[#A78BFA]" />
        <span className="text-[10px] font-semibold tracking-wider text-[#8B949E] uppercase">
          Ruta Institucional
        </span>
        {projectCode && (
          <span className="ml-auto text-[10px] font-mono text-[#00BCFF] bg-[#00BCFF]/10 px-2 py-0.5 rounded">
            {projectCode}
          </span>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1 mb-6 px-2">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div key={step.id} className="flex items-center gap-1 flex-1">
              <button
                type="button"
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors w-full ${
                  isActive
                    ? 'bg-[#A78BFA]/20 text-[#A78BFA]'
                    : isDone
                      ? 'bg-[#00D395]/10 text-[#00D395]'
                      : 'text-[#484F58]'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[#21262D] shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* STEP 0: Route choice */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[#E6EDF3]">
                ¿Usted quiere una revision exhaustiva con la seccion de investigacion?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRouteChoice('exhaustive')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    routeChoice === 'exhaustive'
                      ? 'border-[#A78BFA] bg-[#A78BFA]/10'
                      : 'border-[#21262D] bg-[#161B22] hover:border-[#30363D]'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 mb-2 ${routeChoice === 'exhaustive' ? 'text-[#A78BFA]' : 'text-[#484F58]'}`} />
                  <p className="text-xs font-semibold text-[#E6EDF3]">SI — Revision Exhaustiva</p>
                  <p className="text-[10px] text-[#8B949E] mt-1">
                    Envia documentos a investigacion.cirugia@fsfb.org.co para revision completa por la seccion de investigacion.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRouteChoice('direct')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    routeChoice === 'direct'
                      ? 'border-[#00BCFF] bg-[#00BCFF]/10'
                      : 'border-[#21262D] bg-[#161B22] hover:border-[#30363D]'
                  }`}
                >
                  <ArrowRight className={`w-5 h-5 mb-2 ${routeChoice === 'direct' ? 'text-[#00BCFF]' : 'text-[#484F58]'}`} />
                  <p className="text-xs font-semibold text-[#E6EDF3]">NO — Envio Directo</p>
                  <p className="text-[10px] text-[#8B949E] mt-1">
                    Envia documentos directamente a la Subdireccion de Estudios Clinicos.
                  </p>
                </button>
              </div>

              {routeChoice === 'exhaustive' && (
                <div className="rounded-lg border border-[#A78BFA]/30 bg-[#A78BFA]/5 p-3">
                  <p className="text-[11px] text-[#A78BFA] mb-2">
                    Se enviara el correo a la seccion de investigacion:
                  </p>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSendEmail(
                        'investigacion.cirugia@fsfb.org.co',
                        `Revision de protocolo — ${projectCode}: ${projectTitle}`,
                      )
                    }
                    className="bg-[#A78BFA] hover:bg-[#9678E6] text-white text-xs"
                  >
                    <Mail className="w-3 h-3 mr-1.5" />
                    Enviar a investigacion.cirugia@fsfb.org.co
                  </Button>
                </div>
              )}

              {routeChoice && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="bg-[#00D395] hover:bg-[#00B880] text-[#0D1117] text-xs"
                  >
                    Continuar <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Submission to Subdireccion */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[#E6EDF3]">
                Paso 6 — Sometimiento a Subdireccion de Estudios Clinicos
              </p>
              <p className="text-[11px] text-[#8B949E]">
                Envia los documentos del protocolo a la Subdireccion. Al confirmar el envio,
                Galatea comenzara a contar los dias de espera.
              </p>

              <Button
                size="sm"
                onClick={() =>
                  handleSendEmail(
                    'subdireccion.estudios@fsfb.org.co',
                    `Sometimiento protocolo — ${projectCode}: ${projectTitle}`,
                  )
                }
                className="bg-[#00BCFF] hover:bg-[#0099D6] text-white text-xs"
              >
                <Mail className="w-3 h-3 mr-1.5" />
                Enviar correo a Subdireccion
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkSubmitted}
                className="ml-2 border-[#00D395] text-[#00D395] hover:bg-[#00D395]/10 text-xs"
              >
                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                Confirmar envio
              </Button>
            </div>
          )}

          {/* STEP 2: Subdireccion response + tracker */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[#E6EDF3]">
                Paso 7 — Respuesta de Subdireccion de Estudios Clinicos
              </p>

              {submissionDate && (
                <SubmissionTracker
                  submissionDate={submissionDate}
                  status={subdireccionStatus}
                  label="Subdireccion de Estudios Clinicos"
                />
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus('subdireccion', 'corrections')}
                  className={`text-xs ${subdireccionStatus === 'corrections' ? 'border-[#F7B500] text-[#F7B500]' : 'border-[#21262D] text-[#8B949E]'}`}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Correcciones solicitadas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onUpdateStatus('subdireccion', 'approved');
                    setCurrentStep(3);
                  }}
                  className={`text-xs ${subdireccionStatus === 'approved' ? 'border-[#00D395] text-[#00D395]' : 'border-[#21262D] text-[#8B949E]'}`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Aprobado
                </Button>
              </div>

              {subdireccionStatus === 'approved' && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                    className="bg-[#00D395] hover:bg-[#00B880] text-[#0D1117] text-xs"
                  >
                    Continuar a Comite de Etica <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Comite de Etica */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[#E6EDF3]">
                Pasos 8-9 — Comite de Etica en Investigacion
              </p>

              {submissionDate && (
                <SubmissionTracker
                  submissionDate={submissionDate}
                  status={comiteEticaStatus}
                  label="Comite de Etica"
                />
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus('comite_etica', 'corrections')}
                  className={`text-xs ${comiteEticaStatus === 'corrections' ? 'border-[#F7B500] text-[#F7B500]' : 'border-[#21262D] text-[#8B949E]'}`}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Correcciones
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onUpdateStatus('comite_etica', 'approved');
                    setCurrentStep(4);
                  }}
                  className={`text-xs ${comiteEticaStatus === 'approved' ? 'border-[#00D395] text-[#00D395]' : 'border-[#21262D] text-[#8B949E]'}`}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Aprobado
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REDCap */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[#E6EDF3]">
                Paso 10 — REDCap
              </p>
              <p className="text-[11px] text-[#8B949E]">
                Conexion con REDCap para la extraccion y diligenciamiento de datos del proyecto.
              </p>

              <div className="rounded-lg border border-[#F7B500]/30 bg-[#F7B500]/5 p-3">
                <p className="text-[11px] text-[#F7B500]">
                  Integracion REDCap disponible en proxima version. Por ahora, accede directamente:
                </p>
                <a
                  href="https://redcap.fsfb.org.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded text-xs font-medium bg-[#F7B500]/10 text-[#F7B500] hover:bg-[#F7B500]/20 transition-colors"
                >
                  Abrir REDCap
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* GrupLAC recommendation */}
              <div className="rounded-lg border border-[#21262D] bg-[#161B22] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-semibold tracking-wider text-[#8B949E] uppercase bg-[#A78BFA]/10 text-[#A78BFA] px-1.5 py-0.5 rounded">
                    Recomendacion
                  </span>
                </div>
                <p className="text-[11px] text-[#8B949E]">
                  <strong className="text-[#E6EDF3]">GrupLAC y Produccion Cientifica:</strong> Se recomienda registrar
                  este proyecto en GrupLAC y documentar la produccion cientifica resultante. Esto no es un paso
                  obligatorio, sino una sugerencia para la visibilidad del grupo de investigacion.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentStep > 0 && (
        <div className="flex justify-start mt-4 pt-3 border-t border-[#21262D]">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentStep((s) => s - 1)}
            className="text-[#8B949E] hover:text-[#E6EDF3] text-xs"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Paso anterior
          </Button>
        </div>
      )}
    </div>
  );
}
