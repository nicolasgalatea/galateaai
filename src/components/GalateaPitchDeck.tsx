import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Heart, Award, FileText, TrendingUp, Zap, Users, MapPin, DollarSign, CheckCircle, ArrowRight, Mail, Phone, Calendar } from 'lucide-react';

export const GalateaPitchDeck = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar los datos
    setSubmitted(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para agendar reunión
    console.log('Contacto solicitado:', { name, email, company });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center space-x-3 bg-primary/10 px-4 py-2 rounded-full">
                <Bot className="w-5 h-5 text-primary" />
                <span className="text-primary font-medium">El Futuro de la Salud es Hoy</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-primary bg-clip-text text-transparent">GALATEA AI</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                La primera plataforma de agentes de IA especializados para hospitales, EPS y centros médicos en LATAM. 
                Revolucionamos la medicina con inteligencia artificial adaptada a tu realidad.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Únete a la Lista de Espera
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Demo
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="w-full max-w-md mx-auto bg-card p-8 rounded-2xl shadow-glow border">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Únete al Futuro</h3>
                  <p className="text-muted-foreground">
                    Sé de los primeros en acceder a nuestros agentes de IA especializados
                  </p>
                </div>
                
                {!submitted ? (
                  <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="correo@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Institución/Hospital"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full">
                      Unirme a la Lista de Espera
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Al registrarte, aceptas recibir actualizaciones sobre nuestro lanzamiento
                    </p>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-success mx-auto" />
                    <h4 className="text-xl font-semibold text-success">¡Te has registrado exitosamente!</h4>
                    <p className="text-muted-foreground">
                      Te notificaremos cuando nuestros agentes de IA estén listos para revolucionar tu institución médica.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              El Sistema de Salud Necesita una Revolución
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Los hospitales pierden millones en ineficiencias mientras la IA médica permanece inaccesible
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-shadow">
              <div className="text-4xl font-bold text-destructive mb-4">80%</div>
              <p className="text-muted-foreground">
                de hospitales en LATAM no tienen acceso a IA adaptada a su realidad
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-glow transition-shadow">
              <div className="text-4xl font-bold text-destructive mb-4">$2M</div>
              <p className="text-muted-foreground">
                pierde cada hospital al año en ineficiencias administrativas
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-glow transition-shadow">
              <div className="text-4xl font-bold text-destructive mb-4">12-18</div>
              <p className="text-muted-foreground">
                meses + $1M USD para desarrollar IA médica a medida
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Nuestra Solución: Plataforma de Agentes de IA
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Agentes especializados listos para implementar en tu institución médica
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-glow transition-shadow">
              <Bot className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Agentes Especializados</h3>
              <p className="text-muted-foreground">
                Oncología, Cardiología, Administración Clínica - listos para implementar
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-glow transition-shadow">
              <TrendingUp className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Infraestructura Completa</h3>
              <p className="text-muted-foreground">
                Crear, desplegar y comercializar en una sola plataforma
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-glow transition-shadow">
              <Users className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Ecosistema Conectado</h3>
              <p className="text-muted-foreground">
                Hospitales, EPS, IPS, Laboratorios, Farmas conectados
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* MVP Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Nuestros Agentes de IA en Desarrollo
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              MVP próximo a lanzarse con validación en Hospital de Houston
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Agente Cardiólogo</h3>
                  <p className="text-muted-foreground">
                    Análisis automático de estudios cardiovasculares con 95% de precisión
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Agente Oncólogo</h3>
                  <p className="text-muted-foreground">
                    Coordinación inteligente de planes de tratamiento oncológico
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Agente Administrativo</h3>
                  <p className="text-muted-foreground">
                    Automatización de citas, autorizaciones y seguimientos
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-glow transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Agente Investigación</h3>
                  <p className="text-muted-foreground">
                    Gestión optimizada de ensayos clínicos y protocolos
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-primary rounded-3xl p-12 text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ¿Listo para Revolucionar tu Institución Médica?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Agenda una reunión con nuestro equipo y descubre cómo nuestros agentes de IA pueden transformar tu práctica médica
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="email"
                  placeholder="Tu email corporativo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Input
                  type="text"
                  placeholder="Tu institución médica"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full bg-white text-primary hover:bg-white/90"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Reunión Estratégica
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GALATEA AI
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-muted-foreground text-sm">
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
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Galatea AI. Todos los derechos reservados. Revolucionando la medicina con inteligencia artificial.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};