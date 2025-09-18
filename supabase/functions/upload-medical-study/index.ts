import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName, fileType, userId, medicalCaseId } = await req.json();
    
    console.log('Upload request:', { fileName, fileType, userId, medicalCaseId });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Decode base64 file data
    const binaryData = Uint8Array.from(atob(fileData), c => c.charCodeAt(0));

    // Generate unique file path
    const timestamp = new Date().getTime();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const filePath = `${userId}/${uniqueFileName}`;

    console.log('Uploading to path:', filePath);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-studies')
      .upload(filePath, binaryData, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Get public URL (even though bucket is private, we need the path)
    const { data: urlData } = supabase.storage
      .from('medical-studies')
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // If medicalCaseId provided, update the medical case
    if (medicalCaseId) {
      // Get current study files
      const { data: caseData } = await supabase
        .from('medical_cases')
        .select('study_files')
        .eq('id', medicalCaseId)
        .single();

      const currentFiles = caseData?.study_files || [];
      const updatedFiles = [...currentFiles, fileUrl];

      // Update medical case with new file
      const { error: updateError } = await supabase
        .from('medical_cases')
        .update({ study_files: updatedFiles })
        .eq('id', medicalCaseId);

      if (updateError) {
        console.error('Error updating medical case:', updateError);
        // Don't throw error here, file was uploaded successfully
      }
    }

    return new Response(JSON.stringify({
      success: true,
      fileUrl: fileUrl,
      filePath: filePath,
      fileName: uniqueFileName,
      message: 'File uploaded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-medical-study function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});