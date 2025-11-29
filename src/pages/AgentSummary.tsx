import { FileStack, Upload, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentSummary() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `✅ Medical History Summary Generated

📋 EXECUTIVE CLINICAL SUMMARY
Patient: [Auto-filled] | DOB: XX/XX/XXXX | ID: ****1234

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL INFORMATION:
  • Allergies: Penicillin (anaphylaxis), Sulfa
  • Blood Type: O+
  • Implants: Cardiac pacemaker (2019)

📊 CHRONIC CONDITIONS:
  1. Type 2 Diabetes Mellitus (2015)
     - Current HbA1c: 7.2%
     - Metformin 850mg BID
  2. Essential Hypertension (2012)
     - Losartan 50mg daily
  3. Dyslipidemia (2018)
     - Atorvastatin 20mg nightly

🏥 KEY SURGERIES:
  • 2019: Pacemaker implantation
  • 2016: Appendectomy
  • 2010: Right knee arthroscopy

💊 CURRENT MEDICATIONS: 6 active prescriptions

📅 RECENT VISITS: 12 encounters in past year

✓ 15-year history condensed
✓ Suitable for referrals and transfers`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample patient history...',
    });
  };

  return (
    <AgentDetailTemplate
      name="History Condenser AI"
      tagline="Condense 15 years of medical history into a clinically actionable one-page summary"
      specialty="Clinical Efficiency"
      description="AI analyzes extensive medical records and distills them into executive summaries highlighting critical information, chronic conditions, medications, and key surgical history."
      category="efficiency"
      icon={<FileStack className="w-full h-full" />}
      kpiStats={[
        { value: '15 Yrs', label: '→ 1 Page' },
        { value: '<3 Min', label: 'Processing' },
        { value: '100%', label: 'Critical Capture' },
      ]}
      workflowSteps={[
        {
          title: 'Record Upload',
          description: 'Upload multiple years of medical records, PDFs, or connect to EHR.',
          icon: <Upload className="w-6 h-6" />,
        },
        {
          title: 'AI Synthesis',
          description: 'NLP extracts diagnoses, procedures, medications, and risk factors across all documents.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Executive Summary',
          description: 'Generates prioritized one-page summary ideal for referrals and quick reviews.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['Medical NLP', 'OCR', 'HIPAA Compliant', 'Multi-format']}
      integrations={[
        { name: 'Epic' },
        { name: 'Cerner' },
        { name: 'Servinte' },
        { name: 'PDF/Images' },
        { name: 'HL7' },
      ]}
      roiCalculator={{
        unitLabel: 'Patient Summaries Monthly',
        minValue: 50,
        maxValue: 3000,
        step: 50,
        defaultValue: 500,
        calculateSavings: (value) => `$${(value * 15).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.pdf"
      uploadLabel="Upload Medical Records"
      sampleDataAction={handleSampleData}
    />
  );
}
