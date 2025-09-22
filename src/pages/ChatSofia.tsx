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
  Headphones
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50/30">
      {/* Header */}
      <div className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-3 border-blue-200 shadow-lg">
                    <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-red-100 text-blue-700 text-xl font-bold">DS</AvatarFallback>
                  </Avatar>
                  
                  {/* Voice Indicator */}
                  {(isSpeaking || isPlayingAudio) && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center animate-pulse">
                      <Headphones className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  {/* Online Status */}
                  {!isSpeaking && !isPlayingAudio && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white animate-pulse" />
                  )}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dr. Sofia Rodriguez, MD, PhD</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-red-100 text-red-800 border-red-200 text-sm">
                      <Heart className="w-4 h-4 mr-1" />
                      Interventional Cardiologist
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">
                      <Stethoscope className="w-4 h-4 mr-1" />
                      Aortic Specialist
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Specializing in aortic diseases, valve disorders, and cardiovascular interventions
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Voice Controls */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVolume}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {audioVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                {isPlayingAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopAudio}
                    className="text-red-600 hover:text-red-700"
                  >
                    Stop Audio
                  </Button>
                )}
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                {isConnected ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <Wifi className="w-4 h-4" />
                    <span className="font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <WifiOff className="w-4 h-4" />
                    <span className="font-medium">Disconnected</span>
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
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Activity className="w-4 h-4 mr-2" />
                Vital Signs
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUploader(!showFileUploader)}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Study
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-red-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                    Aortic Consultation with Dr. Sofia
                  </CardTitle>
                  {conversationId && (
                    <Badge variant="secondary" className="text-xs">
                      Session: {conversationId.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Specialist consultation for aortic conditions, valve diseases, and cardiovascular health
                </p>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4 py-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <Avatar className="w-20 h-20 mb-4">
                        <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-red-100 text-blue-700 text-2xl font-bold">DS</AvatarFallback>
                      </Avatar>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Hello! I'm Dr. Sofia</h3>
                      <p className="text-muted-foreground max-w-sm mb-4">
                        I'm a specialized AI cardiologist focused on aortic diseases and valve disorders. How can I assist you with your cardiovascular health today?
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendMessage("I have chest pain and shortness of breath")}
                          className="text-sm"
                        >
                          Chest symptoms
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendMessage("Can you explain aortic stenosis?")}
                          className="text-sm"
                        >
                          Aortic conditions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendMessage("I need a cardiovascular risk assessment")}
                          className="text-sm"
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
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarImage src={sofiaAvatar} alt="Dr. Sofia" />
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">DS</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                            <div
                              className={`rounded-lg px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900 border border-gray-200'
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

              {/* Input Area */}
              <div className="border-t bg-gray-50 p-4">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask Dr. Sofia about aortic conditions, symptoms, or treatments..."
                    className="flex-1 bg-white"
                    disabled={!isConnected || isLoading}
                  />
                  
                  <VoiceRecorder
                    onTranscription={handleVoiceTranscription}
                    disabled={!isConnected}
                  />
                  
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputMessage.trim() || !isConnected || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dr. Sofia Info */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-blue-50">
                <CardTitle className="text-lg flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Dr. Sofia Rodriguez
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Specializations</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• Aortic Valve Diseases</div>
                      <div>• Aortic Stenosis & Regurgitation</div>
                      <div>• Aortic Root Disorders</div>
                      <div>• Cardiovascular Interventions</div>
                      <div>• Cardiac Risk Assessment</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Capabilities</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• Real-time voice consultation</div>
                      <div>• Medical image analysis</div>
                      <div>• Risk stratification</div>
                      <div>• Treatment recommendations</div>
                      <div>• Follow-up planning</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Uploader */}
            {showFileUploader && (
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
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
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
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
              <Card className="shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
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