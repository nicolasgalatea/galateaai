import { Scale, FileText, Search, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentLegalReview() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `✅ Legal Risk Assessment Complete

📋 MEDICOLEGAL REVIEW REPORT

DOCUMENT TYPE: Clinical Record
RISK LEVEL: 🟡 MODERATE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLIANT ELEMENTS:
  • Patient identification complete
  • Informed consent documented
  • Treatment rationale explained
  • Follow-up plan documented

⚠️ RISK AREAS IDENTIFIED:

1. DOCUMENTATION GAP (Medium Risk)
   Location: Progress notes, Day 3
   Issue: No documentation of patient status
   Recommendation: Add addendum

2. INFORMED CONSENT (Low Risk)
   Issue: Alternative treatments not documented
   Recommendation: Update consent form

3. TIMING (Medium Risk)
   Issue: 4-hour delay in documenting critical lab
   Recommendation: Staff education

📊 LITIGATION RISK SCORE: 35/100 (Low-Moderate)

✓ Full recommendations available
✓ Remediation checklist generated`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample clinical documentation...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Legal Risk Analyzer"
      tagline="AI-powered medicolegal review to identify documentation gaps and minimize litigation risk"
      specialty="Risk Management"
      description="Reviews clinical documentation through a legal lens, identifying potential liability issues, documentation gaps, and compliance failures before they become legal problems."
      category="legal"
      icon={<Scale className="w-full h-full" />}
      kpiStats={[
        { value: '88%', label: 'Risk Detection' },
        { value: '60%', label: 'Claims Reduced' },
        { value: '<5 Min', label: 'Review Time' },
      ]}
      workflowSteps={[
        {
          title: 'Document Upload',
          description: 'Upload clinical records, consent forms, or incident reports for review.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'Legal Analysis',
          description: 'AI scans for documentation gaps, timing issues, and potential liability exposures.',
          icon: <Search className="w-6 h-6" />,
        },
        {
          title: 'Risk Report',
          description: 'Generates risk score with specific recommendations and remediation steps.',
          icon: <AlertTriangle className="w-6 h-6" />,
        },
      ]}
      techStack={['Legal AI', 'Colombian Medical Law', 'Risk Scoring', 'NLP']}
      integrations={[
        { name: 'Epic' },
        { name: 'Servinte' },
        { name: 'Risk Management' },
        { name: 'Legal Dept' },
        { name: 'Insurance' },
      ]}
      roiCalculator={{
        unitLabel: 'Records Reviewed Monthly',
        minValue: 50,
        maxValue: 2000,
        step: 50,
        defaultValue: 300,
        calculateSavings: (value) => `$${(value * 50).toLocaleString()} USD`,
        savingsLabel: 'Estimated Risk Avoidance Value',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.pdf"
      uploadLabel="Upload Clinical Record"
      sampleDataAction={handleSampleData}
    />
  );
}
