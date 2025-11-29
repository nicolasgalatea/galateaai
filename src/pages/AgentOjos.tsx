import { Eye, FileImage, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentOjos() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Retinal Analysis Complete

👁️ Findings:
  • Optic disc: Normal appearance
  • Macula: No signs of edema
  • Vessels: Mild arteriovenous nicking

📊 Diabetic Retinopathy Screening:
  • Classification: Mild NPDR (Non-Proliferative)
  • Microaneurysms: 3 detected
  • Hemorrhages: None

💡 Recommendations:
  1. Schedule follow-up in 6 months
  2. Optimize glycemic control (HbA1c target <7%)
  3. Blood pressure monitoring

✓ Report ready for ophthalmologist review`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample retinal fundus image...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Retinal Vision AI"
      tagline="Early detection of diabetic retinopathy and macular degeneration through AI-powered fundoscopy analysis"
      specialty="Ophthalmology AI"
      description="Computer vision algorithms trained on millions of retinal images to detect diabetic retinopathy, glaucoma, and age-related macular degeneration with specialist-level accuracy."
      category="clinical"
      icon={<Eye className="w-full h-full" />}
      kpiStats={[
        { value: '95%', label: 'Accuracy' },
        { value: '<1 Min', label: 'Screening' },
        { value: '40%', label: 'Early Detection ↑' },
      ]}
      workflowSteps={[
        {
          title: 'Image Capture',
          description: 'Upload retinal fundus photographs or OCT scans from any compatible device.',
          icon: <FileImage className="w-6 h-6" />,
        },
        {
          title: 'AI Screening',
          description: 'Neural networks analyze vessel patterns, detect microaneurysms, hemorrhages, and exudates.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Graded Report',
          description: 'Outputs severity grading per ICDR scale with referral recommendations.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['OCT Analysis', 'Deep Learning', 'HIPAA Compliant', 'ICDR Grading']}
      integrations={[
        { name: 'Topcon' },
        { name: 'Zeiss' },
        { name: 'Canon' },
        { name: 'Optos' },
        { name: 'EHR Systems' },
      ]}
      roiCalculator={{
        unitLabel: 'Screenings Per Month',
        minValue: 50,
        maxValue: 2000,
        step: 50,
        defaultValue: 300,
        calculateSavings: (value) => `$${(value * 35).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*"
      uploadLabel="Upload Retinal Image"
      sampleDataAction={handleSampleData}
    />
  );
}
