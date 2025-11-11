import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Settings, Database, Sparkles } from 'lucide-react';
import customAgentImage from '@/assets/custom-agent.jpg';
import { Link } from 'react-router-dom';

const creationSteps = [
  {
    icon: Bot,
    titleKey: 'customAgent.step1.title',
    descKey: 'customAgent.step1.desc',
  },
  {
    icon: Settings,
    titleKey: 'customAgent.step2.title',
    descKey: 'customAgent.step2.desc',
  },
  {
    icon: Database,
    titleKey: 'customAgent.step3.title',
    descKey: 'customAgent.step3.desc',
  },
  {
    icon: Sparkles,
    titleKey: 'customAgent.step4.title',
    descKey: 'customAgent.step4.desc',
  },
];

export default function CustomAgent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('customAgent.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('customAgent.subtitle')}
            </p>
            <img
              src={customAgentImage}
              alt="Build Custom Agent"
              className="rounded-2xl shadow-glow w-full max-w-2xl mx-auto"
            />
          </div>

          {/* Creation Steps */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t('customAgent.howItWorks')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creationSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="hover-lift">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-lg">
                            {t(step.titleKey)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {t(step.descKey)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-hero border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                {t('customAgent.cta.title')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('customAgent.cta.desc')}
              </p>
              <Button size="lg" asChild>
                <Link to="/contact">{t('customAgent.cta.button')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
