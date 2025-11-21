import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, CheckCircle, Receipt, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AgentBilling() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedImage(file);
    setResults(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);

      const response = await fetch(
        'https://newtest1234567.app.n8n.cloud/webhook/4da35d0c-4ede-452f-914f-28c2ee489169',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      
      // Extract and clean text content from JSON response
      const cleanText = JSON.stringify(jsonData, null, 2)
        .replace(/[{}"[\],]/g, '')
        .replace(/^\s+|\s+$/gm, '')
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[\w_]+:\s*/, '').trim())
        .filter(line => line)
        .join('\n');

      setResults(cleanText || JSON.stringify(jsonData));
      
      toast({
        title: 'Analysis complete',
        description: 'Medical order processed successfully',
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to process the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  return <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl shadow-glow flex items-center justify-center p-12">
              <Receipt className="w-48 h-48 text-primary" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('agents.billing.name')}
              </h1>
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 w-fit">
                {t('agents.billing.specialty')}
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                {t('agents.billing.desc')}
              </p>
              
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Medical Order Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg border border-border overflow-hidden bg-muted">
                    <img
                      src={imagePreview}
                      alt="Selected medical order"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Change Image
                    </Button>
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedImage || isAnalyzing}
                      className="gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Analyze Order
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Upload Medical Order Image</p>
                  <p className="text-sm text-muted-foreground">
                    Click to select an image file (JPG, PNG, etc.)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {results && (
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-6">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                    {results}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>;
}