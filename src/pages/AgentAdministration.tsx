import { FileText, ClipboardList, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentAdministration() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Administrative Document Generated

📋 CERTIFICATE OF MEDICAL DISABILITY

PATIENT: [Auto-filled from record]
ID: ************1234
DATE: ${new Date().toLocaleDateString()}

DIAGNOSIS:
M54.5 - Lumbalgia

MEDICAL OPINION:
Patient requires temporary work restriction due to acute lower back pain with muscle spasm.

RECOMMENDED REST PERIOD:
5 calendar days (${new Date().toLocaleDateString()} - ${new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString()})

WORK RESTRICTIONS:
  • No lifting >5 kg
  • Avoid prolonged sitting
  • Ergonomic assessment recommended

FOLLOW-UP:
Return if symptoms persist after rest period.

✓ Ready for physician signature
✓ EPS submission format compliant`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample patient data...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Admin Document Generator"
      tagline="Automate medical certificates, referrals, disability forms, and insurance authorizations"
      specialty="Administrative Efficiency"
      description="AI generates compliant administrative documents including medical certificates, work disability notes, referral letters, and insurance pre-authorizations from clinical data."
      category="ops"
      icon={<FileText className="w-full h-full" />}
      kpiStats={[
        { value: '30 Sec', label: 'Per Document' },
        { value: '95%', label: 'Compliance' },
        { value: '4 Hrs', label: 'Saved/Day' },
      ]}
      workflowSteps={[
        {
          title: 'Patient Selection',
          description: 'Select patient from EHR or upload clinical summary.',
          icon: <ClipboardList className="w-6 h-6" />,
        },
        {
          title: 'Document Generation',
          description: 'AI auto-fills templates based on diagnosis, treatment plan, and regulatory requirements.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Compliant Output',
          description: 'Generates EPS/insurance-compliant documents ready for signature and submission.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['EPS Templates', 'Res. 3100', 'PDF Generation', 'Digital Signature']}
      integrations={[
        { name: 'Servinte' },
        { name: 'Dynamics 365' },
        { name: 'EPS Systems' },
        { name: 'ADRES' },
        { name: 'Email' },
      ]}
      roiCalculator={{
        unitLabel: 'Documents Generated Monthly',
        minValue: 100,
        maxValue: 10000,
        step: 100,
        defaultValue: 2000,
        calculateSavings: (value) => `$${(value * 3).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.pdf"
      uploadLabel="Upload Patient Record"
      sampleDataAction={handleSampleData}
    />
  );
}
