import { useState } from 'react';
import { FileCode2, FileText, Search, CheckCircle, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Slider } from '@/components/ui/slider';

export default function AgentRIPS() {
  const { toast } = useToast();
  const [clinicalNote, setClinicalNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Array<{
    code: string;
    description: string;
    type: string;
    compliant: boolean;
  }> | null>(null);
  const [roiValue, setRoiValue] = useState(10000);

  const handleGenerateRIPS = async () => {
    if (!clinicalNote.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste a clinical note first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setResults(null);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock RIPS results
    setResults([
      { code: 'J18.9', description: 'Neumonía, no especificada', type: 'CIE-10', compliant: true },
      { code: '890302', description: 'Consulta de urgencias, por medicina especializada', type: 'CUPS', compliant: true },
      { code: '903841', description: 'Radiografía de tórax', type: 'CUPS', compliant: true },
      { code: 'A09.9', description: 'Diarrea y gastroenteritis infecciosa', type: 'CIE-10', compliant: true },
      { code: '906201', description: 'Hemograma completo', type: 'CUPS', compliant: true },
    ]);

    setIsProcessing(false);
    toast({
      title: 'RIPS Generated',
      description: 'Clinical note validated against Colombian regulations.',
    });
  };

  const handleSampleData = () => {
    setClinicalNote(`NOTA CLÍNICA - URGENCIAS
Fecha: 2024-01-15
Paciente: Masculino, 45 años

MOTIVO DE CONSULTA: Dificultad respiratoria y fiebre de 3 días de evolución.

ENFERMEDAD ACTUAL: Paciente refiere cuadro de 3 días de evolución caracterizado por tos productiva con expectoración amarillenta, fiebre cuantificada hasta 38.5°C, y disnea progresiva. Niega dolor torácico. Ha presentado además deposiciones líquidas en 4 ocasiones.

EXAMEN FÍSICO:
- TA: 120/80 mmHg, FC: 92 lpm, FR: 24 rpm, T: 38.2°C, SatO2: 92%
- Tórax: Murmullo vesicular disminuido en base derecha, estertores crepitantes
- Abdomen: Blando, depresible, ruidos intestinales aumentados

IMPRESIÓN DIAGNÓSTICA:
1. Neumonía adquirida en comunidad
2. Síndrome diarreico agudo

PLAN:
- Radiografía de tórax PA y lateral
- Hemograma completo
- Iniciar antibioticoterapia empírica`);
    
    toast({
      title: 'Sample Loaded',
      description: 'Sample clinical note loaded. Click "Generate RIPS" to process.',
    });
  };

  // Calculate ROI: (Volume * Average Glosa Cost ~$50,000 COP) * 8% Recovery Rate
  const calculateSavings = (volume: number) => {
    const avgGlosaCost = 50000; // COP per invoice
    const recoveryRate = 0.08;
    const annualSavings = volume * 12 * avgGlosaCost * recoveryRate;
    return `$${(annualSavings / 1000000).toFixed(0)}M COP`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 bg-background overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(ellipse 100% 60% at 50% 0%, hsl(var(--agent-compliance)), transparent)`
          }}
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: `hsl(var(--agent-compliance) / 0.3)`,
                background: `hsl(var(--agent-compliance) / 0.08)`,
                color: `hsl(var(--agent-compliance))`
              }}
            >
              <FileCode2 className="w-4 h-4" />
              Compliance Automation
            </div>
          </div>

          {/* Agent Icon */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{
                background: `hsl(var(--agent-compliance))`,
                boxShadow: `0 20px 40px -15px hsl(var(--agent-compliance) / 0.4)`
              }}
            >
              <FileCode2 className="w-14 h-14" />
            </div>
          </div>

          {/* Title & Value Prop */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Sovereign RIPS & Coding Engine
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              Eliminate technical glosas by validating 100% of claims against Colombian regulation before submission.
            </p>
          </div>

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mb-12">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ color: `hsl(var(--agent-compliance))` }}
              >
                99.8%
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Coding Accuracy
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ color: `hsl(var(--agent-compliance))` }}
              >
                &lt;2 Sec
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Per Claim
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ color: `hsl(var(--agent-compliance))` }}
              >
                0%
              </div>
              <div className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Compliance Risk
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              From clinical note to validated RIPS in seconds
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative max-w-xl mx-auto">
            <div 
              className="absolute left-6 top-6 bottom-6 w-0.5"
              style={{ background: `linear-gradient(to bottom, hsl(var(--agent-compliance)), hsl(var(--agent-compliance) / 0.2))` }}
            />

            <div className="space-y-0">
              {/* Step 1: Input */}
              <div className="relative flex items-start gap-6 py-6">
                <div 
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
                  style={{
                    background: `hsl(var(--agent-compliance))`,
                    boxShadow: `0 8px 20px -6px hsl(var(--agent-compliance) / 0.5)`
                  }}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Input: Clinical Note</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Receive unstructured clinical notes in PDF or text format from any HIS/EHR system.
                  </p>
                </div>
              </div>

              {/* Step 2: Process */}
              <div className="relative flex items-start gap-6 py-6">
                <div 
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
                  style={{
                    background: `hsl(var(--agent-compliance))`,
                    boxShadow: `0 8px 20px -6px hsl(var(--agent-compliance) / 0.5)`
                  }}
                >
                  <Search className="w-6 h-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">AI Processing</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Galatea extracts diagnoses → Maps to CIE-10/CUPS codes → Cross-references with Resolution 510/RIPS requirements.
                  </p>
                </div>
              </div>

              {/* Step 3: Output */}
              <div className="relative flex items-start gap-6 py-6">
                <div 
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg"
                  style={{
                    background: `hsl(var(--agent-compliance))`,
                    boxShadow: `0 8px 20px -6px hsl(var(--agent-compliance) / 0.5)`
                  }}
                >
                  <FileJson className="w-6 h-6" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">Output: Validated RIPS</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Generate a validated JSON RIPS file ready for submission to ADRES, with 0% technical glosas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4 font-medium">Powered By</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Resolution 510', 'CIE-10', 'CUPS', 'RIPS v2.0', 'HIPAA Compliant'].map((tech, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm font-medium text-foreground shadow-sm"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
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
            {['SAP', 'Epic', 'Servinte', 'Dynamics 365', 'ADRES'].map((name, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-xl px-8 py-6 text-center shadow-sm hover:shadow-md transition-all min-w-[140px]"
              >
                <div className="text-lg font-semibold text-foreground">{name}</div>
              </div>
            ))}
            
            <div 
              className="rounded-xl p-5 flex items-center justify-center text-white shadow-lg"
              style={{
                background: `hsl(var(--agent-compliance))`,
                boxShadow: `0 15px 30px -10px hsl(var(--agent-compliance) / 0.4)`
              }}
            >
              <FileCode2 className="w-10 h-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Calculate Your ROI
            </h2>
            <p className="text-muted-foreground text-lg">
              See potential recovered revenue from eliminated glosas
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <label className="text-base font-medium text-foreground">
                  Monthly Invoices Processed
                </label>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: `hsl(var(--agent-compliance))` }}
                >
                  {roiValue.toLocaleString()}
                </span>
              </div>
              <Slider
                value={[roiValue]}
                onValueChange={(value) => setRoiValue(value[0])}
                min={1000}
                max={100000}
                step={1000}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>1,000</span>
                <span>100,000</span>
              </div>
            </div>

            <div 
              className="text-center p-8 rounded-xl border"
              style={{ 
                background: `hsl(var(--agent-compliance) / 0.05)`,
                borderColor: `hsl(var(--agent-compliance) / 0.2)`
              }}
            >
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-2">
                Potential Recovered Revenue (Annual)
              </p>
              <p 
                className="text-4xl md:text-5xl font-bold"
                style={{ color: `hsl(var(--agent-compliance))` }}
              >
                {calculateSavings(roiValue)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Based on 8% glosa recovery rate × $50,000 COP avg glosa cost
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="live-demo" className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border mb-4"
              style={{
                borderColor: `hsl(var(--agent-compliance) / 0.3)`,
                background: `hsl(var(--agent-compliance) / 0.08)`,
                color: `hsl(var(--agent-compliance))`
              }}
            >
              <FileCode2 className="w-4 h-4" />
              Interactive Playground
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Try the Agent</h2>
            <p className="text-muted-foreground text-lg">
              Paste a clinical note and generate validated RIPS codes instantly
            </p>
          </div>

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
              <span className="text-sm font-mono text-muted-foreground">RIPS Engine v2.0</span>
              <div className="flex items-center gap-2 text-xs text-success font-medium">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Ready
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Paste Clinical Note
                </label>
                <Textarea
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  placeholder="Paste your clinical note here (in Spanish)..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handleSampleData}
                  className="gap-2"
                >
                  Load Sample Note
                </Button>
                <Button
                  onClick={handleGenerateRIPS}
                  disabled={isProcessing || !clinicalNote.trim()}
                  className="gap-2 text-primary-foreground"
                  style={{ background: `hsl(var(--agent-compliance))` }}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileCode2 className="w-4 h-4" />
                      Generate RIPS
                    </>
                  )}
                </Button>
              </div>

              {/* Results Table */}
              {results && (
                <div className="animate-fade-in mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-base font-semibold text-foreground">Generated RIPS Codes</h3>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Code</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Description</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">Type</th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((item, index) => (
                          <tr key={index} className="border-b border-border/50 last:border-0">
                            <td className="px-4 py-3 font-mono text-sm font-medium" style={{ color: `hsl(var(--agent-compliance))` }}>
                              {item.code}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {item.description}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-2 py-1 bg-muted text-xs font-medium rounded">
                                {item.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.compliant && (
                                <div className="inline-flex items-center gap-1 text-success text-sm font-medium">
                                  <CheckCircle className="w-4 h-4" />
                                  Compliant
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    ✓ All codes validated against Resolution 510/RIPS v2.0
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Eliminate Glosas?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join leading Colombian healthcare institutions automating their RIPS compliance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="gap-2 px-8 text-primary-foreground"
              style={{ background: `hsl(var(--agent-compliance))` }}
            >
              Schedule Demo
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
