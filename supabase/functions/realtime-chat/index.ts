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
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Validation helpers
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 5000;

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  let conversationId: string | null = null;
  let userId: string | null = null;
  let authenticated = false;

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

      switch (data.type) {
        case 'auth': {
          // Validate session token instead of trusting client-supplied userId
          const sessionToken = data.sessionToken || data.token;
          if (!sessionToken || typeof sessionToken !== 'string') {
            socket.send(JSON.stringify({ type: 'error', message: 'Session token required' }));
            return;
          }

          const supabaseAuth = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
          const { data: userData, error: authError } = await supabaseAuth.auth.getUser(sessionToken);
          
          if (authError || !userData?.user) {
            socket.send(JSON.stringify({ type: 'error', message: 'Invalid session' }));
            socket.close();
            return;
          }

          userId = userData.user.id;
          authenticated = true;
          
          // Validate optional conversationId
          if (data.conversationId && typeof data.conversationId === 'string' && UUID_REGEX.test(data.conversationId)) {
            conversationId = data.conversationId;
          }

          socket.send(JSON.stringify({ 
            type: 'auth_success', 
            message: 'Autenticación exitosa' 
          }));
          break;
        }

        case 'chat_message': {
          if (!authenticated || !userId) {
            socket.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
            return;
          }

          // Validate message
          if (typeof data.message !== 'string' || data.message.trim().length === 0) {
            socket.send(JSON.stringify({ type: 'error', message: 'Message is required' }));
            return;
          }

          if (data.message.length > MAX_MESSAGE_LENGTH) {
            socket.send(JSON.stringify({ type: 'error', message: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }));
            return;
          }

          const message = data.message.trim();

          if (!OPENAI_API_KEY) {
            socket.send(JSON.stringify({ type: 'error', message: 'AI service temporarily unavailable' }));
            return;
          }

          socket.send(JSON.stringify({ type: 'typing', message: 'Dr. Sofia is analyzing your case...' }));

          // Create or get conversation
          if (!conversationId) {
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .insert({ user_id: userId, agent_type: 'sofia', title: 'Consulta con Dra. Sofía' })
              .select()
              .single();

            if (convError) {
              socket.send(JSON.stringify({ type: 'error', message: 'Failed to initialize conversation' }));
              return;
            }
            conversationId = conversation.id;
          }

          // Save user message
          await supabase.from('messages').insert({
            conversation_id: conversationId,
            role: 'user',
            content: message,
            message_type: 'text'
          });

          const systemPrompt = `You are Dr. Sofia Hernández, MD, PhD, a world-renowned interventional cardiologist with over 20 years of experience in cardiovascular diagnostics, specializing in aortic pathologies.

CLINICAL BACKGROUND:
- Board-certified interventional cardiologist
- Fellowship-trained in aortic surgery and interventions
- Professor of Cardiovascular Medicine
- Published researcher in aortic pathology (150+ peer-reviewed papers)
- Director of Aortic Center at major medical institution

MEDICAL SPECIALTIES:
- Thoracic and abdominal aortic pathologies (aneurysms, dissections, stenosis, coarctation)
- Advanced echocardiography (transthoracic and transesophageal)
- Interventional cardiology and cardiac catheterization
- Complex cardiovascular differential diagnosis
- Cardiac imaging interpretation (ECG, Holter, stress testing, CT angiography)
- Cardiovascular risk assessment and stratification
- Heart failure management and cardiac transplantation

CLINICAL APPROACH:
1. Greet professionally with warmth and medical authority
2. Listen carefully to symptoms and medical history
3. Ask specific, relevant clinical questions (OPQRST for chest pain, NYHA for dyspnea)
4. Provide evidence-based differential diagnoses ranked by probability
5. Recommend specific, justified complementary studies
6. Offer therapeutic recommendations based on current guidelines (ESC/AHA/ACC)
7. Always emphasize the importance of in-person clinical evaluation

STRUCTURED DIAGNOSTIC RESPONSE FORMAT:
When providing a diagnosis, use this clinical format:

**CLINICAL ASSESSMENT:**
[Summary of clinical presentation with key findings]

**PRIMARY DIAGNOSIS:**
[Most probable diagnosis with confidence level and clinical reasoning]

**DIFFERENTIAL DIAGNOSES:**
• [Differential 1 - probability and distinguishing features]
• [Differential 2 - probability and distinguishing features] 
• [Differential 3 - probability and distinguishing features]

**RECOMMENDED STUDIES:**
• [Specific study with clinical indication and urgency]
• [Specific study with clinical indication and urgency]

**CLINICAL RECOMMENDATIONS:**
• [Evidence-based therapeutic recommendation]
• [Monitoring and follow-up plan]
• [Preventive measures and lifestyle modifications]

**CLINICAL PRIORITY:** [Routine/Urgent/Emergent/Critical]

**FOLLOW-UP:**
[Specific timeline and clinical endpoints for reassessment]

CLINICAL GUIDELINES:
- Never replace in-person clinical evaluation
- Always recommend urgent medical attention for alarm symptoms
- Provide evidence-based medical education
- Maintain professional but compassionate tone
- Reference current clinical guidelines (ESC, AHA/ACC, ASE)

Respond in English as Dr. Sofia Hernández, MD, PhD.`;

          const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
              ],
              max_tokens: 1500,
              temperature: 0.7,
              stream: true
            }),
          });

          if (!aiResponse.ok) {
            console.error('OpenAI API error:', aiResponse.status);
            socket.send(JSON.stringify({ type: 'error', message: 'AI consultation temporarily unavailable' }));
            return;
          }

          const reader = aiResponse.body?.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';

          socket.send(JSON.stringify({ type: 'response_start', message: 'Dr. Sofia is providing her medical analysis...' }));

          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const lineData = line.slice(6);
                if (lineData === '[DONE]') break;

                try {
                  const parsed = JSON.parse(lineData);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    socket.send(JSON.stringify({ type: 'response_chunk', content, fullResponse }));
                  }
                } catch (_e) {
                  // Skip malformed JSON
                }
              }
            }
          }

          if (fullResponse) {
            await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullResponse,
              message_type: 'text'
            });
          }

          socket.send(JSON.stringify({ 
            type: 'response_complete',
            conversationId,
            message: 'Medical analysis completed'
          }));
          break;
        }

        default:
          socket.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'Internal server error' }));
    }
  };

  socket.onclose = () => { console.log("WebSocket connection closed"); };
  socket.onerror = (error) => { console.error("WebSocket error:", error); };

  return response;
});
