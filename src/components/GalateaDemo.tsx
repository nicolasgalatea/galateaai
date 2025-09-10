import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Upload, 
  FileText, 
  Heart, 
  Activity, 
  Brain, 
  Stethoscope,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  ShoppingCart
} from 'lucide-react';
import galateaAvatar from '@/assets/galatea-avatar.jpg';

export const GalateaDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const steps = [
    {
      id: 'intro',
      title: 'Bienvenido a Galatea AI',
      subtitle: 'La infraestructura para crear y coordinar agentes de IA médica',
      duration: 4000
    },
    {
      id: 'agent-presentation',
      title: 'Agente Cardiovascular Especializado',
      subtitle: 'Especialista en patologías de la aorta',
      duration: 5000
    },
    {
      id: 'file-upload',
      title: 'Cargar Historia Clínica',
      subtitle: 'El médico sube ecocardiograma del paciente',
      duration: 3000
    },
    {
      id: 'analysis',
      title: 'Análisis de IA en Tiempo Real',
      subtitle: 'Procesando datos médicos con algoritmos avanzados',
      duration: 4000
    },
    {
      id: 'results',
      title: 'Diagnóstico y Recomendaciones',
      subtitle: 'Resultado del análisis especializado',
      duration: 6000
    },
    {
      id: 'marketplace',
      title: 'Marketplace de Agentes',
      subtitle: 'Comparte y adquiere agentes especializados',
      duration: 4000
    },
    {
      id: 'conclusion',
      title: 'Democratizando la IA en Salud',
      subtitle: 'Crea tu primer agente hoy mismo',
      duration: 3000
    }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length) {
      const currentStepDuration = steps[currentStep].duration;
      const progressIncrement = 100 / (currentStepDuration / 100);
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setCurrentStep(curr => curr + 1);
            return 0;
          }
          return prev + progressIncrement;
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps]);

  useEffect(() => {
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [currentStep, steps.length]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
    setShowAnalysis(false);
    setAnalysisProgress(0);
  };

  const startAnalysis = () => {
    setShowAnalysis(true);
    let analysisInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(analysisInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  useEffect(() => {
    if (steps[currentStep]?.id === 'analysis' && isPlaying) {
      setTimeout(() => {
        startAnalysis();
      }, 1000);
    }
  }, [currentStep, isPlaying]);

  const renderStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null;

    switch (step.id) {
      case 'intro':
        return (
          <div className="text-center space-y-8">
            <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                Galatea AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                La infraestructura completa para crear, desplegar y comercializar agentes de inteligencia artificial médica de forma segura y escalable
              </p>
            </div>
          </div>
        );

      case 'agent-presentation':
        return (
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                <Heart className="w-4 h-4 mr-2" />
                Cardiología Especializada
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Dr. Cardio AI</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Agente especializado en patologías cardiovasculares, con enfoque particular en 
                diagnósticos de aorta, análisis de ecocardiogramas y recomendaciones de tratamiento.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Análisis de imágenes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Diagnóstico diferencial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Recomendaciones clínicas
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Seguimiento automático
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-4 border-blue-200">
                <Avatar className="w-48 h-48 ring-4 ring-white shadow-2xl">
                  <AvatarImage src={galateaAvatar} alt="Dr. Cardio AI" />
                  <AvatarFallback className="bg-blue-500 text-white text-2xl">DC</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Cargar Historia Clínica</h2>
              <p className="text-muted-foreground">
                El médico carga el ecocardiograma del paciente para análisis
              </p>
            </div>
            
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <Upload className="w-16 h-16 text-primary mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ecocardiograma - Paciente JDR</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Varón, 65 años, hipertensión arterial, dolor precordial
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-8 h-8 text-red-500" />
                      <div className="text-left">
                        <p className="font-semibold">ecocardiograma_paciente_JDR.pdf</p>
                        <p className="text-sm text-muted-foreground">2.4 MB • Subido hace 2min</p>
                      </div>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <Button className="w-full" size="lg">
                    <Brain className="w-5 h-5 mr-2" />
                    Iniciar Análisis con IA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analysis':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Análisis de IA en Tiempo Real</h2>
              <p className="text-muted-foreground">
                Procesando datos médicos con algoritmos avanzados de deep learning
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Procesamiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Análisis de imágenes</span>
                      <span className={analysisProgress >= 25 ? "text-green-500" : "text-muted-foreground"}>
                        {analysisProgress >= 25 ? "✓" : "..."}
                      </span>
                    </div>
                    <Progress value={Math.min(analysisProgress, 25) * 4} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Detección de patologías</span>
                      <span className={analysisProgress >= 50 ? "text-green-500" : "text-muted-foreground"}>
                        {analysisProgress >= 50 ? "✓" : "..."}
                      </span>
                    </div>
                    <Progress value={Math.max(0, Math.min(analysisProgress - 25, 25)) * 4} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Mediciones automatizadas</span>
                      <span className={analysisProgress >= 75 ? "text-green-500" : "text-muted-foreground"}>
                        {analysisProgress >= 75 ? "✓" : "..."}
                      </span>
                    </div>
                    <Progress value={Math.max(0, Math.min(analysisProgress - 50, 25)) * 4} />
                    
                    <div className="flex justify-between text-sm">
                      <span>Generación de reporte</span>
                      <span className={analysisProgress >= 100 ? "text-green-500" : "text-muted-foreground"}>
                        {analysisProgress >= 100 ? "✓" : "..."}
                      </span>
                    </div>
                    <Progress value={Math.max(0, analysisProgress - 75) * 4} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-red-500" />
                    Hallazgos Preliminares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showAnalysis && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-1000">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-sm">Hallazgo Significativo</span>
                        </div>
                        <p className="text-sm text-yellow-800">
                          Dilatación de aorta ascendente detectada
                        </p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold mb-1">Medición automática:</p>
                        <p className="text-sm text-blue-800">
                          Diámetro aórtico: <strong>5.2 cm</strong>
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold mb-1">Confianza del análisis:</p>
                        <p className="text-sm text-green-800">
                          <strong>97.3%</strong> precisión diagnóstica
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Diagnóstico y Recomendaciones</h2>
              <p className="text-muted-foreground">
                Resultado completo del análisis especializado
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-5 h-5" />
                      Diagnóstico Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-bold text-orange-900 mb-3">
                      Aneurisma de Aorta Ascendente
                    </h3>
                    <p className="text-orange-800 mb-4">
                      Se ha identificado una dilatación significativa de la aorta ascendente 
                      con un diámetro de <strong>5.2 cm</strong>, lo que constituye un aneurisma moderado.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Mediciones clave:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Diámetro aorta ascendente: <strong>5.2 cm</strong> (Normal: &lt;3.7cm)</li>
                        <li>• Grosor pared: <strong>3.2 mm</strong></li>
                        <li>• Función ventricular: <strong>Conservada</strong></li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <TrendingUp className="w-5 h-5" />
                      Recomendaciones de Tratamiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Seguimiento</h4>
                        <p className="text-sm text-blue-800">
                          • Ecocardiograma cada 6 meses<br/>
                          • Resonancia magnética anual<br/>
                          • Control de presión arterial
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Criterios Quirúrgicos</h4>
                        <p className="text-sm text-green-800">
                          • Valorar cirugía si &gt;5.5cm<br/>
                          • Considerar si crecimiento &gt;0.5cm/año<br/>
                          • Síntomas de insuficiencia aórtica
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Próximos Pasos</h4>
                      <ol className="text-sm space-y-1">
                        <li>1. Referir a cardiología intervencionista</li>
                        <li>2. Solicitar valoración de cirugía cardiovascular</li>
                        <li>3. Iniciar seguimiento estructurado</li>
                        <li>4. Educación al paciente sobre signos de alarma</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Agente Responsable</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={galateaAvatar} alt="Dr. Cardio AI" />
                      <AvatarFallback>DC</AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold">Dr. Cardio AI</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Especialista en Aorta
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Análisis Completado
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Métricas de Calidad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Precisión</span>
                      <span className="font-semibold">97.3%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tiempo de análisis</span>
                      <span className="font-semibold">3.2s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Confianza</span>
                      <span className="font-semibold text-green-600">Alta</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Marketplace de Agentes</h2>
              <p className="text-muted-foreground">
                Comparte y adquiere agentes especializados creados por la comunidad médica
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Dr. Onco AI",
                  specialty: "Oncología",
                  price: "$299/mes",
                  rating: 4.9,
                  users: 1200,
                  color: "purple"
                },
                {
                  name: "Admin EPS",
                  specialty: "Administrativo",
                  price: "$149/mes",
                  rating: 4.8,
                  users: 850,
                  color: "blue"
                },
                {
                  name: "Research AI",
                  specialty: "Investigación",
                  price: "$399/mes",
                  rating: 4.9,
                  users: 650,
                  color: "green"
                },
                {
                  name: "Dr. Cardio AI",
                  specialty: "Cardiología",
                  price: "$249/mes",
                  rating: 5.0,
                  users: 2100,
                  color: "red",
                  featured: true
                }
              ].map((agent, index) => (
                <Card key={index} className={`relative ${agent.featured ? 'border-primary shadow-lg' : ''}`}>
                  {agent.featured && (
                    <Badge className="absolute -top-2 left-4 bg-primary">
                      Más Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-${agent.color}-100 flex items-center justify-center mb-3`}>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={galateaAvatar} alt={agent.name} />
                        <AvatarFallback className={`bg-${agent.color}-500 text-white`}>
                          {agent.name.split(' ')[1].charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{agent.specialty}</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="text-2xl font-bold">{agent.price}</div>
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <div className="flex text-yellow-500">
                        {"★".repeat(Math.floor(agent.rating))}
                      </div>
                      <span>{agent.rating}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      {agent.users} usuarios
                    </div>
                    <Button className="w-full" variant={agent.featured ? "default" : "outline"}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adquirir
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'conclusion':
        return (
          <div className="text-center space-y-8">
            <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain className="w-16 h-16 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                Galatea AI
              </h1>
              <p className="text-2xl font-semibold text-primary mb-4">
                Democratizando la Inteligencia Artificial en Salud
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
                Con Galatea AI, cualquier institución médica puede crear, desplegar y monetizar 
                agentes de IA especializados en minutos, transformando la atención médica en América Latina.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button size="lg" className="flex-1">
                  Crear mi Agente
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  Ver Demo Completo
                </Button>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">5,000+</div>
                <p className="text-sm text-muted-foreground">Médicos usando la plataforma</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">150+</div>
                <p className="text-sm text-muted-foreground">Agentes especializados</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">98.7%</div>
                <p className="text-sm text-muted-foreground">Precisión diagnóstica</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header Controls */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Demo Galatea AI</h1>
              <Badge variant="secondary">
                Paso {currentStep + 1} de {steps.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayPause}
                variant="outline"
                size="sm"
                disabled={currentStep >= steps.length}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <Button onClick={resetDemo} variant="outline" size="sm">
                Reiniciar
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{steps[currentStep]?.title || "Completado"}</span>
              <span>{currentStep + 1}/{steps.length}</span>
            </div>
            <Progress 
              value={currentStep >= steps.length ? 100 : ((currentStep / steps.length) * 100) + (progress / steps.length)} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {currentStep < steps.length ? (
            <div className="animate-in slide-in-from-bottom-4 duration-700">
              {renderStepContent()}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Demo Completado</h2>
              <p className="text-muted-foreground mb-8">
                Has visto cómo funciona la plataforma Galatea AI de principio a fin
              </p>
              <Button onClick={resetDemo} size="lg">
                Ver Demo Nuevamente
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-4 right-4 z-40">
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={galateaAvatar} alt="Galatea AI" />
                <AvatarFallback>GA</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Demo Interactivo</p>
                <p className="text-xs text-muted-foreground truncate">
                  {steps[currentStep]?.subtitle || "Demostración completada"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">En vivo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};