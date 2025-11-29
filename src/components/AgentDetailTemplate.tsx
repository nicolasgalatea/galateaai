import { useState, useRef, ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, Loader2, CheckCircle, ArrowRight, Play, FileText, 
  Zap, Shield, Clock, TrendingUp, Database, Cpu, Lock,
  ChevronRight, Sparkles, BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Agent category color mapping
const categoryColors: Record<string, string> = {
  finance: 'agent-finance',
  clinical: 'agent-clinical',
  legal: 'agent-legal',
  research: 'agent-research',
  surgical: 'agent-surgical',
  compliance: 'agent-compliance',
  efficiency: 'agent-efficiency',
  audit: 'agent-audit',
  ops: 'agent-ops',
  pharma: 'agent-pharma',
};

interface KPIStat {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface WorkflowStep {
  title: string;
  description: string;
  icon?: ReactNode;
}

interface Integration {
  name: string;
  logo?: string;
}

interface AgentDetailTemplateProps {
  // Basic Info
  name: string;
  tagline: string;
  specialty: string;
  description: string;
  category: keyof typeof categoryColors;
  icon: ReactNode;
  
  // KPI Stats
  kpiStats: KPIStat[];
  
  // Workflow
  workflowSteps: WorkflowStep[];
  techStack?: string[];
  
  // Integrations
  integrations?: Integration[];
  
  // ROI Calculator
  roiCalculator?: {
    unitLabel: string;
    minValue: number;
    maxValue: number;
    step: number;
    defaultValue: number;
    calculateSavings: (value: number) => string;
    savingsLabel: string;
  };
  
  // Demo functionality
  onAnalyze?: (file: File) => Promise<string>;
  acceptedFileTypes?: string;
  uploadLabel?: string;
  sampleDataAction?: () => void;
}

export function AgentDetailTemplate({
  name,
  tagline,
  specialty,
  description,
  category,
  icon,
  kpiStats,
  workflowSteps,
  techStack = ['AWS Bedrock', 'Python', 'HIPAA Compliant'],
  integrations = [],
  roiCalculator,
  onAnalyze,
  acceptedFileTypes = 'image/*',
  uploadLabel = 'Upload File',
  sampleDataAction,
}: AgentDetailTemplateProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [roiValue, setRoiValue] = useState(roiCalculator?.defaultValue || 5000);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryColor = categoryColors[category] || 'agent-finance';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setResults(null);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !onAnalyze) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const result = await onAnalyze(selectedFile);
      setResults(result);
      toast({
        title: 'Analysis Complete',
        description: 'Your file has been processed successfully.',
      });
    } catch (error) {
      console.error('Error analyzing file:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to process the file.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--${categoryColor}) / 0.3), transparent)`
          }}
        />
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Agent Info */}
            <div className="space-y-8">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: `hsl(var(--${categoryColor}) / 0.15)`,
                  color: `hsl(var(--${categoryColor}))`
                }}
              >
                <Sparkles className="w-4 h-4" />
                {specialty}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {name}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground font-light">
                {tagline}
              </p>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="gap-2 text-lg px-8"
                  style={{
                    background: `hsl(var(--${categoryColor}))`,
                  }}
                  onClick={() => document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-5 h-5" />
                  Try Live Demo
                </Button>
                <Button variant="outline" size="lg" className="gap-2 text-lg px-8">
                  Request Full Demo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Right: Visual + KPIs */}
            <div className="space-y-8">
              {/* 3D-like Agent Visual */}
              <div 
                className="relative rounded-3xl p-8 glass-card-highlighted border border-border/50 overflow-hidden"
                style={{
                  boxShadow: `0 20px 80px -20px hsl(var(--${categoryColor}) / 0.3)`
                }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i}
                        className="absolute rounded-full animate-pulse"
                        style={{
                          width: `${20 + i * 15}%`,
                          height: `${20 + i * 15}%`,
                          top: `${50 - (20 + i * 15) / 2}%`,
                          left: `${50 - (20 + i * 15) / 2}%`,
                          border: `1px solid hsl(var(--${categoryColor}) / ${0.3 - i * 0.04})`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: '3s'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center py-12">
                  <div 
                    className="w-40 h-40 rounded-2xl flex items-center justify-center text-white shadow-2xl transform hover:scale-105 transition-transform duration-300"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.7))`,
                      boxShadow: `0 25px 50px -12px hsl(var(--${categoryColor}) / 0.4)`
                    }}
                  >
                    <div className="w-24 h-24">
                      {icon}
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  Active
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-4">
                {kpiStats.map((stat, index) => (
                  <div 
                    key={index}
                    className="glass-card rounded-2xl p-5 border border-border/50 text-center hover-lift"
                  >
                    <div 
                      className="text-3xl md:text-4xl font-bold mb-2"
                      style={{ color: `hsl(var(--${categoryColor}))` }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Understand the intelligent workflow behind the automation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Workflow Timeline */}
            <div className="relative">
              <div 
                className="absolute left-8 top-8 bottom-8 w-0.5"
                style={{ background: `linear-gradient(to bottom, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.2))` }}
              />
              
              <div className="space-y-8">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="relative flex gap-6 items-start">
                    <div 
                      className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                      style={{
                        background: `linear-gradient(135deg, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.7))`,
                        boxShadow: `0 8px 24px -8px hsl(var(--${categoryColor}) / 0.4)`
                      }}
                    >
                      {step.icon || index + 1}
                    </div>
                    <div className="flex-1 glass-card rounded-xl p-6 border border-border/50">
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="glass-card rounded-2xl p-8 border border-border/50 space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5" style={{ color: `hsl(var(--${categoryColor}))` }} />
                  Technology Stack
                </h3>
                <div className="flex flex-wrap gap-3">
                  {techStack.map((tech, index) => (
                    <div 
                      key={index}
                      className="px-4 py-2 rounded-lg bg-muted font-medium text-sm flex items-center gap-2"
                    >
                      {tech.includes('HIPAA') && <Shield className="w-4 h-4 text-success" />}
                      {tech.includes('AWS') && <Database className="w-4 h-4 text-warning" />}
                      {tech.includes('Python') && <Zap className="w-4 h-4 text-info" />}
                      {tech}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" style={{ color: `hsl(var(--${categoryColor}))` }} />
                  Security & Compliance
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {['HIPAA Compliant', 'SOC 2 Type II', 'ISO 27001', 'GDPR Ready'].map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      {integrations.length > 0 && (
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Seamlessly Integrated</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Plug-and-play via API or RPA. No disruption to your core system.
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8">
              {integrations.map((integration, index) => (
                <div 
                  key={index}
                  className="glass-card rounded-2xl p-8 border border-border/50 hover-lift flex flex-col items-center justify-center min-w-[160px]"
                >
                  {integration.logo ? (
                    <img src={integration.logo} alt={integration.name} className="h-12 mb-3 opacity-70" />
                  ) : (
                    <Database className="w-12 h-12 mb-3 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm text-center">{integration.name}</span>
                </div>
              ))}
              
              {/* Central Agent Icon */}
              <div 
                className="rounded-2xl p-6 flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.7))`,
                  boxShadow: `0 20px 40px -12px hsl(var(--${categoryColor}) / 0.4)`
                }}
              >
                <div className="w-16 h-16">{icon}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ROI Calculator Section */}
      {roiCalculator && (
        <section className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Calculate Your ROI</h2>
              <p className="text-xl text-muted-foreground">
                See the potential savings for your organization
              </p>
            </div>

            <div 
              className="glass-card-highlighted rounded-3xl p-8 md:p-12 border border-border/50"
              style={{
                boxShadow: `0 20px 60px -20px hsl(var(--${categoryColor}) / 0.2)`
              }}
            >
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-lg font-medium">{roiCalculator.unitLabel}</label>
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
                    min={roiCalculator.minValue}
                    max={roiCalculator.maxValue}
                    step={roiCalculator.step}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{roiCalculator.minValue.toLocaleString()}</span>
                    <span>{roiCalculator.maxValue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-center p-8 rounded-2xl bg-muted/50">
                  <p className="text-muted-foreground mb-2">{roiCalculator.savingsLabel}</p>
                  <p 
                    className="text-5xl md:text-6xl font-bold"
                    style={{ color: `hsl(var(--${categoryColor}))` }}
                  >
                    {roiCalculator.calculateSavings(roiValue)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="font-bold">85%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="font-bold">99.2%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <BarChart3 className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">ROI Period</p>
                    <p className="font-bold">30 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Demo Section */}
      <section id="live-demo" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{
                background: `hsl(var(--${categoryColor}) / 0.15)`,
                color: `hsl(var(--${categoryColor}))`
              }}
            >
              <Play className="w-4 h-4" />
              Live Simulator
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try It Now</h2>
            <p className="text-xl text-muted-foreground">
              Experience the agent's capabilities with your own data
            </p>
          </div>

          <div 
            className="glass-card rounded-3xl border border-border/50 overflow-hidden"
            style={{
              boxShadow: `0 20px 60px -20px hsl(var(--${categoryColor}) / 0.2)`
            }}
          >
            {/* Terminal-like header */}
            <div className="bg-muted/50 px-6 py-4 flex items-center gap-2 border-b border-border/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm font-mono text-muted-foreground">{name} — Live Demo</span>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {filePreview || selectedFile ? (
                <div className="space-y-6">
                  {filePreview && (
                    <div className="rounded-xl border border-border overflow-hidden bg-muted/50">
                      <img
                        src={filePreview}
                        alt="Selected file"
                        className="w-full h-auto max-h-80 object-contain"
                      />
                    </div>
                  )}
                  {selectedFile && !filePreview && (
                    <div className="flex items-center gap-4 p-6 rounded-xl bg-muted/50">
                      <FileText className="w-12 h-12 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Change File
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || isAnalyzing || !onAnalyze}
                      className="gap-2"
                      style={{
                        background: `hsl(var(--${categoryColor}))`,
                      }}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Run Analysis
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-all duration-300 group"
                  >
                    <div 
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-opacity-100"
                      style={{
                        background: `hsl(var(--${categoryColor}) / 0.15)`,
                        color: `hsl(var(--${categoryColor}))`
                      }}
                    >
                      <Upload className="w-10 h-10" />
                    </div>
                    <p className="text-xl font-semibold mb-2">{uploadLabel}</p>
                    <p className="text-muted-foreground">
                      Drag & drop or click to select your file
                    </p>
                  </div>

                  {sampleDataAction && (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">Or try with sample data</p>
                      <Button
                        variant="outline"
                        onClick={sampleDataAction}
                        className="gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Try with Sample Data
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {results && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-lg font-semibold">Analysis Results</h3>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {results}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading healthcare organizations that trust our AI agents to optimize their workflows.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 text-lg px-8"
              style={{
                background: `hsl(var(--${categoryColor}))`,
              }}
            >
              Schedule Demo
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-lg px-8">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AgentDetailTemplate;
