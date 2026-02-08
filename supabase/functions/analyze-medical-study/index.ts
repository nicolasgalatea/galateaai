import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

// Validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB base64
const ALLOWED_STUDY_TYPES = ['Ecocardiograma', 'Radiografía', 'Tomografía', 'Resonancia', 'Estudio de imagen', 'ECG', 'Holter', 'Ergometría'];

function validateInput(body: unknown) {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const { imageBase64, studyType, patientInfo, userId } = body as Record<string, unknown>;

  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) throw new Error('imageBase64 is required');
  if (imageBase64.length > MAX_IMAGE_SIZE) throw new Error('Image too large (max 10MB)');
  if (typeof userId !== 'string' || !UUID_REGEX.test(userId)) throw new Error('Invalid userId');
  
  const validStudyType = typeof studyType === 'string' && ALLOWED_STUDY_TYPES.includes(studyType)
    ? studyType : 'Estudio de imagen';

  // Sanitize patientInfo - only allow simple string values
  let sanitizedPatientInfo: Record<string, string> | undefined;
  if (patientInfo && typeof patientInfo === 'object') {
    sanitizedPatientInfo = {};
    for (const [key, val] of Object.entries(patientInfo as Record<string, unknown>)) {
      if (typeof key === 'string' && typeof val === 'string' && key.length <= 50 && val.length <= 200) {
        sanitizedPatientInfo[key.slice(0, 50)] = val.slice(0, 200);
      }
    }
  }

  return { imageBase64, studyType: validStudyType, patientInfo: sanitizedPatientInfo, userId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { imageBase64, studyType, patientInfo } = validateInput(await req.json());
    
    console.log('Medical study analysis request:', { studyType, hasPatientInfo: !!patientInfo });

    let analysisPrompt = `Eres la Dra. Sofía, cardióloga especialista con más de 20 años de experiencia. Analiza esta imagen médica cardiovascular con el máximo rigor científico.

INFORMACIÓN DEL PACIENTE:
${patientInfo ? JSON.stringify(patientInfo, null, 2) : 'No proporcionada'}

TIPO DE ESTUDIO: ${studyType}

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
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      console.error('OpenAI Vision API error:', response.status);
      throw new Error('AI service temporarily unavailable');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({
      analysis,
      analysisResult: {
        fullAnalysis: analysis,
        timestamp: new Date().toISOString(),
        studyType,
        aiProvider: 'gpt-4o',
        analysisVersion: '1.0'
      },
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-medical-study function:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
