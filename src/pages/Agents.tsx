import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import agentAortaImg from '@/assets/agent-aorta.jpg';
import agentOjosImg from '@/assets/agent-ojos.jpg';
import customAgentImg from '@/assets/custom-agent.jpg';

const agents = [
  {
    key: 'aorta',
    image: agentAortaImg,
    link: '/agent/aorta',
  },
  {
    key: 'ojos',
    image: agentOjosImg,
    link: '/agent/ojos',
  },
];

export default function Agents() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('agents.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {agents.map((agent) => (
              <Link key={agent.key} to={agent.link}>
                <Card className="hover-lift overflow-hidden cursor-pointer transition-all">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={agent.image}
                      alt={t(`agents.${agent.key}.name`)}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{t(`agents.${agent.key}.name`)}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary">{t(`agents.${agent.key}.specialty`)}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t(`agents.${agent.key}.desc`)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Custom Agent Card */}
            <Link to="/custom-agent">
              <Card className="hover-lift overflow-hidden cursor-pointer bg-gradient-hero border-primary/20 transition-all">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={customAgentImg}
                    alt="Build your own agent"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {t('agents.custom.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t('agents.custom.desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Coming Soon Placeholders */}
            {[1, 2].map((i) => (
              <Card key={`coming-${i}`} className="hover-lift border-dashed">
                <CardContent className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                      <span className="text-3xl">🤖</span>
                    </div>
                    <p className="font-semibold text-muted-foreground">
                      {t('agents.coming')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
