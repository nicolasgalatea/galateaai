import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, ArrowLeft, Bot, Sparkles, Stethoscope, Building2, 
  GraduationCap, Users, Heart, Brain, Settings, Upload, TestTube,
  Eye, Play, CheckCircle, Zap, Globe, Languages, Mic, Shield,
  Target, Award, Star, Code, Cpu, Database, Activity, FileText,
  MessageSquare, Headphones, Palette, Image, Volume2, ChevronDown
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgentData {
  name: string;
  specialty: string;
  role: string;
  description: string;
  avatar: string;
  voice: string;
  language: string;
  personality: string;
  expertise: string[];
  customization: {
    primaryColor: string;
    secondaryColor: string;
    avatarStyle: string;
  };
}

const AgentCreatorStudio = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [agentData, setAgentData] = useState<AgentData>({
    name: '',
    specialty: '',
    role: '',
    description: '',
    avatar: '',
    voice: 'alloy',
    language: 'es',
    personality: '',
    expertise: [],
    customization: {
      primaryColor: '#0F172A',
      secondaryColor: '#3B82F6',
      avatarStyle: 'realistic'
    }
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { 
      id: 1, 
      title: "Definir Especialidad", 
      subtitle: "¿Qué tipo de agente quieres crear?",
      icon: Target
    },
    { 
      id: 2, 
      title: "Información Básica", 
      subtitle: "Nombre y descripción del agente",
      icon: FileText
    },
    { 
      id: 3, 
      title: "Avatar y Apariencia", 
      subtitle: "Diseña la apariencia visual",
      icon: Image
    },
    { 
      id: 4, 
      title: "Voz y Personalidad", 
      subtitle: "Configura la interacción",
      icon: Volume2
    },
    { 
      id: 5, 
      title: "Conocimiento Especializado", 
      subtitle: "Define áreas de expertise",
      icon: Brain
    },
    { 
      id: 6, 
      title: "Pruebas y Validación", 
      subtitle: "Testa tu agente",
      icon: TestTube
    },
    { 
      id: 7, 
      title: "Despliegue", 
      subtitle: "Publica tu agente",
      icon: Globe
    }
  ];

  const specialties = [
    { 
      id: 'cardiology', 
      name: 'Cardiología', 
      icon: Heart, 
      description: 'Especialista en enfermedades cardiovasculares',
      color: 'bg-red-500'
    },
    { 
      id: 'neurology', 
      name: 'Neurología', 
      icon: Brain, 
      description: 'Experto en sistema nervioso y neurología',
      color: 'bg-purple-500'
    },
    { 
      id: 'general', 
      name: 'Medicina General', 
      icon: Stethoscope, 
      description: 'Médico de atención primaria',
      color: 'bg-green-500'
    },
    { 
      id: 'pediatrics', 
      name: 'Pediatría', 
      icon: Users, 
      description: 'Especialista en medicina infantil',
      color: 'bg-blue-500'
    },
    { 
      id: 'research', 
      name: 'Investigación', 
      icon: GraduationCap, 
      description: 'Análisis de datos y investigación médica',
      color: 'bg-orange-500'
    },
    { 
      id: 'admin', 
      name: 'Administrativo', 
      icon: Building2, 
      description: 'Gestión hospitalaria y administrativa',
      color: 'bg-teal-500'
    }
  ];

  const avatarStyles = [
    { id: 'realistic', name: 'Hiperrealista', preview: '/api/placeholder/100/100' },
    { id: 'professional', name: 'Profesional', preview: '/api/placeholder/100/100' },
    { id: 'friendly', name: 'Amigable', preview: '/api/placeholder/100/100' },
    { id: 'modern', name: 'Moderno', preview: '/api/placeholder/100/100' }
  ];

  const voices = [
    { id: 'alloy', name: 'Alloy - Neutral', description: 'Voz equilibrada y profesional' },
    { id: 'echo', name: 'Echo - Cálida', description: 'Tono amigable y empático' },
    { id: 'nova', name: 'Nova - Energética', description: 'Voz dinámica y moderna' },
    { id: 'shimmer', name: 'Shimmer - Suave', description: 'Tono tranquilizador' }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAgentData = (field: string, value: any) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Target className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">Elige la Especialidad de tu Agente</h2>
              <p className="text-muted-foreground text-lg">
                Selecciona el área médica en la que tu agente se especializará
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialties.map((specialty) => (
                <Card 
                  key={specialty.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    agentData.specialty === specialty.id 
                      ? 'ring-4 ring-primary ring-opacity-50 bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => updateAgentData('specialty', specialty.id)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-16 h-16 ${specialty.color} rounded-full flex items-center justify-center mx-auto`}>
                      <specialty.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{specialty.name}</h3>
                    <p className="text-muted-foreground text-sm">{specialty.description}</p>
                    {agentData.specialty === specialty.id && (
                      <CheckCircle className="w-6 h-6 text-primary mx-auto" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">Información Básica del Agente</h2>
              <p className="text-muted-foreground text-lg">
                Define la identidad y propósito de tu agente de IA
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agentName" className="text-base font-medium">
                  Nombre del Agente *
                </Label>
                <Input
                  id="agentName"
                  placeholder="ej: Dr. Carlos Cardiovascular"
                  value={agentData.name}
                  onChange={(e) => updateAgentData('name', e.target.value)}
                  className="text-lg p-3 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentRole" className="text-base font-medium">
                  Rol Específico
                </Label>
                <Input
                  id="agentRole"
                  placeholder="ej: Especialista en Aorta y Válvulas Cardíacas"
                  value={agentData.role}
                  onChange={(e) => updateAgentData('role', e.target.value)}
                  className="text-lg p-3 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentDescription" className="text-base font-medium">
                  Descripción del Agente *
                </Label>
                <Textarea
                  id="agentDescription"
                  placeholder="Describe las capacidades, experiencia y propósito de tu agente..."
                  value={agentData.description}
                  onChange={(e) => updateAgentData('description', e.target.value)}
                  className="min-h-32 text-base"
                />
                <p className="text-sm text-muted-foreground">
                  Esta descripción ayudará a los usuarios a entender las capacidades de tu agente.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Image className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">Diseña la Apariencia Visual</h2>
              <p className="text-muted-foreground text-lg">
                Personaliza el avatar y los colores de tu agente
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Avatar Preview */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Vista Previa del Avatar</h3>
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="text-center space-y-6">
                    <div className="relative w-32 h-32 mx-auto">
                      <div 
                        className="absolute inset-0 rounded-full opacity-20 animate-pulse"
                        style={{ backgroundColor: agentData.customization.primaryColor }}
                      />
                      <Avatar className="w-full h-full ring-4 ring-primary/20">
                        <AvatarFallback 
                          className="text-2xl font-bold"
                          style={{ 
                            backgroundColor: `${agentData.customization.primaryColor}20`,
                            color: agentData.customization.primaryColor 
                          }}
                        >
                          {agentData.name.substring(0, 2).toUpperCase() || 'AG'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{agentData.name || 'Tu Agente'}</h4>
                      <p className="text-muted-foreground">{agentData.role || 'Especialista Médico'}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Customization Options */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Estilo de Avatar</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {avatarStyles.map((style) => (
                      <Card 
                        key={style.id}
                        className={`cursor-pointer transition-all ${
                          agentData.customization.avatarStyle === style.id 
                            ? 'ring-2 ring-primary' 
                            : ''
                        }`}
                        onClick={() => updateAgentData('customization', {
                          ...agentData.customization,
                          avatarStyle: style.id
                        })}
                      >
                        <CardContent className="p-4 text-center space-y-2">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto" />
                          <p className="font-medium">{style.name}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Colores del Tema</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Color Primario</Label>
                      <Input
                        type="color"
                        value={agentData.customization.primaryColor}
                        onChange={(e) => updateAgentData('customization', {
                          ...agentData.customization,
                          primaryColor: e.target.value
                        })}
                        className="h-12 w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color Secundario</Label>
                      <Input
                        type="color"
                        value={agentData.customization.secondaryColor}
                        onChange={(e) => updateAgentData('customization', {
                          ...agentData.customization,
                          secondaryColor: e.target.value
                        })}
                        className="h-12 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <Volume2 className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">Configura Voz y Personalidad</h2>
              <p className="text-muted-foreground text-lg">
                Define cómo tu agente se comunicará con los usuarios
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Configuración de Voz</h3>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Voz</Label>
                    <Select 
                      value={agentData.voice} 
                      onValueChange={(value) => updateAgentData('voice', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div className="space-y-1">
                              <p className="font-medium">{voice.name}</p>
                              <p className="text-sm text-muted-foreground">{voice.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Idioma Principal</Label>
                    <Select 
                      value={agentData.language} 
                      onValueChange={(value) => updateAgentData('language', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="pt">🇧🇷 Português</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Prueba de Voz</h3>
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Headphones className="w-5 h-5 text-primary" />
                        <span>Escuchar muestra de voz</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Reproducir
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Personalidad y Tono</h3>
                  
                  <div className="space-y-2">
                    <Label>Descripción de Personalidad</Label>
                    <Textarea
                      placeholder="Describe cómo quieres que tu agente se comporte: empático, profesional, directo, amigable..."
                      value={agentData.personality}
                      onChange={(e) => updateAgentData('personality', e.target.value)}
                      className="min-h-32"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center">
                      <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="font-medium">Empático</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="font-medium">Profesional</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="font-medium">Dinámico</p>
                    </Card>
                    <Card className="p-4 text-center">
                      <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium">Amigable</p>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <Brain className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">Define el Conocimiento Especializado</h2>
              <p className="text-muted-foreground text-lg">
                Configura las áreas de expertise y capacidades de tu agente
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Áreas de Especialización</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'Diagnóstico por imagen', 'Electrocardiografía', 'Ecocardiografía',
                    'Cateterismo cardíaco', 'Cirugía cardiovascular', 'Farmacología cardíaca',
                    'Rehabilitación cardíaca', 'Cardiología pediátrica', 'Arritmias',
                    'Insuficiencia cardíaca', 'Patología valvular', 'Medicina preventiva'
                  ].map((expertise) => (
                    <Card 
                      key={expertise}
                      className={`cursor-pointer transition-all ${
                        agentData.expertise.includes(expertise) 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => {
                        const newExpertise = agentData.expertise.includes(expertise)
                          ? agentData.expertise.filter(e => e !== expertise)
                          : [...agentData.expertise, expertise];
                        updateAgentData('expertise', newExpertise);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <p className="font-medium">{expertise}</p>
                        {agentData.expertise.includes(expertise) && (
                          <CheckCircle className="w-5 h-5 text-primary mx-auto mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Cargar Conocimiento Personalizado</h3>
                <Card className="border-2 border-dashed border-primary/40 bg-primary/5">
                  <CardContent className="p-8 text-center space-y-4">
                    <Upload className="w-12 h-12 text-primary mx-auto" />
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Subir Documentos de Entrenamiento</h4>
                      <p className="text-muted-foreground">
                        Protocolos médicos, guidelines, papers de investigación, etc.
                      </p>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar Archivos
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Formatos soportados: PDF, DOC, TXT | Máximo 50MB por archivo
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <TestTube className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">Pruebas y Validación</h2>
              <p className="text-muted-foreground text-lg">
                Testa tu agente antes del despliegue final
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Chat de Prueba */}
              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Chat de Prueba</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>Usuario:</strong> Hola, tengo dolor en el pecho
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm">
                      <strong>{agentData.name || 'Tu Agente'}:</strong> Hola, entiendo tu preocupación. 
                      ¿Podrías contarme más detalles sobre este dolor? ¿Cuándo comenzó y cómo lo describes?
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Input placeholder="Escribe un mensaje de prueba..." className="flex-1" />
                    <Button size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de Rendimiento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Métricas de Rendimiento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Precisión del Diagnóstico</span>
                      <span className="font-bold">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tiempo de Respuesta</span>
                      <span className="font-bold">1.2s</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Satisfacción del Usuario</span>
                      <span className="font-bold">4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Casos de Prueba</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">Diagnóstico cardiovascular básico</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">Interpretación de ECG</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">Casos complejos multicausales</span>
                        <TestTube className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <Globe className="w-16 h-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">¡Tu Agente Está Listo!</h2>
              <p className="text-muted-foreground text-lg">
                Elige cómo quieres desplegar tu agente de IA médica
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center space-y-6">
                <div className="relative w-32 h-32 mx-auto">
                  <Avatar className="w-full h-full ring-4 ring-primary/20">
                    <AvatarFallback 
                      className="text-2xl font-bold"
                      style={{ 
                        backgroundColor: `${agentData.customization.primaryColor}20`,
                        color: agentData.customization.primaryColor 
                      }}
                    >
                      {agentData.name.substring(0, 2).toUpperCase() || 'AG'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{agentData.name || 'Tu Agente'}</h3>
                  <p className="text-muted-foreground">{agentData.role || 'Especialista Médico'}</p>
                  <Badge className="mt-2">{agentData.expertise.length} áreas de especialización</Badge>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Uso Privado</h3>
                  <p className="text-muted-foreground">
                    Despliega solo para tu organización o práctica médica
                  </p>
                  <Button className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Despliegue Privado
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Marketplace Público</h3>
                  <p className="text-muted-foreground">
                    Publica en el marketplace y monetiza tu agente
                  </p>
                  <Button className="w-full" variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Publicar en Marketplace
                  </Button>
                </div>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">¿Qué sigue?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Monitoreo en tiempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Mejoras continuas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Analytics y reportes</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold">Creator Studio</span>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Paso {currentStep} de {totalSteps}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-muted-foreground">
                {steps[currentStep - 1]?.title}
              </div>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Step Navigation */}
        <div className="hidden lg:flex justify-center mb-12">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all ${
                    currentStep === step.id 
                      ? 'bg-primary text-white' 
                      : currentStep > step.id 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Vista Previa
            </Button>
            <Button variant="outline" size="sm">
              Guardar Borrador
            </Button>
          </div>

          <Button 
            onClick={nextStep}
            disabled={currentStep === totalSteps}
            className="flex items-center space-x-2 bg-gradient-primary hover:opacity-90"
          >
            <span>{currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}</span>
            {currentStep === totalSteps ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentCreatorStudio;