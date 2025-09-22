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

console.log('Environment check:', {
  hasOpenAI: !!OPENAI_API_KEY,
  hasSupabaseUrl: !!SUPABASE_URL,
  hasSupabaseKey: !!SUPABASE_SERVICE_ROLE_KEY
});

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
          console.log('Processing chat message from user:', userId);
          
          if (!userId) {
            console.error('No user ID provided for chat message');
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'Authentication required - please refresh and try again' 
            }));
            return;
          }

          if (!OPENAI_API_KEY) {
            console.error('OpenAI API key not configured');
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'AI service temporarily unavailable' 
            }));
            return;
          }

          // Send typing indicator
          socket.send(JSON.stringify({ 
            type: 'typing', 
            message: 'Dr. Sofia is analyzing your case...' 
          }));

          console.log('Creating or getting conversation for user:', userId);

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
              console.error('Error creating conversation:', convError);
              socket.send(JSON.stringify({ 
                type: 'error', 
                message: 'Failed to initialize conversation - please try again' 
              }));
              return;
            }
            console.log('Created new conversation:', conversation.id);
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
- Always recommend urgent medical attention for alarm symptoms (acute chest pain, syncope, severe dyspnea)
- Provide evidence-based medical education
- Maintain professional but compassionate tone
- Use NYHA classification for heart failure symptoms
- Apply ESC/AHA criteria for acute coronary syndromes
- Consider cardiovascular risk factors (diabetes, hypertension, dyslipidemia, smoking, family history)
- Reference current clinical guidelines (ESC, AHA/ACC, ASE)

MEDICAL CONTEXT: Standard cardiovascular consultation

Respond in English as Dr. Sofia Hernández, MD, PhD, with the clinical precision of a specialist and the empathy of a physician committed to patient care.`;

          console.log('Calling OpenAI API for medical consultation...');
          
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
            const errorData = await response.text();
            console.error('OpenAI API error:', response.status, errorData);
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'AI consultation temporarily unavailable - please try again in a moment' 
            }));
            return;
          }

          // Stream response
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullResponse = '';

          socket.send(JSON.stringify({ 
            type: 'response_start', 
            message: 'Dr. Sofia is providing her medical analysis...' 
          }));

          console.log('Streaming OpenAI response...');

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
            console.log('Saving assistant response to database...');
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
            } else {
              console.log('Assistant message saved successfully');
            }
          }

          console.log('Medical consultation completed successfully');
          socket.send(JSON.stringify({ 
            type: 'response_complete',
            conversationId: conversationId,
            message: 'Medical analysis completed - Dr. Sofia is ready for your next question'
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