import { Link } from 'react-router-dom';
import { 
  Bot, ArrowLeft, ArrowRight, CheckCircle,
  Activity, Zap, Clock, TrendingUp, Building2, FileText,
  AlertTriangle, Settings, Code, Shield, Mic, Receipt, Scissors, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

// Real agents from the repository
const workspaceAgents = [
  { 
    key: 'coding',
    name: 'Codificación Médica', 
    role: 'CIE-10 & CUPS', 
    status: 'active', 
    tasks: 2847,
    icon: Code,
    color: 'amber',
    link: '/agent/coding'
  },
  { 
    key: 'compliance',
    name: 'Cumplimiento RIPS', 
    role: 'Auditoría', 
    status: 'active', 
    tasks: 1592,
    icon: Shield,
    color: 'emerald',
    link: '/agent/compliance'
  },
  { 
    key: 'clinicalDictation',
    name: 'Dictado Clínico', 
    role: 'Transcripción', 
    status: 'active', 
    tasks: 3241,
    icon: Mic,
    color: 'cyan',
    link: '/agent/clinical-dictation'
  },
  { 
    key: 'billing',
    name: 'Facturación', 
    role: 'Revenue Cycle', 
    status: 'active', 
    tasks: 1876,
    icon: Receipt,
    color: 'blue',
    link: '/agent/billing'
  },
  { 
    key: 'surgicalNotes',
    name: 'Notas Quirúrgicas', 
    role: 'Documentación', 
    status: 'active', 
    tasks: 892,
    icon: Scissors,
    color: 'red',
    link: '/agent/surgical-notes'
  },
  { 
    key: 'aorta',
    name: 'Cardiología AORTA', 
    role: 'Especialidad', 
    status: 'active', 
    tasks: 634,
    icon: Heart,
    color: 'rose',
    link: '/agent/aorta'
  },
];

const logs = [
  { time: '14:32:01', status: 'success', agent: 'Codificación', text: 'Invoice #489 validated → RIPS compliant ✓' },
  { time: '14:32:03', status: 'success', agent: 'Cumplimiento', text: 'CIE-10 code mapped: J18.9 → Approved' },
  { time: '14:32:05', status: 'warning', agent: 'Dictado', text: 'Note #1205 → Missing signature → Flagged' },
  { time: '14:32:08', status: 'success', agent: 'Facturación', text: 'Invoice #490 validated → RIPS compliant ✓' },
  { time: '14:32:10', status: 'processing', agent: 'Notas Qx', text: 'Processing batch #47... Extracting codes...' },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-600' },
  cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-600' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-600' },
  red: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-600' },
  rose: { bg: 'bg-rose-500/20', border: 'border-rose-500/30', text: 'text-rose-600' },
};

export default function MethodologyDeployment() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Link 
            to="/#methodology" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('methodology.backTo')}
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div className="px-4 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
              {t('methodology.step')} 3 {t('methodology.of')} 4
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            {t('methodology.deployment.title')} <span className="text-primary">{t('methodology.deployment.titleHighlight')}</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mb-8">
            {t('methodology.deployment.subtitle')}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{t('methodology.deployment.stat1.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.deployment.stat1.label')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{t('methodology.deployment.stat2.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.deployment.stat2.label')}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-500">{t('methodology.deployment.stat3.value')}</p>
              <p className="text-sm text-muted-foreground">{t('methodology.deployment.stat3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agentic Workspace */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Agentic Workspace</h2>
              <p className="text-muted-foreground text-sm mt-1">Agentes especializados trabajando en tiempo real</p>
            </div>
            <Link to="/agents">
              <Button variant="outline" size="sm" className="gap-2">
                Ver todos los agentes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Agent Workspace Grid */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Agentes Activos
                </h3>
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600 text-xs font-medium">6 Online</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {workspaceAgents.map((agent, i) => {
                  const colors = colorClasses[agent.color];
                  const IconComponent = agent.icon;
                  return (
                    <Link 
                      key={i} 
                      to={agent.link}
                      className={cn(
                        "rounded-xl p-4 border transition-all hover:shadow-md hover:-translate-y-0.5 group",
                        colors.bg, colors.border
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          colors.bg, "border", colors.border
                        )}>
                          <IconComponent className={cn("w-5 h-5", colors.text)} />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        </div>
                      </div>
                      <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{agent.role}</p>
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-lg font-bold text-foreground">{agent.tasks.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{t('methodology.deployment.tasksToday')}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Live Log */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {t('methodology.deployment.liveLog')}
                </h3>
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-green-600 text-sm font-medium">{t('methodology.deployment.live')}</span>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 font-mono text-sm border border-border max-h-72 overflow-y-auto">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "py-3 border-b border-border last:border-0 transition-all",
                      i === logs.length - 1 && "animate-pulse bg-primary/5 rounded-lg -mx-2 px-2"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-muted-foreground text-xs font-medium">{log.time}</span>
                      <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">[{log.agent}]</span>
                    </div>
                    <span className={cn(
                      "text-sm leading-relaxed",
                      log.status === 'success' && "text-green-600",
                      log.status === 'warning' && "text-amber-600",
                      log.status === 'processing' && "text-primary",
                    )}>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="bg-gradient-to-br from-green-500/15 to-green-500/5 rounded-xl p-4 text-center border border-green-500/20">
                  <p className="text-2xl font-bold text-green-600">4,698</p>
                  <p className="text-muted-foreground text-xs mt-1">{t('methodology.deployment.processedToday')}</p>
                </div>
                <div className="bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl p-4 text-center border border-primary/20">
                  <p className="text-2xl font-bold text-primary">99.2%</p>
                  <p className="text-muted-foreground text-xs mt-1">{t('methodology.deployment.precision')}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 rounded-xl p-4 text-center border border-amber-500/20">
                  <p className="text-2xl font-bold text-amber-600">7</p>
                  <p className="text-muted-foreground text-xs mt-1">{t('methodology.deployment.flagged')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Agents Work */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.deployment.howAgentsWork')}</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('methodology.deployment.step1.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('methodology.deployment.step1.desc')}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('methodology.deployment.step2.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('methodology.deployment.step2.desc')}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('methodology.deployment.step3.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('methodology.deployment.step3.desc')}
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t('methodology.deployment.step4.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('methodology.deployment.step4.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">{t('methodology.roi')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.deployment.roi1.title')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('methodology.deployment.roi1.desc')}
              </p>
              <p className="text-2xl font-bold text-primary">{t('methodology.deployment.roi1.value')}</p>
              <p className="text-xs text-muted-foreground">{t('methodology.deployment.roi1.label')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-6">
              <TrendingUp className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.deployment.roi2.title')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('methodology.deployment.roi2.desc')}
              </p>
              <p className="text-2xl font-bold text-green-400">{t('methodology.deployment.roi2.value')}</p>
              <p className="text-xs text-muted-foreground">{t('methodology.deployment.roi2.label')}</p>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-6">
              <Clock className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('methodology.deployment.roi3.title')}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t('methodology.deployment.roi3.desc')}
              </p>
              <p className="text-2xl font-bold text-primary">{t('methodology.deployment.roi3.value')}</p>
              <p className="text-xs text-muted-foreground">{t('methodology.deployment.roi3.label')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">{t('methodology.caseStudy')}</span>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-4">
              {t('methodology.deployment.case.title')}
            </h3>
            
            <p className="text-muted-foreground mb-6">
              {t('methodology.deployment.case.quote')}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">8</p>
                <p className="text-xs text-muted-foreground">{t('methodology.deployment.case.stat1')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">45K</p>
                <p className="text-xs text-muted-foreground">{t('methodology.deployment.case.stat2')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">99.4%</p>
                <p className="text-xs text-muted-foreground">{t('methodology.deployment.case.stat3')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center">
            <Link to="/methodology/integration">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('methodology.deployment.nav.prev')}
              </Button>
            </Link>
            
            <Link to="/methodology/control">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                {t('methodology.deployment.nav.next')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
