import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Check, Store, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const { t } = useLanguage();
  useScrollReveal();

  const plans = [
    {
      name: t('pricing.starter.name'),
      price: t('pricing.starter.price'),
      period: t('pricing.starter.period'),
      desc: t('pricing.starter.desc'),
      features: [
        t('pricing.starter.feature1'),
        t('pricing.starter.feature2'),
        t('pricing.starter.feature3'),
        t('pricing.starter.feature4'),
      ],
      variant: 'outline' as const,
    },
    {
      name: t('pricing.professional.name'),
      price: t('pricing.professional.price'),
      period: t('pricing.professional.period'),
      desc: t('pricing.professional.desc'),
      features: [
        t('pricing.professional.feature1'),
        t('pricing.professional.feature2'),
        t('pricing.professional.feature3'),
        t('pricing.professional.feature4'),
        t('pricing.professional.feature5'),
      ],
      variant: 'default' as const,
      popular: true,
    },
    {
      name: t('pricing.enterprise.name'),
      price: t('pricing.enterprise.price'),
      period: '',
      desc: t('pricing.enterprise.desc'),
      features: [
        t('pricing.enterprise.feature1'),
        t('pricing.enterprise.feature2'),
        t('pricing.enterprise.feature3'),
        t('pricing.enterprise.feature4'),
        t('pricing.enterprise.feature5'),
        t('pricing.enterprise.feature6'),
      ],
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative pt-32 pb-20 px-4 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Page Header */}
          <div className="text-center mb-16 scroll-reveal">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`hover-lift scroll-reveal ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold rounded-t-lg">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.desc}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.variant} className="w-full" asChild>
                    <Link to="/contact">{t('pricing.cta')}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Marketplace */}
            <Card className="hover-lift scroll-reveal">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('pricing.marketplace.title')}</h3>
                <p className="text-muted-foreground">
                  {t('pricing.marketplace.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Premium Services */}
            <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Wrench className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{t('pricing.premium.title')}</h3>
                <p className="text-muted-foreground">
                  {t('pricing.premium.desc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
