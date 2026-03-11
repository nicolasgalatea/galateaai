import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'pdf-upload';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { pdfBase64, fileName, pmid, projectId } = req.body || {};

  if (!pdfBase64) {
    return res.status(400).json({ success: false, error: 'Missing pdfBase64' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Processing PDF upload', { fileName, pmid });
    const start = Date.now();

    // Decode base64 to buffer
    const buffer = Buffer.from(pdfBase64, 'base64');

    // Dynamic import of pdf-parse
    let pdfParse;
    try {
      pdfParse = (await import('pdf-parse')).default;
    } catch {
      return res.status(500).json({
        success: false,
        error: 'pdf-parse not installed. Run: npm install pdf-parse',
      });
    }

    const pdfData = await pdfParse(buffer);
    const text = pdfData.text || '';
    const numPages = pdfData.numpages || 0;

    // Detect if scanned (low text to page ratio)
    const avgCharsPerPage = text.length / Math.max(numPages, 1);
    const likelyScanned = avgCharsPerPage < 100 && numPages > 0;

    // Upload to Supabase Storage if configured
    let storageUrl = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

        const storagePath = `${projectId || 'default'}/${pmid || Date.now()}_${fileName || 'document.pdf'}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('research-pdfs')
          .upload(storagePath, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('research-pdfs').getPublicUrl(storagePath);
          storageUrl = urlData.publicUrl;
        } else if (uploadError) {
          logAgent(AGENT_NAME, 'warn', `Storage upload failed: ${uploadError.message}`);
        }
      } catch (storageErr) {
        logAgent(AGENT_NAME, 'warn', `Supabase storage error: ${storageErr.message}`);
      }
    }

    const duration = Date.now() - start;
    logAgent(AGENT_NAME, 'info', 'PDF processed', { pages: numPages, textLength: text.length, likelyScanned, duration });

    return res.status(200).json({
      success: true,
      data: {
        text: text.slice(0, 50000), // Limit response size
        numPages,
        textLength: text.length,
        likelyScanned,
        storageUrl,
        preview: text.slice(0, 500),
        warning: likelyScanned ? 'El PDF parece ser escaneado (imagen). El texto extraido puede ser incompleto. Considere usar un PDF con texto seleccionable.' : null,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
