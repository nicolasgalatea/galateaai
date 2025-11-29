import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { 
  Search, Cable, Bot, TrendingUp, AlertTriangle, 
  CheckCircle, FileText, ArrowRight, Activity,
  DollarSign, Clock, Users, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { 
    icon: Search, 
    key: 'step1',
    title: 'Bottleneck Diagnosis',
    desc: 'AI-powered process mining reveals hidden inefficiencies',
  },
  { 
    icon: Cable, 
    key: 'step2',
    title: 'Workflow Integration',
    desc: 'Secure connection to your legacy infrastructure',
  },
  { 
    icon: Bot, 
    key: 'step3',
    title: 'Agent Deployment',
    desc: 'Autonomous AI agents execute tasks 24/7',
  },
  { 
    icon: TrendingUp, 
    key: 'step4',
    title: 'Control & Profitability',
    desc: 'Real-time visibility into ROI and efficiency',
  },
];

// Mockup Component for Step 1: Process Mining Dashboard
function DiagnosisMockup() {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-slate-400 text-sm font-mono">Process Mining Dashboard</span>
      </div>
      
      {/* Flowchart visualization */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          {/* Node 1 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <span className="text-xs text-slate-400 mt-2">Intake</span>
          </div>
          
          <ArrowRight className="w-6 h-6 text-slate-600" />
          
          {/* Node 2 - Warning */}
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-2 -right-2 z-10">
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div className="w-16 h-16 rounded-lg bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-red-400" />
            </div>
            <span className="text-xs text-red-400 mt-2 font-medium">Manual Billing</span>
          </div>
          
          <ArrowRight className="w-6 h-6 text-slate-600" />
          
          {/* Node 3 - Warning */}
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-2 -right-2 z-10">
              <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            <div className="w-16 h-16 rounded-lg bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <span className="text-xs text-amber-400 mt-2 font-medium">Auth Delay</span>
          </div>
          
          <ArrowRight className="w-6 h-6 text-slate-600" />
          
          {/* Node 4 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <span className="text-xs text-slate-400 mt-2">Complete</span>
          </div>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Inefficiency Detected</p>
          <p className="text-2xl font-bold text-red-400">45%</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Bottlenecks Found</p>
          <p className="text-2xl font-bold text-amber-400">2</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">Optimization Potential</p>
          <p className="text-2xl font-bold text-green-400">$2.3M</p>
        </div>
      </div>
      
      <p className="text-center text-slate-500 text-sm mt-6 italic">
        "Our engine maps your workflow and highlights friction points instantly."
      </p>
    </div>
  );
}

// Mockup Component for Step 2: Integration Hub
function IntegrationMockup() {
  const integrations = [
    { name: 'SAP', status: 'Connected' },
    { name: 'Veeva', status: 'Connected' },
    { name: 'Servinte', status: 'Connected' },
    { name: 'Epic', status: 'Pending' },
  ];

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-slate-400 text-sm font-mono">Integration Hub</span>
      </div>

      {/* Central Hub Visualization */}
      <div className="relative py-8">
        <div className="flex items-center justify-center">
          {/* Left integrations */}
          <div className="flex flex-col gap-4">
            {integrations.slice(0, 2).map((int, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-center min-w-[100px]">
                  <span className="text-white font-semibold">{int.name}</span>
                </div>
                <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-primary relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Central Galatea Node */}
          <div className="mx-6 relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center border-4 border-primary/50">
              <span className="text-white font-bold text-lg">Galatea</span>
            </div>
          </div>

          {/* Right integrations */}
          <div className="flex flex-col gap-4">
            {integrations.slice(2).map((int, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-0.5 bg-gradient-to-l from-green-500 to-primary relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-center min-w-[100px]">
                  <span className="text-white font-semibold">{int.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {integrations.map((int, i) => (
          <div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <p className="text-white text-sm font-medium">{int.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                int.status === 'Connected' ? "bg-green-500" : "bg-yellow-500"
              )} />
              <span className={cn(
                "text-xs",
                int.status === 'Connected' ? "text-green-400" : "text-yellow-400"
              )}>
                {int.status === 'Connected' ? 'Secure API' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-slate-500 text-sm mt-6 italic">
        "Secure, zero-friction connection to your legacy infrastructure."
      </p>
    </div>
  );
}

// Mockup Component for Step 3: Agent Console
function AgentConsoleMockup() {
  const logs = [
    { time: '14:32:01', status: 'success', text: 'Processing Invoice #489... Validating RIPS... ✓ Approved' },
    { time: '14:32:03', status: 'success', text: 'Processing Invoice #490... Validating RIPS... ✓ Approved' },
    { time: '14:32:05', status: 'warning', text: 'Processing Invoice #491... Missing code... ⚠ Flagged for review' },
    { time: '14:32:08', status: 'success', text: 'Processing Invoice #492... Validating RIPS... ✓ Approved' },
    { time: '14:32:10', status: 'processing', text: 'Processing Invoice #493... Extracting data...' },
  ];

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-slate-400 text-sm font-mono">Active Agent Console</span>
      </div>

      {/* Agent Header */}
      <div className="flex items-center justify-between bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Audit-Bot-01</p>
            <p className="text-slate-400 text-xs">Revenue Cycle Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm">Active</span>
        </div>
      </div>

      {/* Log Window */}
      <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-800 max-h-48 overflow-y-auto">
        {logs.map((log, i) => (
          <div 
            key={i} 
            className={cn(
              "py-1.5 border-b border-slate-800 last:border-0 flex gap-3",
              i === logs.length - 1 && "animate-pulse"
            )}
          >
            <span className="text-slate-500">{log.time}</span>
            <span className={cn(
              log.status === 'success' && "text-green-400",
              log.status === 'warning' && "text-amber-400",
              log.status === 'processing' && "text-blue-400",
            )}>
              {log.text}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
          <p className="text-2xl font-bold text-green-400">1,247</p>
          <p className="text-slate-400 text-xs">Processed Today</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
          <p className="text-2xl font-bold text-primary">99.2%</p>
          <p className="text-slate-400 text-xs">Accuracy</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
          <p className="text-2xl font-bold text-amber-400">3</p>
          <p className="text-slate-400 text-xs">Flagged</p>
        </div>
      </div>

      <p className="text-center text-slate-500 text-sm mt-6 italic">
        "Watch your digital workforce execute tasks in real-time, 24/7."
      </p>
    </div>
  );
}

// Mockup Component for Step 4: ROI Dashboard
function ROIDashboardMockup() {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-slate-400 text-sm font-mono">Executive ROI Dashboard</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-slate-400 text-sm">Cash Flow Recovered</span>
          </div>
          <p className="text-3xl font-bold text-green-400">$150M</p>
          <p className="text-green-400/70 text-xs mt-1">↑ 23% vs last quarter</p>
        </div>
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-slate-400 text-sm">Admin Hours Saved</span>
          </div>
          <p className="text-3xl font-bold text-primary">4,000</p>
          <p className="text-primary/70 text-xs mt-1">↑ 156 hours this week</p>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-medium">Monthly Revenue Impact</span>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">Live</span>
          </div>
        </div>
        {/* Simple bar chart visualization */}
        <div className="flex items-end justify-between h-24 gap-2">
          {[35, 45, 40, 55, 60, 75, 85, 90, 88, 95, 100, 110].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-primary to-green-400 rounded-t"
                style={{ height: `${height}%` }}
              />
              <span className="text-slate-500 text-[10px]">
                {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
          <Users className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">12</p>
          <p className="text-slate-400 text-xs">Active Agents</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
          <Zap className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">2.3M</p>
          <p className="text-slate-400 text-xs">Tasks Completed</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
          <TrendingUp className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">340%</p>
          <p className="text-slate-400 text-xs">ROI</p>
        </div>
      </div>

      <p className="text-center text-slate-500 text-sm mt-6 italic">
        "Real-time visibility into financial impact and operational efficiency."
      </p>
    </div>
  );
}

const mockupComponents = [
  DiagnosisMockup,
  IntegrationMockup,
  AgentConsoleMockup,
  ROIDashboardMockup,
];

export function HowItWorks() {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);
  useScrollReveal();

  const ActiveMockup = mockupComponents[activeStep];

  return (
    <section className="relative py-24 px-4 bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Deployment Methodology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four steps to transform your healthcare operations with autonomous AI agents
          </p>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 scroll-reveal">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            
            return (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "relative p-5 rounded-xl border-2 transition-all duration-300 text-left group",
                  isActive 
                    ? "bg-primary/10 border-primary shadow-lg" 
                    : "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                {/* Step Number */}
                <div className={cn(
                  "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className={cn(
                  "font-semibold mb-1 transition-colors",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {step.desc}
                </p>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary rotate-45 rounded-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mockup Display Area */}
        <div className="scroll-reveal">
          <div 
            key={activeStep}
            className="animate-fade-in"
          >
            <ActiveMockup />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center scroll-reveal">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-muted border border-border">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-foreground">
              Enterprise Healthcare Infrastructure
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
