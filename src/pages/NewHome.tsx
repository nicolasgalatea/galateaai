import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import heroImage from '@/assets/hero-medical-team.jpg';

export default function NewHome() {
  const { t } = useLanguage();
  useScrollReveal();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-gradient-hero overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto relative z-10">
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

      <Footer />
    </div>
  );
}
