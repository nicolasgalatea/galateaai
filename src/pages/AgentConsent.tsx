import { FileSignature, FileText, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentConsent() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Informed Consent Generated

📋 INFORMED CONSENT DOCUMENT

PROCEDURE: Laparoscopic Cholecystectomy
PATIENT: [Auto-filled]
DATE: ${new Date().toLocaleDateString()}

PROCEDURE DESCRIPTION:
Surgical removal of the gallbladder using minimally invasive technique with 4 small incisions...

EXPECTED BENEFITS:
  • Resolution of biliary colic
  • Prevention of complications
  • Quick recovery (1-2 weeks)

RISKS AND COMPLICATIONS:
  • Bleeding (1-2%)
  • Infection (1-3%)
  • Bile duct injury (<0.5%)
  • Conversion to open surgery (5%)

ALTERNATIVES:
  • Medical management
  • Open cholecystectomy
  • Observation

PATIENT ACKNOWLEDGMENT:
☐ I have been informed of the procedure
☐ My questions have been answered
☐ I consent voluntarily

✓ Legally compliant per Colombian law
✓ Ready for patient and physician signatures`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample procedure data...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Consent Builder AI"
      tagline="Generate legally compliant, personalized informed consent documents for any procedure"
      specialty="Legal Documentation"
      description="AI generates procedure-specific informed consent documents tailored to patient profile, risk factors, and institutional requirements. Ensures legal compliance and patient understanding."
      category="legal"
      icon={<FileSignature className="w-full h-full" />}
      kpiStats={[
        { value: '100%', label: 'Legal Compliance' },
        { value: '<1 Min', label: 'Generation' },
        { value: '500+', label: 'Procedures' },
      ]}
      workflowSteps={[
        {
          title: 'Procedure Input',
          description: 'Select procedure type and input patient-specific risk factors.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'AI Personalization',
          description: 'AI customizes consent language based on procedure, patient age, comorbidities, and language preference.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Legal Document',
          description: 'Generates compliant consent form with risk disclosures and signature fields.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['Colombian Medical Law', 'Risk Databases', 'PDF Generation', 'Multi-language']}
      integrations={[
        { name: 'Epic' },
        { name: 'Servinte' },
        { name: 'DocuSign' },
        { name: 'Adobe Sign' },
        { name: 'EHR Systems' },
      ]}
      roiCalculator={{
        unitLabel: 'Consents Generated Monthly',
        minValue: 50,
        maxValue: 5000,
        step: 50,
        defaultValue: 500,
        calculateSavings: (value) => `$${(value * 8).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes=".pdf,.txt"
      uploadLabel="Upload Procedure Details"
      sampleDataAction={handleSampleData}
    />
  );
}
