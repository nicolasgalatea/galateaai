import { useState, useEffect } from 'react';
import { 
  FileSearch, Upload, Cpu, AlertTriangle, Plus, Send, Building2, FileText,
  Search, ClipboardCheck, Shield, Play, Copy, Check, ChevronRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, ArrowDown, Zap, DollarSign } from 'lucide-react';

interface PastConversation {
  id: string;
  title: string;
  lastPhase: string;
  institution: string;
}

interface AgentMessage {
  id: string;
  agent: 'yadav' | 'cmo' | 'regulatory';
  message: string;
  timestamp: Date;
}

interface SubAgent {
  id: 'yadav' | 'cmo' | 'regulatory';
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  isProcessing: boolean;
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

const milestones = [
  { id: 'picot', label: 'PICOT Definido', completed: false },
  { id: 'search', label: 'Búsqueda Generada', completed: false },
  { id: 'audit', label: 'Protocolo Auditado', completed: false },
  { id: 'report', label: 'Reporte Final', completed: false },
];

const sampleSearchEquations = {
  pubmed: `("Omega-3 Fatty Acids"[MeSH] OR "Fish Oils"[MeSH] OR "Eicosapentaenoic Acid"[MeSH])
AND ("Myocardial Infarction"[MeSH] OR "Acute Coronary Syndrome"[MeSH])
AND ("Recovery of Function"[MeSH] OR "Cardiac Rehabilitation"[MeSH])
AND ("Randomized Controlled Trial"[pt] OR "Clinical Trial"[pt])
Filters: Humans, English, 2019-2025`,
  embase: `('omega 3 fatty acid'/exp OR 'fish oil'/exp OR 'eicosapentaenoic acid'/exp)
AND ('heart infarction'/exp OR 'acute coronary syndrome'/exp)
AND ('convalescence'/exp OR 'cardiac rehabilitation'/exp)
AND [randomized controlled trial]/lim
AND [2019-2025]/py AND [english]/lim`,
  scopus: `TITLE-ABS-KEY(("omega-3" OR "fish oil" OR "EPA" OR "DHA")
AND ("myocardial infarction" OR "heart attack" OR "acute coronary")
AND ("recovery" OR "rehabilitation" OR "outcome"))
AND DOCTYPE(ar) AND PUBYEAR > 2018
AND LANGUAGE(english)`,
};

export default function AgentProtocolReview() {
  const { toast } = useToast();
  const [conversations] = useState<PastConversation[]>(exampleConversations);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isStartingNew, setIsStartingNew] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [roiValue, setRoiValue] = useState(25);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [picotInput, setPicotInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [subAgents, setSubAgents] = useState<SubAgent[]>([
    {
      id: 'yadav',
      name: 'Yadav Search Specialist',
      role: 'Estrategia de búsqueda científica',
      icon: <Search className="w-5 h-5" />,
      color: '#0033A0',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'cmo',
      name: 'CMO Methodology Auditor',
      role: 'Verificación de 16 fases institucionales',
      icon: <ClipboardCheck className="w-5 h-5" />,
      color: '#00A651',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'regulatory',
      name: 'Regulatory & Ethics Scout',
      role: 'ICH-GCP & FDA Compliance',
      icon: <Shield className="w-5 h-5" />,
      color: '#6B21A8',
      isActive: false,
      isProcessing: false,
    },
  ]);

  const categoryColor = 'agent-pharma';
  const bayerBlue = '#0033A0';

  const handleStartNewConversation = () => {
    setSelectedConversation(null);
    setIsStartingNew(true);
    setNewProjectTitle('');
    setNewInstitution('');
    setAgentMessages([]);
    setCompletedMilestones([]);
    setShowSearchResults(false);
    setPicotInput('');
  };

  const handleSubmitNewProject = () => {
    if (newProjectTitle.trim() && newInstitution.trim()) {
      setIsStartingNew(false);
      setSelectedConversation('new');
      toast({
        title: 'Proyecto Iniciado',
        description: `Proyecto de investigación "${newProjectTitle}" ha sido creado.`,
      });
    }
  };

  const handleCopyToClipboard = async (text: string, tab: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Ecuación de búsqueda copiada al portapapeles.',
    });
  };

  const simulateOrchestration = async () => {
    if (!picotInput.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una pregunta PICOT o sube un protocolo.',
        variant: 'destructive',
      });
      return;
    }

    setIsOrchestrating(true);
    setAgentMessages([]);
    setCompletedMilestones([]);
    setShowSearchResults(false);

    // Activate Yadav agent
    setSubAgents(prev => prev.map(a => 
      a.id === 'yadav' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 1500));
    
    setAgentMessages(prev => [...prev, {
      id: '1',
      agent: 'yadav',
      message: 'He analizado la pregunta PICOT y generado la sintaxis de búsqueda para PubMed, Embase y Scopus.',
      timestamp: new Date(),
    }]);
    
    setSubAgents(prev => prev.map(a => 
      a.id === 'yadav' ? { ...a, isProcessing: false } : a
    ));
    setCompletedMilestones(['picot']);
    setShowSearchResults(true);

    await new Promise(r => setTimeout(r, 1000));

    // Activate CMO agent
    setSubAgents(prev => prev.map(a => 
      a.id === 'cmo' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 2000));

    setAgentMessages(prev => [...prev, {
      id: '2',
      agent: 'cmo',
      message: 'Recibido. Validando que la estrategia de búsqueda coincida con el objetivo de la Fase 3 del protocolo institucional. Verificando alineación con las 16 fases metodológicas.',
      timestamp: new Date(),
    }]);

    setSubAgents(prev => prev.map(a => 
      a.id === 'cmo' ? { ...a, isProcessing: false } : a
    ));
    setCompletedMilestones(prev => [...prev, 'search']);

    await new Promise(r => setTimeout(r, 1000));

    // Activate Regulatory agent
    setSubAgents(prev => prev.map(a => 
      a.id === 'regulatory' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 1800));

    setAgentMessages(prev => [...prev, {
      id: '3',
      agent: 'regulatory',
      message: 'Análisis regulatorio completado. El protocolo cumple con ICH-GCP E6(R2) y directrices FDA 21 CFR Part 11. Se identificaron 2 áreas menores que requieren documentación adicional.',
      timestamp: new Date(),
    }]);

    setSubAgents(prev => prev.map(a => 
      a.id === 'regulatory' ? { ...a, isProcessing: false } : a
    ));
    setCompletedMilestones(prev => [...prev, 'audit']);

    await new Promise(r => setTimeout(r, 800));
    setCompletedMilestones(prev => [...prev, 'report']);

    setIsOrchestrating(false);
    toast({
      title: '✅ Orquestación Completada',
      description: 'Todos los agentes han finalizado su análisis.',
    });
  };

  const getAgentInfo = (agentId: 'yadav' | 'cmo' | 'regulatory') => {
    return subAgents.find(a => a.id === agentId)!;
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
          SECTION 5: MULTI-AGENT ORCHESTRATION CENTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="live-demo" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Dynamic Header */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border-2 mb-4"
              style={{
                borderColor: bayerBlue,
                background: `${bayerBlue}10`,
                color: bayerBlue
              }}
            >
              <Zap className="w-4 h-4" />
              Centro de Orquestación
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Orquestador Galatea
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Listo para iniciar auditoría metodológica
            </p>
          </div>

          {/* Sub-Agents Panel */}
          <div className="flex justify-center gap-4 md:gap-6 mb-8 flex-wrap">
            {subAgents.map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 min-w-[140px]",
                  agent.isActive 
                    ? "bg-white shadow-lg scale-105" 
                    : "bg-muted/30 opacity-60"
                )}
                style={{
                  borderColor: agent.isActive ? agent.color : 'transparent',
                  boxShadow: agent.isActive ? `0 8px 30px -8px ${agent.color}40` : 'none'
                }}
              >
                {/* Processing Animation */}
                {agent.isProcessing && (
                  <div 
                    className="absolute inset-0 rounded-2xl animate-pulse"
                    style={{ background: `${agent.color}15` }}
                  />
                )}
                
                {/* Avatar */}
                <div 
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center text-white mb-3 transition-transform",
                    agent.isProcessing && "animate-bounce"
                  )}
                  style={{ background: agent.color }}
                >
                  {agent.icon}
                </div>
                
                {/* Name */}
                <h4 className="font-semibold text-sm text-foreground text-center leading-tight mb-1">
                  {agent.name}
                </h4>
                
                {/* Role */}
                <p className="text-xs text-muted-foreground text-center">
                  {agent.role}
                </p>
                
                {/* Status Indicator */}
                <div className={cn(
                  "mt-2 w-2 h-2 rounded-full",
                  agent.isProcessing 
                    ? "animate-ping" 
                    : agent.isActive 
                      ? "bg-emerald-500" 
                      : "bg-muted-foreground/30"
                )} style={agent.isProcessing ? { background: agent.color } : {}} />
              </div>
            ))}
          </div>

          {/* Milestone Progress Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between gap-2">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div 
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-500",
                        completedMilestones.includes(milestone.id)
                          ? "text-white shadow-lg"
                          : "bg-muted text-muted-foreground"
                      )}
                      style={completedMilestones.includes(milestone.id) ? {
                        background: bayerBlue,
                        boxShadow: `0 4px 15px -3px ${bayerBlue}50`
                      } : {}}
                    >
                      {completedMilestones.includes(milestone.id) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 text-center font-medium transition-colors",
                      completedMilestones.includes(milestone.id)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}>
                      {milestone.label}
                    </span>
                  </div>
                  {index < milestones.length - 1 && (
                    <ChevronRight 
                      className={cn(
                        "w-5 h-5 mx-1 transition-colors",
                        completedMilestones.includes(milestones[index + 1]?.id)
                          ? "text-foreground"
                          : "text-muted-foreground/40"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Split Screen Workspace */}
          <div 
            className="bg-white border-2 rounded-2xl overflow-hidden min-h-[600px] flex"
            style={{ 
              borderColor: '#e5e7eb',
              boxShadow: '0 4px 20px -5px rgba(0,0,0,0.08)'
            }}
          >
            {/* Left Side - Input Panel */}
            <div className="w-1/2 border-r border-border flex flex-col">
              <div 
                className="p-4 border-b font-semibold flex items-center gap-2"
                style={{ background: `${bayerBlue}08`, color: bayerBlue }}
              >
                <Upload className="w-5 h-5" />
                Input: Protocolo o Pregunta PICOT
              </div>
              
              <div className="flex-1 p-6 flex flex-col">
                {/* File Upload Area */}
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-colors hover:border-primary/50 cursor-pointer"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-foreground mb-1">Subir Protocolo</p>
                  <p className="text-sm text-muted-foreground">PDF, Word o texto plano</p>
                </div>

                {/* PICOT Input */}
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-foreground mb-2">
                    O escribe tu pregunta PICOT:
                  </label>
                  <Textarea
                    placeholder="P: Pacientes adultos post-infarto&#10;I: Suplementación con Omega-3 (2g/día)&#10;C: Placebo o tratamiento estándar&#10;O: Recuperación funcional cardíaca&#10;T: 12 meses de seguimiento"
                    value={picotInput}
                    onChange={(e) => setPicotInput(e.target.value)}
                    className="flex-1 resize-none text-sm border-border"
                  />
                </div>

                {/* Execute Button */}
                <Button
                  onClick={simulateOrchestration}
                  disabled={isOrchestrating || !picotInput.trim()}
                  className="mt-6 h-14 text-lg font-semibold text-white gap-3 rounded-xl transition-all"
                  style={{ 
                    background: isOrchestrating ? '#6b7280' : bayerBlue,
                    boxShadow: isOrchestrating ? 'none' : `0 8px 25px -5px ${bayerBlue}40`
                  }}
                >
                  {isOrchestrating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Orquestando Agentes...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Ejecutar Orquestación Completa
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Side - Agent Output Panel */}
            <div className="w-1/2 flex flex-col bg-muted/20">
              <div 
                className="p-4 border-b font-semibold flex items-center gap-2"
                style={{ background: `${bayerBlue}08`, color: bayerBlue }}
              >
                <Cpu className="w-5 h-5" />
                Output: Feed de Actividad de Agentes
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {agentMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                      Los agentes comenzarán a comunicarse aquí...
                    </div>
                  ) : (
                    agentMessages.map((msg) => {
                      const agent = getAgentInfo(msg.agent);
                      return (
                        <div 
                          key={msg.id}
                          className="bg-white rounded-xl p-4 border shadow-sm animate-fade-in"
                          style={{ borderLeftWidth: 4, borderLeftColor: agent.color }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                              style={{ background: agent.color }}
                            >
                              {agent.icon}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: agent.color }}>
                              {agent.name}
                            </span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })
                  )}

                  {/* Yadav Search Equations Widget */}
                  {showSearchResults && (
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
                      <div 
                        className="p-3 font-semibold text-sm flex items-center gap-2"
                        style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                      >
                        <Search className="w-4 h-4" />
                        Ecuaciones de Búsqueda - Método Yadav 2025
                      </div>
                      
                      <Tabs defaultValue="pubmed" className="p-4">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                          <TabsTrigger value="pubmed" className="text-xs font-medium">PubMed</TabsTrigger>
                          <TabsTrigger value="embase" className="text-xs font-medium">Embase</TabsTrigger>
                          <TabsTrigger value="scopus" className="text-xs font-medium">Scopus</TabsTrigger>
                        </TabsList>
                        
                        {(['pubmed', 'embase', 'scopus'] as const).map((db) => (
                          <TabsContent key={db} value={db}>
                            <div className="relative">
                              <pre 
                                className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed"
                                style={{ maxHeight: 200 }}
                              >
                                {sampleSearchEquations[db]}
                              </pre>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-2 right-2 gap-1.5 text-xs"
                                onClick={() => handleCopyToClipboard(sampleSearchEquations[db], db)}
                              >
                                {copiedTab === db ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Copiado
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copiar
                                  </>
                                )}
                              </Button>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
