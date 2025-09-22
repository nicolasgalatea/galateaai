import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'audio' | 'file' | 'diagnosis';
  diagnosis?: any;
}

interface UseRealtimeChatReturn {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  sendMessage: (content: string, messageType?: 'text' | 'audio') => void;
  isTyping: boolean;
  conversationId: string | null;
  reconnect: () => void;
}

export const useRealtimeChat = (): UseRealtimeChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentStreamMessage, setCurrentStreamMessage] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user) {
      console.error('No user authenticated, cannot connect to chat');
      toast({
        title: "Autenticación requerida",
        description: "Por favor inicia sesión para usar el chat con Dra. Sofía",
        variant: "destructive",
      });
      return;
    }

    console.log('Connecting to Dr. Sofia chat with user:', user.id);

    try {
      const wsUrl = `wss://jytsldbqgvntrqfjnkhz.supabase.co/functions/v1/realtime-chat`;
      console.log('Connecting to WebSocket:', wsUrl);
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Authenticate
        const authMessage = {
          type: 'auth',
          userId: user.id,
          conversationId: conversationId
        };
        console.log('Sending authentication:', authMessage);
        socketRef.current?.send(JSON.stringify(authMessage));
        
        toast({
          title: "Conectado",
          description: "Conectado con Dra. Sofía - ¡Ya puedes conversar!",
        });
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          switch (data.type) {
            case 'connection':
              toast({
                title: "Conectado",
                description: data.message,
              });
              break;

            case 'auth_success':
              console.log('Authentication successful');
              break;

            case 'typing':
              setIsTyping(true);
              setIsLoading(true);
              break;

            case 'response_start':
              setIsTyping(false);
              setCurrentStreamMessage('');
              // Add a placeholder message for streaming
              const streamingMessage: Message = {
                id: `streaming-${Date.now()}`,
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                messageType: 'text'
              };
              setMessages(prev => [...prev, streamingMessage]);
              break;

            case 'response_chunk':
              setCurrentStreamMessage(data.fullResponse || '');
              // Update the last message with streamed content
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                  lastMessage.content = data.fullResponse || '';
                }
                return newMessages;
              });
              break;

            case 'response_complete':
              setIsLoading(false);
              setIsTyping(false);
              setCurrentStreamMessage('');
              if (data.conversationId) {
                setConversationId(data.conversationId);
              }
              break;

            case 'error':
              setIsLoading(false);
              setIsTyping(false);
              toast({
                title: "Error",
                description: data.message,
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        setIsConnected(false);
        setIsLoading(false);
        setIsTyping(false);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        toast({
          title: "Error de conexión",
          description: "Se perdió la conexión con Dra. Sofía. Intentando reconectar...",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al chat en tiempo real",
        variant: "destructive",
      });
    }
  }, [user, conversationId, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.close(1000); // Normal closure
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsLoading(false);
    setIsTyping(false);
  }, []);

  const sendMessage = useCallback((content: string, messageType: 'text' | 'audio' = 'text') => {
    if (!content.trim() || !isConnected || !socketRef.current) {
      toast({
        title: "Error",
        description: "No hay conexión disponible",
        variant: "destructive",
      });
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      messageType
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Send message via WebSocket
    socketRef.current.send(JSON.stringify({
      type: 'chat_message',
      message: content,
      messageType: messageType
    }));
  }, [isConnected, toast]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Initialize connection
  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Add welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm **Dr. Sofia Hernández, MD, PhD**, an interventional cardiologist specializing in aortic pathologies with over 20 years of clinical experience at leading cardiovascular centers.

🔬 **MY CLINICAL SPECIALTIES:**
• Thoracic and abdominal aortic pathologies
• Advanced echocardiography (TTE/TEE)
• Interventional cardiology and catheterization
• Aortic valve interventions (TAVR/SAVR)
• Cardiovascular imaging and diagnostics
• Aortic aneurysm and dissection management

💬 **HOW I CAN ASSIST YOU:**
• Clinical cardiovascular symptom analysis
• Medical study interpretation (ECG, Echo, CT angiography)
• Specialized differential diagnoses
• Evidence-based therapeutic recommendations
• Cardiovascular risk stratification
• Aortic pathology assessment

📋 **TO BEGIN:** Describe patient symptoms, share medical history, or upload studies (DICOM, ECG, imaging) for clinical analysis.

⚠️ **CLINICAL DISCLAIMER:** My analysis supplements but never replaces direct clinical evaluation and physician judgment.`,
        timestamp: new Date(),
        messageType: 'text'
      };
      
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  return {
    messages,
    isConnected,
    isLoading,
    sendMessage,
    isTyping,
    conversationId,
    reconnect
  };
};