import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Target, Eye, Users, TrendingUp, Rocket, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const { t } = useLanguage();
  useScrollReveal();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="relative pt-32 pb-20 px-4 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Page Title */}
          <div className="text-center mb-16 scroll-reveal">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('about.title')}
            </h1>
          </div>

          {/* Section 1: Mission & Values */}
          <section className="mb-20 scroll-reveal" id="mission">
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">{t('about.mission.valueTitle')}</h2>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {t('about.mission.value')}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Problem & Opportunity */}
          <section className="mb-20" id="problem-opportunity">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="hover-lift scroll-reveal">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{t('about.problem.title')}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t('about.problem.desc')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-muted-foreground">{t('about.problem.point1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-muted-foreground">{t('about.problem.point2')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-muted-foreground">{t('about.problem.point3')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-muted-foreground">{t('about.problem.point4')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{t('about.opportunity.title')}</h2>
                  <p className="text-muted-foreground mb-4">
                    {t('about.opportunity.desc')}
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t('about.opportunity.benefit1')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{t('about.opportunity.benefit2')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 3: Team */}
          <section className="mb-20" id="team">
            <div className="text-center mb-12 scroll-reveal">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Users className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">{t('about.team.title')}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Nicolás */}
              <Card className="hover-lift scroll-reveal">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">{t('about.team.nicolas.name')}</h3>
                  <p className="text-primary font-semibold mb-4">{t('about.team.nicolas.title')}</p>
                  <p className="text-muted-foreground mb-4">{t('about.team.nicolas.bio')}</p>
                  <ul className="space-y-2">
                    <li className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.team.nicolas.highlight1')}</span>
                    </li>
                    <li className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.team.nicolas.highlight2')}</span>
                    </li>
                    <li className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.team.nicolas.highlight3')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Carlos */}
              <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-2">{t('about.team.carlos.name')}</h3>
                  <p className="text-primary font-semibold mb-4">{t('about.team.carlos.title')}</p>
                  <p className="text-muted-foreground mb-4">{t('about.team.carlos.bio')}</p>
                  <ul className="space-y-2">
                    <li className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.team.carlos.highlight1')}</span>
                    </li>
                    <li className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.team.carlos.highlight2')}</span>
                    </li>
                    <li className="text-sm text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.team.carlos.highlight3')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* CTO */}
            <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">{t('about.team.cto.name')}</h3>
                <p className="text-primary font-semibold mb-4">{t('about.team.cto.title')}</p>
                <p className="text-muted-foreground mb-3">{t('about.team.cto.bio')}</p>
                <p className="text-sm text-muted-foreground">{t('about.team.cto.profile')}</p>
              </CardContent>
            </Card>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
