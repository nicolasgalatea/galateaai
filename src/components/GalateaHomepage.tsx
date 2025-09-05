import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Heart, Award, FileText, TrendingUp, Zap, Users, MapPin, 
  ArrowRight, CheckCircle, Brain, Shield, Stethoscope, Database,
  Cloud, Microscope, Activity, Calendar, Mail, Phone, Globe,
  Target, Lightbulb, Code, Cpu, Building2, Star, Play
} from 'lucide-react';

export const GalateaHomepage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GALATEA AI
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-muted-foreground hover:text-foreground transition-colors">Inicio</a>
              <a href="#servicios" className="text-muted-foreground hover:text-foreground transition-colors">Servicios</a>
              <a href="#tecnologia" className="text-muted-foreground hover:text-foreground transition-colors">Tecnología</a>
              <a href="#casos" className="text-muted-foreground hover:text-foreground transition-colors">Casos de Uso</a>
              <a href="#empresa" className="text-muted-foreground hover:text-foreground transition-colors">Empresa</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <a href="/waitlist">Lista de Espera</a>
              </Button>
              <Button size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-3 bg-primary/10 px-6 py-3 rounded-full">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">The Platform for Hyperrealistic Healthcare Avatars</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold max-w-5xl mx-auto">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Galatea AI
              </span>
              <br />
              <span className="text-foreground">Healthcare Revolution</span>
            </h1>
            
            <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Galatea AI is the platform that empowers every healthcare stakeholder to design, coordinate, deploy, and commercialize AI-powered hyperrealistic avatars. From pharmaceutical companies, hospitals, clinics, insurers (EPS/IPS), and medical professionals to students, researchers, and even patients themselves—Galatea provides the tools to bring digital healthcare to life. We are both B2B and B2C, enabling large-scale deployments for institutions and personalized use for individuals.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <Button size="lg" className="text-lg px-8 py-4">
                <a href="/waitlist" className="flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demo en Vivo
                </a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <FileText className="w-5 h-5 mr-2" />
                Descargar Whitepaper
              </Button>
            </div>
            
            <div className="flex justify-center items-center space-x-12 pt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">98%</div>
                <div className="text-muted-foreground">Satisfacción Pacientes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">40%</div>
                <div className="text-muted-foreground">Reducción Tiempo Consulta</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">24/7</div>
                <div className="text-muted-foreground">Disponibilidad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why Galatea?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Code className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">End-to-end Platform</h3>
              <p className="text-muted-foreground">
                Build, train, and launch avatars from a single hub with comprehensive tools and workflows.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Hyperrealism + Trust</h3>
              <p className="text-muted-foreground">
                Avatars that look, sound, and behave like real humans, validated for medical use.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Healthcare-Native</h3>
              <p className="text-muted-foreground">
                Designed specifically for the needs of life sciences and medical workflows.
              </p>
            </Card>
            
            <Card className="p-8 text-center hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Scalable and Global</h3>
              <p className="text-muted-foreground">
                Deploy across geographies, languages, and specialties with ease.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="empresa" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge variant="secondary" className="mb-4">Who We Are</Badge>
                <h2 className="text-5xl font-bold mb-6">
                  The Platform for Hyperrealistic Healthcare Avatars
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Galatea AI is the platform that empowers every healthcare stakeholder to design, coordinate, deploy, and commercialize AI-powered hyperrealistic avatars. From pharmaceutical companies, hospitals, clinics, insurers to medical professionals, students, researchers, and patients—we provide the tools to bring digital healthcare to life.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Misión</h3>
                    <p className="text-muted-foreground">
                      Democratizar el acceso a IA médica avanzada para todas las instituciones de salud en LATAM.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Visión</h3>
                    <p className="text-muted-foreground">
                      Ser la plataforma líder de IA médica que transforme la atención sanitaria en América Latina.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Hospitales Objetivo</div>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">15M+</div>
                <div className="text-muted-foreground">Pacientes Impactados</div>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">12</div>
                <div className="text-muted-foreground">Países LATAM</div>
              </Card>
              <Card className="p-6 text-center hover:shadow-glow transition-shadow">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Satisfacción Cliente</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Nuestros Servicios</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Agentes de IA Especializados por Área Médica
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Cada agente está entrenado con conocimiento médico específico, protocolos clínicos 
              y regulaciones locales para brindar asistencia experta las 24 horas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Cardiología</h3>
                  <Badge variant="outline" className="mt-1">En Desarrollo</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Análisis avanzado de ECG, ecocardiogramas y estudios hemodinámicos con interpretación 
                automática y recomendaciones terapéuticas.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Interpretación de ECG en tiempo real</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Análisis de riesgo cardiovascular</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Protocolos de emergencia</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Microscope className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Oncología</h3>
                  <Badge variant="outline" className="mt-1">En Desarrollo</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Asistente especializado en planes de tratamiento oncológico, seguimiento de pacientes 
                y coordinación multidisciplinaria.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Planes de tratamiento personalizados</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Seguimiento de efectos adversos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Coordinación de juntas médicas</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Administración</h3>
                  <Badge className="mt-1 bg-success/10 text-success">Disponible</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Automatización inteligente de procesos administrativos, gestión de citas, 
                autorizaciones y facturación médica.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Gestión automática de citas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Procesamiento de autorizaciones</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Optimización de recursos</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Radiología</h3>
                  <Badge variant="outline" className="mt-1">Próximamente</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Análisis avanzado de imágenes médicas con detección automática de anomalías 
                y generación de reportes estructurados.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Detección automática de lesiones</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Reportes estructurados DICOM</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Priorización por urgencia</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Investigación</h3>
                  <Badge variant="outline" className="mt-1">Beta</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Optimización de ensayos clínicos, gestión de protocolos de investigación 
                y análisis de datos médicos complejos.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Gestión de ensayos clínicos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Análisis estadístico avanzado</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Cumplimiento regulatorio</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Medicina General</h3>
                  <Badge variant="outline" className="mt-1">Próximamente</Badge>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Asistente para consulta general, triaje inteligente y apoyo en decisiones 
                clínicas para atención primaria.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Triaje automático de pacientes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Apoyo en diagnóstico diferencial</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Recomendaciones de derivación</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="tecnologia" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Tecnología Avanzada</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Infraestructura de IA de Clase Mundial
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Nuestra plataforma combina los últimos avances en IA, procesamiento de lenguaje natural 
              y computing en la nube para ofrecer soluciones médicas de precisión.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Cpu className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Large Language Models</h3>
              <p className="text-muted-foreground text-sm">
                Modelos especializados entrenados con literatura médica y protocolos clínicos
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Cloud className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cloud Native</h3>
              <p className="text-muted-foreground text-sm">
                Arquitectura escalable y segura en la nube con disponibilidad 99.9%
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Seguridad Médica</h3>
              <p className="text-muted-foreground text-sm">
                Cumplimiento HIPAA, GDPR y regulaciones locales de protección de datos
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-glow transition-shadow">
              <Database className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Integración HIS</h3>
              <p className="text-muted-foreground text-sm">
                Conectividad nativa con sistemas hospitalarios y bases de datos médicas
              </p>
            </Card>
          </div>
          
          <div className="bg-card rounded-3xl p-12 shadow-glow">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold">Diferenciadores Tecnológicos</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Conocimiento Médico Especializado</h4>
                      <p className="text-muted-foreground text-sm">
                        Entrenamiento específico con guías clínicas, protocolos hospitalarios y 
                        literatura médica en español y portugués.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Aprendizaje Continuo</h4>
                      <p className="text-muted-foreground text-sm">
                        Los agentes mejoran constantemente con cada interacción, adaptándose 
                        a las particularidades de cada institución.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Privacidad por Diseño</h4>
                      <p className="text-muted-foreground text-sm">
                        Procesamiento local de datos sensibles con encriptación end-to-end 
                        y anonimización automática.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-primary rounded-2xl p-8 text-white">
                <h4 className="text-2xl font-bold mb-6">Métricas de Rendimiento</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">95%</div>
                    <div className="text-white/80 text-sm">Precisión Diagnóstica</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">&lt;2s</div>
                    <div className="text-white/80 text-sm">Tiempo de Respuesta</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">99.9%</div>
                    <div className="text-white/80 text-sm">Disponibilidad</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-white/80 text-sm">Soporte Activo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="casos" className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Casos de Uso</Badge>
            <h2 className="text-5xl font-bold mb-6">
              Transformando la Atención Médica en Tiempo Real
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Nuestros agentes de IA están revolucionando la práctica médica en hospitales 
              y centros de salud líderes en América Latina.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Hospital Universitario San Ignacio</h3>
                <Badge variant="outline" className="mb-4">Caso de Estudio</Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Implementación del Agente Administrativo para optimizar la gestión de citas 
                y reducir tiempos de espera en 60%.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reducción tiempo espera</span>
                  <span className="font-semibold text-primary">60%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Eficiencia administrativa</span>
                  <span className="font-semibold text-primary">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Satisfacción pacientes</span>
                  <span className="font-semibold text-primary">85%</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Clínica Cardiovascular Santa María</h3>
                <Badge variant="outline" className="mb-4">Piloto Activo</Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Agente Cardiólogo asistiendo en interpretación de ECG y análisis de riesgo 
                cardiovascular con precisión del 95%.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Precisión diagnóstica</span>
                  <span className="font-semibold text-primary">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiempo análisis ECG</span>
                  <span className="font-semibold text-primary">-80%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Detección temprana</span>
                  <span className="font-semibold text-primary">92%</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="mb-6">
                <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                  <Microscope className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Instituto Nacional de Cancerología</h3>
                <Badge variant="outline" className="mb-4">En Implementación</Badge>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Agente Oncólogo coordinando planes de tratamiento multidisciplinarios 
                y optimizando protocolos de quimioterapia.
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Coordinación tratamientos</span>
                  <span className="font-semibold text-primary">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Adherencia protocolos</span>
                  <span className="font-semibold text-primary">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Seguimiento pacientes</span>
                  <span className="font-semibold text-primary">24/7</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl font-bold mb-6">
            ¿Listo para Transformar tu Institución Médica?
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Únete a los hospitales líderes que ya están revolucionando la atención médica 
            con nuestros agentes de IA especializados.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4">
              <a href="/waitlist" className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Demo Personalizada
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4">
              <a href="/waitlist" className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Unirse a Lista de Espera
              </a>
            </Button>
          </div>
          
          <div className="mt-12 text-center opacity-80">
            <p className="text-sm">
              Implementación gratuita para las primeras 10 instituciones • 
              Soporte dedicado 24/7 • ROI garantizado en 6 meses
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  GALATEA AI
                </span>
              </div>
              <p className="text-muted-foreground">
                Revolucionando la medicina en LATAM con agentes de inteligencia artificial 
                especializados para hospitales y centros médicos.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="icon">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Mail className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#servicios" className="hover:text-foreground transition-colors">Agentes de IA</a></li>
                <li><a href="#tecnologia" className="hover:text-foreground transition-colors">Plataforma</a></li>
                <li><a href="#casos" className="hover:text-foreground transition-colors">Casos de Uso</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API & Integraciones</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#empresa" className="hover:text-foreground transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Noticias</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Inversionistas</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>contacto@galatea.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+57 (1) 234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Bogotá, Colombia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-muted-foreground text-sm">
                &copy; 2024 Galatea AI. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
                <a href="#" className="hover:text-foreground transition-colors">Términos</a>
                <a href="#" className="hover:text-foreground transition-colors">Seguridad</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};