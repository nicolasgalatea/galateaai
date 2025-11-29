import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { Search, Cable, Bot, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const steps = [
  { 
    icon: Search, 
    titleKey: 'howItWorks.step1.title',
    descKey: 'howItWorks.step1.desc',
    path: '/methodology/diagnosis',
  },
  { 
    icon: Cable, 
    titleKey: 'howItWorks.step2.title',
    descKey: 'howItWorks.step2.desc',
    path: '/methodology/integration',
  },
  { 
    icon: Bot, 
    titleKey: 'howItWorks.step3.title',
    descKey: 'howItWorks.step3.desc',
    path: '/methodology/deployment',
  },
  { 
    icon: TrendingUp, 
    titleKey: 'howItWorks.step4.title',
    descKey: 'howItWorks.step4.desc',
    path: '/methodology/control',
  },
];

export function HowItWorks() {
  useScrollReveal();
  const { t } = useLanguage();

  return (
    <section id="methodology" className="relative py-24 px-4 bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-reveal">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <Link
                key={index}
                to={step.path}
                className="group relative bg-card hover:bg-card/80 p-6 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-3 text-base">
                  {t(step.titleKey)}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(step.descKey)}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center scroll-reveal">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary text-primary-foreground">
            <p className="text-sm font-medium">
              {t('howItWorks.bottomCta')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
