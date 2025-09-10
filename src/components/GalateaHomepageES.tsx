import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowRight, Users, Zap, Globe, CheckCircle, Star, Play, Brain, Stethoscope, 
  Building2, GraduationCap, MessageSquare, Mic, Shield, Sparkles, Bot, FileText, 
  Search, TrendingUp, Calendar, Mail, Heart, Award, Database, Cloud, Microscope, 
  Activity, Phone, Target, Lightbulb, Code, Cpu, UserPlus, Settings, ShoppingCart,
  Upload, TestTube, Eye, Headphones, Lock, Globe2, Languages, AlertTriangle
} from 'lucide-react';

// Import hyper-realistic avatar images
import miraAvatar from '@/assets/mira-avatar.jpg';
import aydaAvatar from '@/assets/ayda-avatar.jpg';
import erinAvatar from '@/assets/erin-avatar.jpg';
import mireyaAvatar from '@/assets/mireya-avatar.jpg';
import carlosCardioAvatar from '@/assets/carlos-cardio-avatar.jpg';
import elenaOncoAvatar from '@/assets/elena-onco-avatar.jpg';
import amaraPediatricAvatar from '@/assets/amara-pediatric-avatar.jpg';
import rajOrthoAvatar from '@/assets/raj-ortho-avatar.jpg';
import galateaAvatar from '@/assets/galatea-avatar.jpg';

export const GalateaHomepageES = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [showAvatar, setShowAvatar] = useState(false);

  const avatarSteps = [
    { 
      id: 1, 
      title: "¡Hola! Soy la Dra. Sofia", 
      subtitle: "Tu asistente de IA en salud",
      description: "Soy un avatar hiperrealista potenciado por Galatea AI. Me especializo en diagnóstico aórtico y complicaciones cardiovasculares para ayudarte con evaluaciones médicas precisas."
    },
    { 
      id: 2, 
      title: "Crea tu agente de IA", 
      subtitle: "En solo 5 minutos",
      description: "Diseña agentes especializados para atención clínica, administración, investigación o soporte al paciente con nuestro asistente intuitivo."
    },
    { 
      id: 3, 
      title: "Despliega en cualquier lugar", 
      subtitle: "Escala globalmente",
      description: "Lanza tus agentes en hospitales, clínicas, o hazlos disponibles en nuestro mercado para otros profesionales de la salud."
    }
  ];

  const platformSteps = [
    {
      icon: UserPlus,
      title: "Regístrate y define rol",
      description: "Elige tu rol en salud: Médico, Hospital, EPS, Investigador o Paciente",
      color: "bg-blue-500"
    },
    {
      icon: Bot,
      title: "Crear agente de IA",
      description: "Selecciona tipo de agente: Clínico, Administrativo, Investigación o Soporte al Paciente",
      color: "bg-green-500"
    },
    {
      icon: Settings,
      title: "Personalizar avatar",
      description: "Diseña apariencia hiperrealista con síntesis de voz vía ElevenLabs",
      color: "bg-purple-500"
    },
    {
      icon: Upload,
      title: "Entrenar con datos",
      description: "Sube protocolos médicos, artículos de investigación y guías institucionales",
      color: "bg-orange-500"
    },
    {
      icon: TestTube,
      title: "Probar y validar",
      description: "Pruebas interactivas con conversaciones de texto y voz",
      color: "bg-red-500"
    },
    {
      icon: Globe2,
      title: "Desplegar y escalar",
      description: "Lanza globalmente o vende en nuestro mercado de agentes de IA",
      color: "bg-teal-500"
    }
  ];

  const stakeholders = [
    { icon: Stethoscope, title: "Médicos", description: "Doctores individuales y especialistas" },
    { icon: Building2, title: "Hospitales", description: "Instituciones de salud y redes" },
    { icon: Heart, title: "EPS/IPS", description: "Proveedores de seguros y servicios de salud" },
    { icon: GraduationCap, title: "Investigadores", description: "Instituciones de investigación médica" },
    { icon: Users, title: "Pacientes", description: "Consumidores individuales de salud" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={galateaAvatar} alt="Dra. Galatea - Fundadora de Galatea AI" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">GA</AvatarFallback>
              </Avatar>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#platform" className="text-muted-foreground hover:text-foreground transition-colors">Plataforma</a>
              <a href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">Agentes IA</a>
              <a href="#marketplace" className="text-muted-foreground hover:text-foreground transition-colors">Mercado</a>
              <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Seguridad</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Precios</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <a href="/">🇺🇸 English</a>
              </Button>
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
              <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" />
                Crear Agente IA
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Interactive Avatar */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">La infraestructura para agentes de IA médica</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Crea y despliega
                </span>
                <br />
                <span className="text-foreground">avatares</span>
                <br />
                <span className="text-foreground">hiperrealistas</span>
                <br />
                <span className="text-foreground">de salud</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                La plataforma que empodera a cada actor del sistema de salud para diseñar, coordinar, 
                desplegar y comercializar avatares hiperrealistas potenciados por IA. Desde compañías 
                farmacéuticas hasta pacientes individuales.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Button size="lg" className="text-lg px-8 py-4 bg-gradient-primary hover:opacity-90">
                  <Play className="w-5 h-5 mr-2" />
                  Crear mi primer agente
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  <Eye className="w-5 h-5 mr-2" />
                  Explorar mercado
                </Button>
              </div>

              {/* Stakeholder Icons */}
              <div className="flex items-center space-x-8 pt-8">
                <span className="text-sm text-muted-foreground">Confiado por:</span>
                <div className="flex items-center space-x-6">
                  {stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2 group">
                      <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        <stakeholder.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">{stakeholder.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Interactive Avatar Demo */}
            <div className="relative">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all duration-500">
                <div className="text-center space-y-6">
                  {/* Avatar Container */}
                  <div className="relative w-64 h-64 mx-auto">
                    <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-pulse" />
                    <div className="relative w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border-4 border-primary/20">
                      <Avatar className="w-48 h-48">
                        <AvatarImage src={galateaAvatar} alt="Dra. Galatea - Avatar IA" />
                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">GA</AvatarFallback>
                      </Avatar>
                      
                      {/* Voice Indicator */}
                      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-primary/90 text-white px-3 py-2 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <Headphones className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Avatar Introduction */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary">
                      {avatarSteps[activeStep - 1]?.title}
                    </h3>
                    <p className="text-primary/80 font-medium">
                      {avatarSteps[activeStep - 1]?.subtitle}
                    </p>
                    <p className="text-muted-foreground">
                      {avatarSteps[activeStep - 1]?.description}
                    </p>
                  </div>

                  {/* Interactive Controls */}
                  <div className="flex justify-center space-x-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveStep(activeStep === 1 ? 3 : activeStep - 1)}
                    >
                      Anterior
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-primary/90 hover:bg-primary"
                      onClick={() => setActiveStep(activeStep === 3 ? 1 : activeStep + 1)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Conversar con Dra. Sofia
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveStep(activeStep === 3 ? 1 : activeStep + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>

                  {/* Demo Features */}
                  <div className="flex justify-center space-x-6 pt-4 border-t border-border">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>Chat de texto</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mic className="w-4 h-4 text-primary" />
                      <span>IA de voz</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Languages className="w-4 h-4 text-primary" />
                      <span>Multiidioma</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO EN VIVO - SECCIÓN PRINCIPAL */}
      <section id="demo-video" className="py-32 px-6 bg-gradient-to-br from-red-500/10 via-primary/5 to-secondary/10 relative overflow-hidden border-y-4 border-primary/20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/90" />
        
        {/* Floating Alert Badge */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-red-500/20 text-red-600 px-6 py-3 rounded-full border-2 border-red-500/30 animate-bounce">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-lg">Demo en Vivo Disponible</span>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 bg-primary/15 px-8 py-4 rounded-full mb-8 border border-primary/20">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-primary font-bold text-lg">Demo en Vivo</span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
              <br />
              <span className="text-foreground">En acción real</span>
            </h2>
            
            <p className="text-2xl text-muted-foreground max-w-5xl mx-auto leading-relaxed font-light">
              Ve cómo nuestro agente cardiovascular analiza un caso complejo en tiempo real, 
              desde la interpretación de estudios hasta recomendaciones clínicas precisas.
            </p>
          </div>

          {/* Video Demo Container */}
          <div className="relative max-w-6xl mx-auto">
            {/* Browser Window Frame */}
            <div className="bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary/20 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono bg-background/50 px-3 py-1 rounded">
                    galatea.ai/demo-cardiovascular
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Transmisión en Vivo
                  </Badge>
                </div>
              </div>
              
              {/* Video Content Area */}
              <div className="relative bg-gradient-to-br from-background/50 to-muted/30 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Main Video Demo Interface */}
                  <div className="w-full max-w-4xl p-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Left: Avatar & Analysis */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="relative">
                            <Avatar className="w-20 h-20 ring-4 ring-primary/30">
                              <AvatarImage src={galateaAvatar} alt="IA Cardiovascular" />
                              <AvatarFallback className="bg-primary text-white text-2xl">DC</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-primary">IA Cardiovascular</h3>
                            <p className="text-muted-foreground">Especialista en Patología Aórtica</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-600 font-medium">Analizando en tiempo real...</span>
                            </div>
                          </div>
                        </div>
                        
                        <Card className="p-6 bg-primary/10 border-primary/30">
                          <h4 className="font-semibold text-primary mb-3 flex items-center">
                            <Brain className="w-5 h-5 mr-2" />
                            Análisis en Curso
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Segmentación de aorta completada</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <span>Analizando dilatación aórtica...</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span>Evaluando flujo sanguíneo</span>
                            </div>
                          </div>
                        </Card>
                        
                        <Button className="w-full bg-gradient-primary hover:opacity-90">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Hacer pregunta al especialista
                        </Button>
                      </div>
                      
                      {/* Right: Medical Visualization */}
                      <div className="space-y-6">
                        <Card className="p-6">
                          <h4 className="font-semibold mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-red-500" />
                            Visualización Médica 3D
                          </h4>
                          <div className="bg-gradient-to-br from-red-500/10 to-blue-500/10 rounded-lg p-8 text-center border-2 border-dashed border-primary/30">
                            <div className="space-y-4">
                              <div className="w-24 h-24 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-full mx-auto flex items-center justify-center">
                                <Heart className="w-12 h-12 text-red-500" />
                              </div>
                              <div className="text-sm space-y-2">
                                <p className="font-medium">Modelo 3D del Corazón</p>
                                <p className="text-muted-foreground">Visualización en tiempo real</p>
                                <div className="flex justify-center space-x-4 text-xs">
                                  <span className="bg-red-500/20 text-red-600 px-2 py-1 rounded">Aneurisma detectado</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                        
                        <Card className="p-4">
                          <h5 className="font-medium text-sm mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Métricas en Tiempo Real
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">4.2cm</div>
                              <div className="text-muted-foreground">Diámetro aórtico</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-500">Alto</div>
                              <div className="text-muted-foreground">Riesgo</div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Steps */}
      <section id="platform" className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Cómo funciona
              </span>
              <br />
              <span className="text-foreground">la plataforma</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desde la creación hasta el despliegue, nuestra plataforma te guía en cada paso 
              para construir agentes de IA médica de clase mundial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformSteps.map((step, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <div className={`p-4 ${step.color}/10 rounded-xl w-fit mx-auto mb-4`}>
                  <step.icon className={`w-8 h-8 text-${step.color.split('-')[1]}-500`} />
                </div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  <div className="w-8 h-0.5 bg-gradient-primary rounded"></div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Showcase */}
      <section id="agents" className="py-24 px-6 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Agentes especializados
              </span>
              <br />
              <span className="text-foreground">disponibles ahora</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explora nuestra colección de agentes de IA médica, cada uno diseñado por expertos 
              para especialidades específicas del sector salud.
            </p>
          </div>

          {/* Clinical Agents */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center">
                <Stethoscope className="w-8 h-8 mr-3 text-primary" />
                Agentes Clínicos
              </h3>
              <Button variant="outline">
                Ver todos los agentes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={carlosCardioAvatar} alt="Dr. Carlos - Cardiólogo IA" />
                  <AvatarFallback className="bg-red-500/10 text-red-600 text-xl font-bold">CC</AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold mb-2">Dr. Carlos</h4>
                <p className="text-sm text-muted-foreground mb-3">Especialista Cardiovascular</p>
                <Badge className="bg-red-500/10 text-red-600 mb-4">Cardiología</Badge>
                <p className="text-xs text-muted-foreground">Diagnóstico y tratamiento de enfermedades del corazón y sistema circulatorio</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={elenaOncoAvatar} alt="Dra. Elena - Oncóloga IA" />
                  <AvatarFallback className="bg-purple-500/10 text-purple-600 text-xl font-bold">EO</AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold mb-2">Dra. Elena</h4>
                <p className="text-sm text-muted-foreground mb-3">Especialista en Oncología</p>
                <Badge className="bg-purple-500/10 text-purple-600 mb-4">Oncología</Badge>
                <p className="text-xs text-muted-foreground">Diagnóstico, tratamiento y seguimiento de pacientes con cáncer</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={amaraPediatricAvatar} alt="Dra. Amara - Pediatra IA" />
                  <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xl font-bold">AP</AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold mb-2">Dra. Amara</h4>
                <p className="text-sm text-muted-foreground mb-3">Especialista Pediátrica</p>
                <Badge className="bg-blue-500/10 text-blue-600 mb-4">Pediatría</Badge>
                <p className="text-xs text-muted-foreground">Atención médica integral para niños desde el nacimiento hasta la adolescencia</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                <Avatar className="w-16 h-16 mx-auto mb-4">
                  <AvatarImage src={rajOrthoAvatar} alt="Dr. Raj - Ortopedista IA" />
                  <AvatarFallback className="bg-green-500/10 text-green-600 text-xl font-bold">RO</AvatarFallback>
                </Avatar>
                <h4 className="text-lg font-semibold mb-2">Dr. Raj</h4>
                <p className="text-sm text-muted-foreground mb-3">Especialista Ortopédico</p>
                <Badge className="bg-green-500/10 text-green-600 mb-4">Ortopedia</Badge>
                <p className="text-xs text-muted-foreground">Tratamiento de lesiones y enfermedades del sistema musculoesquelético</p>
              </Card>
            </div>
          </div>

          {/* Administrative & Research Agents */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-blue-500/10 rounded-xl w-fit mx-auto mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agentes Administrativos</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Gestión hospitalaria, programación de citas, facturación y procesos administrativos
              </p>
              <Badge className="bg-blue-500/10 text-blue-600">Alta Demanda</Badge>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-4 bg-purple-500/10 rounded-xl w-fit mx-auto mb-4">
                <Microscope className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Agentes de Investigación</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Análisis de datos, revisión de literatura, diseño de estudios y generación de insights
              </p>
              <Badge className="bg-purple-500/10 text-purple-600">Innovador</Badge>
            </Card>
            
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Mercado de agentes
              </span>
              <br />
              <span className="text-foreground">de IA médica</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubre, compra o vende agentes de IA especializados creados por expertos médicos 
              de todo el mundo. La primera plataforma de comercialización de IA médica.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Compra agentes especializados</h3>
                    <p className="text-muted-foreground">
                      Accede a una biblioteca creciente de agentes de IA médica creados por especialistas verificados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Monetiza tu expertise</h3>
                    <p className="text-muted-foreground">
                      Crea y vende tus propios agentes de IA basados en tu conocimiento médico especializado.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Calidad garantizada</h3>
                    <p className="text-muted-foreground">
                      Todos los agentes pasan por un riguroso proceso de validación por pares médicos.
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                <Eye className="w-5 h-5 mr-2" />
                Explorar mercado
              </Button>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Tarjetas de Agentes Destacados */}
            <Card className="p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                    <AvatarImage src={carlosCardioAvatar} alt="Dr. Martinez" />
                    <AvatarFallback className="text-xl">DM</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Especialista en Cardiología</h3>
                    <p className="text-sm text-muted-foreground">por Dr. Martinez</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">4.9</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Interpretación avanzada de ECG y evaluación de riesgo cardiovascular con monitoreo en tiempo real
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-500/10 text-green-600">Licenciado 450+</Badge>
                <span className="font-semibold">$299/mes</span>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                    <AvatarImage src={aydaAvatar} alt="Hospital Central" />
                    <AvatarFallback className="text-xl">HC</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Administrativo EPS</h3>
                    <p className="text-sm text-muted-foreground">por Hospital Central</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Automatización administrativa completa para flujos de trabajo EPS, autorizaciones y facturación
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/10 text-blue-600">Licenciado 120+</Badge>
                <span className="font-semibold">$199/mes</span>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/20">
                    <AvatarImage src={elenaOncoAvatar} alt="Instituto de Investigación" />
                    <AvatarFallback className="text-xl">RI</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Investigación Oncológica</h3>
                    <p className="text-sm text-muted-foreground">por Instituto de Investigación</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm">5.0</span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Especializado en protocolos de investigación del cáncer, análisis de literatura y optimización de tratamientos
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-500/10 text-purple-600">Licenciado 80+</Badge>
                <span className="font-semibold">$399/mes</span>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="mr-4">
              <Search className="w-5 h-5 mr-2" />
              Explorar Todos los Agentes
            </Button>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Crear Agente IA
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section id="security" className="py-24 px-6 bg-muted/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Seguridad y cumplimiento
              </span>
              <br />
              <span className="text-foreground">de nivel empresarial</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Construido con los más altos estándares de seguridad para proteger datos médicos sensibles 
              y cumplir con regulaciones internacionales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "HIPAA Compliant", description: "Cumplimiento total con estándares de privacidad médica" },
              { icon: Lock, title: "Encriptación E2E", description: "Encriptación de extremo a extremo para todos los datos" },
              { icon: Cloud, title: "ISO 27001", description: "Certificación en gestión de seguridad de la información" },
              { icon: Database, title: "Respaldo Seguro", description: "Copias de seguridad automáticas y recuperación de desastres" }
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-glow transition-all duration-300">
                <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Precios transparentes
              </span>
              <br />
              <span className="text-foreground">para todos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desde profesionales individuales hasta grandes instituciones hospitalarias, 
              tenemos un plan que se adapta a tus necesidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$49",
                description: "Para médicos individuales",
                features: [
                  "1 agente de IA personalizado",
                  "Hasta 1000 consultas/mes",
                  "Soporte por email",
                  "Integraciones básicas"
                ]
              },
              {
                name: "Professional",
                price: "$149",
                description: "Para clínicas y grupos médicos",
                features: [
                  "Hasta 5 agentes de IA",
                  "Hasta 10,000 consultas/mes",
                  "Soporte prioritario 24/7",
                  "Integraciones avanzadas",
                  "Análisis y reportes",
                  "API completa"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Personalizado",
                description: "Para hospitales y redes de salud",
                features: [
                  "Agentes ilimitados",
                  "Consultas ilimitadas",
                  "Soporte dedicado",
                  "Integración personalizada",
                  "SLA garantizado",
                  "Cumplimiento regulatorio"
                ]
              }
            ].map((plan, index) => (
              <Card key={index} className={`p-8 text-center relative ${plan.popular ? 'border-2 border-primary shadow-glow' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-white px-4 py-2">Más Popular</Badge>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary mb-2">
                  {plan.price}
                  {plan.price !== "Personalizado" && <span className="text-lg text-muted-foreground">/mes</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-primary hover:opacity-90' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.price === "Personalizado" ? "Contactar ventas" : "Comenzar ahora"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              ¿Listo para revolucionar
            </span>
            <br />
            <span className="text-foreground">la atención médica?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales de la salud que ya están utilizando 
            Galatea AI para mejorar la atención al paciente y optimizar sus procesos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-primary hover:opacity-90">
              <Sparkles className="w-5 h-5 mr-2" />
              Crear mi primer agente
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              <Calendar className="w-5 h-5 mr-2" />
              Agendar demo personalizado
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Sin compromiso</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>30 días gratis</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Soporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-muted/50 border-t border-border">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={galateaAvatar} alt="Galatea AI" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">GA</AvatarFallback>
                </Avatar>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Galatea AI
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                La infraestructura para agentes de IA médica hiperrealistas. 
                Revolucionando la atención médica con inteligencia artificial.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#platform" className="block hover:text-foreground transition-colors">Plataforma</a>
                <a href="#agents" className="block hover:text-foreground transition-colors">Agentes IA</a>
                <a href="#marketplace" className="block hover:text-foreground transition-colors">Mercado</a>
                <a href="#pricing" className="block hover:text-foreground transition-colors">Precios</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Sobre nosotros</a>
                <a href="#" className="block hover:text-foreground transition-colors">Carreras</a>
                <a href="#" className="block hover:text-foreground transition-colors">Blog</a>
                <a href="#" className="block hover:text-foreground transition-colors">Prensa</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Centro de ayuda</a>
                <a href="#" className="block hover:text-foreground transition-colors">Documentación</a>
                <a href="#" className="block hover:text-foreground transition-colors">Estado del sistema</a>
                <a href="#" className="block hover:text-foreground transition-colors">Contacto</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Galatea AI. Todos los derechos reservados. | Política de privacidad | Términos de servicio</p>
          </div>
        </div>
      </footer>
    </div>
  );
};