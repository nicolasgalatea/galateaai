import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ReferencesProvider } from "./contexts/ReferencesContext";
import NewHome from "./pages/NewHome";
import Agents from "./pages/Agents";
import AgentAorta from "./pages/AgentAorta";
import AgentOjos from "./pages/AgentOjos";
import AgentClinicalDictation from "./pages/AgentClinicalDictation";
import AgentCompliance from "./pages/AgentCompliance";
import AgentSurgicalNotes from "./pages/AgentSurgicalNotes";
import AgentResearch from "./pages/AgentResearch";
import AgentCoding from "./pages/AgentCoding";
import AgentAdministration from "./pages/AgentAdministration";
import AgentConsent from "./pages/AgentConsent";
import AgentSummary from "./pages/AgentSummary";
import AgentLegalReview from "./pages/AgentLegalReview";
import AgentProtocolReview from "./pages/AgentProtocolReview";
import AgentSurgicalProtocols from "./pages/AgentSurgicalProtocols";
import AgentLogbook from "./pages/AgentLogbook";
import AgentBilling from "./pages/AgentBilling";
import AgentRIPS from "./pages/AgentRIPS";
import CustomAgent from "./pages/CustomAgent";
import About from "./pages/About";
import Team from "./pages/Team";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import MethodologyDiagnosis from "./pages/MethodologyDiagnosis";
import MethodologyIntegration from "./pages/MethodologyIntegration";
import MethodologyDeployment from "./pages/MethodologyDeployment";
import MethodologyControl from "./pages/MethodologyControl";
import ResearchFlow from "./pages/ResearchFlow";
import ClinicalNavigator from "./pages/ClinicalNavigator";
import ResearchLab from "./pages/ResearchLab";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <ReferencesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NewHome />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/agent/aorta" element={<AgentAorta />} />
            <Route path="/agent/ojos" element={<AgentOjos />} />
            <Route path="/agent/clinical-dictation" element={<AgentClinicalDictation />} />
            <Route path="/agent/compliance" element={<AgentCompliance />} />
            <Route path="/agent/surgical-notes" element={<AgentSurgicalNotes />} />
            <Route path="/agent/research" element={<AgentResearch />} />
            <Route path="/agent/coding" element={<AgentCoding />} />
            <Route path="/agent/administration" element={<AgentAdministration />} />
            <Route path="/agent/consent" element={<AgentConsent />} />
            <Route path="/agent/summary" element={<AgentSummary />} />
            <Route path="/agent/legal-review" element={<AgentLegalReview />} />
            <Route path="/agent/protocol-review" element={<AgentProtocolReview />} />
            <Route path="/agent/surgical-protocols" element={<AgentSurgicalProtocols />} />
            <Route path="/agent/logbook" element={<AgentLogbook />} />
            <Route path="/agent/billing" element={<AgentBilling />} />
            <Route path="/agent/rips" element={<AgentRIPS />} />
            <Route path="/custom-agent" element={<CustomAgent />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/methodology/diagnosis" element={<MethodologyDiagnosis />} />
            <Route path="/methodology/integration" element={<MethodologyIntegration />} />
            <Route path="/methodology/deployment" element={<MethodologyDeployment />} />
            <Route path="/methodology/control" element={<MethodologyControl />} />
            {/* Research Flow - Sistema de 14 Agentes */}
            <Route path="/research/new" element={<ResearchFlow />} />
            <Route path="/research/:projectId" element={<ResearchFlow />} />
            <Route path="/agent/clinical-navigator" element={<ClinicalNavigator />} />
            <Route path="/research-lab" element={<ResearchLab />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ReferencesProvider>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
