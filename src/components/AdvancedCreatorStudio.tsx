import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { 
  initializeAIModels, 
  analyzeImageContent, 
  removeBackgroundAdvanced, 
  enhanceImageQuality,
  checkWebGPUSupport 
} from '@/utils/aiImageProcessing';
import { 
  Sparkles, 
  Download, 
  Upload, 
  Wand2, 
  RefreshCw, 
  User, 
  Palette,
  Camera,
  Settings,
  Image as ImageIcon,
  Scissors,
  Trash2,
  Brain,
  Mic,
  Zap,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Heart,
  Stethoscope,
  Eye,
  Cpu,
  Layers
} from 'lucide-react';

interface AvatarSettings {
  gender: string;
  age: number;
  ethnicity: string;
  profession: string;
  style: string;
  lighting: string;
  background: string;
  expression: string;
  quality: string;
  enhancement: 'realistic' | 'professional' | 'artistic';
}

const AdvancedCreatorStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState('avatar-generator');
  const [settings, setSettings] = useState<AvatarSettings>({
    gender: 'female',
    age: 35,
    ethnicity: 'hispanic',
    profession: 'doctor',
    style: 'photorealistic',
    lighting: 'professional',
    background: 'medical',
    expression: 'confident',
    quality: 'ultra',
    enhancement: 'professional'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiModelsReady, setAiModelsReady] = useState(false);
  const [webGPUSupported, setWebGPUSupported] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize AI models on component mount
  useEffect(() => {
    const initAI = async () => {
      try {
        const webGPUAvailable = await checkWebGPUSupport();
        setWebGPUSupported(webGPUAvailable);
        
        if (webGPUAvailable) {
          const modelsInitialized = await initializeAIModels();
          setAiModelsReady(modelsInitialized);
          
          if (modelsInitialized) {
            toast({
              title: "AI Models Ready!",
              description: "WebGPU acceleration enabled for advanced image processing",
            });
          }
        } else {
          toast({
            title: "WebGPU Not Available",
            description: "Using CPU fallback for image processing",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('AI initialization error:', error);
      }
    };

    initAI();
  }, [toast]);

  const generateAvatar = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const { data, error } = await supabase.functions.invoke('generate-enhanced-avatar', {
        body: { settings }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data?.success && data.image) {
        const imageUrl = `data:image/png;base64,${data.image}`;
        setGeneratedImage(imageUrl);
        toast({
          title: "Success!",
          description: `Professional medical avatar generated using ${data.provider}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to generate avatar');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImageBackground = async () => {
    if (!uploadedImage) return;
    
    setIsProcessing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      
      // Load image element
      const imageElement = await loadImage(blob);
      
      let processedBlob: Blob;
      
      // Use advanced AI segmentation if available, otherwise fallback to basic
      if (aiModelsReady && webGPUSupported) {
        toast({
          title: "Using AI Enhancement",
          description: "Processing with WebGPU-accelerated AI models",
        });
        processedBlob = await removeBackgroundAdvanced(imageElement);
      } else {
        toast({
          title: "Using Standard Processing",
          description: "AI models not available, using fallback method",
        });
        processedBlob = await removeBackground(imageElement);
      }
      
      // Convert back to base64 for display
      const reader = new FileReader();
      reader.onload = () => {
        setProcessedImage(reader.result as string);
      };
      reader.readAsDataURL(processedBlob);
      
      toast({
        title: "Background Removed!",
        description: aiModelsReady ? "AI-enhanced segmentation completed" : "Basic background removal completed",
      });
    } catch (error) {
      console.error('Background removal error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to remove background. Try a different image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Advanced Creator Studio
                </h1>
                <p className="text-gray-600">Professional AI Agent Creation Platform</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full lg:w-fit grid-cols-1 lg:grid-cols-4 gap-1 bg-white/50">
            <TabsTrigger value="avatar-generator" className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Avatar Generator</span>
            </TabsTrigger>
            <TabsTrigger value="voice-synthesis" className="flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Voice Synthesis</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Deployment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar-generator" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Controls Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Generation Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Character Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Gender</Label>
                        <Select value={settings.gender} onValueChange={(value) => setSettings({...settings, gender: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Age</Label>
                        <Input
                          type="number"
                          min="25"
                          max="65"
                          value={settings.age}
                          onChange={(e) => setSettings({...settings, age: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Ethnicity</Label>
                      <Select value={settings.ethnicity} onValueChange={(value) => setSettings({...settings, ethnicity: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="caucasian">Caucasian</SelectItem>
                          <SelectItem value="hispanic">Hispanic/Latino</SelectItem>
                          <SelectItem value="african">African</SelectItem>
                          <SelectItem value="asian">Asian</SelectItem>
                          <SelectItem value="indigenous">Indigenous</SelectItem>
                          <SelectItem value="mixed">Mixed Heritage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Medical Profession</Label>
                      <Select value={settings.profession} onValueChange={(value) => setSettings({...settings, profession: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">General Doctor</SelectItem>
                          <SelectItem value="cardiologist">Cardiologist</SelectItem>
                          <SelectItem value="surgeon">Surgeon</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="researcher">Medical Researcher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Expression</Label>
                      <Select value={settings.expression} onValueChange={(value) => setSettings({...settings, expression: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confident">Confident</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="empathetic">Empathetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Style Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Visual Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Enhancement Type</Label>
                      <Select value={settings.enhancement} onValueChange={(value) => setSettings({...settings, enhancement: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realistic">Ultra Realistic</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="artistic">Artistic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Lighting</Label>
                        <Select value={settings.lighting} onValueChange={(value) => setSettings({...settings, lighting: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="natural">Natural</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                            <SelectItem value="soft">Soft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Background</Label>
                        <Select value={settings.background} onValueChange={(value) => setSettings({...settings, background: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical">Medical Office</SelectItem>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="clinic">Clinic</SelectItem>
                            <SelectItem value="laboratory">Laboratory</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Quality</Label>
                      <Select value={settings.quality} onValueChange={(value) => setSettings({...settings, quality: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="ultra">Ultra HD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Status Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Engine Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        <span className="text-sm">WebGPU Acceleration</span>
                      </div>
                      <Badge variant={webGPUSupported ? "default" : "secondary"}>
                        {webGPUSupported ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        <span className="text-sm">AI Models</span>
                      </div>
                      <Badge variant={aiModelsReady ? "default" : "secondary"}>
                        {aiModelsReady ? "Ready" : "Loading"}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      {aiModelsReady 
                        ? "Advanced AI processing available" 
                        : "Basic processing mode active"
                      }
                    </div>
                  </CardContent>
                </Card>

                {/* Image Processing Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scissors className="w-5 h-5" />
                      AI Image Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <div className="space-y-3">
                          <img src={uploadedImage} alt="Uploaded" className="w-20 h-20 rounded-lg mx-auto object-cover" />
                          <p className="text-sm text-gray-600">Click to change image</p>
                          {isAnalyzing && (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span className="text-xs">Analyzing...</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                          <div>
                            <p className="font-medium">Upload Image</p>
                            <p className="text-sm text-gray-500">AI-powered analysis & processing</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {imageAnalysis && (
                      <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          AI Analysis
                        </h4>
                        <p className="text-xs text-gray-700">{imageAnalysis.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {imageAnalysis.labels?.slice(0, 3).map((label: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {label.label} ({Math.round(label.score * 100)}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadedImage && (
                      <Button 
                        onClick={removeImageBackground}
                        disabled={isProcessing}
                        className="w-full"
                        variant="outline"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Scissors className="w-4 h-4 mr-2" />
                            {aiModelsReady ? "AI Background Removal" : "Remove Background"}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button 
                  onClick={generateAvatar}
                  disabled={isGenerating}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Professional Avatar
                    </>
                  )}
                </Button>

                {progress > 0 && (
                  <div className="space-y-2">
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-center text-gray-600">{progress}% Complete</p>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Generated Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Generated Avatar */}
                    {generatedImage ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <img 
                            src={generatedImage} 
                            alt="Generated Avatar" 
                            className="w-full max-w-lg mx-auto rounded-xl shadow-lg"
                          />
                          <Badge className="absolute top-4 right-4 bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Generated
                          </Badge>
                        </div>
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={() => downloadImage(generatedImage, 'medical-avatar.png')}
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Avatar
                          </Button>
                          <Button
                            onClick={() => setGeneratedImage(null)}
                            variant="outline"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate New
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">No Avatar Generated Yet</h3>
                          <p className="text-gray-600">Configure your settings and click generate to create a professional medical avatar</p>
                        </div>
                      </div>
                    )}

                    {/* Processed Image */}
                    {processedImage && (
                      <div className="space-y-4">
                        <Separator />
                        <h3 className="text-lg font-semibold">Background Removed</h3>
                        <div className="relative">
                          <img 
                            src={processedImage} 
                            alt="Processed" 
                            className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                            style={{
                              background: `
                                linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                                linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                                linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                                linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                              `,
                              backgroundSize: '20px 20px',
                              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                            }}
                          />
                          <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-800">
                            <Scissors className="w-3 h-3 mr-1" />
                            Processed
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          <Button
                            onClick={() => downloadImage(processedImage, 'processed-image.png')}
                            variant="outline"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Processed
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice-synthesis" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Synthesis Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                    <Mic className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Voice Synthesis Coming Soon</h3>
                  <p className="text-gray-600">Advanced voice cloning and synthesis capabilities will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge-base" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Medical Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                    <Brain className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Knowledge Base Coming Soon</h3>
                  <p className="text-gray-600">Upload medical datasets and create specialized knowledge bases for your AI agents.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Agent Deployment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Deployment Platform Coming Soon</h3>
                  <p className="text-gray-600">Deploy your AI agents to web, mobile, and integrate with existing medical systems.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedCreatorStudio;