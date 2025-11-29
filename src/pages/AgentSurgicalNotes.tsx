import { Scissors, FileText, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentSurgicalNotes() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `✅ Surgical Note Generated

📋 OPERATIVE REPORT

PROCEDURE: Laparoscopic Cholecystectomy
DATE: ${new Date().toLocaleDateString()}
SURGEON: [Auto-filled from system]

PREOPERATIVE DIAGNOSIS:
Cholelithiasis with chronic cholecystitis

POSTOPERATIVE DIAGNOSIS:
Same as above

PROCEDURE DETAILS:
Patient placed in supine position under general anesthesia...
Four-port technique employed...
Gallbladder dissected from liver bed...
Critical view of safety achieved...

SPECIMENS: Gallbladder sent to pathology

ESTIMATED BLOOD LOSS: <50 mL
COMPLICATIONS: None
DISPOSITION: Recovery room, stable

✓ Ready for surgeon signature`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample surgical procedure notes...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Surgical Documentation AI"
      tagline="Generate complete operative reports from brief surgical notes in under 2 minutes"
      specialty="Surgical Documentation"
      description="Transforms surgeon dictations and brief notes into comprehensive operative reports with all required fields, procedure codes, and post-op instructions."
      category="surgical"
      icon={<Scissors className="w-full h-full" />}
      kpiStats={[
        { value: '94%', label: 'Completeness' },
        { value: '<2 Min', label: 'Generation' },
        { value: '75%', label: 'Time Saved' },
      ]}
      workflowSteps={[
        {
          title: 'Surgical Input',
          description: 'Upload brief operative notes, dictation, or procedure summary.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'AI Expansion',
          description: 'Medical AI expands notes into standardized operative report format with all required sections.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Complete Report',
          description: 'Generates signature-ready report with procedure codes and post-op orders.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['Surgical Templates', 'Medical NLP', 'HIPAA Compliant', 'CPT Codes']}
      integrations={[
        { name: 'Epic' },
        { name: 'Cerner' },
        { name: 'Servinte' },
        { name: 'OR Systems' },
        { name: 'Anesthesia' },
      ]}
      roiCalculator={{
        unitLabel: 'Surgeries Per Month',
        minValue: 50,
        maxValue: 2000,
        step: 50,
        defaultValue: 300,
        calculateSavings: (value) => `$${(value * 25).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="audio/*,image/*,.pdf,.txt"
      uploadLabel="Upload Surgical Notes"
      sampleDataAction={handleSampleData}
    />
  );
}
