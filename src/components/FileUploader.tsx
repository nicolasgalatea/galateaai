import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Image, X, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  onFileUploaded?: (fileUrl: string, fileName: string) => void;
  onAnalysisComplete?: (analysis: string) => void;
  medicalCaseId?: string;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  uploaded: boolean;
  progress: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  onAnalysisComplete,
  medicalCaseId,
  disabled
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    for (const file of selectedFiles) {
      const fileId = Date.now().toString() + Math.random().toString();
      
      // Add file to state
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        url: '',
        type: file.type,
        uploaded: false,
        progress: 0
      };
      
      setFiles(prev => [...prev, newFile]);
      
      try {
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          
          // Upload file
          const { data, error } = await supabase.functions.invoke('upload-medical-study', {
            body: {
              fileData: base64Data,
              fileName: file.name,
              fileType: file.type,
              userId: (await supabase.auth.getUser()).data.user?.id,
              medicalCaseId: medicalCaseId
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          // Update file state
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, uploaded: true, progress: 100, url: data.fileUrl }
              : f
          ));

          onFileUploaded?.(data.fileUrl, file.name);
          
          toast({
            title: "Archivo subido",
            description: `${file.name} se ha subido correctamente`,
          });

          // If it's an image, analyze it automatically
          if (file.type.startsWith('image/')) {
            await analyzeImage(base64Data, file.type, file.name);
          }
        };
        
        reader.readAsDataURL(file);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === fileId && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }));
        }, 200);

        setTimeout(() => clearInterval(progressInterval), 2000);
        
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.filter(f => f.id !== fileId));
        toast({
          title: "Error de subida",
          description: `No se pudo subir ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    // Clear input
    event.target.value = '';
  }, [medicalCaseId, onFileUploaded, toast]);

  const analyzeImage = async (base64Image: string, fileType: string, fileName: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-medical-study', {
        body: {
          imageBase64: base64Image,
          studyType: fileName.toLowerCase().includes('eco') ? 'Ecocardiograma' : 'Estudio de imagen',
          patientInfo: null,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      onAnalysisComplete?.(data.analysis);
      
      toast({
        title: "Análisis completado",
        description: "La Dra. Sofía ha analizado su estudio médico",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error de análisis",
        description: "No se pudo analizar la imagen",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-primary/40 hover:border-primary/60 transition-colors">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Subir Estudios Médicos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Suba ecocardiogramas, radiografías, ECG u otros estudios cardiovasculares
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                disabled={disabled || isAnalyzing}
                className="relative overflow-hidden"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.dcm"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={disabled || isAnalyzing}
                />
                <Upload className="w-4 h-4 mr-2" />
                {isAnalyzing ? 'Analizando...' : 'Seleccionar Archivos'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Formatos soportados: JPG, PNG, PDF, DICOM. Máximo 50MB por archivo.
            </p>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Archivos subidos</h4>
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-5 h-5 text-blue-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-red-500" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    {!file.uploaded && (
                      <Progress value={file.progress} className="h-2 mt-1" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.uploaded ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {file.progress}%
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};