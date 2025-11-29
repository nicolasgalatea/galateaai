import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check, Building2, Network, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pricing() {
  const { t } = useLanguage();
  useScrollReveal();

  const plans = [
    {
      key: 'core',
      icon: Building2,
      features: ['feature1', 'feature2', 'feature3', 'feature4'],
      highlighted: false,
    },
    {
      key: 'enterprise',
      icon: Network,
      features: ['feature1', 'feature2', 'feature3', 'feature4'],
      highlighted: true,
    },
    {
      key: 'sovereign',
      icon: Cloud,
      features: ['feature1', 'feature2', 'feature3', 'feature4'],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative pt-32 pb-20 px-4 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Page Header */}
          <div className="text-center mb-20 scroll-reveal">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              {t('pricing.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Enterprise Licensing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.key}
                  className={`scroll-reveal relative group ${plan.highlighted ? 'lg:-mt-4 lg:mb-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card */}
                  <div
                    className={`
                      relative h-full rounded-2xl p-8 lg:p-10 transition-all duration-500
                      ${plan.highlighted 
                        ? 'glass-card-highlighted border-2 border-primary/50 shadow-2xl shadow-primary/20' 
                        : 'glass-card border border-border/50 hover:border-primary/30 hover:shadow-xl'
                      }
                    `}
                  >
                    {/* Recommended Badge */}
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold tracking-wide uppercase">
                          {t('pricing.recommended')}
                        </span>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center mb-6
                      ${plan.highlighted 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-primary/10 text-primary'
                      }
                    `}>
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Title & Tagline */}
                    <h3 className="text-2xl lg:text-3xl font-bold mb-2 tracking-tight">
                      {t(`pricing.${plan.key}.name`)}
                    </h3>
                    <p className="text-primary font-medium text-sm uppercase tracking-wider mb-4">
                      {t(`pricing.${plan.key}.tagline`)}
                    </p>

                    {/* Description */}
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      {t(`pricing.${plan.key}.desc`)}
                    </p>

                    {/* Features */}
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                            ${plan.highlighted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}
                          `}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className="text-foreground/90">
                            {t(`pricing.${plan.key}.${feature}`)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button 
                      className={`
                        w-full h-12 text-base font-semibold transition-all duration-300
                        ${plan.highlighted 
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30' 
                          : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:text-primary'
                        }
                      `}
                    >
                      {t(`pricing.${plan.key}.cta`)}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="mt-20 text-center scroll-reveal">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-4">
              {t('pricing.trust.title')}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground/70">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                HIPAA
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                ISO 27001
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                GDPR
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                SOC 2
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                GxP Ready
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
