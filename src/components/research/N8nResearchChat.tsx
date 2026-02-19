/**
 * N8nResearchChat
 * ──────────────────────────────────────────────────────────────
 * Chat integrado con el endpoint de n8n para el Research Lab.
 * - POST a /webhook/.../chat con { message, project_id }
 * - Muestra "IA pensando..." mientras espera la respuesta
 * - Al recibir respuesta, llama a onRefetch() para sincronizar
 *   los componentes de Supabase (radar, barra de progreso, etc.)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Send, Loader2, Bot, User, RefreshCw, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// ── Endpoint del chat n8n ──────────────────────────────────────
const N8N_CHAT_URL =
  'https://nicolasgalatea.app.n8n.cloud/webhook/7e71e911-5f56-42cf-8785-fb9aa063e2f3/chat';

// ── Tipos ──────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

// ── Tipo para datos estructurados de n8n ───────────────────────
export interface StructuredUpdate {
  type: 'PHASE_UPDATE' | 'FIELD_UPDATE';
  current_phase?: number;
  data?: Record<string, unknown>;
  field?: string;
  value?: unknown;
}

interface N8nResearchChatProps {
  /** UUID de la fila en research_projects (project.id) */
  projectId: string;
  /** project_id fijo del proyecto (project.project_id) */
  projectFixedId?: string;
  /** Callback para refrescar los datos de Supabase tras cada respuesta */
  onRefetch: () => void;
  /** Fase actual para contextualizar el placeholder */
  currentPhase?: number;
  /** Callback opcional cuando n8n retorna datos estructurados (metadata/phase_data) */
  onStructuredData?: (data: StructuredUpdate) => void;
}

// ── Mensajes de bienvenida por fase ────────────────────────────
const PHASE_PLACEHOLDERS: Record<number, string> = {
  1: 'Ej: "¿Cómo puedo refinar mi población objetivo en el PICOT?"',
  2: 'Ej: "¿Qué tan específica debe ser mi intervención?"',
  3: 'Ej: "¿Mi pregunta cumple los criterios FINER?"',
  4: 'Ej: "¿Qué criterios de exclusión debo considerar?"',
  5: 'Ej: "¿Debo registrar mi revisión en PROSPERO?"',
  6: 'Ej: "¿Qué términos MeSH son más relevantes?"',
  7: 'Ej: "¿Cómo estructuro el protocolo PRISMA-P?"',
  8: 'Ej: "¿Cómo ejecuto el flow PRISMA correctamente?"',
  9: 'Ej: "¿Qué herramienta de evaluación de calidad recomiendas?"',
  10: 'Ej: "¿Cómo redacto la sección de discusión?"',
};

// ── Helper para extraer texto de la respuesta n8n ──────────────
function extractResponseText(body: unknown): string {
  if (typeof body === 'string') return body;
  if (typeof body !== 'object' || body === null) return JSON.stringify(body);

  const obj = body as Record<string, unknown>;

  // Formatos comunes de n8n chat
  if (typeof obj.output === 'string') return obj.output;
  if (typeof obj.text === 'string') return obj.text;
  if (typeof obj.message === 'string') return obj.message;
  if (typeof obj.response === 'string') return obj.response;
  if (Array.isArray(obj.messages) && obj.messages.length > 0) {
    const last = obj.messages[obj.messages.length - 1] as Record<string, unknown>;
    if (typeof last?.content === 'string') return last.content;
  }

  return JSON.stringify(obj, null, 2);
}

// ══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function N8nResearchChat({
  projectId,
  projectFixedId,
  onRefetch,
  currentPhase = 1,
  onStructuredData,
}: N8nResearchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Auto-scroll al fondo cuando lleguen mensajes ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // ── Mensaje de bienvenida inicial ──
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `¡Hola! Soy tu asistente de investigación conectado a los agentes de IA. 
        
Estamos en la **Fase ${currentPhase}** de tu revisión sistemática. Puedes hacerme preguntas sobre tu proyecto, pedir que refine algún aspecto, o solicitar que los agentes ejecuten una nueva tarea.

*Cada respuesta que te doy sincroniza automáticamente el dashboard con los datos más recientes.*`,
        timestamp: new Date(),
      },
    ]);
  }, []); // Solo en montaje

  // ── Envío de mensaje ──
  const sendMessage = useCallback(async () => {
    const message = inputValue.trim();
    if (!message || isThinking) return;

    // 1. Agregar mensaje del usuario
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
      // 2. POST al endpoint de n8n
      const payload = {
        message,
        project_id: projectId,
        ...(projectFixedId && { project_fixed_id: projectFixedId }),
        current_phase: currentPhase,
        timestamp: new Date().toISOString(),
      };

      console.log('[N8nResearchChat] Enviando a n8n:', payload);

      const response = await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`n8n respondió con status ${response.status}`);
      }

      // 3. Parsear respuesta (n8n puede devolver JSON o texto plano)
      let responseBody: unknown;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      console.log('[N8nResearchChat] Respuesta de n8n:', responseBody);

      // 4. Detectar datos estructurados antes de extraer el texto
      if (typeof responseBody === 'object' && responseBody !== null) {
        const obj = responseBody as Record<string, unknown>;
        if (obj.metadata || obj.phase_data || typeof obj.current_phase === 'number') {
          const structuredPayload: StructuredUpdate = {
            type: 'PHASE_UPDATE',
            current_phase:
              typeof obj.current_phase === 'number'
                ? obj.current_phase
                : typeof (obj.metadata as Record<string, unknown>)?.current_phase === 'number'
                ? (obj.metadata as Record<string, unknown>).current_phase as number
                : undefined,
            data: obj.phase_data as Record<string, unknown> | undefined,
          };
          console.log('[N8nResearchChat] Datos estructurados detectados:', structuredPayload);
          onStructuredData?.(structuredPayload);
          // Refetch prioritario cuando llegan datos estructurados
          onRefetch();
        }
      }

      const assistantContent = extractResponseText(responseBody);

      // 5. Agregar respuesta del asistente
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // 6. Refetch de los datos de Supabase para actualizar radar, barra de progreso, etc.
      console.log('[N8nResearchChat] Disparando refetch de research_projects...');
      onRefetch();

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al conectar con n8n';

      console.error('[N8nResearchChat] Error:', errorMessage);

      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Error de conexión con el agente:** ${errorMessage}\n\nVerifica que el webhook de n8n esté activo e intenta de nuevo.`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);

      toast({
        title: 'Error al contactar al agente',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsThinking(false);
      // Refocus en el textarea
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [inputValue, isThinking, projectId, projectFixedId, currentPhase, onRefetch, onStructuredData]);

  // ── Enter para enviar (Shift+Enter = nueva línea) ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Limpiar chat ──
  const clearChat = () => {
    setMessages((prev) => prev.slice(0, 1)); // Mantener solo bienvenida
  };

  const placeholder =
    PHASE_PLACEHOLDERS[currentPhase] || 'Escribe tu pregunta al agente de investigación...';

  return (
    <Card className="border-2 border-primary/30 shadow-sm">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            Chat con Agentes de IA
            <Badge
              variant="secondary"
              className="text-[10px] bg-primary/10 text-primary border-primary/20 font-normal"
            >
              Fase {currentPhase}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            title="Limpiar conversación"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── Área de mensajes ── */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.isError
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Burbuja */}
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : msg.isError
                      ? 'bg-destructive/5 text-destructive border border-destructive/20 rounded-tl-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                  <div
                    className={`text-[10px] mt-1.5 ${
                      msg.role === 'user'
                        ? 'text-primary-foreground/60 text-right'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Indicador "IA pensando..." ── */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex gap-2.5"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-sm text-primary font-medium animate-pulse">
                    IA pensando...
                  </span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ── Input área ── */}
        <div className="border-t border-border p-3">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isThinking}
              rows={2}
              className="flex-1 min-h-[60px] max-h-40 resize-none text-sm focus-visible:ring-primary/50"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isThinking}
              size="sm"
              className="h-10 w-10 p-0 shrink-0"
              title="Enviar (Enter)"
            >
              {isThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 ml-0.5">
            Enter para enviar · Shift+Enter para nueva línea · Refetch automático tras cada respuesta
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
