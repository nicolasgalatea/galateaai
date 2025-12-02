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
    console.log('Starting Google Drive OAuth upload process');
    
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
    const { fileName, imageBase64 } = await req.json();
    
    if (!fileName || !imageBase64) {
      throw new Error('Missing required fields: fileName and imageBase64');
    }

    console.log('File received:', fileName);

    // Get fresh access token using refresh token
    console.log('Requesting access token from refresh token');
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

    console.log('Access token obtained, uploading file to Drive');

    // Target folder ID (Unprocessed Files folder)
    const FOLDER_ID = '16UDWVbjUcyx8-iYrdOkInX3ZxB3nZXnY';

    // Prepare file metadata
    const metadata = {
      name: fileName,
      parents: [FOLDER_ID],
    };

    // Create multipart upload body
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    // Determine content type from base64 or default to image/jpeg
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
      const errorText = await uploadResponse.text();
      console.error('Upload error:', errorText);
      throw new Error(`Failed to upload file: ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('File uploaded successfully:', uploadData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fileId: uploadData.id,
        fileName: uploadData.name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in upload-to-drive-oauth function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
