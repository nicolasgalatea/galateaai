import { BookOpen, FileText, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentLogbook() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Logbook Entry Created

📋 SURGICAL LOGBOOK ENTRY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CASE #: 2024-0847
DATE: ${new Date().toLocaleDateString()}
INSTITUTION: Hospital Universitario

PROCEDURE: Laparoscopic Cholecystectomy
CPT CODE: 47562
CUPS CODE: 514400

ROLE: Primary Surgeon
SUPERVISION: Attending (Dr. García)

PATIENT DEMOGRAPHICS:
  • Age: 45 years
  • Gender: Female
  • ASA Score: II

TECHNIQUE DETAILS:
  • Approach: 4-port laparoscopic
  • Duration: 65 minutes
  • Blood Loss: <50 mL

COMPLICATIONS: None

DISPOSITION: Discharged POD 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CUMULATIVE STATISTICS:
  • Total cases this year: 127
  • Laparoscopic cholecystectomy: 34
  • Complication rate: 2.3%

✓ ACGME logging requirements met
✓ Ready for program director review`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample surgical case data...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Surgical Logbook AI"
      tagline="Automated surgical case logging for resident training and surgeon credentialing"
      specialty="Surgical Education"
      description="Captures and organizes surgical cases with procedure codes, techniques, complications, and outcomes. Essential for residency training requirements and hospital credentialing."
      category="surgical"
      icon={<BookOpen className="w-full h-full" />}
      kpiStats={[
        { value: 'ACGME', label: 'Compliant' },
        { value: '1 Min', label: 'Per Entry' },
        { value: '100%', label: 'Case Capture' },
      ]}
      workflowSteps={[
        {
          title: 'Case Input',
          description: 'Enter surgical case details or upload operative report for automatic extraction.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'AI Structuring',
          description: 'AI extracts procedure details, codes, technique, and outcomes into standardized format.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Logbook Entry',
          description: 'Creates searchable, exportable entry with cumulative statistics and competency tracking.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['ACGME Standards', 'CPT/CUPS Codes', 'Analytics', 'Export Ready']}
      integrations={[
        { name: 'Epic' },
        { name: 'OR Systems' },
        { name: 'Residency Programs' },
        { name: 'ACGME' },
        { name: 'Credentialing' },
      ]}
      roiCalculator={{
        unitLabel: 'Cases Logged Monthly',
        minValue: 20,
        maxValue: 500,
        step: 10,
        defaultValue: 100,
        calculateSavings: (value) => `${(value * 15).toLocaleString()} min`,
        savingsLabel: 'Time Saved Monthly',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.pdf,.txt"
      uploadLabel="Upload Operative Report"
      sampleDataAction={handleSampleData}
    />
  );
}
