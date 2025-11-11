import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Target, Eye, Users } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('about.title')}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h2>
                <p className="text-muted-foreground">
                  {t('about.mission.desc')}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-4">{t('about.vision.title')}</h2>
                <p className="text-muted-foreground">
                  {t('about.vision.desc')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{t('about.team.title')}</h2>
              </div>
              <p className="text-muted-foreground">
                Galatea AI was founded by a team of healthcare professionals, AI researchers, and 
                technology entrepreneurs passionate about transforming healthcare through ethical 
                and secure artificial intelligence solutions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
