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
  ShoppingCart,
  Maximize2,
  Minimize2,
  RotateCcw,
  Zap,
  Shield,
  Target,
  Award,
  Settings,
  BarChart3,
  Cpu,
  Star
} from 'lucide-react';
import galateaAvatar from '@/assets/galatea-avatar.jpg';

export const GalateaDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    if (!step) return (
      <div className="text-center py-20">
        <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-8">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Demo Completado</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Gracias por explorar las capacidades de Galatea AI
        </p>
        <Button onClick={resetDemo} size="lg" className="bg-gradient-primary hover:opacity-90">
          <RotateCcw className="w-5 h-5 mr-2" />
          Repetir Demo
        </Button>
      </div>
    );

    switch (step.id) {
      case 'intro':
        return (
          <div className="text-center space-y-8 py-16">
            <div className="w-40 h-40 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Brain className="w-20 h-20 text-white" />
            </div>
            <div>
              <h1 className="text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
                Galatea AI
              </h1>
              <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                La infraestructura completa para crear, desplegar y comercializar agentes de inteligencia artificial médica 
                de forma segura, escalable y profesional
              </p>
            </div>
            <div className="flex justify-center space-x-6 pt-8">
              <Badge className="bg-green-500/20 text-green-600 border-green-300 text-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Seguro y Confiable
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-600 border-blue-300 text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Implementación Rápida
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-600 border-purple-300 text-sm px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Calidad Médica
              </Badge>
            </div>
          </div>
        );

      case 'agent-presentation':
        return (
          <div className="flex flex-col lg:flex-row items-center gap-16 py-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <Badge className="mb-6 bg-red-100 text-red-800 border-red-200 px-4 py-2">
                <Heart className="w-5 h-5 mr-2" />
                Especialista Cardiovascular
              </Badge>
              <h2 className="text-5xl font-bold mb-6">Dr. Cardio AI</h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Agente especializado en patologías cardiovasculares con enfoque particular en diagnósticos de aorta, 
                análisis avanzado de ecocardiogramas y generación de recomendaciones terapéuticas basadas en evidencia.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">Análisis de imágenes médicas</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="font-medium">Diagnóstico diferencial avanzado</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">Recomendaciones terapéuticas</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="font-medium">Seguimiento automatizado</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-8 border-red-100 shadow-2xl">
                <Avatar className="w-64 h-64 ring-8 ring-white shadow-2xl">
                  <AvatarImage src={galateaAvatar} alt="Dr. Cardio AI" className="object-cover" />
                  <AvatarFallback className="bg-red-500 text-white text-4xl font-bold">DC</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white p-4 rounded-full shadow-lg animate-pulse">
                <Activity className="w-8 h-8" />
              </div>
              
              <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div className="max-w-5xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Carga de Historia Clínica</h2>
              <p className="text-xl text-muted-foreground">
                El médico carga el ecocardiograma del paciente para análisis completo con IA
              </p>
            </div>
            
            <Card className="border-4 border-dashed border-primary/40 bg-primary/5 shadow-2xl">
              <CardContent className="p-12">
                <div className="text-center space-y-8">
                  <div className="relative">
                    <Upload className="w-24 h-24 text-primary mx-auto animate-bounce" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      NUEVO
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Ecocardiograma - Paciente JDR</h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Varón, 65 años • Hipertensión arterial • Dolor precordial atípico
                    </p>
                  </div>
                  
                  <Card className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg max-w-md mx-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <FileText className="w-10 h-10 text-red-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-lg font-bold text-gray-800">ecocardiograma_paciente_JDR.pdf</p>
                        <p className="text-sm text-gray-500">3.7 MB • Subido hace 2 minutos</p>
                      </div>
                    </div>
                    <Progress value={100} className="h-3 mb-4" />
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Carga exitosa</span>
                    </div>
                  </Card>
                  
                  <Button className="w-full max-w-md mx-auto" size="lg">
                    <Brain className="w-6 h-6 mr-3" />
                    Iniciar Análisis Inteligente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analysis':
        return (
          <div className="max-w-6xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Análisis de IA en Tiempo Real</h2>
              <p className="text-xl text-muted-foreground">
                Procesando datos médicos con algoritmos de deep learning y redes neuronales especializadas
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="shadow-2xl border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Cpu className="w-6 h-6 text-blue-600" />
                    Procesamiento Neural Avanzado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">Análisis de imágenes cardiovasculares</span>
                        <span className={analysisProgress >= 25 ? "text-green-600 font-bold" : "text-gray-400"}>
                          {analysisProgress >= 25 ? "✓ Completado" : "Procesando..."}
                        </span>
                      </div>
                      <Progress value={Math.min(analysisProgress, 25) * 4} className="h-3" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">Detección automática de patologías</span>
                        <span className={analysisProgress >= 50 ? "text-green-600 font-bold" : "text-gray-400"}>
                          {analysisProgress >= 50 ? "✓ Completado" : "Procesando..."}
                        </span>
                      </div>
                      <Progress value={Math.max(0, Math.min(analysisProgress - 25, 25)) * 4} className="h-3" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">Mediciones automatizadas de precisión</span>
                        <span className={analysisProgress >= 75 ? "text-green-600 font-bold" : "text-gray-400"}>
                          {analysisProgress >= 75 ? "✓ Completado" : "Procesando..."}
                        </span>
                      </div>
                      <Progress value={Math.max(0, Math.min(analysisProgress - 50, 25)) * 4} className="h-3" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="font-medium">Generación de reporte clínico</span>
                        <span className={analysisProgress >= 100 ? "text-green-600 font-bold" : "text-gray-400"}>
                          {analysisProgress >= 100 ? "✓ Completado" : "Procesando..."}
                        </span>
                      </div>
                      <Progress value={Math.max(0, analysisProgress - 75) * 4} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-2xl border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    Hallazgos Preliminares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showAnalysis && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-1000">
                      <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                          <span className="font-bold text-lg text-yellow-800">Hallazgo Crítico Detectado</span>
                        </div>
                        <p className="text-yellow-800 font-medium">
                          Dilatación significativa de aorta ascendente identificada mediante análisis de IA
                        </p>
                      </div>
                      
                      <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl shadow-lg">
                        <p className="text-lg font-bold mb-3 text-blue-900">Medición automática de alta precisión:</p>
                        <div className="text-blue-800">
                          <p className="text-2xl font-bold">
                            Diámetro aórtico: <span className="text-red-600">5.2 cm</span>
                          </p>
                          <p className="text-sm mt-2">(Valor normal: &lt;3.7 cm)</p>
                        </div>
                      </div>
                      
                      <div className="p-6 bg-green-50 border-2 border-green-300 rounded-xl shadow-lg">
                        <p className="text-lg font-bold mb-3 text-green-900">Confianza del análisis:</p>
                        <div className="text-green-800">
                          <p className="text-2xl font-bold">
                            <span className="text-green-600">97.3%</span> precisión diagnóstica
                          </p>
                          <p className="text-sm mt-2">Validado con protocolos clínicos estándar</p>
                        </div>
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
          <div className="max-w-7xl mx-auto py-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">Diagnóstico Completo y Recomendaciones Clínicas</h2>
              <p className="text-xl text-muted-foreground">
                Resultado integral del análisis especializado con plan de manejo personalizado
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-orange-900">
                      <AlertTriangle className="w-7 h-7" />
                      Diagnóstico Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-3xl font-bold text-orange-900 mb-6">
                      Aneurisma de Aorta Ascendente Moderado
                    </h3>
                    <p className="text-lg text-orange-800 mb-6 leading-relaxed">
                      Se ha identificado una dilatación significativa de la aorta ascendente con un diámetro de 
                      <strong className="text-red-600"> 5.2 cm</strong>, lo que constituye un aneurisma moderado que 
                      requiere seguimiento especializado y evaluación quirúrgica.
                    </p>
                    <Card className="bg-white p-6 rounded-xl shadow-lg">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">Mediciones Clave del Análisis:</h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-base">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Diámetro aorta ascendente:</span>
                          <span className="font-bold text-red-600">5.2 cm</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Grosor de pared:</span>
                          <span className="font-bold">3.2 mm</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Función ventricular:</span>
                          <span className="font-bold text-green-600">Conservada</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Valor normal aórtico:</span>
                          <span className="font-bold">&lt;3.7 cm</span>
                        </div>
                      </div>
                    </Card>
                  </CardContent>
                </Card>
                
                <Card className="shadow-2xl border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-blue-900">
                      <TrendingUp className="w-7 h-7" />
                      Plan de Manejo y Recomendaciones
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Card className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-900 mb-4">📅 Seguimiento Requerido</h4>
                        <ul className="space-y-2 text-blue-800">
                          <li>• Ecocardiograma cada 6 meses</li>
                          <li>• Resonancia magnética cardíaca anual</li>
                          <li>• Control estricto de presión arterial</li>
                          <li>• Monitoreo de síntomas cardiovasculares</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-6 bg-green-50 rounded-xl border border-green-200">
                        <h4 className="text-lg font-bold text-green-900 mb-4">⚕️ Criterios Quirúrgicos</h4>
                        <ul className="space-y-2 text-green-800">
                          <li>• Valorar cirugía si diámetro &gt;5.5cm</li>
                          <li>• Considerar si crecimiento &gt;0.5cm/año</li>
                          <li>• Presencia de insuficiencia aórtica</li>
                          <li>• Síntomas de compromiso hemodinámico</li>
                        </ul>
                      </Card>
                    </div>
                    
                    <Card className="p-6 bg-gray-50 rounded-xl shadow-lg border-2 border-gray-200">
                      <h4 className="text-xl font-bold mb-4 text-gray-800">🔄 Próximos Pasos Inmediatos</h4>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <ol className="space-y-3 text-gray-700">
                          <li className="flex items-center gap-3">
                            <Badge className="bg-blue-600 text-white min-w-[24px]">1</Badge>
                            <span>Referir a cardiología intervencionista</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Badge className="bg-green-600 text-white min-w-[24px]">2</Badge>
                            <span>Solicitar valoración quirúrgica cardiovascular</span>
                          </li>
                        </ol>
                        <ol className="space-y-3 text-gray-700" start={3}>
                          <li className="flex items-center gap-3">
                            <Badge className="bg-purple-600 text-white min-w-[24px]">3</Badge>
                            <span>Iniciar seguimiento estructurado</span>
                          </li>
                          <li className="flex items-center gap-3">
                            <Badge className="bg-orange-600 text-white min-w-[24px]">4</Badge>
                            <span>Educación al paciente sobre signos de alarma</span>
                          </li>
                        </ol>
                      </div>
                    </Card>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-8">
                <Card className="shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Agente Responsable del Análisis</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20">
                      <AvatarImage src={galateaAvatar} alt="Dr. Cardio AI" />
                      <AvatarFallback className="text-2xl bg-primary/10">DC</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">Dr. Cardio AI</h3>
                      <p className="text-muted-foreground mb-4">Especialista en Cardiología</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Certificado
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4 text-left">
                      <h4 className="font-semibold">Especialidades:</h4>
                      <div className="space-y-2">
                        <Badge variant="outline" className="w-full justify-start">
                          <Heart className="w-4 h-4 mr-2" />
                          Patologías de Aorta
                        </Badge>
                        <Badge variant="outline" className="w-full justify-start">
                          <Activity className="w-4 h-4 mr-2" />
                          Ecocardiografía
                        </Badge>
                        <Badge variant="outline" className="w-full justify-start">
                          <Brain className="w-4 h-4 mr-2" />
                          Diagnóstico por IA
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-2xl border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-900">Precisión del Diagnóstico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-700 mb-2">97.3%</div>
                      <p className="text-green-600 font-medium">Confianza Clínica</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Análisis de imágenes</span>
                        <span className="font-semibold">98.1%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mediciones automáticas</span>
                        <span className="font-semibold">96.8%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Correlación clínica</span>
                        <span className="font-semibold">97.0%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <div className="max-w-6xl mx-auto py-12 text-center">
            <div className="mb-12">
              <h2 className="text-4xl font-bold mb-6">Marketplace de Agentes Galatea AI</h2>
              <p className="text-xl text-muted-foreground">
                Descubre, comparte y adquiere agentes especializados creados por la comunidad médica global
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-4 bg-purple-500/10 rounded-xl w-fit mx-auto mb-4">
                  <Brain className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Dr. Onco AI</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Especialista en oncología médica y tratamientos personalizados
                </p>
                <div className="flex justify-between items-center mb-4">
                  <Badge className="bg-purple-500/10 text-purple-600">Oncología</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adquirir Agente
                </Button>
              </Card>
              
              <Card className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-4 bg-green-500/10 rounded-xl w-fit mx-auto mb-4">
                  <Users className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Admin EPS</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Automatización de procesos administrativos y autorizaciones
                </p>
                <div className="flex justify-between items-center mb-4">
                  <Badge className="bg-green-500/10 text-green-600">Administrativo</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adquirir Agente
                </Button>
              </Card>
              
              <Card className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-4 bg-blue-500/10 rounded-xl w-fit mx-auto mb-4">
                  <Stethoscope className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Dr. Research</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Asistente de investigación clínica y análisis de literatura
                </p>
                <div className="flex justify-between items-center mb-4">
                  <Badge className="bg-blue-500/10 text-blue-600">Investigación</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
                <Button size="sm" className="w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adquirir Agente
                </Button>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                <Target className="w-5 h-5 mr-2" />
                Explorar Marketplace Completo
              </Button>
              <p className="text-muted-foreground">
                Más de 150+ agentes especializados disponibles • Nuevos agentes cada semana
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-background via-muted/10 to-background`}>
      {/* Professional Demo Header */}
      <div className="p-8 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="p-4 bg-gradient-primary rounded-xl shadow-glow">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                LIVE
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI - Demo Profesional
              </h1>
              <p className="text-lg text-muted-foreground">
                Agente Cardiovascular Especializado en Patologías de Aorta
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">
                  <Heart className="w-3 h-3 mr-1" />
                  Cardiología
                </Badge>
                <Badge className="bg-green-500/10 text-green-600 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Certificado
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">
                  <Brain className="w-3 h-3 mr-1" />
                  IA Avanzada
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline" 
              size="sm"
              className="hover:bg-primary/10"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
              {isFullscreen ? 'Salir Pantalla Completa' : 'Pantalla Completa'}
            </Button>
            <Button onClick={resetDemo} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar Demo
            </Button>
            <Button 
              onClick={togglePlayPause}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white shadow-glow"
            >
              {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isPlaying ? 'Pausar Demo' : 'Iniciar Demo'}
            </Button>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">
                {steps[currentStep]?.title || 'Demo Completado'}
              </span>
              <span className="text-muted-foreground">
                • {steps[currentStep]?.subtitle || 'Gracias por su atención'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Progreso:</span>
              <span className="font-semibold text-primary">
                {Math.round(((currentStep * 100 + progress) / steps.length))}%
              </span>
            </div>
          </div>
          <div className="relative">
            <Progress value={(currentStep * 100 + progress) / steps.length} className="h-3" />
            <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-full" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <span key={index} className={index <= currentStep ? 'text-primary' : ''}>
                {index + 1}. {step.title.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};