import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, Upload, Download, Eye, Wand2, Settings, 
  Image, Palette, Brain, Mic, Languages, TestTube,
  Zap, Target, Users, Heart, Stethoscope, CheckCircle,
  Loader2, Play, Volume2, ArrowRight, ArrowLeft, Info
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarGenerationSettings {
  gender: string;
  age: number[];
  ethnicity: string;
  profession: string;
  style: string;
  lighting: string;
  background: string;
  expression: string;
  quality: string;
}

const AdvancedCreatorStudio = () => {
  const [activeTab, setActiveTab] = useState('avatar-generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [avatarSettings, setAvatarSettings] = useState<AvatarGenerationSettings>({
    gender: 'female',
    age: [35],
    ethnicity: 'hispanic',
    profession: 'doctor',
    style: 'photorealistic',
    lighting: 'professional',
    background: 'medical',
    expression: 'confident',
    quality: 'ultra'
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedPrompt(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: {
          settings: {
            ...avatarSettings,
            age: avatarSettings.age[0]
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedImage(`data:image/png;base64,${data.image}`);
        setGeneratedPrompt(data.prompt);
        toast({
          title: "Avatar generado exitosamente",
          description: "Tu avatar hiperrealista ha sido creado.",
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      toast({
        title: "Error al generar avatar",
        description: "No se pudo generar el avatar. Verifica tu configuración e intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSetting = (key: keyof AvatarGenerationSettings, value: any) => {
    setAvatarSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const professions = [
    { id: 'doctor', name: 'Médico General', description: 'Bata blanca, estetoscopio' },
    { id: 'cardiologist', name: 'Cardiólogo', description: 'Especialista cardiovascular' },
    { id: 'surgeon', name: 'Cirujano', description: 'Uniforme quirúrgico' },
    { id: 'nurse', name: 'Enfermero/a', description: 'Uniforme médico' },
    { id: 'researcher', name: 'Investigador', description: 'Atuendo científico' }
  ];

  const ethnicities = [
    { id: 'hispanic', name: 'Hispano/Latino' },
    { id: 'caucasian', name: 'Caucásico' },
    { id: 'african', name: 'Afrodescendiente' },
    { id: 'asian', name: 'Asiático' },
    { id: 'indigenous', name: 'Indígena' },
    { id: 'mixed', name: 'Mestizo' }
  ];

  const styles = [
    { id: 'photorealistic', name: 'Fotorrealista', description: 'Máximo realismo' },
    { id: 'professional', name: 'Profesional', description: 'Estilo corporativo' },
    { id: 'friendly', name: 'Amigable', description: 'Apariencia cálida' },
    { id: 'authoritative', name: 'Autoritativo', description: 'Presencia médica' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Advanced Creator Studio</h1>
                <p className="text-muted-foreground">Plataforma avanzada de creación de agentes IA</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full lg:w-fit grid-cols-1 lg:grid-cols-4 gap-1 bg-card/50">
            <TabsTrigger value="avatar-generator" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Avatar Generator</span>
            </TabsTrigger>
            <TabsTrigger value="voice-synthesis" className="flex items-center space-x-2">
              <Mic className="w-4 h-4" />
              <span>Síntesis de Voz</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge-base" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Base de Conocimiento</span>
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Despliegue</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatar-generator" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Panel - Controls */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Wand2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Generador de Avatares Hiperrealistas</CardTitle>
                      <CardDescription>
                        Crea avatares médicos fotorrealistas con IA generativa
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-0 space-y-6">
                  {/* Basic Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Características Básicas</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Género</Label>
                        <Select value={avatarSettings.gender} onValueChange={(value) => updateSetting('gender', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Femenino</SelectItem>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="non-binary">No binario</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Edad: {avatarSettings.age[0]} años</Label>
                        <Slider
                          value={avatarSettings.age}
                          onValueChange={(value) => updateSetting('age', value)}
                          max={70}
                          min={25}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Etnia</Label>
                      <Select value={avatarSettings.ethnicity} onValueChange={(value) => updateSetting('ethnicity', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ethnicities.map((ethnicity) => (
                            <SelectItem key={ethnicity.id} value={ethnicity.id}>
                              {ethnicity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Profesión Médica</Label>
                      <Select value={avatarSettings.profession} onValueChange={(value) => updateSetting('profession', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {professions.map((profession) => (
                            <SelectItem key={profession.id} value={profession.id}>
                              <div>
                                <p className="font-medium">{profession.name}</p>
                                <p className="text-sm text-muted-foreground">{profession.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Style Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Palette className="w-5 h-5" />
                      <span>Estilo Visual</span>
                    </h3>

                    <div className="space-y-2">
                      <Label>Estilo de Renderizado</Label>
                      <Select value={avatarSettings.style} onValueChange={(value) => updateSetting('style', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((style) => (
                            <SelectItem key={style.id} value={style.id}>
                              <div>
                                <p className="font-medium">{style.name}</p>
                                <p className="text-sm text-muted-foreground">{style.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Iluminación</Label>
                        <Select value={avatarSettings.lighting} onValueChange={(value) => updateSetting('lighting', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Profesional</SelectItem>
                            <SelectItem value="natural">Natural</SelectItem>
                            <SelectItem value="studio">Estudio</SelectItem>
                            <SelectItem value="soft">Suave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Fondo</Label>
                        <Select value={avatarSettings.background} onValueChange={(value) => updateSetting('background', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical">Médico</SelectItem>
                            <SelectItem value="hospital">Hospital</SelectItem>
                            <SelectItem value="clinic">Clínica</SelectItem>
                            <SelectItem value="neutral">Neutro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Expresión</Label>
                      <Select value={avatarSettings.expression} onValueChange={(value) => updateSetting('expression', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confident">Confiado</SelectItem>
                          <SelectItem value="friendly">Amigable</SelectItem>
                          <SelectItem value="professional">Profesional</SelectItem>
                          <SelectItem value="empathetic">Empático</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Opciones Avanzadas</span>
                    </h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Calidad Ultra HD</Label>
                        <p className="text-sm text-muted-foreground">Renderizado de máxima calidad</p>
                      </div>
                      <Switch 
                        checked={avatarSettings.quality === 'ultra'}
                        onCheckedChange={(checked) => updateSetting('quality', checked ? 'ultra' : 'standard')}
                      />
                    </div>
                  </div>

                  {/* Upload Reference Image */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Imagen de Referencia (Opcional)</span>
                    </h3>
                    
                    <div 
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <div className="space-y-4">
                          <img src={uploadedImage} alt="Reference" className="w-24 h-24 rounded-lg mx-auto object-cover" />
                          <p className="text-sm text-muted-foreground">Imagen de referencia cargada</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                          <div>
                            <p className="font-medium">Subir imagen de referencia</p>
                            <p className="text-sm text-muted-foreground">Opcional: Usa una foto como base para el avatar</p>
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
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={generateAvatar}
                    disabled={isGenerating}
                    className="w-full bg-gradient-primary hover:opacity-90 text-lg py-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Generando Avatar...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-3" />
                        Generar Avatar Hiperrealista
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Right Panel - Preview */}
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary/20 rounded-lg">
                        <Eye className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Vista Previa</CardTitle>
                        <CardDescription>Resultado de la generación</CardDescription>
                      </div>
                    </div>
                    {generatedImage && (
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-0">
                  <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center relative overflow-hidden">
                    {isGenerating ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="space-y-2">
                          <p className="font-medium">Generando avatar...</p>
                          <p className="text-sm text-muted-foreground">Esto puede tardar unos momentos</p>
                        </div>
                      </div>
                    ) : generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated Avatar" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <Image className="w-16 h-16 text-muted-foreground/50 mx-auto" />
                        <div className="space-y-2">
                          <p className="font-medium text-muted-foreground">Avatar Preview</p>
                          <p className="text-sm text-muted-foreground/75">
                            El avatar generado aparecerá aquí
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {generatedImage && (
                    <div className="mt-6 space-y-4">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Avatar generado exitosamente. Puedes descargarlo o usarlo en tu agente.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex space-x-3">
                        <Button variant="outline" className="flex-1">
                          <Settings className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button className="flex-1 bg-gradient-primary hover:opacity-90">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Usar en Agente
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="voice-synthesis" className="space-y-8">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="p-4 bg-secondary/20 rounded-xl w-fit mx-auto">
                  <Mic className="w-12 h-12 text-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Síntesis de Voz Avanzada</h2>
                  <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
                </div>
                <Badge variant="secondary">Próximamente</Badge>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge-base" className="space-y-8">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="p-4 bg-accent/20 rounded-xl w-fit mx-auto">
                  <Brain className="w-12 h-12 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Base de Conocimiento Médico</h2>
                  <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
                </div>
                <Badge variant="secondary">Próximamente</Badge>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-8">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="p-4 bg-primary/20 rounded-xl w-fit mx-auto">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Despliegue de Agentes</h2>
                  <p className="text-muted-foreground">Esta funcionalidad estará disponible próximamente</p>
                </div>
                <Badge variant="secondary">Próximamente</Badge>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedCreatorStudio;