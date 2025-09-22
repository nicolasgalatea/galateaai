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
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  VolumeX,
  Headphones,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { FileUploader } from '@/components/FileUploader';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MedicalDiagnosis } from '@/components/MedicalDiagnosis';
import { MedicalInsights, generateCardiovascularInsights } from '@/components/MedicalInsights';
import { VitalSigns } from '@/components/VitalSigns';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { supabase } from '@/integrations/supabase/client';
import sofiaAvatar from '@/assets/galatea-avatar.jpg';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'audio' | 'file' | 'diagnosis';
  diagnosis?: DiagnosisData;
}

interface DiagnosisData {
  primaryDiagnosis: string;
  confidence: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  differentialDiagnoses: string[];
  recommendations: string[];
  studiesRequested?: string[];
  followUp?: string;
}

const ChatSofia = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showVitalSigns, setShowVitalSigns] = useState(false);
  const [patientSymptoms, setPatientSymptoms] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioVolume, setAudioVolume] = useState(1);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Use the new realtime chat hook
  const { 
    messages, 
    isConnected, 
    isLoading, 
    sendMessage, 
    isTyping, 
    conversationId,
    reconnect 
  } = useRealtimeChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Extract symptoms for medical insights when new messages arrive
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      const symptoms = lastMessage.content.toLowerCase();
      if (symptoms.includes('pain') || symptoms.includes('chest') || 
          symptoms.includes('shortness') || symptoms.includes('breath') ||
          symptoms.includes('palpitations') || symptoms.includes('dizziness') ||
          symptoms.includes('aorta') || symptoms.includes('heart')) {
        setPatientSymptoms(prev => [...prev, lastMessage.content]);
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleVoiceTranscription = (text: string) => {
    sendMessage(text, 'audio');
  };

  // Play AI response using ElevenLabs
  const playAIResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-speech', {
        body: { 
          text: text,
          voice_id: "9BWtsMINqrJLrRacOk9x" // Aria voice - professional female voice
        }
      });

      if (error) throw error;

      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Create and play new audio
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audio.volume = audioVolume;
      
      audio.onended = () => {
        setIsSpeaking(false);
        setIsPlayingAudio(false);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsPlayingAudio(false);
        toast({
          title: "Audio Error",
          description: "Could not play AI response audio",
          variant: "destructive"
        });
      };

      setCurrentAudio(audio);
      setIsPlayingAudio(true);
      await audio.play();
      
    } catch (error) {
      console.error('Error playing AI response:', error);
      setIsSpeaking(false);
      setIsPlayingAudio(false);
      toast({
        title: "Voice Error", 
        description: "Could not generate AI voice response",
        variant: "destructive"
      });
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlayingAudio(false);
      setIsSpeaking(false);
    }
  };

  const toggleVolume = () => {
    if (audioVolume === 0) {
      setAudioVolume(1);
      if (currentAudio) currentAudio.volume = 1;
    } else {
      setAudioVolume(0);
      if (currentAudio) currentAudio.volume = 0;
    }
  };

  // Auto-play AI responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content) {
      // Only play if it's a recent message and not already playing
      if (!isPlayingAudio && lastMessage.content.length > 10) {
        playAIResponse(lastMessage.content);
      }
    }
  }, [messages]);

  const parseStructuredDiagnosis = (response: string): DiagnosisData => {
    const lines = response.split('\n');
    const primaryDiagnosis = lines.find(line => line.includes('DIAGNOSIS:') || line.includes('Primary:'))?.replace(/DIAGNOSIS:|Primary:/g, '').trim() || 'Under evaluation';
    const recommendations = lines.filter(line => line.startsWith('•') || line.startsWith('-')).map(line => line.substring(1).trim());
    
    return {
      primaryDiagnosis,
      confidence: 85,
      urgencyLevel: response.toLowerCase().includes('urgent') || response.toLowerCase().includes('critical') || response.toLowerCase().includes('emergency') ? 'high' : 'medium',
      differentialDiagnoses: ['Acute Coronary Syndrome', 'Aortic Stenosis', 'Aortic Regurgitation', 'Aortic Dissection', 'Pericarditis'],
      recommendations: recommendations.length > 0 ? recommendations : ['Clinical evaluation required', 'Follow-up with cardiologist'],
      studiesRequested: ['ECG', 'Echocardiogram', 'CT Angiography', 'Cardiac Biomarkers'],
      followUp: 'Follow-up in 24-48 hours or sooner if symptoms worsen'
    };
  };

  const handleFileAnalysis = (analysis: string) => {
    const analysisContent = `**MEDICAL STUDY ANALYSIS:**\n\n${analysis}`;
    sendMessage(analysisContent);
    setShowFileUploader(false);
  };

  const handleVitalSignsUpdate = (vitals: any[]) => {
    const vitalsSummary = vitals
      .filter(v => v.value)
      .map(v => `${v.name}: ${v.value} ${v.unit}`)
      .join(', ');
    
    if (vitalsSummary) {
      sendMessage(`Patient vital signs: ${vitalsSummary}`);
    }
    setShowVitalSigns(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-elegant">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-glow">
                    <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" className="object-cover" />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl font-bold">DS</AvatarFallback>
                  </Avatar>
                  
                  {/* Voice Indicator */}
                  {(isSpeaking || isPlayingAudio) && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full border-4 border-background flex items-center justify-center animate-pulse">
                      <Headphones className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  {/* Online Status */}
                  {!isSpeaking && !isPlayingAudio && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-background animate-pulse" />
                  )}
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Dr. Sofia Rodriguez, MD, PhD</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                      <Heart className="w-4 h-4 mr-2" />
                      Interventional Cardiologist
                    </Badge>
                    <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-sm px-3 py-1">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Aortic Specialist
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-base">
                    Specializing in aortic diseases, valve disorders, and cardiovascular interventions
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Voice Controls */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVolume}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {audioVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                {isPlayingAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopAudio}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Stop Audio
                  </Button>
                )}
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-success bg-success/10 px-4 py-2 rounded-xl border border-success/20">
                    <Wifi className="w-4 h-4" />
                    <span className="font-medium text-sm">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20">
                    <WifiOff className="w-4 h-4" />
                    <span className="font-medium text-sm">Disconnected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={reconnect}
                      className="ml-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVitalSigns(!showVitalSigns)}
                className="text-primary border-primary/20 hover:bg-primary/5 px-4 py-2"
              >
                <Activity className="w-4 h-4 mr-2" />
                Vital Signs
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUploader(!showFileUploader)}
                className="text-secondary border-secondary/20 hover:bg-secondary/5 px-4 py-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Study
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col shadow-elegant border-primary/10">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <Stethoscope className="w-6 h-6 mr-3 text-primary" />
                    Aortic Consultation with Dr. Sofia
                  </CardTitle>
                  {conversationId && (
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      Session: {conversationId.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-base">
                  Specialist consultation for aortic conditions, valve diseases, and cardiovascular health
                </p>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-6 py-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-pulse" />
                        <Avatar className="w-24 h-24 relative">
                          <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" />
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">DS</AvatarFallback>
                        </Avatar>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">Hello! I'm Dr. Sofia</h3>
                      <p className="text-muted-foreground max-w-md mb-8 text-lg">
                        I'm a specialized AI cardiologist focused on aortic diseases and valve disorders. How can I assist you with your cardiovascular health today?
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center">
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => sendMessage("I have chest pain and shortness of breath")}
                          className="text-primary border-primary/20 hover:bg-primary/5"
                        >
                          Chest symptoms
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => sendMessage("Can you explain aortic stenosis?")}
                          className="text-secondary border-secondary/20 hover:bg-secondary/5"
                        >
                          Aortic conditions
                        </Button>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => sendMessage("I need a cardiovascular risk assessment")}
                          className="text-accent border-accent/20 hover:bg-accent/5"
                        >
                          Risk assessment
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" />
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-bold">DS</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[75%] ${message.role === 'user' ? 'order-first' : ''}`}>
                            <div
                              className={`rounded-2xl px-6 py-4 ${
                                message.role === 'user'
                                  ? 'bg-gradient-primary text-primary-foreground shadow-lg'
                                  : 'bg-card text-card-foreground border border-border shadow-sm'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </div>
                            
                            {message.messageType === 'audio' && (
                              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                <Mic className="w-3 h-3 mr-1" />
                                Voice message
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          
                          {message.role === 'user' && (
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="bg-blue-600 text-white text-xs">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" />
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">DS</AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 rounded-lg px-4 py-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>

              {/* Chat Input */}
              <div className="p-6 border-t border-border bg-gradient-to-r from-muted/20 to-muted/10">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask Dr. Sofia about aortic conditions, symptoms, or treatments..."
                      className="pr-16 h-12 bg-background border-border focus:border-primary text-base rounded-xl"
                      disabled={!isConnected || isLoading}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <VoiceRecorder onTranscription={handleVoiceTranscription} />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={!inputMessage.trim() || !isConnected || isLoading}
                    className="bg-gradient-primary hover:opacity-90 text-primary-foreground px-8 h-12 rounded-xl shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </form>
                
                {isTyping && (
                  <div className="flex items-center space-x-3 text-muted-foreground mt-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-base">Dr. Sofia is typing...</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dr. Sofia Info */}
            <Card className="shadow-elegant border-primary/10 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b border-border">
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Heart className="w-6 h-6 mr-3 text-primary" />
                  Dr. Sofia Rodriguez
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-foreground mb-4 flex items-center text-lg">
                      <Heart className="w-5 h-5 mr-3 text-primary" />
                      Specializations
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-3 h-3 bg-primary rounded-full mr-3" />
                        Aortic Valve Diseases
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-3 h-3 bg-secondary rounded-full mr-3" />
                        Aortic Stenosis & Regurgitation
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-3 h-3 bg-accent rounded-full mr-3" />
                        Aortic Root Disorders
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-3 h-3 bg-success rounded-full mr-3" />
                        Cardiovascular Interventions
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <div className="w-3 h-3 bg-warning rounded-full mr-3" />
                        Cardiac Risk Assessment
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-bold text-foreground mb-4 flex items-center text-lg">
                      <Stethoscope className="w-5 h-5 mr-3 text-secondary" />
                      Capabilities
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <CheckCircle className="w-4 h-4 mr-3 text-success" />
                        Real-time voice consultation
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <CheckCircle className="w-4 h-4 mr-3 text-success" />
                        Medical image analysis
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <CheckCircle className="w-4 h-4 mr-3 text-success" />
                        Risk stratification
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <CheckCircle className="w-4 h-4 mr-3 text-success" />
                        Treatment recommendations
                      </div>
                      <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <CheckCircle className="w-4 h-4 mr-3 text-success" />
                        Follow-up planning
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Uploader */}
            {showFileUploader && (
              <Card className="shadow-elegant border-accent/10 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <FileText className="w-6 h-6 mr-3 text-accent" />
                    Upload Medical Study
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    onAnalysisComplete={handleFileAnalysis}
                    disabled={!isConnected}
                  />
                </CardContent>
              </Card>
            )}

            {/* Vital Signs */}
            {showVitalSigns && (
              <Card className="shadow-elegant border-primary/10 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-primary" />
                    Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VitalSigns
                    onVitalSignsUpdate={handleVitalSignsUpdate}
                  />
                </CardContent>
              </Card>
            )}

            {/* Medical Insights */}
            {patientSymptoms.length > 0 && (
              <Card className="shadow-elegant border-success/10 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-success" />
                    Cardiovascular Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MedicalInsights
                    insights={generateCardiovascularInsights(patientSymptoms)}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSofia;