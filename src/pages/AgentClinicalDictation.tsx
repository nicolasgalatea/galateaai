import { Mic, AudioLines, Cpu, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentClinicalDictation() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `✅ Transcription Complete

📋 STRUCTURED CLINICAL NOTE:

PATIENT: [Auto-extracted]
DATE: ${new Date().toLocaleDateString()}

CHIEF COMPLAINT:
Chest pain x 2 days, worse with exertion

HISTORY OF PRESENT ILLNESS:
45-year-old male presents with substernal chest pain...

PHYSICAL EXAMINATION:
• Vitals: BP 138/88, HR 82, RR 16, SpO2 98%
• Cardiac: Regular rhythm, no murmurs
• Lungs: Clear bilateral

ASSESSMENT:
1. Atypical chest pain - low risk ACS
2. Essential hypertension, uncontrolled

PLAN:
1. EKG and troponin
2. Stress test if negative
3. Adjust antihypertensive therapy

✓ Ready for physician signature`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample clinical dictation audio...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Voice-to-Record AI"
      tagline="Transform verbal clinical notes into structured, EHR-ready medical records in real-time"
      specialty="Clinical Documentation"
      description="Advanced speech recognition with medical NLP transforms physician dictations into validated, structured records. Supports Spanish and English with medical terminology."
      category="efficiency"
      icon={<Mic className="w-full h-full" />}
      kpiStats={[
        { value: '98%', label: 'Accuracy' },
        { value: '3x', label: 'Faster' },
        { value: '2 Hrs', label: 'Saved/Day' },
      ]}
      workflowSteps={[
        {
          title: 'Voice Input',
          description: 'Record or upload audio dictation in any format (MP3, WAV, M4A).',
          icon: <AudioLines className="w-6 h-6" />,
        },
        {
          title: 'NLP Processing',
          description: 'Medical speech recognition extracts entities, diagnoses, and procedures with context awareness.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Structured Output',
          description: 'Generates SOAP notes, discharge summaries, or custom templates ready for EHR.',
          icon: <FileText className="w-6 h-6" />,
        },
      ]}
      techStack={['Whisper AI', 'Medical NLP', 'HIPAA Compliant', 'HL7 FHIR']}
      integrations={[
        { name: 'Epic' },
        { name: 'Cerner' },
        { name: 'Servinte' },
        { name: 'Medifolios' },
        { name: 'FHIR' },
      ]}
      roiCalculator={{
        unitLabel: 'Dictations Per Month',
        minValue: 100,
        maxValue: 10000,
        step: 100,
        defaultValue: 2000,
        calculateSavings: (value) => `$${(value * 8).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="audio/*,.mp3,.wav,.m4a"
      uploadLabel="Upload Audio Dictation"
      sampleDataAction={handleSampleData}
    />
  );
}
