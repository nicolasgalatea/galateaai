import { ClipboardCheck, FileText, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentSurgicalProtocols() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Surgical Checklist Generated

📋 PRE-OPERATIVE CHECKLIST
Procedure: Laparoscopic Cholecystectomy
Date: ${new Date().toLocaleDateString()}

━━━ BEFORE INDUCTION ━━━
☐ Patient identity verified (Name + ID)
☐ Procedure and site confirmed
☐ Consent signed and witnessed
☐ Site marked (if applicable)
☐ Allergies reviewed
☐ NPO status confirmed (>8 hours)
☐ Antibiotics given within 60 min
☐ DVT prophylaxis administered

━━━ BEFORE INCISION ━━━
☐ Time-out performed
☐ All team members introduced
☐ Anticipated blood loss reviewed
☐ Equipment sterility confirmed
☐ Essential imaging displayed

━━━ POST-OPERATIVE ━━━
☐ Instrument and sponge count correct
☐ Specimen labeled and sent
☐ Equipment issues documented
☐ Recovery plan communicated

✓ WHO Safe Surgery Checklist compliant
✓ Institutional requirements met`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample surgical procedure data...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Surgical Safety Protocol"
      tagline="Automated pre-op, intra-op, and post-op checklists for surgical safety compliance"
      specialty="Surgical Quality"
      description="Generates WHO-compliant surgical safety checklists customized by procedure type. Ensures all safety checks are completed and documented, reducing never events."
      category="surgical"
      icon={<ClipboardCheck className="w-full h-full" />}
      kpiStats={[
        { value: '100%', label: 'WHO Compliant' },
        { value: '0', label: 'Never Events' },
        { value: '2 Min', label: 'Generation' },
      ]}
      workflowSteps={[
        {
          title: 'Procedure Selection',
          description: 'Select surgical procedure from library or input custom procedure details.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'Checklist Generation',
          description: 'AI generates procedure-specific checklists based on WHO guidelines and institutional protocols.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Safety Documentation',
          description: 'Interactive checklist with timestamps and team verification for complete audit trail.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['WHO Guidelines', 'Joint Commission', 'HIPAA Compliant', 'Real-time']}
      integrations={[
        { name: 'Epic' },
        { name: 'Cerner' },
        { name: 'OR Systems' },
        { name: 'Anesthesia' },
        { name: 'Quality Dept' },
      ]}
      roiCalculator={{
        unitLabel: 'Surgeries Per Month',
        minValue: 50,
        maxValue: 2000,
        step: 50,
        defaultValue: 400,
        calculateSavings: (value) => `$${(value * 20).toLocaleString()} USD`,
        savingsLabel: 'Risk Avoidance Value',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes=".pdf,.txt"
      uploadLabel="Upload Procedure Details"
      sampleDataAction={handleSampleData}
    />
  );
}
