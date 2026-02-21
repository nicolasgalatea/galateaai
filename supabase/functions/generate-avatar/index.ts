import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AvatarSettings {
  gender: string;
  age: number;
  ethnicity: string;
  profession: string;
  style: string;
  lighting: string;
  background: string;
  expression: string;
  quality: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { settings }: { settings: AvatarSettings } = await req.json()

    // Construir el prompt detallado para el avatar médico
    const professionMap: Record<string, string> = {
      'doctor': 'médico general con bata blanca y estetoscopio',
      'cardiologist': 'cardiólogo especialista con bata médica',
      'surgeon': 'cirujano con uniforme quirúrgico',
      'nurse': 'enfermero/a con uniforme médico',
      'researcher': 'investigador médico con atuendo científico'
    }

    const ethnicityMap: Record<string, string> = {
      'hispanic': 'hispano/latino',
      'caucasian': 'caucásico',
      'african': 'afrodescendiente',
      'asian': 'asiático',
      'indigenous': 'indígena',
      'mixed': 'mestizo'
    }

    const backgroundMap: Record<string, string> = {
      'medical': 'consultorio médico profesional',
      'hospital': 'ambiente hospitalario',
      'clinic': 'clínica moderna',
      'neutral': 'fondo neutro profesional'
    }

    const expressionMap: Record<string, string> = {
      'confident': 'expresión confiada y segura',
      'friendly': 'sonrisa amigable y cálida',
      'professional': 'expresión profesional y seria',
      'empathetic': 'expresión empática y comprensiva'
    }

    const genderText = settings.gender === 'female' ? 'mujer' : settings.gender === 'male' ? 'hombre' : 'persona'
    
    const prompt = `Retrato profesional ultra realista de ${genderText} ${ethnicityMap[settings.ethnicity]} de aproximadamente ${settings.age} años, trabajando como ${professionMap[settings.profession]}. ${expressionMap[settings.expression]}. Fotografía de alta calidad con ${settings.lighting} iluminación en ${backgroundMap[settings.background]}. Estilo fotorrealista profesional, resolución 4K, detalles perfectos de la piel, ojos expresivos, cabello natural. Composición de retrato headshot profesional.`

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: settings.quality === 'ultra' ? 'high' : 'medium',
        output_format: 'png'
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        success: true,
        image: data.data[0].b64_json,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error generando avatar', 
        details: err.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})