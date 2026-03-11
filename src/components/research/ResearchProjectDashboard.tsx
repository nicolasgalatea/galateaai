import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, FileText } from 'lucide-react';
import { ResearchProgressBar } from './ResearchProgressBar';
import { DashboardHeader } from './DashboardHeader';
import { ApprovalModal } from './ApprovalModal';
import { ResultsRenderer } from './ResultsRenderer';
import { AgentLiveGrid } from './AgentLiveGrid';
import { useResearchProject } from '@/hooks/useResearchProject';
import { useAgentExecution } from '@/hooks/useAgentExecution';
import { getAgentById } from '@/config/researchAgents';
import {
  getResearchLabAgentByPhase,
  type ResearchLabPhaseNumber,
} from '@/config/researchLabAgents';
import { triggerN8N } from '@/services/apiService';
import { FinerAuditView } from './FinerAuditView';
import { ManuscriptEditor } from './ManuscriptEditor';
import { PicotInteractiveTable } from './PicotInteractiveTable';
import { BooleanEquationBlock } from './BooleanEquationBlock';
import { InstitutionalRouteWizard } from './InstitutionalRouteWizard';
import type { Project, FinerOutput, FinerScores, ResearchProject } from '@/types/domain';
import type { PicoData } from '@/navigator';
import type { ApiErrorDetail } from '@/services/apiService';

/**
 * Fallback: extrae FinerOutput directamente del JSONB de researchProject
 * cuando el navigator aun no lo ha procesado.
 */
function extractFinerFromProject(rp: ResearchProject | null | undefined): FinerOutput | null {
  if (!rp?.finer_results) return null;
  const raw = rp.finer_results as Record<string, unknown>;
  const rawScores = raw.finer_scores as Record<string, unknown> | undefined;
  const scores: FinerScores | null = rawScores
    ? {
        feasible: typeof rawScores.feasible === 'number' ? rawScores.feasible : null,
        interesting: typeof rawScores.interesting === 'number' ? rawScores.interesting : null,
        novel: typeof rawScores.novel === 'number' ? rawScores.novel : null,
        ethical: typeof rawScores.ethical === 'number' ? rawScores.ethical : null,
        relevant: typeof rawScores.relevant === 'number' ? rawScores.relevant : null,
      }
    : null;
  return {
    finer_scores: scores,
    aprobado: raw.aprobado === true,
    recomendaciones: (raw.recomendaciones as string) ?? null,
    hipotesis: (raw.hipotesis as string) ?? null,
  };
}

interface ResearchProjectDashboardProps {
  projectId?: string;
  onProjectCreated?: (project: Project) => void;
  finerOutput?: FinerOutput | null;
  picoData?: PicoData | null;
  currentResearchLabPhase?: number;
  isFinerApproved?: boolean;
  researchProject?: ResearchProject | null;
}

export function ResearchProjectDashboard({
  projectId,
  onProjectCreated,
  finerOutput = null,
  picoData = null,
  currentResearchLabPhase = 0,
  isFinerApproved = false,
  researchProject = null,
}: ResearchProjectDashboardProps) {
  const {
    project,
    isLoading: projectLoading,
    createProject,
    updateProject,
    advanceToNextAgent,
    approveProtocol,
  } = useResearchProject(projectId);

  const {
    isExecuting,
    result,
    executeAgent,
  } = useAgentExecution();

  const [researchQuestion, setResearchQuestion] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [currentOutput, setCurrentOutput] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [createError, setCreateError] = useState<ApiErrorDetail | null>(null);

  // ═══════════════════════════════════════════════════════════════════════
  // activeViewPhase — fase que la UI muestra actualmente.
  // Se sincroniza automaticamente con currentResearchLabPhase del navigator.
  // ═══════════════════════════════════════════════════════════════════════
  const [activeViewPhase, setActiveViewPhase] = useState(currentResearchLabPhase);
  const prevPhaseRef = useRef(currentResearchLabPhase);
  const dashboardTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    if (currentResearchLabPhase !== prev) {
      prevPhaseRef.current = currentResearchLabPhase;
      setActiveViewPhase(currentResearchLabPhase);
      setCurrentOutput(null);

      const agent = getResearchLabAgentByPhase(currentResearchLabPhase as ResearchLabPhaseNumber);
      console.log(
        `[Dashboard] Fase cambio de ${prev} a ${currentResearchLabPhase} (${agent?.displayNameEs ?? 'desconocido'})`,
      );

      // Scroll automatico al inicio del Dashboard cuando la fase avanza
      // Especialmente importante en la transicion 0→1 (primer resultado)
      dashboardTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentResearchLabPhase]);

  // Resolver el nombre del agente v2 para el header
  const activeAgent = getResearchLabAgentByPhase(activeViewPhase as ResearchLabPhaseNumber);

  // Actualizar output cuando hay resultado del agente ejecutado manualmente
  useEffect(() => {
    if (result?.output) {
      setCurrentOutput(result.output);
    }
  }, [result]);

  // Mostrar modal de aprobacion cuando llega a AWAITING_APPROVAL
  useEffect(() => {
    if (project?.phase === 'AWAITING_APPROVAL') {
      setShowApprovalModal(true);
    }
  }, [project?.phase]);

  // Crear nuevo proyecto e iniciar flujo en n8n
  const handleCreateProject = async () => {
    if (!projectTitle.trim() || !researchQuestion.trim()) return;

    setCreateError(null);
    const { project: newProject, error } = await createProject({
      title: projectTitle,
      research_question: researchQuestion,
    });

    if (error) {
      setCreateError(error);
      return;
    }

    if (newProject) {
      onProjectCreated?.(newProject);

      // Iniciar flujo centralizado en n8n (Fase 1)
      // Webhook: galatea-protocol-start
      // Payload: { projectId, researchIdea, userId }
      try {
        const response = await triggerN8N({
          phase: 'protocol',
          projectId: newProject.id,
          title: newProject.title,
          research_question: newProject.research_question || researchQuestion,
        });

        if (!response.success) {
          console.warn('Webhook de n8n no respondio correctamente:', response.error);
        } else {
          console.log('Flujo de investigacion iniciado exitosamente en n8n');
          // El estado se sincronizara automaticamente mediante la suscripcion en tiempo real
        }
      } catch (error) {
        console.error('Error al iniciar flujo en n8n:', error);
        // No fallar la creacion del proyecto si el webhook falla
      }
    }
  };

  const handleTestCreateProject = async () => {
    const { project: testProject, error } = await createProject({
      title: 'Bayer Night Test',
      research_question: 'Is this working?',
    });

    console.log('Test createProject result:', testProject);
    if (error) {
      console.warn('Test createProject failed:', error);
      return;
    }
    if (testProject) {
      onProjectCreated?.(testProject);
    }
  };

  // Ejecutar agente actual (solo para casos manuales, normalmente n8n maneja todo)
  const handleExecuteCurrentAgent = async (proj?: Project) => {
    const targetProject = proj || project;
    if (!targetProject) return;

    const agent = getAgentById(targetProject.current_agent_step);
    if (!agent) return;

    // Construir datos de entrada basados en el agente
    const inputData: Record<string, unknown> = {
      research_question: targetProject.research_question,
      chatInput: targetProject.research_question,
    };

    const response = await executeAgent({
      projectId: targetProject.id,
      agentNumber: targetProject.current_agent_step,
      inputData,
    });

    if (response) {
      // Guardar datos estructurados si existen
      if (response.structured_data) {
        await updateProject(response.structured_data);
      }

      // Avanzar al siguiente agente
      await advanceToNextAgent();
    }
  };

  // Aprobar protocolo
  const handleApproveProtocol = async (notes?: string) => {
    await approveProtocol(notes);
    setShowApprovalModal(false);
  };

  // Vista de creacion de proyecto (sin proyecto existente)
  if (!projectId && !project) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Nueva Revision Sistematica
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titulo del Proyecto
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Ej: Efectividad de metformina en prevencion de Alzheimer"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pregunta de Investigacion
              </label>
              <Textarea
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="Describe tu pregunta de investigacion en detalle. El sistema la convertira automaticamente al formato PICOT..."
                className="min-h-[150px]"
              />
            </div>

            {createError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {createError.message}
                {createError.column && (
                  <span className="ml-2 text-red-800">
                    (columna: {createError.column})
                  </span>
                )}
              </div>
            )}

            <Button
              onClick={handleCreateProject}
              disabled={!projectTitle.trim() || !researchQuestion.trim() || projectLoading}
              className="w-full h-12 text-lg bg-[#0091DF] hover:bg-[#007FC4]"
            >
              {projectLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando proyecto...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Generacion de Protocolo
                </>
              )}
            </Button>

            <Button
              onClick={handleTestCreateProject}
              variant="outline"
              className="w-full h-10 text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Test createProject (Bayer Night Test)
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Vista de carga
  if (projectLoading && !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Vista del dashboard principal
  if (!project) return null;

  const currentAgent = getAgentById(project.current_agent_step);
  return (
    <div ref={dashboardTopRef} className="grid grid-cols-12 gap-6 p-6">
      {/* Columna izquierda: Progreso */}
      <div className="col-span-12 lg:col-span-3">
        <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
          <ResearchProgressBar
            currentStep={project.current_agent_step}
            phase={project.phase}
            projectId={project.id}

            researchLabPhase={activeViewPhase}
          />
        </div>
      </div>

      {/* Columna central: Output del agente */}
      <div className="col-span-12 lg:col-span-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <DashboardHeader
            researchProject={researchProject}
            legacyTitle={project.title}
            activeViewPhase={activeViewPhase}
            activeAgent={activeAgent}
            legacyAgentName={currentAgent?.displayNameEs}
            isExecuting={isExecuting}
            currentAgentStep={project.current_agent_step}
            projectPhase={project.phase}
            onExecuteAgent={() => handleExecuteCurrentAgent()}
            onShowApproval={() => setShowApprovalModal(true)}
          />

          <div className="mb-6">
            <AgentLiveGrid
              researchProject={researchProject}
              currentPhase={currentResearchLabPhase}
            />
          </div>

          {/* Output — driven by activeViewPhase (auto-synced with currentResearchLabPhase) */}
          <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[400px] bg-gray-50">
            {/* Manuscript Editor for phases 8-10 */}
            {activeViewPhase >= 8 && activeViewPhase <= 10 ? (
              <ManuscriptEditor
                projectId={project.id}
                manuscriptDraft={researchProject?.manuscript_draft ?? null}
                currentPhase={activeViewPhase}
                projectTitle={researchProject?.title ?? project.title}
                projectCode={researchProject?.project_code ?? ''}
              />
            ) : /* PICOT Interactive Table for phase 3 */
            activeViewPhase === 3 ? (
              <PicotInteractiveTable
                picoData={researchProject?.research_question ?? null}
                readOnly
              />
            ) : /* FINER Audit View for phases 4-5-6 */
            activeViewPhase >= 4 && activeViewPhase <= 6 ? (
              <FinerAuditView
                finerOutput={finerOutput ?? extractFinerFromProject(researchProject)}
                picoData={picoData ?? null}
                currentPhase={activeViewPhase}
                isFinerApproved={isFinerApproved}
              />
            ) : /* Boolean Equation Block for phase 7 */
            activeViewPhase === 7 ? (
              <BooleanEquationBlock
                searchStrategy={researchProject?.search_strategy ?? null}
              />
            ) : /* Default phases 0-2: show research_question output or executing/empty state */
            isExecuting ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600">
                  Ejecutando {activeAgent?.displayNameEs ?? currentAgent?.displayNameEs}...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Tiempo estimado: {activeAgent?.estimatedDuration ?? currentAgent?.estimatedDuration}
                </p>
              </div>
            ) : currentOutput ? (
              <ResultsRenderer content={typeof currentOutput === 'string' ? currentOutput : JSON.stringify(currentOutput, null, 2)} />
            ) : researchProject?.research_question ? (
              <ResultsRenderer content={JSON.stringify(researchProject.research_question, null, 2)} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText className="w-12 h-12 mb-4" />
                <p>Los resultados apareceran aqui</p>
                <p className="text-sm mt-2">
                  n8n esta procesando los agentes en segundo plano...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna derecha: Info y acciones */}
      <div className="col-span-12 lg:col-span-3">
        <div className="space-y-4">
          {/* Institutional Route Wizard — visible from phase 8 onward */}
          {activeViewPhase >= 8 && researchProject && (
            <InstitutionalRouteWizard
              projectCode={researchProject.project_code ?? ''}
              projectTitle={researchProject.title}
              submissionDate={researchProject.submission_date ?? null}
              subdireccionStatus={researchProject.subdireccion_status ?? 'pending'}
              comiteEticaStatus={researchProject.comite_etica_status ?? 'pending'}
              onUpdateSubmissionDate={async (date) => {
                await updateProject({ submission_date: date } as any);
              }}
              onUpdateStatus={async (step, status) => {
                if (step === 'subdireccion') {
                  await updateProject({ subdireccion_status: status } as any);
                } else {
                  await updateProject({ comite_etica_status: status } as any);
                }
              }}
            />
          )}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">Panel de Agentes</h3>
            <p className="text-sm text-gray-600">
              {researchProject?.project_code
                ? `Codigo: ${researchProject.project_code}`
                : 'Generando codigo de proyecto...'}
            </p>
          </div>
        </div>
      </div>

      {/* Modal de aprobacion */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onApprove={handleApproveProtocol}
        projectTitle={project.title}
      />
    </div>
  );
}

export default ResearchProjectDashboard;
