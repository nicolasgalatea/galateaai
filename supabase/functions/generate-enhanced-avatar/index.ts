import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnhancedAvatarSettings {
  gender: string;
  age: number;
  ethnicity: string;
  profession: string;
  style: string;
  lighting: string;
  background: string;
  expression: string;
  quality: string;
  enhancement: 'realistic' | 'professional' | 'artistic';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { settings }: { settings: EnhancedAvatarSettings } = await req.json()

    // Enhanced prompts for different professions and styles
    const professionMap: Record<string, string> = {
      'doctor': 'medical doctor in professional white coat with stethoscope, confident medical professional',
      'cardiologist': 'cardiovascular specialist in medical scrubs, experienced cardiologist with medical expertise',
      'surgeon': 'skilled surgeon in surgical scrubs and cap, professional operating room physician',
      'nurse': 'healthcare nurse in professional medical uniform, caring medical professional',
      'researcher': 'medical researcher in laboratory coat with scientific equipment, academic medical professional'
    }

    const ethnicityMap: Record<string, string> = {
      'hispanic': 'Hispanic/Latino heritage',
      'caucasian': 'Caucasian heritage',
      'african': 'African heritage',
      'asian': 'Asian heritage',
      'indigenous': 'Indigenous heritage',
      'mixed': 'mixed ethnicity heritage'
    }

    const backgroundMap: Record<string, string> = {
      'medical': 'modern medical office with soft professional lighting',
      'hospital': 'clean hospital environment with medical equipment',
      'clinic': 'contemporary medical clinic setting',
      'neutral': 'clean neutral background with soft professional lighting',
      'laboratory': 'modern medical laboratory with scientific equipment'
    }

    const expressionMap: Record<string, string> = {
      'confident': 'confident and assured professional expression',
      'friendly': 'warm friendly smile with approachable demeanor',
      'professional': 'serious professional medical expression with authority',
      'empathetic': 'compassionate empathetic expression with caring eyes'
    }

    const styleMap: Record<string, string> = {
      'photorealistic': 'ultra-realistic photography, 8K resolution, professional medical portrait',
      'professional': 'high-quality professional headshot, corporate medical photography',
      'artistic': 'artistic portrait photography with dramatic lighting',
      'clinical': 'clinical medical photography, documentary style, authentic medical professional'
    }

    const genderText = settings.gender === 'female' ? 'female' : settings.gender === 'male' ? 'male' : 'person'
    
    // Create enhanced prompt with professional medical terminology
    const prompt = `Professional medical portrait of ${genderText} ${ethnicityMap[settings.ethnicity]} approximately ${settings.age} years old, working as ${professionMap[settings.profession]}. ${expressionMap[settings.expression]}. ${styleMap[settings.style]} with ${settings.lighting} lighting in ${backgroundMap[settings.background]}. Ultra-high definition, sharp focus on facial features, natural skin texture, professional medical photography, authentic healthcare professional appearance, detailed medical attire, ${settings.quality === 'ultra' ? 'masterpiece quality, award-winning portrait photography' : 'high-quality professional photography'}.`

    console.log('Generating enhanced avatar with prompt:', prompt);

    // Try HuggingFace first for better quality
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    
    if (hfToken) {
      try {
        const hf = new HfInference(hfToken);
        
        const image = await hf.textToImage({
          inputs: prompt,
          model: 'black-forest-labs/FLUX.1-schnell',
        });

        const arrayBuffer = await image.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        return new Response(
          JSON.stringify({ 
            success: true,
            image: base64,
            prompt: prompt,
            provider: 'huggingface'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (hfError) {
        console.error('HuggingFace error, falling back to OpenAI:', hfError);
      }
    }

    // Fallback to OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('No AI service available. Please configure API keys.');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: settings.quality === 'ultra' ? 'hd' : 'standard',
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Convert URL to base64 for consistency
    const imageResponse = await fetch(data.data[0].url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    return new Response(
      JSON.stringify({ 
        success: true,
        image: base64Image,
        prompt: prompt,
        provider: 'openai'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error generating enhanced avatar', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})