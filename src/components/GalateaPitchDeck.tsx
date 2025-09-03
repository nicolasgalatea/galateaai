import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Bot, Heart, Award, FileText, TrendingUp, Zap, Users, MapPin, DollarSign } from 'lucide-react';

const slideData = [
  {
    id: 'intro',
    title: 'GALATEA AI',
    subtitle: 'La Infraestructura de IA para el Futuro de la Salud',
    description: 'Creamos, desplegamos y comercializamos agentes de IA especializados que revolucionan la medicina',
    type: 'hero'
  },
  {
    id: 'problem',
    title: 'El Sistema de Salud está Bloqueado para Adoptar IA',
    type: 'stats',
    stats: [
      { value: '80%', label: 'de hospitales en LATAM no tienen acceso a IA adaptada a su realidad' },
      { value: '$2M', label: 'pierde cada hospital al año en ineficiencias administrativas' },
      { value: '12-18 meses', label: '+ $1M USD para desarrollar IA médica a medida' }
    ]
  },
  {
    id: 'solution',
    title: 'Nuestra Solución',
    subtitle: 'Marketplace de Agentes de IA especializados en salud',
    type: 'solution',
    features: [
      {
        icon: Bot,
        title: 'Agentes Especializados',
        description: 'Oncología, Cardiología, Administración Clínica - listos para implementar'
      },
      {
        icon: TrendingUp,
        title: 'Infraestructura Completa',
        description: 'Crear, desplegar y comercializar en una sola plataforma'
      },
      {
        icon: Users,
        title: 'Ecosistema Conectado',
        description: 'Hospitales, EPS, IPS, Laboratorios, Farmas conectados'
      }
    ]
  },
  {
    id: 'market',
    title: 'Mercado',
    type: 'market',
    markets: [
      { value: '$350B', label: 'TAM Global', sublabel: 'HealthTech AI' },
      { value: '$45B', label: 'SAM Latam', sublabel: 'Digital Health' },
      { value: '$2B', label: 'SOM Colombia', sublabel: 'Healthcare AI' }
    ]
  },
  {
    id: 'revenue',
    title: 'Cómo Ganamos Dinero',
    type: 'pricing',
    plans: [
      {
        name: 'Plan Base',
        price: '$2,000',
        period: 'USD/mes por hospital',
        description: 'Acceso básico a agentes'
      },
      {
        name: 'Enterprise',
        price: '$50k-$250k',
        period: 'USD/año',
        description: 'Agentes ilimitados + integración EHR'
      },
      {
        name: 'Marketplace',
        price: '10%',
        period: 'comisión',
        description: 'por cada agente comprado/vendido'
      }
    ]
  },
  {
    id: 'mvp',
    title: 'MVP en Desarrollo',
    type: 'mvp',
    agents: [
      {
        icon: Heart,
        title: 'Agente Cardiólogo',
        description: 'Análisis automático de estudios cardiovasculares con 95% de precisión'
      },
      {
        icon: Award,
        title: 'Agente Oncólogo',
        description: 'Coordinación inteligente de planes de tratamiento oncológico'
      },
      {
        icon: FileText,
        title: 'Agente Administrativo',
        description: 'Automatización de citas, autorizaciones y seguimientos'
      },
      {
        icon: Zap,
        title: 'Agente Investigación',
        description: 'Gestión optimizada de ensayos clínicos y protocolos'
      }
    ]
  },
  {
    id: 'traction',
    title: 'Tracción Temprana',
    type: 'traction',
    milestones: [
      {
        icon: MapPin,
        title: 'Hospital de Houston',
        description: 'Validación de idea en curso - feedback muy positivo para MVP'
      },
      {
        icon: Zap,
        title: 'MVP Próxima Semana',
        description: 'Primera versión funcional lista para pilotos'
      },
      {
        icon: TrendingUp,
        title: 'Fase Idea',
        description: 'Equipo técnico ensamblado, roadmap definido'
      }
    ]
  },
  {
    id: 'team',
    title: 'Equipo Fundador',
    type: 'team',
    members: [
      {
        name: 'Nicolás Pérez Rivera',
        role: 'CEO',
        initials: 'NP',
        color: 'bg-info',
        experience: [
          '8+ años experiencia en ventas',
          '5+ años en salud digital e IA',
          'Especialista en HealthTech startups'
        ]
      },
      {
        name: 'Carlos Pérez Rivera',
        role: 'Chief Medical Officer',
        initials: 'CP',
        color: 'bg-success',
        experience: [
          'Médico cirujano especialista',
          '10+ años experiencia clínica',
          '90+ papers en revistas internacionales'
        ]
      },
      {
        name: 'Buscamos CTO',
        role: 'Chief Technology Officer',
        initials: '?',
        color: 'bg-destructive',
        experience: [
          'Experiencia desplegando modelos IA',
          'Machine Learning a escala',
          'Arquitectura sistemas distribuidos'
        ]
      }
    ]
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    type: 'roadmap',
    milestones: [
      {
        quarter: 'Q4 2025',
        icon: Zap,
        title: 'MVP Listo',
        description: 'Primer piloto con Hospital de Houston'
      },
      {
        quarter: 'Q1 2026',
        icon: TrendingUp,
        title: 'Expansión Pilotos',
        description: '3 hospitales + 1 aseguradora en piloto'
      },
      {
        quarter: 'Q2 2026',
        icon: DollarSign,
        title: 'Primer Cliente Pago',
        description: 'Validación de modelo de negocio'
      },
      {
        quarter: 'Q4 2026',
        icon: MapPin,
        title: 'Expansión Regional',
        description: 'Lanzamiento en México y Brasil'
      }
    ]
  },
  {
    id: 'why-now',
    title: 'Por Qué Ahora',
    type: 'why-now',
    reasons: [
      '🌊 Ola global de IA en salud - momento perfecto para capturar mercado',
      '🏗️ No existe infraestructura multi-agente en este sector',
      '⚡ Timing perfecto: instituciones buscan soluciones propias, rápidas y seguras',
      '🎯 Primera ventaja: ser la infraestructura estándar de IA médica'
    ],
    cta: {
      title: 'Buscamos $500k',
      description: 'Para terminar el MVP, lanzar pilotos y escalar en LATAM.',
      vision: 'Queremos ser la infraestructura global de la IA médica.'
    }
  }
];

export const GalateaPitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideData.length) % slideData.length);
  };

  const renderSlide = (slide: typeof slideData[0]) => {
    switch (slide.type) {
      case 'hero':
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-24 h-24 mx-auto bg-card rounded-full flex items-center justify-center shadow-glow">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {slide.title}
              </h1>
              <p className="text-xl text-muted-foreground italic">
                {slide.subtitle}
              </p>
              <p className="text-lg text-foreground max-w-3xl mx-auto">
                {slide.description}
              </p>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="grid md:grid-cols-3 gap-8">
              {slide.stats?.map((stat, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-glow transition-shadow">
                  <div className="text-4xl font-bold text-destructive mb-4">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'solution':
        return (
          <div className="space-y-12 animate-slide-in">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold">{slide.title}</h1>
              <p className="text-xl text-muted-foreground italic">{slide.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {slide.features?.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-8 text-center hover:shadow-glow transition-shadow">
                    <Icon className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="flex justify-center gap-8">
              {slide.markets?.map((market, index) => (
                <div key={index} className="text-center">
                  <div className="w-48 h-48 rounded-full border-4 border-primary/30 flex flex-col items-center justify-center bg-card hover:shadow-glow transition-shadow">
                    <div className="text-3xl font-bold text-success mb-2">
                      {market.value}
                    </div>
                    <div className="text-lg font-semibold">{market.label}</div>
                    <div className="text-sm text-muted-foreground">{market.sublabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="grid md:grid-cols-3 gap-8">
              {slide.plans?.map((plan, index) => (
                <Card key={index} className={`p-8 text-center hover:shadow-glow transition-shadow ${index === 1 ? 'ring-2 ring-primary' : ''}`}>
                  <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
                  <div className="text-3xl font-bold text-success mb-2">
                    {plan.price}
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">
                    {plan.period}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'mvp':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="grid md:grid-cols-2 gap-8">
              {slide.agents?.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <Card key={index} className="p-8 hover:shadow-glow transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{agent.title}</h3>
                        <p className="text-muted-foreground">{agent.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'traction':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="grid md:grid-cols-3 gap-8">
              {slide.milestones?.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <Card key={index} className="p-8 hover:shadow-glow transition-shadow">
                    <Icon className="w-12 h-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="grid md:grid-cols-3 gap-8">
              {slide.members?.map((member, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-glow transition-shadow">
                  <div className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                    {member.initials}
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-4">{member.role}</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {member.experience.map((exp, expIndex) => (
                      <li key={expIndex}>• {exp}</li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'roadmap':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="space-y-6">
              {slide.milestones?.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <Card key={index} className="p-6 hover:shadow-glow transition-shadow">
                    <div className="flex items-center space-x-6">
                      <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold">
                        {milestone.quarter}
                      </div>
                      <Icon className="w-8 h-8 text-info" />
                      <div>
                        <h3 className="text-xl font-semibold text-info">{milestone.title}</h3>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'why-now':
        return (
          <div className="space-y-12 animate-slide-in">
            <h1 className="text-5xl font-bold text-center">{slide.title}</h1>
            <div className="space-y-6 max-w-4xl mx-auto">
              {slide.reasons?.map((reason, index) => (
                <div key={index} className="text-lg text-muted-foreground p-4 bg-card/50 rounded-lg">
                  {reason}
                </div>
              ))}
            </div>
            <Card className="bg-destructive text-destructive-foreground p-8 text-center max-w-2xl mx-auto shadow-glow">
              <h2 className="text-3xl font-bold mb-4">{slide.cta?.title}</h2>
              <p className="text-lg mb-2">{slide.cta?.description}</p>
              <p className="text-xl font-semibold">{slide.cta?.vision}</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-8 py-12">
        <div className="min-h-[80vh] flex items-center justify-center">
          {renderSlide(slideData[currentSlide])}
        </div>
        
        <div className="flex justify-center items-center space-x-4 mt-12">
          <Button
            variant="secondary"
            onClick={prevSlide}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>
          
          <div className="flex space-x-2">
            {slideData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="secondary"
            onClick={nextSlide}
            className="flex items-center space-x-2"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};