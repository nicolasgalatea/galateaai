import { useState, useRef, ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Upload, Loader2, CheckCircle, ArrowRight, Play, FileText, 
  Zap, Shield, ArrowDown, Sparkles, DollarSign
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
  name: string;
  tagline: string;
  specialty: string;
  description: string;
  category: keyof typeof categoryColors;
  icon: ReactNode;
  kpiStats: KPIStat[];
  workflowSteps: WorkflowStep[];
  techStack?: string[];
  integrations?: Integration[];
  roiCalculator?: {
    unitLabel: string;
    minValue: number;
    maxValue: number;
    step: number;
    defaultValue: number;
    calculateSavings: (value: number) => string;
    savingsLabel: string;
  };
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

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HERO - THE PROMISE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-4 bg-background overflow-hidden">
        {/* Subtle gradient overlay */}
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
              {specialty}
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
              <div className="w-14 h-14">{icon}</div>
            </div>
          </div>

          {/* Title & Value Prop */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {name}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              {tagline}
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
            {/* Connecting Line */}
            <div 
              className="absolute left-6 top-6 bottom-6 w-0.5"
              style={{ background: `linear-gradient(to bottom, hsl(var(--${categoryColor})), hsl(var(--${categoryColor}) / 0.2))` }}
            />

            <div className="space-y-0">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative flex items-start gap-6 py-6">
                  {/* Step Number Circle */}
                  <div 
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
                    style={{
                      background: `hsl(var(--${categoryColor}))`,
                      boxShadow: `0 8px 20px -6px hsl(var(--${categoryColor}) / 0.5)`
                    }}
                  >
                    {step.icon || <span className="text-lg">{index + 1}</span>}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Arrow Down (except last) */}
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
      {integrations.length > 0 && (
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

            {/* Integration Grid */}
            <div className="flex flex-wrap justify-center items-center gap-6">
              {integrations.map((integration, index) => (
                <div 
                  key={index}
                  className="bg-card border border-border rounded-xl px-8 py-6 text-center shadow-sm hover:shadow-md hover:border-border/80 transition-all min-w-[140px]"
                >
                  <div className="text-lg font-semibold text-foreground">{integration.name}</div>
                </div>
              ))}
              
              {/* Central Agent Connector */}
              <div 
                className="rounded-xl p-5 flex items-center justify-center text-white shadow-lg"
                style={{
                  background: `hsl(var(--${categoryColor}))`,
                  boxShadow: `0 15px 30px -10px hsl(var(--${categoryColor}) / 0.4)`
                }}
              >
                <div className="w-10 h-10">{icon}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4: ROI SIMULATOR - THE MONEY
      ═══════════════════════════════════════════════════════════════════════ */}
      {roiCalculator && (
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
              {/* Volume Input */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-base font-medium text-foreground">
                    {roiCalculator.unitLabel}
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
                  min={roiCalculator.minValue}
                  max={roiCalculator.maxValue}
                  step={roiCalculator.step}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{roiCalculator.minValue.toLocaleString()}</span>
                  <span>{roiCalculator.maxValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Savings Display */}
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
                    {roiCalculator.savingsLabel}
                  </p>
                </div>
                <p 
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: `hsl(var(--${categoryColor}))` }}
                >
                  {roiCalculator.calculateSavings(roiValue)}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5: INTERACTIVE DEMO PLAYGROUND
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="live-demo" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border mb-4"
              style={{
                borderColor: `hsl(var(--${categoryColor}) / 0.3)`,
                background: `hsl(var(--${categoryColor}) / 0.08)`,
                color: `hsl(var(--${categoryColor}))`
              }}
            >
              <Zap className="w-4 h-4" />
              Interactive Playground
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Try the Agent</h2>
            <p className="text-muted-foreground text-lg">
              Experience the agent's capabilities with your own data
            </p>
          </div>

          {/* Demo Interface Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            {/* Header Bar */}
            <div className="bg-muted/50 px-6 py-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
              </div>
              <span className="text-sm font-mono text-muted-foreground">{name}</span>
              <div className="flex items-center gap-2 text-xs text-success font-medium">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Ready
              </div>
            </div>

            {/* Demo Content */}
            <div className="p-6 md:p-8">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {filePreview || selectedFile ? (
                <div className="space-y-6">
                  {/* File Preview */}
                  {filePreview && (
                    <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                      <img
                        src={filePreview}
                        alt="Selected file"
                        className="w-full h-auto max-h-72 object-contain"
                      />
                    </div>
                  )}
                  {selectedFile && !filePreview && (
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-muted/50 border border-border">
                      <FileText className="w-10 h-10 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
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
                      className="gap-2 text-primary-foreground"
                      style={{ background: `hsl(var(--${categoryColor}))` }}
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
                  {/* Upload Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
                  >
                    <div 
                      className="w-16 h-16 mx-auto mb-5 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                      style={{
                        background: `hsl(var(--${categoryColor}) / 0.1)`,
                        color: `hsl(var(--${categoryColor}))`
                      }}
                    >
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-1">{uploadLabel}</p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to select
                    </p>
                  </div>

                  {/* Sample Data Button */}
                  {sampleDataAction && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">Or try with sample data</p>
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

              {/* Results */}
              {results && (
                <div className="mt-6 animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-base font-semibold text-foreground">Analysis Results</h3>
                  </div>
                  <div className="bg-muted/50 border border-border rounded-xl p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {results}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join leading healthcare organizations that trust our AI agents.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 px-8 text-primary-foreground"
              style={{ background: `hsl(var(--${categoryColor}))` }}
            >
              Schedule Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="px-8">
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
