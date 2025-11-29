import { Code, FileText, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentCoding() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Medical Coding Complete

📋 EXTRACTED CODES:

DIAGNOSES (CIE-10):
  • J18.9 - Neumonía, no especificada (Principal)
  • J96.0 - Insuficiencia respiratoria aguda
  • E11.9 - Diabetes mellitus tipo 2

PROCEDURES (CUPS):
  • 890302 - Consulta de urgencias especializada
  • 903841 - Radiografía de tórax
  • 906201 - Hemograma completo

📊 VALIDATION:
  ✓ All codes valid per CUPS 2024
  ✓ Diagnosis-procedure consistency verified
  ✓ No duplicate codes detected

💰 BILLING ESTIMATE: $450,000 COP

✓ Ready for RIPS submission`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample clinical documentation...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Medical Coding Engine"
      tagline="Automated CIE-10 and CUPS coding from clinical documentation with 99% accuracy"
      specialty="Revenue Cycle"
      description="AI extracts diagnoses and procedures from clinical notes and automatically assigns validated CIE-10 and CUPS codes. Reduces coding errors and accelerates billing cycles."
      category="finance"
      icon={<Code className="w-full h-full" />}
      kpiStats={[
        { value: '99%', label: 'Accuracy' },
        { value: '10x', label: 'Faster' },
        { value: '45%', label: 'Less Denials' },
      ]}
      workflowSteps={[
        {
          title: 'Clinical Input',
          description: 'Upload clinical notes, discharge summaries, or operative reports.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'NLP Extraction',
          description: 'Medical NLP identifies diagnoses, procedures, and maps to official code sets.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Validated Codes',
          description: 'Outputs validated CIE-10/CUPS codes with confidence scores and billing estimates.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['CIE-10', 'CUPS 2024', 'Medical NLP', 'RIPS v2.0']}
      integrations={[
        { name: 'SAP' },
        { name: 'Servinte' },
        { name: 'Dynamics 365' },
        { name: 'ADRES' },
        { name: 'Epic' },
      ]}
      roiCalculator={{
        unitLabel: 'Records Coded Monthly',
        minValue: 500,
        maxValue: 50000,
        step: 500,
        defaultValue: 5000,
        calculateSavings: (value) => `$${(value * 6).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.pdf,.txt"
      uploadLabel="Upload Clinical Document"
      sampleDataAction={handleSampleData}
    />
  );
}
