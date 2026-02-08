import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB base64
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_.\-\s]+$/;

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

    console.log('Starting Google Drive OAuth upload process');
    
    const oauthConfigJson = Deno.env.get('GOOGLE_OAUTH_CONFIG');
    if (!oauthConfigJson) {
      throw new Error('GOOGLE_OAUTH_CONFIG not configured');
    }

    const oauthConfig = JSON.parse(oauthConfigJson);
    const { client_id, client_secret, refresh_token } = oauthConfig;

    if (!client_id || !client_secret || !refresh_token) {
      throw new Error('Invalid OAuth configuration');
    }

    const { fileName, imageBase64 } = await req.json();
    
    // Input validation
    if (!fileName || typeof fileName !== 'string' || fileName.length > 255) {
      throw new Error('Invalid fileName');
    }
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    if (sanitizedFileName.includes('..')) throw new Error('Invalid fileName');

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new Error('Missing imageBase64');
    }
    if (imageBase64.length > MAX_FILE_SIZE) {
      throw new Error('File too large (max 20MB)');
    }

    console.log('File received:', sanitizedFileName);

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

    const FOLDER_ID = '16UDWVbjUcyx8-iYrdOkInX3ZxB3nZXnY';
    const metadata = { name: sanitizedFileName, parents: [FOLDER_ID] };
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    let contentType = 'image/jpeg';
    let base64Data = imageBase64;
    
    if (imageBase64.startsWith('data:')) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        base64Data = matches[2];
      }
    }

    const multipartBody = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${contentType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data +
      closeDelimiter;

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!uploadResponse.ok) {
      console.error('Upload error:', uploadResponse.status);
      throw new Error('Failed to upload file');
    }

    const uploadData = await uploadResponse.json();

    return new Response(
      JSON.stringify({ success: true, fileId: uploadData.id, fileName: uploadData.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-to-drive-oauth function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
