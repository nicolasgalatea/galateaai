import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Heart, 
  Stethoscope, 
  FileText, 
  Mic,
  Volume2,
  Upload,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { FileUploader } from '@/components/FileUploader';
import { AudioPlayer } from '@/components/AudioPlayer';
import sofiaAvatar from '@/assets/galatea-avatar.jpg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'audio' | 'file';
}

const ChatSofia = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `¡Hola ${profile?.full_name || 'Doctor/a'}! Soy la Dra. Sofía, especialista en cardiología con más de 20 años de experiencia. Estoy aquí para ayudarle con consultas cardiovasculares, análisis de estudios y diagnósticos especializados en patologías de la aorta.

¿En qué puedo asistirle hoy? Puede:
• Describirme síntomas de un paciente
• Subir estudios médicos para análisis
• Hacer consultas sobre patologías cardiovasculares
• Solicitar interpretación de ecocardiogramas

Recuerde que mi análisis complementa pero no reemplaza la evaluación clínica presencial.`,
      timestamp: new Date(),
      messageType: 'text'
    };
    
    setMessages([welcomeMessage]);
    scrollToBottom();
  }, [profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, messageType: 'text' | 'audio' = 'text') => {
    if (!content.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      messageType
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-sofia', {
        body: {
          message: content,
          conversationId: conversationId,
          userId: user.id,
          medicalContext: null
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        messageType: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleVoiceTranscription = (text: string) => {
    sendMessage(text, 'audio');
  };

  const handleFileAnalysis = (analysis: string) => {
    const analysisMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `**ANÁLISIS DE ESTUDIO MÉDICO:**\n\n${analysis}`,
      timestamp: new Date(),
      messageType: 'text'
    };
    
    setMessages(prev => [...prev, analysisMessage]);
    setShowFileUploader(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-red-200">
                    <AvatarImage src={sofiaAvatar} alt="Dra. Sofía" />
                    <AvatarFallback className="bg-red-100 text-red-700">DS</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dra. Sofía</h1>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      Cardióloga
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      Especialista en Aorta
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUploader(!showFileUploader)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Estudio
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Consulta Médica</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 text-green-500" />
                    En línea
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <Avatar className="w-8 h-8 border border-red-200">
                            <AvatarImage src={sofiaAvatar} alt="Dra. Sofía" />
                            <AvatarFallback className="bg-red-100 text-red-700 text-xs">DS</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          
                          {message.role === 'assistant' && message.content.length > 100 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <AudioPlayer 
                                text={message.content}
                                className="bg-white"
                              />
                            </div>
                          )}
                          
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        
                        {message.role === 'user' && (
                          <Avatar className="w-8 h-8 border border-blue-200">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                              {profile?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="w-8 h-8 border border-red-200">
                          <AvatarImage src={sofiaAvatar} alt="Dra. Sofía" />
                          <AvatarFallback className="bg-red-100 text-red-700 text-xs">DS</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            <span className="text-sm text-gray-600 ml-2">
                              Dra. Sofía está analizando...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="border-t bg-gray-50 p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Describa los síntomas del paciente o haga su consulta..."
                        disabled={isLoading}
                        className="flex-1"
                      />
                      
                      <VoiceRecorder
                        onTranscription={handleVoiceTranscription}
                        disabled={isLoading}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Uploader */}
            {showFileUploader && (
              <FileUploader
                onAnalysisComplete={handleFileAnalysis}
                medicalCaseId={conversationId || undefined}
                disabled={isLoading}
              />
            )}
            
            {/* Dr. Sofia Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre la Dra. Sofía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-red-200">
                    <AvatarImage src={sofiaAvatar} alt="Dra. Sofía" />
                    <AvatarFallback className="bg-red-100 text-red-700 text-2xl">DS</AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg mb-2">Dra. Sofía Cardio</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Especialista en Cardiología con más de 20 años de experiencia
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Patologías de Aorta
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Ecocardiografía
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Diagnóstico Diferencial
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Imágenes Cardíacas
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Capacidades</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Análisis de ecocardiogramas</li>
                    <li>• Interpretación de ECG</li>
                    <li>• Diagnósticos diferenciales</li>
                    <li>• Evaluación de riesgo</li>
                    <li>• Recomendaciones terapéuticas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSofia;