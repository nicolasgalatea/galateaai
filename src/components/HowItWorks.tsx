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
    color: 'red',
  },
  { 
    icon: Cable, 
    titleKey: 'howItWorks.step2.title',
    descKey: 'howItWorks.step2.desc',
    path: '/methodology/integration',
    color: 'blue',
  },
  { 
    icon: Bot, 
    titleKey: 'howItWorks.step3.title',
    descKey: 'howItWorks.step3.desc',
    path: '/methodology/deployment',
    color: 'purple',
  },
  { 
    icon: TrendingUp, 
    titleKey: 'howItWorks.step4.title',
    descKey: 'howItWorks.step4.desc',
    path: '/methodology/control',
    color: 'green',
  },
];

const colorClasses = {
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'bg-red-500',
    iconText: 'text-white',
    hoverBorder: 'hover:border-red-500/50',
    dotBorder: 'border-red-500/40',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'bg-blue-500',
    iconText: 'text-white',
    hoverBorder: 'hover:border-blue-500/50',
    dotBorder: 'border-blue-500/40',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: 'bg-purple-500',
    iconText: 'text-white',
    hoverBorder: 'hover:border-purple-500/50',
    dotBorder: 'border-purple-500/40',
  },
  green: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: 'bg-green-500',
    iconText: 'text-white',
    hoverBorder: 'hover:border-green-500/50',
    dotBorder: 'border-green-500/40',
  },
};

export function HowItWorks() {
  useScrollReveal();
  const { t } = useLanguage();

  return (
    <section id="methodology" className="relative py-28 px-4 bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Step Cards */}
        <div className="relative scroll-reveal">
          {/* Dotted connector line - visible only on large screens */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-primary/40 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colors = colorClasses[step.color as keyof typeof colorClasses];
              
              return (
                <Link
                  key={index}
                  to={step.path}
                  className={`group relative bg-card hover:bg-card/80 p-8 rounded-2xl border ${colors.border} ${colors.hoverBorder} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* Step Number */}
                  <div className={`absolute top-5 right-5 w-8 h-8 rounded-full ${colors.icon} flex items-center justify-center text-sm font-bold ${colors.iconText}`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-20 h-20 rounded-2xl ${colors.icon} flex items-center justify-center mb-6`}>
                    <Icon className={`w-10 h-10 ${colors.iconText}`} />
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold mb-4 text-xl ${colors.text}`}>
                    {t(step.titleKey)}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center scroll-reveal">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground">
            <p className="text-base font-medium">
              {t('howItWorks.bottomCta')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
