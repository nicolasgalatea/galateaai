import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

export function AgentDetailTemplate({
  name,
  tagline,
  category,
  icon,
}: any) {
  const { toast } = useToast();

  // ════════════════════════════════════════════════════════════════════
  // ESTADOS PRINCIPALES - Limpieza de variables
  // ════════════════════════════════════════════════════════════════════
  const [userInput, setUserInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  // ════════════════════════════════════════════════════════════════════
  // FUNCIÓN CONECTADA A N8N - URL DE PRODUCCIÓN (SIN -test)
  // ════════════════════════════════════════════════════════════════════
  const handleAnalyze = async () => {
    console.log('🔥 BOTÓN CLICKEADO - handleAnalyze ejecutándose');
    console.log('userInput actual:', userInput);

    if (!userInput.trim()) {
      console.log('⚠️ userInput está vacío, mostrando toast');
      toast({
        title: 'Campo vacío',
        description: 'Por favor escribe algo antes de analizar.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResults(null);

    // URL DE PRODUCCIÓN - SIN "-test"
    const webhookUrl = 'https://nicolasgalatea.app.n8n.cloud/webhook/3b2ea962-6b27-456f-9566-1a9ed2385836';

    console.log('══════════════════════════════════════');
    console.log('ENVIANDO PETICIÓN A N8N...');
    console.log('URL:', webhookUrl);
    console.log('Payload:', { chatInput: userInput, agentName: name });
    console.log('══════════════════════════════════════');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          chatInput: userInput,
          agentName: name,
          sessionId: `session_${Date.now()}`
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('══════════════════════════════════════');
      console.log('✅ CONECTADO A N8N');
      console.log('Respuesta completa:', data);
      console.log('══════════════════════════════════════');

      const finalResult = data.output || data.text || data.response || JSON.stringify(data, null, 2);
      setResults(finalResult);

      toast({
        title: 'Análisis completado',
        description: 'Claude ha procesado tu consulta.',
      });

    } catch (error: any) {
      console.error('══════════════════════════════════════');
      console.error('❌ ERROR DE CONEXIÓN');
      console.error('Tipo:', error.name);
      console.error('Mensaje:', error.message);
      console.error('══════════════════════════════════════');

      if (error.message.includes('Failed to fetch')) {
        setResults('Error CORS: Revisa la consola del navegador (F12).');
      }

      toast({
        title: 'Error',
        description: error.message || 'No se pudo conectar.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ════════════════════════════════════════════════════════════════════
          PROBADOR DEL AGENTE - FONDO AMARILLO PARA CONFIRMAR CAMBIOS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="pt-24 pb-12 px-4" style={{ backgroundColor: '#FF0000' }}>
        <div className="container mx-auto max-w-3xl">

          {/* Título del agente */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              {icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-gray-600 mt-2">{tagline}</p>
          </div>

          {/* Tarjeta del Probador */}
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-yellow-400 p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <Zap className="w-8 h-8 text-yellow-500" />
              Probador del Agente
            </h2>

            {/* Textarea */}
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Escribe tu consulta clínica aquí... Ejemplo: 'Protocolo para diabetes tipo 2 en mayores de 65 años'"
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl mb-6 min-h-[180px] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50 text-gray-800"
              disabled={isAnalyzing}
            />

            {/* Botón */}
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !userInput.trim()}
              className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 w-6 h-6 animate-spin" />
                  Procesando con IA...
                </>
              ) : (
                '🚀 Iniciar Análisis IA'
              )}
            </Button>

            {/* Resultados */}
            {results && (
              <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-xl">
                <h3 className="font-bold text-lg text-green-800 flex items-center gap-2 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  Resultado del Análisis:
                </h3>
                <div className="prose prose-gray max-w-none text-gray-700">
                  <ReactMarkdown
                    components={{
                      h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mt-3 mb-1">{children}</h3>,
                      p: ({children}) => <p className="mb-3 leading-relaxed">{children}</p>,
                      strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="ml-2">{children}</li>,
                    }}
                  >
                    {results.replace(/\\n/g, '\n')}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AgentDetailTemplate;
