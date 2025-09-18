import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice = 'alloy' } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    console.log('Generating speech for text length:', text.length);

    // Use ElevenLabs for more natural Spanish voice
    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (elevenLabsApiKey) {
      // ElevenLabs API call for better Spanish voice
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('ElevenLabs API error:', error);
        throw new Error('Failed to generate speech with ElevenLabs')
      }

      // Convert audio buffer to base64
      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      )

      console.log('ElevenLabs speech generated successfully');

      return new Response(
        JSON.stringify({ audioContent: base64Audio, provider: 'elevenlabs' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    } else {
      // Fallback to OpenAI TTS
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voice,
          response_format: 'mp3',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate speech')
      }

      // Convert audio buffer to base64
      const arrayBuffer = await response.arrayBuffer()
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      )

      console.log('OpenAI speech generated successfully');

      return new Response(
        JSON.stringify({ audioContent: base64Audio, provider: 'openai' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }
  } catch (error) {
    console.error('Text to speech error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})