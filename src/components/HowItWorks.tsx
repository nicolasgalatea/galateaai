import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import { Search, Cable, Bot, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const steps = [
  { 
    icon: Search, 
    key: 'step1',
    titleKey: 'howItWorks.card1.title',
    descKey: 'howItWorks.card1.desc',
    path: '/methodology/diagnosis',
    color: 'red',
  },
  { 
    icon: Cable, 
    key: 'step2',
    titleKey: 'howItWorks.card2.title',
    descKey: 'howItWorks.card2.desc',
    path: '/methodology/integration',
    color: 'blue',
  },
  { 
    icon: Bot, 
    key: 'step3',
    titleKey: 'howItWorks.card3.title',
    descKey: 'howItWorks.card3.desc',
    path: '/methodology/deployment',
    color: 'purple',
  },
  { 
    icon: TrendingUp, 
    key: 'step4',
    titleKey: 'howItWorks.card4.title',
    descKey: 'howItWorks.card4.desc',
    path: '/methodology/control',
    color: 'green',
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
        <div className="text-center mb-12 scroll-reveal">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('howItWorks.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('howItWorks.sectionSubtitle')}
          </p>
        </div>

        {/* Step Cards - Now as Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 scroll-reveal">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorClasses = {
              red: {
                bg: 'bg-red-500/10 hover:bg-red-500/20',
                border: 'border-red-500/20 hover:border-red-500/40',
                icon: 'bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white',
                number: 'bg-red-500 text-white',
                arrow: 'text-red-400',
              },
              blue: {
                bg: 'bg-blue-500/10 hover:bg-blue-500/20',
                border: 'border-blue-500/20 hover:border-blue-500/40',
                icon: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
                number: 'bg-blue-500 text-white',
                arrow: 'text-blue-400',
              },
              purple: {
                bg: 'bg-purple-500/10 hover:bg-purple-500/20',
                border: 'border-purple-500/20 hover:border-purple-500/40',
                icon: 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
                number: 'bg-purple-500 text-white',
                arrow: 'text-purple-400',
              },
              green: {
                bg: 'bg-green-500/10 hover:bg-green-500/20',
                border: 'border-green-500/20 hover:border-green-500/40',
                icon: 'bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white',
                number: 'bg-green-500 text-white',
                arrow: 'text-green-400',
              },
            };
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            
            return (
              <Link
                key={index}
                to={step.path}
                className={cn(
                  "group relative p-6 rounded-2xl border-2 transition-all duration-300",
                  colors.bg,
                  colors.border,
                  "hover:scale-105 hover:shadow-xl"
                )}
              >
                {/* Step Number */}
                <div className={cn(
                  "absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  colors.number
                )}>
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                  colors.icon
                )}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 text-lg">
                  {t(step.titleKey)}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {t(step.descKey)}
                </p>

                {/* Arrow indicator */}
                <div className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-transform group-hover:translate-x-2",
                  colors.arrow
                )}>
                  {t('howItWorks.viewMore')}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center scroll-reveal">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-muted border border-border">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-foreground">
              {t('howItWorks.bottomCta')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
