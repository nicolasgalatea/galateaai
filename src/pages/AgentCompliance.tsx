import { Shield, FileText, Search, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentCompliance() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Compliance Audit Complete

📋 Document Analysis:

COMPLIANCE STATUS: ✓ PASSED (92/100)

✓ COMPLIANT ITEMS:
  • Patient identification complete
  • Diagnosis documentation adequate
  • Treatment plan documented
  • Informed consent present

⚠️ MINOR ISSUES (3):
  1. Missing physician signature on page 2
  2. Date format inconsistent (recommend DD/MM/YYYY)
  3. Medication dosage units not standardized

📊 REGULATORY CHECK:
  • Resolution 3100/2019: ✓ Compliant
  • HIPAA Privacy Rule: ✓ Compliant
  • Colombian Medical Standards: ✓ Compliant

✓ Ready for submission after corrections`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample medical document for audit...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Compliance Guardian"
      tagline="Automated regulatory compliance auditing for medical documentation against Colombian and international standards"
      specialty="Regulatory Compliance"
      description="AI-powered document auditor that validates medical records against Resolution 3100, HIPAA, and institutional protocols. Reduces audit time by 80% and prevents compliance penalties."
      category="compliance"
      icon={<Shield className="w-full h-full" />}
      kpiStats={[
        { value: '99%', label: 'Detection Rate' },
        { value: '80%', label: 'Time Saved' },
        { value: '0', label: 'Penalties' },
      ]}
      workflowSteps={[
        {
          title: 'Document Upload',
          description: 'Upload medical records, clinical notes, or consent forms in PDF or image format.',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'Regulatory Scan',
          description: 'AI cross-references document against Colombian regulations, HIPAA, and institutional requirements.',
          icon: <Search className="w-6 h-6" />,
        },
        {
          title: 'Compliance Report',
          description: 'Generates detailed audit report with compliance score and specific corrective actions.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['Res. 3100/2019', 'HIPAA', 'ISO 27001', 'Document AI']}
      integrations={[
        { name: 'Epic' },
        { name: 'Servinte' },
        { name: 'Dynamics 365' },
        { name: 'SharePoint' },
        { name: 'ADRES' },
      ]}
      roiCalculator={{
        unitLabel: 'Documents Audited Monthly',
        minValue: 100,
        maxValue: 10000,
        step: 100,
        defaultValue: 1000,
        calculateSavings: (value) => `$${(value * 12).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.pdf"
      uploadLabel="Upload Document for Audit"
      sampleDataAction={handleSampleData}
    />
  );
}
