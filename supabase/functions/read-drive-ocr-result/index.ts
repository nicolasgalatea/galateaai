import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const supabaseAuth = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    console.log('Starting Google Drive OCR result search');
    
    const oauthConfigJson = Deno.env.get('GOOGLE_OAUTH_CONFIG');
    if (!oauthConfigJson) {
      throw new Error('GOOGLE_OAUTH_CONFIG not configured');
    }

    const oauthConfig = JSON.parse(oauthConfigJson);
    const { client_id, client_secret, refresh_token } = oauthConfig;

    if (!client_id || !client_secret || !refresh_token) {
      throw new Error('Invalid OAuth configuration');
    }

    const { timestamp } = await req.json();
    
    // Validate timestamp
    if (!timestamp || typeof timestamp !== 'string' || timestamp.length > 50) {
      throw new Error('Invalid timestamp');
    }
    // Only allow alphanumeric, dots, dashes, underscores in timestamp
    if (!/^[a-zA-Z0-9._\-]+$/.test(timestamp)) {
      throw new Error('Invalid timestamp format');
    }

    const resultFileName = `resultado_${timestamp}.json`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id, client_secret, refresh_token, grant_type: 'refresh_token' }),
    });

    if (!tokenResponse.ok) {
      console.error('Token refresh error:', tokenResponse.status);
      throw new Error('Failed to refresh access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const searchQuery = encodeURIComponent(`name='${resultFileName}'`);
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${searchQuery}&fields=files(id,name)`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!searchResponse.ok) {
      console.error('Search error:', searchResponse.status);
      throw new Error('Failed to search files');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.files || searchData.files.length === 0) {
      return new Response(
        JSON.stringify({ found: false, message: 'File not found yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileId = searchData.files[0].id;

    const downloadResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { method: 'GET', headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!downloadResponse.ok) {
      console.error('Download error:', downloadResponse.status);
      throw new Error('Failed to download file');
    }

    const fileContent = await downloadResponse.text();

    let parsedContent;
    try {
      parsedContent = JSON.parse(fileContent);
    } catch (_e) {
      throw new Error('Failed to parse file content');
    }

    return new Response(
      JSON.stringify({ found: true, data: parsedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in read-drive-ocr-result function:', error);
    return new Response(
      JSON.stringify({ found: false, error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
