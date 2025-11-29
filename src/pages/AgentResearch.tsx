import { FlaskConical, FileText, Search, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentResearch() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `✅ Research Analysis Complete

📚 LITERATURE REVIEW SUMMARY:

SEARCH QUERY: "Novel treatments for resistant hypertension"
DATABASES: PubMed, Cochrane, EMBASE
ARTICLES ANALYZED: 847

🔬 KEY FINDINGS:

1. RENAL DENERVATION (34 studies)
   - Efficacy: -8.5 mmHg systolic (meta-analysis)
   - Safety: Low adverse event rate

2. DEVICE-BASED THERAPIES (18 studies)
   - Baroreflex activation promising
   - Long-term data pending

3. NOVEL PHARMACOLOGY (52 studies)
   - Aldosterone synthase inhibitors
   - Phase 3 trials ongoing

📊 EVIDENCE QUALITY: Moderate-High

GAPS IDENTIFIED:
  • Limited data in Latin American populations
  • Cost-effectiveness studies needed

✓ Full report with citations available`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample research query...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Research Intelligence"
      tagline="AI-powered systematic literature review and evidence synthesis for clinical research teams"
      specialty="Research & Evidence"
      description="Automates systematic literature reviews, meta-analyses, and evidence synthesis. Searches multiple databases, extracts data, and generates publication-ready summaries."
      category="research"
      icon={<FlaskConical className="w-full h-full" />}
      kpiStats={[
        { value: '1000+', label: 'Papers/Hour' },
        { value: '85%', label: 'Time Saved' },
        { value: 'PRISMA', label: 'Compliant' },
      ]}
      workflowSteps={[
        {
          title: 'Research Query',
          description: 'Define PICO criteria, keywords, and inclusion/exclusion parameters.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'Literature Search',
          description: 'AI searches PubMed, Cochrane, EMBASE, and extracts relevant data from abstracts and full texts.',
          icon: <Search className="w-6 h-6" />,
        },
        {
          title: 'Evidence Synthesis',
          description: 'Generates PRISMA-compliant reports with quality assessment and meta-analysis where applicable.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['PubMed API', 'Cochrane', 'PRISMA', 'Meta-Analysis']}
      integrations={[
        { name: 'EndNote' },
        { name: 'Zotero' },
        { name: 'Mendeley' },
        { name: 'REDCap' },
        { name: 'SPSS' },
      ]}
      roiCalculator={{
        unitLabel: 'Research Projects Per Year',
        minValue: 5,
        maxValue: 100,
        step: 5,
        defaultValue: 20,
        calculateSavings: (value) => `$${(value * 8000).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes=".pdf,.txt,.docx"
      uploadLabel="Upload Research Protocol"
      sampleDataAction={handleSampleData}
    />
  );
}
