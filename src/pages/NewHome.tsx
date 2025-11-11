import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserPlus, Bot, Palette, Database, TestTube, Rocket, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-medical-ai.jpg';

const processSteps = [
  { icon: UserPlus, key: 'step1' },
  { icon: Bot, key: 'step2' },
  { icon: Palette, key: 'step3' },
  { icon: Database, key: 'step4' },
  { icon: TestTube, key: 'step5' },
  { icon: Rocket, key: 'step6' },
];

export default function NewHome() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/contact">{t('hero.cta.create')}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/contact">{t('hero.cta.demo')}</Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="Medical AI Technology"
                className="relative rounded-2xl shadow-glow w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('process.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          {t(`process.${step.key}.title`)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t(`process.${step.key}.desc`)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/contact">
                {t('process.cta')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
