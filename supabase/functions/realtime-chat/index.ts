import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  let conversationId: string | null = null;
  let userId: string | null = null;

  socket.onopen = () => {
    console.log("WebSocket connection established");
    socket.send(JSON.stringify({ 
      type: 'connection', 
      status: 'connected',
      message: 'Conexión establecida con Dra. Sofía' 
    }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      switch (data.type) {
        case 'auth':
          userId = data.userId;
          conversationId = data.conversationId;
          socket.send(JSON.stringify({ 
            type: 'auth_success', 
            message: 'Autenticación exitosa' 
          }));
          break;

        case 'chat_message':
          if (!userId) {
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'No autenticado' 
            }));
            return;
          }

          // Send typing indicator
          socket.send(JSON.stringify({ 
            type: 'typing', 
            message: 'Dra. Sofía está escribiendo...' 
          }));

          // Create or get conversation
          if (!conversationId) {
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .insert({
                user_id: userId,
                agent_type: 'sofia',
                title: 'Consulta con Dra. Sofía'
              })
              .select()
              .single();

            if (convError) {
              socket.send(JSON.stringify({ 
                type: 'error', 
                message: 'Error al crear conversación' 
              }));
              return;
            }
            conversationId = conversation.id;
          }

          // Save user message
          const { error: userMsgError } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              role: 'user',
              content: data.message,
              message_type: 'text'
            });

          if (userMsgError) {
            console.error('Error saving user message:', userMsgError);
          }

          // Call OpenAI API
          const systemPrompt = `Eres la Dra. Sofía, una cardióloga especialista en patologías de la aorta con más de 20 años de experiencia. 

ESPECIALIDADES:
- Cardiología intervencionista
- Cirugía de aorta torácica y abdominal
- Diagnóstico por imágenes cardiovasculares
- Ecocardiografía avanzada

INSTRUCCIONES:
1. Responde como médica especialista con conocimiento profundo
2. Usa terminología médica precisa pero explicada para el profesional consultante
3. Proporciona diagnósticos diferenciales cuando sea apropiado
4. Sugiere estudios complementarios específicos
5. Indica niveles de urgencia: URGENTE, PRIORITARIO, RUTINARIO
6. Siempre recuerda que complementas pero no reemplazas la evaluación presencial

FORMATO DE RESPUESTA para casos clínicos:
- Análisis inicial
- Diagnósticos diferenciales principales
- Estudios recomendados
- Manejo sugerido
- Nivel de urgencia
- Seguimiento recomendado

Responde de manera profesional, empática y con la precisión de una especialista experimentada.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: data.message }
              ],
              max_tokens: 1500,
              temperature: 0.7,
              stream: true
            }),
          });

          if (!response.ok) {
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'Error en la consulta médica' 
            }));
            return;
          }

          // Stream response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';

          socket.send(JSON.stringify({ 
            type: 'response_start', 
            message: 'Dra. Sofía está respondiendo...' 
          }));

          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    socket.send(JSON.stringify({ 
                      type: 'response_chunk', 
                      content: content,
                      fullResponse: fullResponse
                    }));
                  }
                } catch (e) {
                  // Skip malformed JSON
                }
              }
            }
          }

          // Save assistant message
          if (fullResponse) {
            const { error: assistantMsgError } = await supabase
              .from('messages')
              .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: fullResponse,
                message_type: 'text'
              });

            if (assistantMsgError) {
              console.error('Error saving assistant message:', assistantMsgError);
            }
          }

          socket.send(JSON.stringify({ 
            type: 'response_complete',
            conversationId: conversationId,
            message: 'Respuesta completada'
          }));
          break;

        default:
          socket.send(JSON.stringify({ 
            type: 'error', 
            message: 'Tipo de mensaje no reconocido' 
          }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Error interno del servidor' 
      }));
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return response;
});