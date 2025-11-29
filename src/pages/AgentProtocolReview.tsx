import { FileSearch, Upload, Cpu, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentProtocolReview() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `✅ Protocol Review Complete

📋 CLINICAL TRIAL PROTOCOL ANALYSIS

STUDY: Phase III Diabetes Trial
SPONSOR: [Pharmaceutical Company]
VERSION: 3.2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLIANT SECTIONS:
  • Primary endpoints clearly defined
  • Randomization methodology sound
  • Statistical analysis plan complete
  • Safety monitoring adequate

⚠️ ISSUES DETECTED (3):

1. INCLUSION CRITERIA (High Priority)
   Section: 4.2
   Issue: HbA1c range conflicts with exclusion criteria
   Impact: May exclude target population

2. DOSING SCHEDULE (Medium Priority)
   Section: 6.1
   Issue: Titration timing unclear
   Recommendation: Specify day ranges

3. CONCOMITANT MEDICATIONS (Low Priority)
   Section: 7.3
   Issue: Metformin interaction not addressed
   Recommendation: Add guidance

📊 PROTOCOL QUALITY SCORE: 87/100

✓ ICH-GCP compliant
✓ Ready for INVIMA submission with corrections`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample clinical protocol...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Protocol Auditor AI"
      tagline="AI-powered clinical trial protocol review for pharmaceutical and research teams"
      specialty="Clinical Research"
      description="Reviews clinical trial protocols against ICH-GCP guidelines, detects inconsistencies, and ensures inclusion/exclusion criteria alignment. Essential for regulatory submission readiness."
      category="pharma"
      icon={<FileSearch className="w-full h-full" />}
      kpiStats={[
        { value: '92%', label: 'Issue Detection' },
        { value: 'ICH-GCP', label: 'Compliant' },
        { value: '70%', label: 'Faster Review' },
      ]}
      workflowSteps={[
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
      ]}
      techStack={['ICH-GCP', 'INVIMA', 'FDA Guidelines', 'Protocol AI']}
      integrations={[
        { name: 'Veeva' },
        { name: 'Medidata' },
        { name: 'CTMS' },
        { name: 'REDCap' },
        { name: 'EDC Systems' },
      ]}
      roiCalculator={{
        unitLabel: 'Protocols Reviewed Per Year',
        minValue: 5,
        maxValue: 100,
        step: 5,
        defaultValue: 25,
        calculateSavings: (value) => `$${(value * 15000).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes=".pdf,.docx"
      uploadLabel="Upload Protocol Document"
      sampleDataAction={handleSampleData}
    />
  );
}
