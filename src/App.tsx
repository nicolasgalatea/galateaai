import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WaitingList from "./pages/WaitingList";
import Demo from "./pages/Demo";
import ChatSofia from "./pages/ChatSofia";
import CreatorStudio from "./pages/CreatorStudio";
import AdvancedCreator from "./pages/AdvancedCreator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/waitlist" element={<WaitingList />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/chat-sofia" element={<ChatSofia />} />
            <Route 
              path="/creator-studio" 
              element={
                <ProtectedRoute>
                  <CreatorStudio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/advanced-creator" 
              element={
                <ProtectedRoute>
                  <AdvancedCreator />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
