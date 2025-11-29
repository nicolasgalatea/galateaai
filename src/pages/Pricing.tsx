import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Store, Wrench } from 'lucide-react';

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
