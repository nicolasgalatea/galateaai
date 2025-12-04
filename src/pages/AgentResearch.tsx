import { useState } from 'react';
import { FlaskConical, Plus, Send, Building2, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PastConversation {
  id: string;
  title: string;
  lastPhase: string;
  institution: string;
}

const exampleConversations: PastConversation[] = [
  {
    id: '1',
    title: 'Impact of Omega-3 on Post-MI Recovery',
    lastPhase: 'Protocol Development',
    institution: 'Johns Hopkins University',
  },
  {
    id: '2',
    title: 'Pediatric Asthma Environmental Triggers',
    lastPhase: 'Submission to Internal Review',
    institution: 'Mayo Clinic',
  },
  {
    id: '3',
    title: 'Telemedicine Outcomes in Rural Diabetes Care',
    lastPhase: 'Initial Project Classification',
    institution: 'Stanford School of Medicine',
  },
  {
    id: '4',
    title: 'Efficacy of New Antifungal Agents in ICU Patients',
    lastPhase: 'Ethics Committee Submission',
    institution: 'Cleveland Clinic',
  },
];

export default function AgentResearch() {
  const [conversations] = useState<PastConversation[]>(exampleConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newInstitution, setNewInstitution] = useState('');

  const handleStartNewConversation = () => {
    setSelectedConversation(null);
    setIsStartingNew(true);
    setNewProjectTitle('');
    setNewInstitution('');
  };

  const handleSubmitNewProject = () => {
    if (newProjectTitle.trim() && newInstitution.trim()) {
      // For now, just show the form was submitted
      // Future implementation would create the conversation
      console.log('New project:', { title: newProjectTitle, institution: newInstitution });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-8 px-4 bg-background border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-agent-research flex items-center justify-center text-white shadow-lg">
              <FlaskConical className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Clinical Guideline Navigator
            </h1>
          </div>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            A medical research assistant that helps structure clinical or academic projects through clear phases and institutional requirements.
            <br />
            Designed for clean, scientific UX with a guided workflow.
          </p>
        </div>
      </section>

      {/* Try the Agent Section - ChatGPT-like Interface */}
      <section className="flex-1 py-8 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl h-full">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-agent-research/30 bg-agent-research/10 text-agent-research">
              <FlaskConical className="w-4 h-4" />
              Interactive Workspace
            </span>
            <h2 className="text-2xl font-bold text-foreground mt-3">Try the Agent</h2>
          </div>

          {/* ChatGPT-like Layout */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[600px] flex">
            {/* Left Sidebar - Past Conversations */}
            <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
              {/* New Conversation Button */}
              <div className="p-4 border-b border-border">
                <Button
                  onClick={handleStartNewConversation}
                  className="w-full gap-2 bg-agent-research hover:bg-agent-research/90 text-white"
                >
                  <Plus className="w-4 h-4" />
                  New Research Project
                </Button>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv.id);
                        setIsStartingNew(false);
                      }}
                      className={cn(
                        "w-full text-left p-4 rounded-xl transition-all duration-200 group",
                        "hover:bg-background border border-transparent",
                        selectedConversation === conv.id
                          ? "bg-background border-agent-research/30 shadow-sm"
                          : "hover:border-border"
                      )}
                    >
                      {/* Title - Largest */}
                      <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                        {conv.title}
                      </h3>
                      
                      {/* Phase with Green Circle - Smaller */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <span className="text-emerald-500">🟢</span>
                        <span className="font-medium">{conv.lastPhase}</span>
                      </div>
                      
                      {/* Institution - Smallest */}
                      <p className="text-xs text-muted-foreground/70 truncate">
                        {conv.institution}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Main Panel - Conversation Area */}
            <div className="flex-1 flex flex-col bg-background">
              {!selectedConversation && !isStartingNew ? (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-agent-research/10 flex items-center justify-center mx-auto mb-6">
                      <FlaskConical className="w-10 h-10 text-agent-research" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Welcome to Clinical Guideline Navigator
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start a new research project or select an existing one from the sidebar to continue your work.
                    </p>
                    <Button
                      onClick={handleStartNewConversation}
                      className="gap-2 bg-agent-research hover:bg-agent-research/90 text-white"
                    >
                      <Plus className="w-4 h-4" />
                      Start New Project
                    </Button>
                  </div>
                </div>
              ) : isStartingNew ? (
                /* New Conversation Form */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full max-w-lg">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-agent-research/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-agent-research" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">
                        New Research Project
                      </h3>
                      <p className="text-muted-foreground">
                        Enter the details of your clinical or academic research project
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Project Title Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-agent-research" />
                          Title of the Research Project
                        </label>
                        <Input
                          placeholder="e.g., Impact of Early Mobilization on Post-Surgical Recovery"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          className="h-12 text-base border-border focus:border-agent-research focus:ring-agent-research/20"
                        />
                      </div>

                      {/* Institution Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-agent-research" />
                          Institution (Clinic, Hospital, or University)
                        </label>
                        <Input
                          placeholder="e.g., Harvard Medical School"
                          value={newInstitution}
                          onChange={(e) => setNewInstitution(e.target.value)}
                          className="h-12 text-base border-border focus:border-agent-research focus:ring-agent-research/20"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handleSubmitNewProject}
                        disabled={!newProjectTitle.trim() || !newInstitution.trim()}
                        className="w-full h-12 gap-2 bg-agent-research hover:bg-agent-research/90 text-white disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        Begin Research Guidance
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected Conversation View */
                <div className="flex-1 flex flex-col">
                  {/* Conversation Header */}
                  {selectedConversation && (
                    <div className="p-6 border-b border-border bg-muted/20">
                      {(() => {
                        const conv = conversations.find(c => c.id === selectedConversation);
                        if (!conv) return null;
                        return (
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {conv.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1.5 text-emerald-600">
                                <span>🟢</span>
                                <span className="font-medium">{conv.lastPhase}</span>
                              </span>
                              <span className="text-muted-foreground">
                                {conv.institution}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Conversation Content Placeholder */}
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-muted-foreground">
                      <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Conversation history and guidance will appear here.</p>
                      <p className="text-sm mt-2">The checklist system will be implemented in the next phase.</p>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 h-12 border-border focus:border-agent-research"
                        disabled
                      />
                      <Button
                        className="h-12 px-6 bg-agent-research hover:bg-agent-research/90 text-white"
                        disabled
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
