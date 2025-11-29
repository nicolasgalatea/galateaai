import { Heart, FileImage, Cpu, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentAorta() {
  const { toast } = useToast();

  const handleAnalyze = async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `✅ Cardiovascular Analysis Complete

🫀 Aortic Assessment:
  • Diameter: 3.8 cm (within normal limits)
  • Wall thickness: 2.1 mm
  • Calcification: Minimal

📊 Risk Assessment:
  • Aneurysm Risk: Low (8%)
  • Dissection Risk: Very Low (2%)

💡 Recommendations:
  1. Continue routine monitoring
  2. Follow-up echocardiogram in 12 months
  3. Maintain blood pressure control

✓ Report generated for medical review`;
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample cardiovascular imaging data...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Aortic Intelligence Agent"
      tagline="Advanced AI-powered cardiovascular imaging analysis for early detection of aortic pathologies"
      specialty="Cardiovascular Imaging"
      description="Leverages deep learning to analyze CT angiography and echocardiograms, detecting aortic aneurysms, dissections, and valve abnormalities with clinical-grade accuracy."
      category="clinical"
      icon={<Heart className="w-full h-full" />}
      kpiStats={[
        { value: '97%', label: 'Sensitivity' },
        { value: '<3 Min', label: 'Analysis Time' },
        { value: '0.3mm', label: 'Resolution' },
      ]}
      workflowSteps={[
        {
          title: 'Input',
          description: 'Upload CT angiography, echocardiogram, or MRI images in DICOM format.',
          icon: <FileImage className="w-6 h-6" />,
        },
        {
          title: 'AI Analysis',
          description: 'Deep learning models analyze vessel morphology, detect calcifications, and measure aortic dimensions.',
          icon: <Cpu className="w-6 h-6" />,
        },
        {
          title: 'Clinical Report',
          description: 'Generates structured findings with risk stratification and follow-up recommendations.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['DICOM', 'Deep Learning', 'HIPAA Compliant', 'HL7 FHIR']}
      integrations={[
        { name: 'Epic' },
        { name: 'Cerner' },
        { name: 'PACS' },
        { name: 'Philips' },
        { name: 'GE Healthcare' },
      ]}
      roiCalculator={{
        unitLabel: 'Studies Analyzed Monthly',
        minValue: 100,
        maxValue: 5000,
        step: 100,
        defaultValue: 500,
        calculateSavings: (value) => `$${(value * 45).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*,.dcm"
      uploadLabel="Upload Medical Image"
      sampleDataAction={handleSampleData}
    />
  );
}
