import { useState } from 'react';
import { Receipt, FileText, Scan, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AgentDetailTemplate } from '@/components/AgentDetailTemplate';

export default function AgentBilling() {
  const { toast } = useToast();
  const [uploadTimestamp, setUploadTimestamp] = useState<number | null>(null);

  const pollForOCRResult = async (timestamp: number): Promise<string> => {
    const maxAttempts = 60;
    const pollInterval = 2000; // 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      console.log(`Polling attempt ${attempt + 1}/${maxAttempts} for resultado_${timestamp}.json`);
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/read-drive-ocr-result`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ timestamp }),
          }
        );

        if (!response.ok) {
          console.error('Poll response not ok:', response.status);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        const data = await response.json();
        
        if (data.found && data.data) {
          const { status, nombrePaciente, fecha, tipoOrden } = data.data;
          return `🎉 ¡Procesamiento completado!\n\n👤 Paciente: ${nombrePaciente}\n📅 Fecha: ${fecha}\n📋 Tipo: ${tipoOrden}\n✅ Estado: ${status}`;
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error('Timeout: No se encontró el resultado del OCR después de 2 minutos');
  };

  const handleAnalyze = async (file: File): Promise<string> => {
    // Generate unique timestamp ID
    const timestamp = Date.now();
    const modifiedFileName = `${timestamp}_${file.name}`;

    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const imageBase64 = await base64Promise;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-to-drive-oauth`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: modifiedFileName,
          imageBase64,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Save timestamp in state for later use
      setUploadTimestamp(timestamp);
      
      // Show processing message via toast
      toast({
        title: 'Procesando con OCR...',
        description: 'Esperando resultado del procesamiento. Esto puede tomar hasta 2 minutos.',
      });
      
      // Poll for OCR result
      try {
        const ocrResult = await pollForOCRResult(timestamp);
        return ocrResult;
      } catch (error) {
        if (error instanceof Error && error.message.includes('Timeout')) {
          throw new Error('⏱️ Timeout: El procesamiento OCR está tardando más de lo esperado. Por favor intente nuevamente.');
        }
        throw error;
      }
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  };

  const handleSampleData = () => {
    toast({
      title: 'Sample Data',
      description: 'Loading sample medical invoice for demonstration...',
    });
  };

  return (
    <AgentDetailTemplate
      name="Revenue Cycle Orchestrator"
      tagline="Eliminate revenue leakage with intelligent invoice processing"
      specialty="Revenue Automation"
      description="AI-powered invoice processing that extracts, validates, and codes medical billing data with 99% accuracy. Reduce manual errors, prevent claim denials, and accelerate your revenue cycle."
      category="finance"
      icon={<Receipt className="w-full h-full" />}
      kpiStats={[
        { value: '99%', label: 'Accuracy' },
        { value: '300x', label: 'Faster' },
        { value: '<30 Days', label: 'ROI' },
      ]}
      workflowSteps={[
        {
          title: 'Input',
          description: 'Upload medical invoices, orders, or billing documents in any format (PDF, image, or electronic).',
          icon: <FileText className="w-6 h-6" />,
        },
        {
          title: 'OCR Extraction',
          description: 'Advanced OCR technology extracts all relevant data points including patient info, procedures, and charges.',
          icon: <Scan className="w-6 h-6" />,
        },
        {
          title: 'Validation & Coding',
          description: 'AI validates data against medical coding rules (CUPS/RIPS) and flags anomalies for review.',
          icon: <AlertTriangle className="w-6 h-6" />,
        },
        {
          title: 'Output',
          description: 'Generates validated RIPS files ready for submission, with full audit trail and compliance documentation.',
          icon: <CheckCircle className="w-6 h-6" />,
        },
      ]}
      techStack={['AWS Bedrock', 'Python', 'HIPAA Compliant', 'HL7 FHIR', 'DICOM']}
      integrations={[
        { name: 'SAP' },
        { name: 'Epic' },
        { name: 'Servinte' },
        { name: 'Dynamics 365' },
        { name: 'Veeva' },
      ]}
      roiCalculator={{
        unitLabel: 'Monthly Invoices Processed',
        minValue: 1000,
        maxValue: 50000,
        step: 1000,
        defaultValue: 10000,
        calculateSavings: (value) => `$${(value * 5).toLocaleString()} USD`,
        savingsLabel: 'Estimated Annual Savings',
      }}
      onAnalyze={handleAnalyze}
      acceptedFileTypes="image/*"
      uploadLabel="Upload Medical Invoice"
      sampleDataAction={handleSampleData}
    />
  );
}
