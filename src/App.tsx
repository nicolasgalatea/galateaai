import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ReferencesProvider } from "./contexts/ReferencesContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import NewHome from "./pages/NewHome";
import Auth from "./pages/Auth";
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
      <AuthProvider>
        <TooltipProvider>
          <ReferencesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
           <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<NewHome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/methodology/diagnosis" element={<MethodologyDiagnosis />} />
              <Route path="/methodology/integration" element={<MethodologyIntegration />} />
              <Route path="/methodology/deployment" element={<MethodologyDeployment />} />
              <Route path="/methodology/control" element={<MethodologyControl />} />

              {/* Protected routes — require Supabase Auth session */}
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/agent/aorta" element={<ProtectedRoute><AgentAorta /></ProtectedRoute>} />
              <Route path="/agent/ojos" element={<ProtectedRoute><AgentOjos /></ProtectedRoute>} />
              <Route path="/agent/clinical-dictation" element={<ProtectedRoute><AgentClinicalDictation /></ProtectedRoute>} />
              <Route path="/agent/compliance" element={<ProtectedRoute><AgentCompliance /></ProtectedRoute>} />
              <Route path="/agent/surgical-notes" element={<ProtectedRoute><AgentSurgicalNotes /></ProtectedRoute>} />
              <Route path="/agent/research" element={<ProtectedRoute><AgentResearch /></ProtectedRoute>} />
              <Route path="/agent/coding" element={<ProtectedRoute><AgentCoding /></ProtectedRoute>} />
              <Route path="/agent/administration" element={<ProtectedRoute><AgentAdministration /></ProtectedRoute>} />
              <Route path="/agent/consent" element={<ProtectedRoute><AgentConsent /></ProtectedRoute>} />
              <Route path="/agent/summary" element={<ProtectedRoute><AgentSummary /></ProtectedRoute>} />
              <Route path="/agent/legal-review" element={<ProtectedRoute><AgentLegalReview /></ProtectedRoute>} />
              <Route path="/agent/protocol-review" element={<ProtectedRoute><AgentProtocolReview /></ProtectedRoute>} />
              <Route path="/agent/surgical-protocols" element={<ProtectedRoute><AgentSurgicalProtocols /></ProtectedRoute>} />
              <Route path="/agent/logbook" element={<ProtectedRoute><AgentLogbook /></ProtectedRoute>} />
              <Route path="/agent/billing" element={<ProtectedRoute><AgentBilling /></ProtectedRoute>} />
              <Route path="/agent/rips" element={<ProtectedRoute><AgentRIPS /></ProtectedRoute>} />
              <Route path="/agent/clinical-navigator" element={<ProtectedRoute><ClinicalNavigator /></ProtectedRoute>} />
              <Route path="/custom-agent" element={<ProtectedRoute><CustomAgent /></ProtectedRoute>} />
              <Route path="/research/new" element={<ProtectedRoute><ResearchFlow /></ProtectedRoute>} />
              <Route path="/research/:projectId" element={<ProtectedRoute><ResearchFlow /></ProtectedRoute>} />
              <Route path="/research-lab" element={<ProtectedRoute><ResearchLab /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
           </ErrorBoundary>
          </BrowserRouter>
          </ReferencesProvider>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
