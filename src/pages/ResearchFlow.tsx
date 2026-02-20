import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ResearchProjectDashboard } from '@/components/research/ResearchProjectDashboard';
import { useAgentClinicianNavigator } from '@/navigator';
import type { Project } from '@/types/domain';

export function ResearchFlow() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    finerOutput,
    isFinerApproved,
    methodologyData,
    currentResearchLabPhase,
    researchProject,
  } = useAgentClinicianNavigator({
    projectId: projectId || '',
  });

  const handleProjectCreated = (project: Project) => {
    // Navegar a la URL con el ID del proyecto
    navigate(`/research/${project.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="pt-20 pb-12">
        {/* Titulo de la seccion - The Research Lab */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 mb-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">The Research Lab</h1>
            <p className="text-blue-100 mt-2">
              Sistema de 10 fases con 6 agentes maestros: desde la idea hasta el protocolo y la redaccion cientifica
            </p>
          </div>
        </div>

        {/* Dashboard principal */}
        <div className="container mx-auto px-4">
          <ResearchProjectDashboard
            projectId={projectId}
            onProjectCreated={handleProjectCreated}
            finerOutput={finerOutput}
            picoData={methodologyData?.pico_data ?? null}
            currentResearchLabPhase={currentResearchLabPhase}
            isFinerApproved={isFinerApproved}
            researchProject={researchProject}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ResearchFlow;
