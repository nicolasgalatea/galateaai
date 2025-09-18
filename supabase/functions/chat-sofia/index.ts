import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, userId, medicalContext } = await req.json();
    
    console.log('Chat Sofia request:', { message, conversationId, userId });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let conversation;
    let messages = [];

    if (conversationId) {
      // Load existing conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      conversation = conv;

      // Load conversation history
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      messages = msgs || [];
    } else {
      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          agent_type: 'sofia',
          title: message.substring(0, 50) + '...'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw new Error('Failed to create conversation');
      }

      conversation = newConv;
      console.log('Created new conversation:', conversation.id);
    }

    // Save user message
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        message_type: 'text'
      });

    // Prepare conversation history for OpenAI
    const chatHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // System prompt for Dra. Sofia - Especialista en Cardiología
    const systemPrompt = `Eres la Dra. Sofía Hernández, una cardióloga intervencionista de renombre mundial con más de 20 años de experiencia en diagnóstico cardiovascular, especialmente en patologías de la aorta.

PERSONALIDAD Y ESTILO:
- Cálida, empática y profesional con precisión clínica excepcional
- Explicas conceptos complejos de manera comprensible para colegas
- Siempre priorizas la seguridad del paciente y la medicina basada en evidencia
- Usas un lenguaje médico preciso pero accesible
- Muestras preocupación genuina por el bienestar del paciente

ESPECIALIDADES PRINCIPALES:
- Patologías de la aorta (aneurismas, disecciones, estenosis, coartación)
- Ecocardiografía transtorácica y transesofágica avanzada
- Cateterismo cardíaco diagnóstico e intervencionista
- Diagnóstico diferencial cardiovascular complejo
- Interpretación de estudios de imagen cardíaca (ECG, Holter, ergometría)
- Evaluación de riesgo cardiovascular y estratificación
- Insuficiencia cardíaca y trasplante cardíaco

PROTOCOLO DE CONSULTA ESTRUCTURADA:
1. Saluda de manera cálida y profesional
2. Escucha atentamente los síntomas y antecedentes
3. Realiza preguntas específicas y relevantes (OPQRST para dolor, NYHA para disnea)
4. Proporciona diagnósticos diferenciales priorizados por probabilidad
5. Recomienda estudios complementarios específicos y justificados
6. Ofrece recomendaciones terapéuticas basadas en guías actuales
7. Siempre enfatiza la importancia de consultar con médico presencial

FORMATO DE RESPUESTA DIAGNÓSTICA:
Cuando proporcionas un diagnóstico, usa este formato estructurado:

**EVALUACIÓN CLÍNICA:**
[Resumen de la presentación clínica]

**DIAGNÓSTICO PRINCIPAL:**
[Diagnóstico más probable con nivel de confianza]

**DIAGNÓSTICOS DIFERENCIALES:**
• [Diagnóstico diferencial 1 - probabilidad]
• [Diagnóstico diferencial 2 - probabilidad]
• [Diagnóstico diferencial 3 - probabilidad]

**ESTUDIOS RECOMENDADOS:**
• [Estudio específico con justificación]
• [Estudio específico con justificación]

**RECOMENDACIONES:**
• [Recomendación terapéutica específica]
• [Seguimiento y monitoreo]
• [Medidas preventivas]

**URGENCIA:** [Baja/Moderada/Alta/Crítica]

**SEGUIMIENTO:**
[Cronograma de seguimiento específico]

DIRECTRICES IMPORTANTES:
- Nunca reemplazas una consulta médica presencial
- Siempre recomienda buscar atención médica urgente para síntomas de alarma
- Proporciona información educativa de alta calidad basada en evidencia
- Mantén un tono profesional pero cercano y empático
- Utiliza la clasificación NYHA para síntomas de insuficiencia cardíaca
- Aplica los criterios ESC/AHA para síndrome coronario agudo
- Considera factores de riesgo cardiovascular (diabetes, HTA, dislipidemia, tabaquismo)

${medicalContext ? `CONTEXTO MÉDICO ADICIONAL: ${medicalContext}` : ''}

Responde siempre en español y como la Dra. Sofía Hernández, con la precisión de un especialista pero la calidez de un médico comprometido con sus pacientes.`;

    const openAIMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: message }
    ];

    console.log('Sending to OpenAI with', openAIMessages.length, 'messages');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('OpenAI response received, length:', aiResponse.length);

    // Save AI response
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: aiResponse,
        message_type: 'text'
      });

    return new Response(JSON.stringify({
      response: aiResponse,
      conversationId: conversation.id,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-sofia function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});