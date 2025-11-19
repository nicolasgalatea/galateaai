import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, CheckCircle, FileStack } from 'lucide-react';

export default function AgentSummary() {
  const { t } = useLanguage();
  const [inputData, setInputData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResults({
      diagnosis: '15 years of medical history condensed to single page',
      confidence: 90,
      recommendations: [
        'Review key diagnoses',
        'Verify medication history',
        'Check allergies section',
      ],
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-glow flex items-center justify-center p-12">
              <FileStack className="w-48 h-48 text-primary" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('agents.summary.name')}
              </h1>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 w-fit">
                {t('agents.summary.specialty')}
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {t('agents.summary.desc')}
              </p>
              <p className="text-muted-foreground">
                Condenses 10-15 years of medical history into a single-page, clinically relevant summary. Perfect for referrals, transfers, and quick patient reviews.
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('agent.upload.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder={t('agent.upload.placeholder')}
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  {t('agent.upload.file')}
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!inputData || isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('agent.analyzing')}
                    </>
                  ) : (
                    t('agent.analyze')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  {t('agent.results.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('agent.results.diagnosis')}
                  </div>
                  <div className="text-lg font-medium">{results.diagnosis}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('agent.results.confidence')}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${results.confidence}%` }}
                      />
                    </div>
                    <span className="text-lg font-medium">{results.confidence}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('agent.results.recommendations')}
                  </div>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
