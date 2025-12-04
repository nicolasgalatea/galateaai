import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Google Drive OCR result search');
    
    // Get OAuth config from environment
    const oauthConfigJson = Deno.env.get('GOOGLE_OAUTH_CONFIG');
    if (!oauthConfigJson) {
      throw new Error('GOOGLE_OAUTH_CONFIG not configured');
    }

    const oauthConfig = JSON.parse(oauthConfigJson);
    const { client_id, client_secret, refresh_token } = oauthConfig;

    if (!client_id || !client_secret || !refresh_token) {
      throw new Error('Invalid OAuth configuration: missing client_id, client_secret, or refresh_token');
    }

    // Parse request body
    const { timestamp } = await req.json();
    
    if (!timestamp) {
      throw new Error('Missing required field: timestamp');
    }

    const resultFileName = `resultado_${timestamp}.json`;
    console.log('Searching for file:', resultFileName);

    // Get fresh access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token refresh error:', errorText);
      throw new Error(`Failed to refresh access token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Search for the file by name
    const searchQuery = encodeURIComponent(`name='${resultFileName}'`);
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${searchQuery}&fields=files(id,name)`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search error:', errorText);
      throw new Error(`Failed to search files: ${errorText}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.files || searchData.files.length === 0) {
      console.log('File not found yet');
      return new Response(
        JSON.stringify({ 
          found: false,
          message: 'File not found yet'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const fileId = searchData.files[0].id;
    console.log('File found:', fileId);

    // Download the file content
    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error('Download error:', errorText);
      throw new Error(`Failed to download file: ${errorText}`);
    }

    const fileContent = await downloadResponse.text();
    console.log('File content retrieved');

    // Parse the JSON content
    let parsedContent;
    try {
      parsedContent = JSON.parse(fileContent);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Failed to parse JSON content from file');
    }

    return new Response(
      JSON.stringify({ 
        found: true,
        data: parsedContent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in read-drive-ocr-result function:', error);
    return new Response(
      JSON.stringify({ 
        found: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
