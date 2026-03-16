import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: 'para siempre',
    description: 'Ideal para explorar la plataforma y proyectos individuales.',
    icon: Sparkles,
    highlighted: false,
    features: [
      '1 proyecto de investigación activo',
      'Agentes Arquitecto y Metodólogo',
      'Test FINER interactivo',
      'Búsqueda PubMed (10 artículos)',
      'Exportación PDF básica',
    ],
    cta: 'Comenzar Gratis',
    ctaLink: '/demo/index.html',
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/mes por investigador',
    description: 'Para investigadores activos que necesitan el flujo completo.',
    icon: Zap,
    highlighted: true,
    features: [
      'Proyectos ilimitados',
      '4 agentes completos (Arquitecto → Redactor)',
      'Búsqueda PubMed ilimitada',
      'Meta-análisis con Forest Plot y GRADE',
      'Manuscrito IMRyD + exportación DOCX/PDF',
      'Integración REDCap',
      'Soporte prioritario',
    ],
    cta: 'Elegir Pro',
    ctaLink: '/demo/index.html',
  },
  {
    name: 'Institucional',
    price: 'Cotizar',
    period: '',
    description: 'Para hospitales, universidades y grupos de investigación.',
    icon: Building2,
    highlighted: false,
    features: [
      'Todo lo de Pro',
      'Usuarios ilimitados',
      'SSO institucional (SAML/OIDC)',
      'Ruta FSFB / Comité de Ética personalizable',
      'Dashboard administrativo',
      'API dedicada + SLA 99.9%',
      'Despliegue on-premise opcional',
    ],
    cta: 'Contactar Ventas',
    ctaLink: '/contact',
  },
];

export default function Pricing() {
  useScrollReveal();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative pt-32 pb-20 px-4 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20 scroll-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Precios simples, investigación sin límites
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Desde la pregunta de investigación hasta el manuscrito publicable. Elige el plan que se adapte a tu equipo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`scroll-reveal relative group ${plan.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`
                      relative h-full rounded-2xl p-8 lg:p-10 transition-all duration-500
                      ${plan.highlighted
                        ? 'glass-card-highlighted border-2 border-primary/50 shadow-2xl shadow-primary/20'
                        : 'glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl'
                      }
                    `}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold tracking-wide uppercase">
                          Recomendado
                        </span>
                      </div>
                    )}

                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center mb-6
                      ${plan.highlighted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                      }
                    `}>
                      <Icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold mb-1 tracking-tight">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </div>

                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      {plan.description}
                    </p>

                    <ul className="space-y-4 mb-10">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                            ${plan.highlighted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}
                          `}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-foreground/90">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <a href={plan.ctaLink}>
                      <Button
                        className={`
                          w-full h-12 text-base font-semibold transition-all duration-300
                          ${plan.highlighted
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:text-primary'
                          }
                        `}
                      >
                        {plan.cta}
                      </Button>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 text-center scroll-reveal">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4">
              Seguridad y Cumplimiento
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground/70">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />API Keys server-side</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Supabase RLS</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />HTTPS</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Sin datos de pacientes</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" />Res. 008430/1993</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
