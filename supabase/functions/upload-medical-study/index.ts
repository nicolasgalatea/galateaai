import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_.\-\s]+$/;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB base64
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/dicom', 'image/dicom'];

function validateInput(body: unknown) {
  if (!body || typeof body !== 'object') throw new Error('Invalid request body');
  const { fileData, fileName, fileType, userId, medicalCaseId } = body as Record<string, unknown>;

  if (typeof fileData !== 'string' || fileData.length === 0) throw new Error('fileData is required');
  if (fileData.length > MAX_FILE_SIZE) throw new Error('File too large (max 50MB)');
  if (typeof fileName !== 'string' || fileName.length === 0 || fileName.length > 255) throw new Error('Invalid fileName');
  
  // Sanitize filename - prevent path traversal
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_.\-]/g, '_');
  if (sanitizedFileName.includes('..') || sanitizedFileName.startsWith('.')) throw new Error('Invalid fileName');
  
  if (typeof fileType !== 'string' || !ALLOWED_TYPES.includes(fileType)) throw new Error('Invalid fileType');
  if (typeof userId !== 'string' || !UUID_REGEX.test(userId)) throw new Error('Invalid userId');
  if (medicalCaseId !== undefined && medicalCaseId !== null && (typeof medicalCaseId !== 'string' || !UUID_REGEX.test(medicalCaseId))) throw new Error('Invalid medicalCaseId');

  return { fileData, fileName: sanitizedFileName, fileType, userId, medicalCaseId: medicalCaseId as string | undefined };
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
    const authenticatedUserId = claimsData.claims.sub as string;

    const { fileData, fileName, fileType, medicalCaseId } = validateInput(await req.json());

    // Use authenticated userId
    const userId = authenticatedUserId;

    console.log('Upload request:', { fileName, fileType, userId: userId.slice(0, 8) + '...' });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const filePath = `${userId}/${uniqueFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-studies')
      .upload(filePath, binaryData, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Upload failed');
    }

    const { data: urlData } = supabase.storage
      .from('medical-studies')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    if (medicalCaseId) {
      const { data: caseData } = await supabase
        .from('medical_cases')
        .select('study_files')
        .eq('id', medicalCaseId)
        .eq('user_id', userId)
        .single();

      if (caseData) {
        const currentFiles = caseData.study_files || [];
        const updatedFiles = [...currentFiles, fileUrl];

        await supabase
          .from('medical_cases')
          .update({ study_files: updatedFiles })
          .eq('id', medicalCaseId)
          .eq('user_id', userId);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      fileUrl,
      filePath,
      fileName: uniqueFileName,
      message: 'File uploaded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-medical-study function:', error);
    return new Response(JSON.stringify({ 
      error: 'An error occurred processing your request',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
