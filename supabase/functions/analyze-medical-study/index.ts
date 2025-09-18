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
    const { imageBase64, studyType, patientInfo, userId } = await req.json();
    
    console.log('Medical study analysis request:', { studyType, patientInfo });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare specialized prompt based on study type
    let analysisPrompt = `Eres la Dra. Sofía, cardióloga especialista con más de 20 años de experiencia. Analiza esta imagen médica cardiovascular con el máximo rigor científico.

INFORMACIÓN DEL PACIENTE:
${patientInfo ? JSON.stringify(patientInfo, null, 2) : 'No proporcionada'}

TIPO DE ESTUDIO: ${studyType || 'No especificado'}

INSTRUCCIONES DE ANÁLISIS:
1. Describe detalladamente lo que observas en la imagen
2. Identifica estructuras anatómicas relevantes
3. Señala cualquier hallazgo patológico o anormal
4. Proporciona mediciones aproximadas si es posible
5. Genera diagnósticos diferenciales
6. Sugiere estudios complementarios si es necesario
7. Evalúa el nivel de urgencia (bajo, normal, alto, crítico)
8. Proporciona recomendaciones terapéuticas

FORMATO DE RESPUESTA:
- Utiliza terminología médica precisa
- Estructura la información de manera clara
- Incluye nivel de confianza en tus observaciones
- Siempre recuerda que este análisis no reemplaza la evaluación clínica presencial

Responde en español de manera profesional y detallada.`;

    if (studyType?.toLowerCase().includes('eco')) {
      analysisPrompt += `

ANÁLISIS ECOCARDIOGRÁFICO ESPECÍFICO:
- Evalúa función ventricular izquierda
- Mide dimensiones de cavidades
- Analiza válvulas cardíacas
- Busca anomalías de la pared
- Evalúa flujo Doppler si visible
- Examina especialmente la aorta y sus segmentos`;
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Vision API error:', errorText);
      throw new Error(`OpenAI Vision API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Medical analysis completed, length:', analysis.length);

    // Extract key findings for structured storage
    const analysisResult = {
      fullAnalysis: analysis,
      timestamp: new Date().toISOString(),
      studyType: studyType,
      patientInfo: patientInfo,
      aiProvider: 'gpt-4o',
      analysisVersion: '1.0'
    };

    return new Response(JSON.stringify({
      analysis: analysis,
      analysisResult: analysisResult,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-medical-study function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});