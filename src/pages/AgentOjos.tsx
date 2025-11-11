import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import agentImage from '@/assets/agent-ojos.jpg';

export default function AgentOjos() {
  const { t } = useLanguage();
  const [inputData, setInputData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResults({
      diagnosis: 'Early stage diabetic retinopathy detected',
      confidence: 87,
      recommendations: [
        'Schedule comprehensive dilated eye exam',
        'Monitor blood glucose levels closely',
        'Follow up in 3 months',
      ],
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <img
                src={agentImage}
                alt="Agent Ojos"
                className="rounded-2xl shadow-glow w-full h-auto"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('agents.ojos.name')}
              </h1>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 w-fit">
                {t('agents.ojos.specialty')}
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {t('agents.ojos.desc')}
              </p>
              <p className="text-muted-foreground">
                Agent Ojos leverages cutting-edge computer vision and AI to analyze
                retinal images, detect eye diseases, and provide clinical decision support
                for ophthalmologists.
              </p>
            </div>
          </div>

          {/* Data Upload Panel */}
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

          {/* Results Panel */}
          {results && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  {t('agent.results.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <h3 className="font-semibold mb-2">{t('agent.results.diagnosis')}</h3>
                    <p className="text-lg">{results.diagnosis}</p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg">
                    <h3 className="font-semibold mb-2">{t('agent.results.confidence')}</h3>
                    <p className="text-3xl font-bold text-primary">{results.confidence}%</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">{t('agent.results.recommendations')}</h3>
                  <ul className="space-y-2">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
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
