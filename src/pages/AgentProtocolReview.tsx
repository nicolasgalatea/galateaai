import { useState, useEffect } from 'react';
import { 
  FileSearch, Upload, Cpu, AlertTriangle, Plus, Send, Building2, FileText,
  Search, ClipboardCheck, Shield, Play, Copy, Check, ChevronRight, BookOpen,
  Filter, FlaskConical, Lock, Unlock, Award, Users, BarChart3, ArrowDown,
  CheckCircle2, XCircle, ThumbsUp, ThumbsDown, Diamond, Minus
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
import { Sparkles, ArrowRight, Zap, DollarSign } from 'lucide-react';

interface AgentMessage {
  id: string;
  agent: 'literature' | 'criteria' | 'yadav';
  message: string;
  timestamp: Date;
  type?: 'text' | 'gaps' | 'criteria-table';
}

interface SubAgent {
  id: 'literature' | 'criteria' | 'yadav';
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  isProcessing: boolean;
}

interface ProtocolSection {
  id: string;
  title: string;
  status: 'pending' | 'complete' | 'warning';
}

interface PRISMABlock {
  label: string;
  count: number;
  description: string;
}

interface AuthorVote {
  name: string;
  avatar: string;
  vote: 'include' | 'exclude' | 'pending';
}

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

const protocolSections: ProtocolSection[] = [
  { id: '1', title: '1. Título del Estudio', status: 'complete' },
  { id: '2', title: '2. Investigador Principal', status: 'complete' },
  { id: '3', title: '3. Justificación Científica', status: 'complete' },
  { id: '4', title: '4. Pregunta de Investigación (PICOT)', status: 'complete' },
  { id: '5', title: '5. Objetivos (Primario/Secundarios)', status: 'complete' },
  { id: '6', title: '6. Diseño del Estudio', status: 'complete' },
  { id: '7', title: '7. Criterios de Inclusión', status: 'complete' },
  { id: '8', title: '8. Criterios de Exclusión', status: 'complete' },
  { id: '9', title: '9. Cálculo de Tamaño Muestral', status: 'warning' },
  { id: '10', title: '10. Variables y Desenlaces', status: 'complete' },
  { id: '11', title: '11. Estrategia de Búsqueda', status: 'complete' },
  { id: '12', title: '12. Plan de Análisis Estadístico', status: 'complete' },
  { id: '13', title: '13. Consideraciones Éticas', status: 'complete' },
  { id: '14', title: '14. Cronograma', status: 'complete' },
  { id: '15', title: '15. Presupuesto', status: 'warning' },
  { id: '16', title: '16. Referencias Bibliográficas', status: 'complete' },
  { id: '17', title: '17. Anexos', status: 'pending' },
];

const prismaBlocks: PRISMABlock[] = [
  { label: 'Identificados', count: 1372, description: 'Registros de bases de datos' },
  { label: 'Tras Duplicados', count: 1063, description: 'Registros únicos' },
  { label: 'Cribados', count: 847, description: 'Títulos/Abstracts revisados' },
  { label: 'Texto Completo', count: 124, description: 'Artículos evaluados' },
  { label: 'Incluidos', count: 38, description: 'Estudios en síntesis cualitativa' },
  { label: 'Meta-análisis', count: 24, description: 'Estudios en síntesis cuantitativa' },
];

const forestPlotData = [
  { study: 'Smith et al. 2023', or: 0.72, ci_low: 0.54, ci_high: 0.96, weight: 15.2 },
  { study: 'Johnson 2022', or: 0.85, ci_low: 0.68, ci_high: 1.06, weight: 18.7 },
  { study: 'García et al. 2023', or: 0.63, ci_low: 0.45, ci_high: 0.88, weight: 12.4 },
  { study: 'Lee & Kim 2024', or: 0.78, ci_low: 0.62, ci_high: 0.98, weight: 16.8 },
  { study: 'Williams 2023', or: 0.91, ci_low: 0.71, ci_high: 1.17, weight: 14.3 },
  { study: 'Chen et al. 2024', or: 0.69, ci_low: 0.51, ci_high: 0.93, weight: 13.1 },
  { study: 'Pooled Effect', or: 0.76, ci_low: 0.67, ci_high: 0.86, weight: 100, isPooled: true },
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
  cochrane: `#1 MeSH descriptor: [Fatty Acids, Omega-3] explode all trees
#2 MeSH descriptor: [Myocardial Infarction] explode all trees
#3 MeSH descriptor: [Recovery of Function] explode all trees
#4 #1 AND #2 AND #3
#5 #4 with Cochrane Library publication date Between Jan 2019 and Dec 2025`,
  scopus: `TITLE-ABS-KEY(("omega-3" OR "fish oil" OR "EPA" OR "DHA")
AND ("myocardial infarction" OR "heart attack" OR "acute coronary")
AND ("recovery" OR "rehabilitation" OR "outcome"))
AND DOCTYPE(ar) AND PUBYEAR > 2018
AND LANGUAGE(english)`,
};

const evidenceGaps = [
  { gap: 'Falta de estudios en población latinoamericana', severity: 'high' },
  { gap: 'Dosis óptima no establecida (1-4g/día)', severity: 'medium' },
  { gap: 'Seguimiento máximo 12 meses en mayoría', severity: 'medium' },
  { gap: 'Pocos estudios con endpoints duros (mortalidad)', severity: 'high' },
];

const inclusionCriteria = [
  { criterion: 'Adultos ≥18 años con IAM previo', included: true },
  { criterion: 'Intervención con Omega-3 (cualquier dosis)', included: true },
  { criterion: 'Grupo control (placebo/atención estándar)', included: true },
  { criterion: 'Outcomes de recuperación cardíaca', included: true },
  { criterion: 'RCT o cuasi-experimental', included: true },
];

const exclusionCriteria = [
  { criterion: 'Estudios observacionales puros', excluded: true },
  { criterion: 'Población pediátrica', excluded: true },
  { criterion: 'Suplementos combinados sin grupo Omega-3 aislado', excluded: true },
  { criterion: 'Artículos sin texto completo disponible', excluded: true },
  { criterion: 'Idiomas distintos a inglés/español', excluded: true },
];

export default function AgentProtocolReview() {
  const { toast } = useToast();
  const [roiValue, setRoiValue] = useState(25);
  const [activePhase, setActivePhase] = useState<'protocol' | 'execution'>('protocol');
  const [isPhase2Unlocked, setIsPhase2Unlocked] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [ideaInput, setIdeaInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [showProtocolPreview, setShowProtocolPreview] = useState(false);
  const [showApprovalAnimation, setShowApprovalAnimation] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  
  const [authorVotes, setAuthorVotes] = useState<AuthorVote[]>([
    { name: 'Dr. AI Alpha', avatar: '🤖', vote: 'pending' },
    { name: 'Dr. AI Beta', avatar: '🔬', vote: 'pending' },
    { name: 'Dr. AI Gamma', avatar: '📊', vote: 'pending' },
  ]);

  const [subAgents, setSubAgents] = useState<SubAgent[]>([
    {
      id: 'literature',
      name: 'Literature Scout',
      role: 'Identificación de gaps de evidencia',
      icon: <BookOpen className="w-5 h-5" />,
      color: '#0033A0',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'criteria',
      name: 'Criteria Designer',
      role: 'Diseño de criterios I/E',
      icon: <Filter className="w-5 h-5" />,
      color: '#00A651',
      isActive: false,
      isProcessing: false,
    },
    {
      id: 'yadav',
      name: 'Yadav Strategist',
      role: 'Sintaxis de búsqueda multicapa',
      icon: <FlaskConical className="w-5 h-5" />,
      color: '#6B21A8',
      isActive: false,
      isProcessing: false,
    },
  ]);

  const categoryColor = 'agent-pharma';
  const bayerBlue = '#0033A0';

  const handleCopyToClipboard = async (text: string, tab: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
    toast({
      title: 'Copiado',
      description: 'Ecuación de búsqueda copiada al portapapeles.',
    });
  };

  const simulatePhase1Orchestration = async () => {
    if (!ideaInput.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa una idea de investigación.',
        variant: 'destructive',
      });
      return;
    }

    setIsOrchestrating(true);
    setAgentMessages([]);
    setShowProtocolPreview(false);

    // Activate Literature Scout
    setSubAgents(prev => prev.map(a => 
      a.id === 'literature' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 2000));
    
    setAgentMessages(prev => [...prev, {
      id: '1',
      agent: 'literature',
      message: 'Analizando la literatura existente y comparando con tu idea de investigación...',
      timestamp: new Date(),
      type: 'text',
    }]);

    await new Promise(r => setTimeout(r, 1500));

    setAgentMessages(prev => [...prev, {
      id: '2',
      agent: 'literature',
      message: 'gaps',
      timestamp: new Date(),
      type: 'gaps',
    }]);
    
    setSubAgents(prev => prev.map(a => 
      a.id === 'literature' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 1000));

    // Activate Criteria Designer
    setSubAgents(prev => prev.map(a => 
      a.id === 'criteria' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 2000));

    setAgentMessages(prev => [...prev, {
      id: '3',
      agent: 'criteria',
      message: 'Generando criterios de inclusión y exclusión basados en PICOT...',
      timestamp: new Date(),
      type: 'text',
    }]);

    await new Promise(r => setTimeout(r, 1500));

    setAgentMessages(prev => [...prev, {
      id: '4',
      agent: 'criteria',
      message: 'criteria-table',
      timestamp: new Date(),
      type: 'criteria-table',
    }]);

    setSubAgents(prev => prev.map(a => 
      a.id === 'criteria' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 1000));

    // Activate Yadav Strategist
    setSubAgents(prev => prev.map(a => 
      a.id === 'yadav' ? { ...a, isActive: true, isProcessing: true } : a
    ));

    await new Promise(r => setTimeout(r, 2500));

    setAgentMessages(prev => [...prev, {
      id: '5',
      agent: 'yadav',
      message: 'Aplicando el método de dos capas del paper Yadav 2025. Generando sintaxis optimizada para 4 bases de datos...',
      timestamp: new Date(),
      type: 'text',
    }]);

    setSubAgents(prev => prev.map(a => 
      a.id === 'yadav' ? { ...a, isProcessing: false } : a
    ));

    await new Promise(r => setTimeout(r, 800));
    
    setShowProtocolPreview(true);
    setIsOrchestrating(false);
    
    toast({
      title: '✅ Fase 1 Completada',
      description: 'Protocolo listo para revisión. Revisa las 17 secciones antes de aprobar.',
    });
  };

  const handleApproveProtocol = () => {
    setShowApprovalAnimation(true);
    
    setTimeout(() => {
      setIsPhase2Unlocked(true);
      setActivePhase('execution');
      setShowApprovalAnimation(false);
      
      toast({
        title: '🎉 Protocolo Aprobado',
        description: 'Fase 2 desbloqueada. Iniciando ejecución de búsqueda sistemática.',
      });

      // Simulate author voting
      simulateAuthorVoting();
    }, 2500);
  };

  const simulateAuthorVoting = () => {
    const articles = ['Artículo 1', 'Artículo 2', 'Artículo 3'];
    let articleIdx = 0;

    const voteInterval = setInterval(() => {
      if (articleIdx >= 3) {
        clearInterval(voteInterval);
        return;
      }

      setAuthorVotes([
        { name: 'Dr. AI Alpha', avatar: '🤖', vote: Math.random() > 0.3 ? 'include' : 'exclude' },
        { name: 'Dr. AI Beta', avatar: '🔬', vote: Math.random() > 0.3 ? 'include' : 'exclude' },
        { name: 'Dr. AI Gamma', avatar: '📊', vote: Math.random() > 0.4 ? 'include' : 'exclude' },
      ]);
      
      setCurrentArticleIndex(articleIdx + 1);
      articleIdx++;
    }, 2000);
  };

  const getAgentInfo = (agentId: 'literature' | 'criteria' | 'yadav') => {
    return subAgents.find(a => a.id === agentId)!;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 px-4 bg-background overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(ellipse 100% 60% at 50% 0%, hsl(var(--${categoryColor})), transparent)`
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
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

          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Clinical Guideline Navigator
            </h1>
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mb-4"
              style={{ background: `${bayerBlue}15`, color: bayerBlue }}
            >
              <Cpu className="w-4 h-4" />
              ORCHESTRATOR MODE
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              A medical research assistant that helps structure clinical or academic projects through clear phases and institutional requirements.
              <br />
              <span className="text-lg">Designed for clean, scientific UX with a guided workflow.</span>
            </p>
          </div>

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

      {/* WORKFLOW SECTION */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Intelligent automation in three simple steps
            </p>
          </div>

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

      {/* INTEGRATIONS SECTION */}
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

      {/* ROI SECTION */}
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

      {/* MULTI-AGENT ORCHESTRATION CENTER - 2 PHASES */}
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
              Multi-Agent Orchestrator
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Clinical Guideline Navigator: Orchestrator Mode
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Sistema de 2 Fases para Investigación Científica Rigurosa
            </p>
          </div>

          {/* Phase Tabs */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setActivePhase('protocol')}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all text-left",
                  activePhase === 'protocol'
                    ? "bg-white shadow-xl border-2"
                    : "bg-muted/50 hover:bg-muted"
                )}
                style={activePhase === 'protocol' ? { borderColor: bayerBlue } : {}}
              >
                <div 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    activePhase === 'protocol' ? "text-white" : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                  style={activePhase === 'protocol' ? { background: bayerBlue } : {}}
                >
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold" style={activePhase === 'protocol' ? { color: bayerBlue } : {}}>
                    Fase 1: Protocolo
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Rigor Metodológico (Agentes 1-8)
                  </div>
                </div>
              </button>

              <button
                onClick={() => isPhase2Unlocked && setActivePhase('execution')}
                disabled={!isPhase2Unlocked}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all text-left relative",
                  activePhase === 'execution'
                    ? "bg-white shadow-xl border-2"
                    : isPhase2Unlocked
                      ? "bg-muted/50 hover:bg-muted"
                      : "bg-muted/30 cursor-not-allowed opacity-60"
                )}
                style={activePhase === 'execution' ? { borderColor: '#00A651' } : {}}
              >
                {!isPhase2Unlocked && (
                  <Lock className="absolute top-3 right-3 w-4 h-4 text-muted-foreground" />
                )}
                <div 
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    activePhase === 'execution' ? "text-white" : "bg-muted-foreground/20 text-muted-foreground"
                  )}
                  style={activePhase === 'execution' ? { background: '#00A651' } : {}}
                >
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-bold" style={activePhase === 'execution' ? { color: '#00A651' } : {}}>
                    Fase 2: Ejecución
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isPhase2Unlocked ? 'Acción Científica' : 'Requiere Protocolo Aprobado'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* PHASE 1: PROTOCOL */}
          {activePhase === 'protocol' && (
            <div className="space-y-8">
              {/* Sub-Agents Panel */}
              <div className="bg-muted/20 rounded-2xl p-6 border">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: bayerBlue }} />
                  Agentes en Servicio
                </h3>
                <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
                  {subAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className={cn(
                        "relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 min-w-[160px]",
                        agent.isActive 
                          ? "bg-white shadow-lg scale-105" 
                          : "bg-white/50 opacity-60"
                      )}
                      style={{
                        borderColor: agent.isActive ? agent.color : 'transparent',
                        boxShadow: agent.isActive ? `0 8px 30px -8px ${agent.color}40` : 'none',
                        borderRadius: '12px'
                      }}
                    >
                      {agent.isProcessing && (
                        <div 
                          className="absolute inset-0 rounded-xl animate-pulse"
                          style={{ background: `${agent.color}15` }}
                        />
                      )}
                      
                      <div 
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center text-white mb-3 transition-transform",
                          agent.isProcessing && "animate-bounce"
                        )}
                        style={{ background: agent.color }}
                      >
                        {agent.icon}
                      </div>
                      
                      <h4 className="font-semibold text-sm text-foreground text-center leading-tight mb-1">
                        {agent.name}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        {agent.role}
                      </p>
                      
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
              </div>

              {/* Split Screen Workspace */}
              <div 
                className="bg-white border-2 rounded-2xl overflow-hidden min-h-[700px] flex"
                style={{ 
                  borderColor: '#e5e7eb',
                  boxShadow: '0 4px 20px -5px rgba(0,0,0,0.08)',
                  borderRadius: '12px'
                }}
              >
                {/* Left Side - Input Panel */}
                <div className="w-1/2 border-r border-border flex flex-col">
                  <div 
                    className="p-4 border-b font-semibold flex items-center gap-2"
                    style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                  >
                    <Upload className="w-5 h-5" />
                    Input: Idea de Investigación
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div 
                      className="border-2 border-dashed rounded-xl p-6 text-center mb-6 transition-colors hover:border-primary/50 cursor-pointer"
                      style={{ borderColor: '#d1d5db', borderRadius: '12px' }}
                    >
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="font-medium text-foreground mb-1">Subir Protocolo Borrador</p>
                      <p className="text-sm text-muted-foreground">PDF, Word o texto plano</p>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="text-sm font-medium text-foreground mb-2">
                        O describe tu idea de investigación:
                      </label>
                      <Textarea
                        placeholder="Ej: Investigar el impacto de suplementación con Omega-3 en pacientes post-infarto para mejorar la recuperación funcional cardíaca durante 12 meses de seguimiento..."
                        value={ideaInput}
                        onChange={(e) => setIdeaInput(e.target.value)}
                        className="flex-1 resize-none text-sm border-border"
                        style={{ borderRadius: '12px', fontFamily: 'system-ui, sans-serif' }}
                      />
                    </div>

                    <Button
                      onClick={simulatePhase1Orchestration}
                      disabled={isOrchestrating || !ideaInput.trim()}
                      className="mt-6 h-14 text-lg font-semibold text-white gap-3 transition-all"
                      style={{ 
                        background: isOrchestrating ? '#6b7280' : bayerBlue,
                        boxShadow: isOrchestrating ? 'none' : `0 8px 25px -5px ${bayerBlue}40`,
                        borderRadius: '12px'
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
                          Iniciar Fase 1: Protocolo
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Right Side - Agent Output Panel */}
                <div className="w-1/2 flex flex-col bg-muted/10">
                  <div 
                    className="p-4 border-b font-semibold flex items-center gap-2"
                    style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                  >
                    <Cpu className="w-5 h-5" />
                    Output: Actividad de Agentes
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      {agentMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                          <div className="text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Los agentes comenzarán a trabajar en cadena...</p>
                          </div>
                        </div>
                      ) : (
                        agentMessages.map((msg) => {
                          const agent = getAgentInfo(msg.agent);
                          
                          if (msg.type === 'gaps') {
                            return (
                              <div 
                                key={msg.id}
                                className="bg-white rounded-xl p-4 border shadow-sm animate-fade-in"
                                style={{ borderLeftWidth: 4, borderLeftColor: agent.color, borderRadius: '12px' }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div 
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                                    style={{ background: agent.color }}
                                  >
                                    {agent.icon}
                                  </div>
                                  <span className="font-semibold text-sm" style={{ color: agent.color }}>
                                    {agent.name} - Gaps de Evidencia
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {evidenceGaps.map((gap, idx) => (
                                    <div 
                                      key={idx}
                                      className={cn(
                                        "flex items-start gap-2 p-2 rounded-lg text-sm",
                                        gap.severity === 'high' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                                      )}
                                      style={{ borderRadius: '8px' }}
                                    >
                                      <AlertTriangle className={cn(
                                        "w-4 h-4 mt-0.5 shrink-0",
                                        gap.severity === 'high' ? 'text-red-500' : 'text-amber-500'
                                      )} />
                                      <span className="text-foreground">{gap.gap}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          
                          if (msg.type === 'criteria-table') {
                            return (
                              <div 
                                key={msg.id}
                                className="bg-white rounded-xl p-4 border shadow-sm animate-fade-in"
                                style={{ borderLeftWidth: 4, borderLeftColor: agent.color, borderRadius: '12px' }}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div 
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                                    style={{ background: agent.color }}
                                  >
                                    {agent.icon}
                                  </div>
                                  <span className="font-semibold text-sm" style={{ color: agent.color }}>
                                    {agent.name} - Criterios I/E
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="text-xs font-bold text-emerald-700 uppercase mb-2 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Inclusión
                                    </h5>
                                    <div className="space-y-1">
                                      {inclusionCriteria.map((c, idx) => (
                                        <div key={idx} className="flex items-start gap-1.5 text-xs bg-emerald-50 p-2 rounded-lg">
                                          <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                                          <span>{c.criterion}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> Exclusión
                                    </h5>
                                    <div className="space-y-1">
                                      {exclusionCriteria.map((c, idx) => (
                                        <div key={idx} className="flex items-start gap-1.5 text-xs bg-red-50 p-2 rounded-lg">
                                          <XCircle className="w-3 h-3 text-red-600 mt-0.5 shrink-0" />
                                          <span>{c.criterion}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div 
                              key={msg.id}
                              className="bg-white rounded-xl p-4 border shadow-sm animate-fade-in"
                              style={{ borderLeftWidth: 4, borderLeftColor: agent.color, borderRadius: '12px' }}
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
                              <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: 'system-ui, sans-serif' }}>
                                {msg.message}
                              </p>
                            </div>
                          );
                        })
                      )}

                      {/* Yadav Search Equations Widget */}
                      {showProtocolPreview && (
                        <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4" style={{ borderRadius: '12px' }}>
                          <div 
                            className="p-3 font-semibold text-sm flex items-center gap-2"
                            style={{ background: `${bayerBlue}08`, color: bayerBlue }}
                          >
                            <Search className="w-4 h-4" />
                            Ecuaciones de Búsqueda - Método Yadav 2025 (Dos Capas)
                          </div>
                          
                          <Tabs defaultValue="pubmed" className="p-4">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                              <TabsTrigger value="pubmed" className="text-xs font-medium">PubMed</TabsTrigger>
                              <TabsTrigger value="embase" className="text-xs font-medium">Embase</TabsTrigger>
                              <TabsTrigger value="cochrane" className="text-xs font-medium">Cochrane</TabsTrigger>
                              <TabsTrigger value="scopus" className="text-xs font-medium">Scopus</TabsTrigger>
                            </TabsList>
                            
                            {(['pubmed', 'embase', 'cochrane', 'scopus'] as const).map((db) => (
                              <TabsContent key={db} value={db}>
                                <div className="relative">
                                  <pre 
                                    className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto leading-relaxed"
                                    style={{ maxHeight: 200, fontFamily: 'JetBrains Mono, Consolas, monospace', borderRadius: '12px' }}
                                  >
                                    {sampleSearchEquations[db]}
                                  </pre>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="absolute top-2 right-2 gap-1.5 text-xs"
                                    onClick={() => handleCopyToClipboard(sampleSearchEquations[db], db)}
                                    style={{ borderRadius: '8px' }}
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

              {/* Protocol Preview & Approval Checkpoint */}
              {showProtocolPreview && (
                <div className="bg-white border-2 rounded-2xl overflow-hidden" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                  <div 
                    className="p-4 border-b font-bold flex items-center justify-between"
                    style={{ background: `${bayerBlue}05` }}
                  >
                    <div className="flex items-center gap-2" style={{ color: bayerBlue }}>
                      <FileText className="w-5 h-5" />
                      Protocol Preview - 17 Secciones Institucionales
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Simulación de documento PDF
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                      {protocolSections.map((section) => (
                        <div 
                          key={section.id}
                          className={cn(
                            "p-3 rounded-xl border text-sm flex items-start gap-2",
                            section.status === 'complete' && "bg-emerald-50 border-emerald-200",
                            section.status === 'warning' && "bg-amber-50 border-amber-200",
                            section.status === 'pending' && "bg-gray-50 border-gray-200"
                          )}
                          style={{ borderRadius: '12px' }}
                        >
                          {section.status === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                          {section.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                          {section.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />}
                          <span className="text-xs font-medium">{section.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Approval Button */}
                    <div className="flex justify-center relative">
                      {showApprovalAnimation && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/90 rounded-xl">
                          <div className="text-center animate-bounce">
                            <Award className="w-20 h-20 mx-auto mb-2 text-emerald-500" />
                            <p className="text-xl font-bold text-emerald-600">Sello de Aprobación Ética</p>
                            <p className="text-sm text-muted-foreground">Protocolo validado - Desbloqueando Fase 2...</p>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleApproveProtocol}
                        disabled={isPhase2Unlocked || showApprovalAnimation}
                        className="h-16 px-12 text-lg font-bold text-white gap-3 transition-all"
                        style={{ 
                          background: isPhase2Unlocked ? '#10b981' : '#00A651',
                          boxShadow: '0 8px 25px -5px rgba(0, 166, 81, 0.4)',
                          borderRadius: '12px'
                        }}
                      >
                        {isPhase2Unlocked ? (
                          <>
                            <Unlock className="w-6 h-6" />
                            Protocolo Aprobado - Fase 2 Desbloqueada
                          </>
                        ) : (
                          <>
                            <Award className="w-6 h-6" />
                            ✅ Aprobar Protocolo y Ejecutar Búsqueda
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHASE 2: EXECUTION */}
          {activePhase === 'execution' && isPhase2Unlocked && (
            <div className="space-y-8">
              {/* PRISMA Flow Diagram */}
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" style={{ color: '#00A651' }} />
                  Diagrama PRISMA - Flujo de Selección
                </h3>
                
                <div className="flex flex-col items-center gap-2">
                  {prismaBlocks.map((block, index) => (
                    <div key={index} className="w-full max-w-md">
                      <div 
                        className="p-4 rounded-xl text-center transition-all hover:scale-102"
                        style={{ 
                          background: index === prismaBlocks.length - 1 ? '#00A651' : `${bayerBlue}${15 - index * 2}0`,
                          color: index === prismaBlocks.length - 1 ? 'white' : bayerBlue,
                          borderRadius: '12px'
                        }}
                      >
                        <div className="text-3xl font-bold font-mono">{block.count.toLocaleString()}</div>
                        <div className="font-semibold">{block.label}</div>
                        <div className="text-xs opacity-80">{block.description}</div>
                      </div>
                      {index < prismaBlocks.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowDown className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground ml-2">
                            -{(prismaBlocks[index].count - prismaBlocks[index + 1].count).toLocaleString()} excluidos
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Authors Consensus Widget */}
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6" style={{ color: bayerBlue }} />
                  Consenso de 3 Revisores IA - Artículo #{currentArticleIndex || 1}
                </h3>
                
                <div className="flex justify-center gap-8 mb-6">
                  {authorVotes.map((author, idx) => (
                    <div key={idx} className="text-center">
                      <div 
                        className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 border-4 transition-all",
                          author.vote === 'include' && "border-emerald-500 bg-emerald-50",
                          author.vote === 'exclude' && "border-red-500 bg-red-50",
                          author.vote === 'pending' && "border-gray-300 bg-gray-50 animate-pulse"
                        )}
                      >
                        {author.avatar}
                      </div>
                      <p className="font-semibold text-sm text-foreground">{author.name}</p>
                      <div className={cn(
                        "mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase",
                        author.vote === 'include' && "bg-emerald-100 text-emerald-700",
                        author.vote === 'exclude' && "bg-red-100 text-red-700",
                        author.vote === 'pending' && "bg-gray-100 text-gray-500"
                      )}>
                        {author.vote === 'include' && <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Incluir</span>}
                        {author.vote === 'exclude' && <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> Excluir</span>}
                        {author.vote === 'pending' && 'Evaluando...'}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>Los revisores IA votan independientemente. Consenso por mayoría (2/3).</p>
                </div>
              </div>

              {/* Forest Plot (Meta-analysis) */}
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: '#e5e7eb', borderRadius: '12px' }}>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Diamond className="w-6 h-6" style={{ color: '#6B21A8' }} />
                  Forest Plot - Meta-análisis de Resultados
                </h3>
                
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-muted-foreground uppercase border-b pb-2 mb-4">
                      <div className="col-span-3">Estudio</div>
                      <div className="col-span-6 text-center">Odds Ratio (IC 95%)</div>
                      <div className="col-span-2 text-right">OR</div>
                      <div className="col-span-1 text-right">Peso</div>
                    </div>
                    
                    {/* Studies */}
                    {forestPlotData.map((study, idx) => {
                      const orPosition = ((study.or - 0.3) / 1.4) * 100;
                      const ciLowPos = ((study.ci_low - 0.3) / 1.4) * 100;
                      const ciHighPos = ((study.ci_high - 0.3) / 1.4) * 100;
                      const lineWidth = ciHighPos - ciLowPos;
                      
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "grid grid-cols-12 gap-2 items-center py-2",
                            study.isPooled && "bg-slate-100 rounded-lg px-2 font-bold"
                          )}
                        >
                          <div className="col-span-3 text-sm" style={{ fontFamily: study.isPooled ? 'inherit' : 'JetBrains Mono, monospace' }}>
                            {study.study}
                          </div>
                          <div className="col-span-6 relative h-8">
                            {/* Center line at OR=1 */}
                            <div 
                              className="absolute top-0 bottom-0 w-px bg-gray-400"
                              style={{ left: `${((1 - 0.3) / 1.4) * 100}%` }}
                            />
                            {/* CI line */}
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-600"
                              style={{ left: `${ciLowPos}%`, width: `${lineWidth}%` }}
                            />
                            {/* OR point (diamond for pooled) */}
                            {study.isPooled ? (
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rotate-45"
                                style={{ left: `${orPosition}%`, background: '#6B21A8' }}
                              />
                            ) : (
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                                style={{ left: `${orPosition}%`, background: bayerBlue }}
                              />
                            )}
                          </div>
                          <div className="col-span-2 text-right text-sm font-mono">
                            {study.or.toFixed(2)} [{study.ci_low.toFixed(2)}-{study.ci_high.toFixed(2)}]
                          </div>
                          <div className="col-span-1 text-right text-sm">
                            {study.weight.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* X-axis labels */}
                    <div className="grid grid-cols-12 gap-2 mt-4 pt-2 border-t">
                      <div className="col-span-3"></div>
                      <div className="col-span-6 flex justify-between text-xs text-muted-foreground px-1">
                        <span>0.5</span>
                        <span>Favors Treatment</span>
                        <span>1.0</span>
                        <span>Favors Control</span>
                        <span>1.5</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-purple-50 rounded-xl text-sm" style={{ borderRadius: '12px' }}>
                  <p className="font-semibold text-purple-900 mb-1">Resultado del Meta-análisis:</p>
                  <p className="text-purple-800">
                    OR pooled = 0.76 (IC 95%: 0.67-0.86), p &lt; 0.001. Heterogeneidad: I² = 23%, indicando 
                    resultados consistentes. El tratamiento con Omega-3 reduce significativamente el riesgo 
                    en un 24% comparado con control.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
