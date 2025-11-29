import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Store, Wrench, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pricing() {
  const { t } = useLanguage();
  useScrollReveal();

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

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Starter */}
            <Card className="hover-lift scroll-reveal relative overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">{t('pricing.starter.name')}</h3>
                <p className="text-muted-foreground mb-6">{t('pricing.starter.desc')}</p>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.starter.feature1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.starter.feature2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.starter.feature3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.starter.feature4')}
                  </li>
                </ul>
                <Button className="w-full" variant="outline">{t('pricing.cta')}</Button>
              </CardContent>
            </Card>

            {/* Professional */}
            <Card className="hover-lift scroll-reveal border-primary relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">{t('pricing.professional.name')}</h3>
                <p className="text-muted-foreground mb-6">{t('pricing.professional.desc')}</p>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.professional.feature1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.professional.feature2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.professional.feature3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.professional.feature4')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.professional.feature5')}
                  </li>
                </ul>
                <Button className="w-full">{t('pricing.cta')}</Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="hover-lift scroll-reveal relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">{t('pricing.enterprise.name')}</h3>
                <p className="text-muted-foreground mb-6">{t('pricing.enterprise.desc')}</p>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.enterprise.feature1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.enterprise.feature2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.enterprise.feature3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.enterprise.feature4')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.enterprise.feature5')}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    {t('pricing.enterprise.feature6')}
                  </li>
                </ul>
                <Button className="w-full" variant="outline">{t('pricing.cta')}</Button>
              </CardContent>
            </Card>
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
