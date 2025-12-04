import { useState } from 'react';
import { FileSearch, Upload, Cpu, AlertTriangle, Plus, Send, Building2, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles, Play, ArrowRight, ArrowDown, Shield, Zap, DollarSign } from 'lucide-react';

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

const kpiStats = [
  { value: '92%', label: 'Issue Detection' },
  { value: 'ICH-GCP', label: 'Compliant' },
  { value: '70%', label: 'Faster Review' },
];

const workflowSteps = [
  {
    title: 'Protocol Upload',
    description: 'Upload clinical trial protocol document in PDF or Word format.',
    icon: <Upload className="w-6 h-6" />,
  },
  {
    title: 'AI Analysis',
    description: 'AI checks against ICH-GCP, identifies inconsistencies, and validates scientific methodology.',
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    title: 'Audit Report',
    description: 'Generates prioritized findings with specific sections and recommended corrections.',
    icon: <AlertTriangle className="w-6 h-6" />,
  },
];

const techStack = ['ICH-GCP', 'INVIMA', 'FDA Guidelines', 'Protocol AI'];

const integrations = [
  { name: 'Veeva' },
  { name: 'Medidata' },
  { name: 'CTMS' },
  { name: 'REDCap' },
  { name: 'EDC Systems' },
];

export default function AgentProtocolReview() {
  const { toast } = useToast();
  const [conversations] = useState<PastConversation[]>(exampleConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [roiValue, setRoiValue] = useState(25);

  const categoryColor = 'agent-pharma';

  const handleStartNewConversation = () => {
    setSelectedConversation(null);
    setIsStartingNew(true);
    setNewProjectTitle('');
    setNewInstitution('');
  };

  const handleSubmitNewProject = () => {
    if (newProjectTitle.trim() && newInstitution.trim()) {
      toast({
        title: 'Project Started',
        description: `Research project "${newProjectTitle}" has been created.`,
      });
    }
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample clinical protocol...',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO - THE PROMISE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-4 bg-background overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(ellipse 100% 60% at 50% 0%, hsl(var(--${categoryColor})), transparent)`
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: `hsl(var(--${categoryColor}) / 0.3)`,
                background: `hsl(var(--${categoryColor}) / 0.08)`,
                color: `hsl(var(--${categoryColor}))`
              }}
            >
              <Sparkles className="w-4 h-4" />
              Clinical Research
            </div>
          </div>

          {/* Agent Icon */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{
                background: `hsl(var(--${categoryColor}))`,
                boxShadow: `0 20px 40px -15px hsl(var(--${categoryColor}) / 0.4)`
              }}
            >
              <FileSearch className="w-14 h-14" />
            </div>
          </div>

          {/* Title & Value Prop */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Clinical Guideline Navigator
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              A medical research assistant that helps structure clinical or academic projects through clear phases and institutional requirements.
              <br />
              <span className="text-lg">Designed for clean, scientific UX with a guided workflow.</span>
            </p>
          </div>

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-12">
            {kpiStats.map((stat, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div 
                  className="text-2xl md:text-3xl font-bold mb-1"
                  style={{ color: `hsl(var(--${categoryColor}))` }}
                >
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 px-8 text-primary-foreground"
              style={{ background: `hsl(var(--${categoryColor}))` }}
              onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="w-4 h-4" />
              Try Live Demo
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8">
              Request Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: WORKFLOW VISUALIZATION - HOW IT WORKS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Intelligent automation in three simple steps
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative max-w-xl mx-auto">
            <div 
              className="absolute left-6 top-6 bottom-6 w-0.5"
              style={{ background: `linear-gradient(to bottom, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.2))` }}
            />

            <div className="space-y-0">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-6 py-6">
                  <div 
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
                    style={{
                      background: `hsl(var(--${categoryColor}))`,
                      boxShadow: `0 8px 20px -6px hsl(var(--${categoryColor}) / 0.5)`
                    }}
                  >
                    {step.icon || <span className="text-lg">{index + 1}</span>}
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {index < workflowSteps.length - 1 && (
                    <ArrowDown 
                      className="absolute left-[18px] -bottom-3 w-6 h-6 z-20"
                      style={{ color: `hsl(var(--${categoryColor}) / 0.5)` }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4 font-medium">Powered By</p>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground shadow-sm"
                >
                  {tech.includes('HIPAA') && <Shield className="w-4 h-4 text-success" />}
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: INTEGRATION HUB - SEAMLESS CONNECTIVITY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Seamlessly Integrated
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Zero-Friction Integration via API/RPA. No disruption to your core system.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl px-8 py-6 text-center shadow-sm hover:shadow-md hover:border-border/80 transition-all min-w-[140px]"
              >
                <div className="text-lg font-semibold text-foreground">{integration.name}</div>
              </div>
            ))}
            
            <div 
              className="rounded-xl p-5 flex items-center justify-center text-white shadow-lg"
              style={{
                background: `hsl(var(--${categoryColor}))`,
                boxShadow: `0 15px 30px -10px hsl(var(--${categoryColor}) / 0.4)`
              }}
            >
              <FileSearch className="w-10 h-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4: ROI SIMULATOR - THE MONEY
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Calculate Your ROI
            </h2>
            <p className="text-muted-foreground text-lg">
              See the potential savings for your organization
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-base font-medium text-foreground">
                  Protocols Reviewed Per Year
                </label>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: `hsl(var(--${categoryColor}))` }}
                >
                  {roiValue.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[roiValue]}
                onValueChange={(value) => setRoiValue(value[0])}
                min={5}
                max={100}
                step={5}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>5</span>
                <span>100</span>
              </div>
            </div>

            <div 
              className="text-center p-8 rounded-xl border"
              style={{ 
                background: `hsl(var(--${categoryColor}) / 0.05)`,
                borderColor: `hsl(var(--${categoryColor}) / 0.2)`
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  Estimated Annual Savings
                </p>
              </div>
              <p 
                className="text-4xl md:text-5xl font-bold"
                style={{ color: `hsl(var(--${categoryColor}))` }}
              >
                ${(roiValue * 15000).toLocaleString()} USD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5: INTERACTIVE DEMO - CHATGPT-LIKE INTERFACE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="live-demo" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border mb-4"
              style={{
                borderColor: `hsl(var(--${categoryColor}) / 0.3)`,
                background: `hsl(var(--${categoryColor}) / 0.08)`,
                color: `hsl(var(--${categoryColor}))`
              }}
            >
              <Zap className="w-4 h-4" />
              Interactive Workspace
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Try the Agent</h2>
            <p className="text-muted-foreground text-lg">
              Structure your clinical or academic research project with guided phases
            </p>
          </div>

          {/* ChatGPT-like Layout */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[550px] flex">
            {/* Left Sidebar - Past Conversations */}
            <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
              {/* New Conversation Button */}
              <div className="p-4 border-b border-border">
                <Button
                  onClick={handleStartNewConversation}
                  className="w-full gap-2 text-white"
                  style={{ background: `hsl(var(--${categoryColor}))` }}
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
                          ? "bg-background border-border shadow-sm"
                          : "hover:border-border"
                      )}
                      style={selectedConversation === conv.id ? {
                        borderColor: `hsl(var(--${categoryColor}) / 0.3)`
                      } : {}}
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
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                      style={{ background: `hsl(var(--${categoryColor}) / 0.1)` }}
                    >
                      <FileSearch className="w-10 h-10" style={{ color: `hsl(var(--${categoryColor}))` }} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      Welcome to Clinical Guideline Navigator
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Start a new research project or select an existing one from the sidebar to continue your work.
                    </p>
                    <Button
                      onClick={handleStartNewConversation}
                      className="gap-2 text-white"
                      style={{ background: `hsl(var(--${categoryColor}))` }}
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
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: `hsl(var(--${categoryColor}) / 0.1)` }}
                      >
                        <FileText className="w-8 h-8" style={{ color: `hsl(var(--${categoryColor}))` }} />
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
                          <FileText className="w-4 h-4" style={{ color: `hsl(var(--${categoryColor}))` }} />
                          Title of the Research Project
                        </label>
                        <Input
                          placeholder="e.g., Impact of Early Mobilization on Post-Surgical Recovery"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          className="h-12 text-base border-border"
                        />
                      </div>

                      {/* Institution Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Building2 className="w-4 h-4" style={{ color: `hsl(var(--${categoryColor}))` }} />
                          Institution (Clinic, Hospital, or University)
                        </label>
                        <Input
                          placeholder="e.g., Harvard Medical School"
                          value={newInstitution}
                          onChange={(e) => setNewInstitution(e.target.value)}
                          className="h-12 text-base border-border"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handleSubmitNewProject}
                        disabled={!newProjectTitle.trim() || !newInstitution.trim()}
                        className="w-full h-12 gap-2 text-white disabled:opacity-50"
                        style={{ background: `hsl(var(--${categoryColor}))` }}
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
                      <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>Conversation history and guidance will appear here.</p>
                      <p className="text-sm mt-2">The checklist system will be implemented in the next phase.</p>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-border bg-muted/10">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1 h-12 border-border"
                        disabled
                      />
                      <Button
                        className="h-12 px-6 text-white"
                        style={{ background: `hsl(var(--${categoryColor}))` }}
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
