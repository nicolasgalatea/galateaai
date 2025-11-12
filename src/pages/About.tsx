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

          {/* Section 3: Business Model */}
          <section className="mb-20 scroll-reveal" id="business-model">
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-3xl font-bold">{t('about.business.title')}</h2>
                </div>
                <p className="text-muted-foreground text-lg mb-6">
                  {t('about.business.intro')}
                </p>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">{t('about.business.saas')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">{t('about.business.marketplace')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-muted-foreground">{t('about.business.premium')}</p>
                  </div>
                </div>
                <Button asChild variant="default">
                  <Link to="/pricing">{t('about.business.cta')}</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Section 4: Team */}
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

            {/* CTO Position */}
            <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-2">{t('about.team.cto.name')}</h3>
                <p className="text-accent font-semibold mb-4">{t('about.team.cto.title')}</p>
                <p className="text-muted-foreground mb-3">{t('about.team.cto.bio')}</p>
                <p className="text-sm text-muted-foreground">{t('about.team.cto.profile')}</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Strategic Roadmap */}
          <section className="mb-20 scroll-reveal" id="roadmap">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('about.roadmap.title')}</h2>
            </div>

            <div className="space-y-8">
              {/* Phase 1 */}
              <Card className="hover-lift scroll-reveal">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="text-xl font-bold">{t('about.roadmap.phase1.title')}</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase1.point1')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase1.point2')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase1.point3')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase1.point4')}</span>
                    </li>
                  </ul>
                  <p className="text-primary font-semibold">{t('about.roadmap.phase1.goal')}</p>
                </CardContent>
              </Card>

              {/* Phase 2 */}
              <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.1s' }}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h3 className="text-xl font-bold">{t('about.roadmap.phase2.title')}</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase2.point1')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase2.point2')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase2.point3')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase2.point4')}</span>
                    </li>
                  </ul>
                  <p className="text-primary font-semibold">{t('about.roadmap.phase2.goal')}</p>
                </CardContent>
              </Card>

              {/* Phase 3 */}
              <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h3 className="text-xl font-bold">{t('about.roadmap.phase3.title')}</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase3.point1')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase3.point2')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase3.point3')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase3.point4')}</span>
                    </li>
                  </ul>
                  <p className="text-primary font-semibold">{t('about.roadmap.phase3.goal')}</p>
                </CardContent>
              </Card>

              {/* Phase 4 */}
              <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <h3 className="text-xl font-bold">{t('about.roadmap.phase4.title')}</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase4.point1')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase4.point2')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase4.point3')}</span>
                    </li>
                    <li className="text-muted-foreground flex items-start gap-2">
                      <span>•</span>
                      <span>{t('about.roadmap.phase4.point4')}</span>
                    </li>
                  </ul>
                  <p className="text-primary font-semibold">{t('about.roadmap.phase4.goal')}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
