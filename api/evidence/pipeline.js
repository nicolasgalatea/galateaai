/**
 * Consolidated evidence pipeline endpoint — handles multiple actions via ?action= parameter
 * Actions: clinicaltrials-search, import-ris, deduplicate, extract-data, extract-batch, build-dataset, pdf-upload
 * This consolidation avoids Vercel Hobby plan's 12-function limit.
 */
import { logAgent, logError } from '../_utils/logger.js';

const AGENT_NAME = 'evidence-pipeline';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// ═══════════════════════════════════════════════════════════════
// ACTION: clinicaltrials-search
// ═══════════════════════════════════════════════════════════════
function parseStudy(study) {
  const proto = study.protocolSection || {};
  const id = proto.identificationModule || {};
  const status = proto.statusModule || {};
  const design = proto.designModule || {};
  const sponsor = proto.sponsorCollaboratorsModule || {};
  const outcomes = proto.outcomesModule || {};
  const conditions = proto.conditionsModule || {};
  const interventions = proto.armsInterventionsModule || {};
  const description = proto.descriptionModule || {};
  return {
    nctId: id.nctId || '',
    title: id.officialTitle || id.briefTitle || '',
    briefTitle: id.briefTitle || '',
    status: status.overallStatus || '',
    phase: (design.phases || []).join(', ') || '',
    studyType: design.studyType || '',
    enrollment: (status.enrollmentInfo || {}).count || null,
    conditions: (conditions.conditions || []),
    interventions: (interventions.interventions || []).map(function(iv) {
      return { type: iv.type || '', name: iv.name || '', description: iv.description || '' };
    }),
    sponsors: {
      lead: (sponsor.leadSponsor || {}).name || '',
      collaborators: (sponsor.collaborators || []).map(function(c) { return c.name || ''; }),
    },
    primaryOutcomes: (outcomes.primaryOutcomes || []).map(function(o) { return { measure: o.measure || '', timeFrame: o.timeFrame || '' }; }),
    secondaryOutcomes: (outcomes.secondaryOutcomes || []).map(function(o) { return { measure: o.measure || '', timeFrame: o.timeFrame || '' }; }),
    briefSummary: (description.briefSummary || '').slice(0, 500),
    startDate: (status.startDateStruct || {}).date || '',
    completionDate: (status.completionDateStruct || {}).date || '',
  };
}

async function handleClinicalTrialsSearch(body) {
  const { query, pageSize = 20 } = body;
  if (!query) throw new Error('Missing query');
  const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(query)}&pageSize=${Math.min(pageSize, 50)}&format=json`;
  const response = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`ClinicalTrials.gov API failed: ${response.status}`);
  const data = await response.json();
  return { count: data.totalCount || 0, studies: (data.studies || []).map(parseStudy) };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: import-ris
// ═══════════════════════════════════════════════════════════════
function parseRIS(text) {
  const articles = [];
  const entries = text.split(/\nER\s*-/);
  for (const entry of entries) {
    const lines = entry.split('\n');
    const record = {};
    const authors = [];
    const keywords = [];
    let currentTag = '', currentValue = '';
    for (const line of lines) {
      const tagMatch = line.match(/^([A-Z][A-Z0-9])\s{2}-\s?(.*)/);
      if (tagMatch) {
        if (currentTag === 'AU' || currentTag === 'A1') authors.push(currentValue.trim());
        else if (currentTag === 'KW') keywords.push(currentValue.trim());
        else if (currentTag && currentValue.trim()) record[currentTag] = (record[currentTag] ? record[currentTag] + ' ' : '') + currentValue.trim();
        currentTag = tagMatch[1]; currentValue = tagMatch[2] || '';
      } else if (currentTag) currentValue += ' ' + line.trim();
    }
    if (currentTag === 'AU' || currentTag === 'A1') authors.push(currentValue.trim());
    else if (currentTag === 'KW') keywords.push(currentValue.trim());
    else if (currentTag && currentValue.trim()) record[currentTag] = (record[currentTag] ? record[currentTag] + ' ' : '') + currentValue.trim();
    const title = record.TI || record.T1 || '';
    if (!title) continue;
    const year = (record.PY || record.Y1 || '').replace(/[^0-9]/g, '').slice(0, 4);
    articles.push({ title: title.trim(), authors: authors.filter(Boolean), year, doi: (record.DO || '').trim(), abstract: (record.AB || record.N2 || '').trim(), journal: (record.JO || record.JF || record.T2 || '').trim(), volume: (record.VL || '').trim(), issue: (record.IS || '').trim(), pages: [record.SP, record.EP].filter(Boolean).join('-'), keywords: keywords.filter(Boolean), source: 'EMBASE', pmid: (record.AN || '').trim() });
  }
  return articles;
}

function parseBibTeX(text) {
  const articles = [];
  const entries = text.match(/@\w+\{[^@]*/g) || [];
  for (const entry of entries) {
    const fields = {};
    const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g;
    let m;
    while ((m = fieldRegex.exec(entry)) !== null) fields[m[1].toLowerCase()] = m[2].trim();
    const title = fields.title || '';
    if (!title) continue;
    const authors = (fields.author || '').split(/\s+and\s+/).map(a => a.trim()).filter(Boolean);
    articles.push({ title, authors, year: (fields.year || '').trim(), doi: (fields.doi || '').trim(), abstract: (fields.abstract || '').trim(), journal: (fields.journal || '').trim(), volume: (fields.volume || '').trim(), issue: (fields.number || '').trim(), pages: (fields.pages || '').replace('--', '-'), keywords: (fields.keywords || '').split(/[,;]/).map(k => k.trim()).filter(Boolean), source: 'EMBASE', pmid: (fields.pmid || '').trim() });
  }
  return articles;
}

function handleImportRIS(body) {
  const { text, sourceName } = body;
  if (!text) throw new Error('Missing file text content');
  const trimmed = text.trim();
  let format, articles;
  if (trimmed.match(/^TY\s{2}-/m)) { format = 'RIS'; articles = parseRIS(trimmed); }
  else if (trimmed.match(/^@\w+\{/m)) { format = 'BibTeX'; articles = parseBibTeX(trimmed); }
  else throw new Error('Formato no reconocido. Se esperaba RIS o BibTeX.');
  if (sourceName) articles.forEach(a => { a.source = sourceName; });
  return { format, count: articles.length, articles };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: deduplicate
// ═══════════════════════════════════════════════════════════════
function normalizeTitle(title) {
  return (title || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\b(the|a|an|of|in|on|for|and|or|to|with|by|from|at|is|are|was|were|el|la|los|las|de|del|en|con|por|para|un|una|que|se|al|es|su|como|mas|pero|entre|sin|sobre|este|esta|estos|estas|o|y|e|u|no|si)\b/g, '').replace(/\s+/g, ' ').trim();
}

function titleHash(title) {
  const normalized = normalizeTitle(title);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) { hash = ((hash << 5) - hash) + normalized.charCodeAt(i); hash |= 0; }
  return hash.toString(36);
}

function handleDeduplicate(body) {
  const { articles } = body;
  if (!Array.isArray(articles) || articles.length === 0) throw new Error('Missing or empty articles array');
  const unique = [], duplicates = [];
  const seenDOIs = new Map(), seenPMIDs = new Map(), seenTitleHashes = new Map();
  for (const article of articles) {
    let isDuplicate = false, reason = '', keptArticle = null;
    const doi = (article.doi || '').toLowerCase().trim();
    if (doi && doi.length > 5) { if (seenDOIs.has(doi)) { isDuplicate = true; reason = 'DOI match'; keptArticle = seenDOIs.get(doi); } else seenDOIs.set(doi, article); }
    if (!isDuplicate) { const pmid = (article.pmid || '').trim(); if (pmid) { if (seenPMIDs.has(pmid)) { isDuplicate = true; reason = 'PMID match'; keptArticle = seenPMIDs.get(pmid); } else seenPMIDs.set(pmid, article); } }
    if (!isDuplicate) { const hash = titleHash(article.title); const year = (article.year || article.anio || '').toString(); const key = hash + '_' + year; if (seenTitleHashes.has(key)) { isDuplicate = true; reason = 'Title+Year match'; keptArticle = seenTitleHashes.get(key); } else seenTitleHashes.set(key, article); }
    if (isDuplicate) duplicates.push({ kept: keptArticle, removed: article, reason }); else unique.push(article);
  }
  const bySource = {}, dupByReason = {};
  for (const a of articles) { const src = a.source || a.database || 'unknown'; bySource[src] = (bySource[src] || 0) + 1; }
  for (const d of duplicates) { dupByReason[d.reason] = (dupByReason[d.reason] || 0) + 1; }
  return { unique, duplicates, stats: { total: articles.length, unique: unique.length, duplicated: duplicates.length, bySource, byReason: dupByReason } };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: extract-data / extract-batch
// ═══════════════════════════════════════════════════════════════
async function handleExtractData(body) {
  const { callClaude } = await import('../_utils/anthropic-client.js');
  const { ExtractionSchema } = await import('../_utils/extraction-schema.js');
  const { PROMPTS } = await import('../../prompts/system-prompts.js');
  const { text, articleMeta, picot } = body;
  const meta = articleMeta || {};
  const articleText = text || meta.abstract || '';
  if (!articleText && !meta.title) throw new Error('Missing text or articleMeta');
  const userPrompt = `Extrae los datos estructurados del siguiente articulo para una revision sistematica.\n\nPICOT: ${JSON.stringify(picot || {})}\n\nARTICULO:\n- Titulo: ${meta.title || 'N/A'}\n- Autores: ${(meta.authors || []).join(', ') || 'N/A'}\n- Ano: ${meta.year || 'N/A'}\n- PMID: ${meta.pmid || 'N/A'}\n\nTEXTO:\n${(articleText || '').slice(0, 8000)}\n\nResponde SOLO con JSON valido con la estructura: { population, intervention, comparator, outcomes[], studyDesign, riskOfBias, funding, conflicts, limitations }`;
  const result = await callClaude(PROMPTS.DATA_EXTRACTOR, userPrompt, { temperature: 0.1, max_tokens: 2000 });
  const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const validation = ExtractionSchema.safeParse(parsed);
  if (validation.success) return { extraction: validation.data, valid: true };
  // Retry with errors
  const errorDetails = validation.error.issues.map(i => `- ${i.path.join('.')}: ${i.message}`).join('\n');
  const retryResult = await callClaude(PROMPTS.DATA_EXTRACTOR, `Tu respuesta anterior tuvo errores. Corrige:\n${errorDetails}\n\nRespuesta anterior:\n${cleaned}\n\nCorrige y responde SOLO con JSON valido.`, { temperature: 0.1, max_tokens: 2000 });
  const retryCleaned = retryResult.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const retryParsed = JSON.parse(retryCleaned);
  const rv = ExtractionSchema.safeParse(retryParsed);
  return { extraction: rv.success ? rv.data : retryParsed, valid: rv.success, errors: rv.success ? null : rv.error.issues };
}

async function handleExtractBatch(body) {
  const { articles, picot } = body;
  if (!Array.isArray(articles) || articles.length === 0) throw new Error('Missing articles array');
  const batch = articles.slice(0, 4);
  const results = [];
  for (const article of batch) {
    try {
      const r = await handleExtractData({ text: article.abstract || article.title || '', articleMeta: article, picot });
      results.push({ pmid: article.pmid || '', title: article.title || '', extraction: r.extraction, valid: r.valid });
    } catch (err) {
      results.push({ pmid: article.pmid || '', title: article.title || '', extraction: null, valid: false, error: err.message });
    }
  }
  return { results, processed: results.length, remaining: articles.length - batch.length };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: build-dataset
// ═══════════════════════════════════════════════════════════════
function tableToCSV(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map(h => { const val = (row[h] == null ? '' : String(row[h])).replace(/"/g, '""'); return val.includes(',') || val.includes('"') || val.includes('\n') ? '"' + val + '"' : val; });
    lines.push(values.join(','));
  }
  return lines.join('\n');
}

function handleBuildDataset(body) {
  const { extractions, articlesMeta, format } = body;
  if (!extractions || typeof extractions !== 'object') throw new Error('Missing extractions object');
  const metaMap = {};
  if (Array.isArray(articlesMeta)) articlesMeta.forEach(a => { if (a.pmid) metaMap[a.pmid] = a; });
  const studiesTable = [], outcomesTable = [], interventionsTable = [], metadataTable = [];
  Object.entries(extractions).forEach(([studyId, ext]) => {
    if (!ext) return;
    const meta = metaMap[studyId] || {};
    const authorStr = Array.isArray(meta.authors) ? (meta.authors[0] || '') + (meta.authors.length > 1 ? ' et al.' : '') : (meta.autor || '');
    studiesTable.push({ study_id: studyId, author: authorStr, year: meta.year || meta.anio || '', design: ext.studyDesign || '', country: (ext.population && ext.population.country) || meta.country || '', sample_size: (ext.population && ext.population.sampleSize) || null, funding: ext.funding || '', rob_overall: (ext.riskOfBias && ext.riskOfBias.overall) || '' });
    (ext.outcomes || []).forEach(o => {
      let ciLower = '', ciUpper = '';
      if (o.ci95) { const m = o.ci95.match(/([\d.-]+)\s*[-–to]+\s*([\d.-]+)/); if (m) { ciLower = m[1]; ciUpper = m[2]; } }
      outcomesTable.push({ study_id: studyId, outcome_name: o.name || '', type: o.type || 'other', measure: o.measure || '', effect_size: o.effectSize || '', ci_lower: ciLower, ci_upper: ciUpper, p_value: o.pValue || '' });
    });
    interventionsTable.push({ study_id: studyId, intervention_name: (ext.intervention && ext.intervention.name) || '', dose: (ext.intervention && ext.intervention.dose) || '', duration: (ext.intervention && ext.intervention.duration) || '', comparator_name: (ext.comparator && ext.comparator.name) || '' });
    metadataTable.push({ study_id: studyId, keywords: (meta.keywords || []).join('; '), mesh_terms: (meta.meshTerms || []).join('; '), journal: meta.journal || '', doi: meta.doi || '', publication_type: (meta.publicationTypes || []).join('; ') });
  });
  if (format === 'csv') return { studies_csv: tableToCSV(studiesTable), outcomes_csv: tableToCSV(outcomesTable), interventions_csv: tableToCSV(interventionsTable), metadata_csv: tableToCSV(metadataTable) };
  const stats = { studies: studiesTable.length, outcomes: outcomesTable.length, interventions: interventionsTable.length, countries: [...new Set(studiesTable.map(s => s.country).filter(Boolean))].length };
  return { studiesTable, outcomesTable, interventionsTable, metadataTable, stats };
}

// ═══════════════════════════════════════════════════════════════
// ACTION: pdf-upload
// ═══════════════════════════════════════════════════════════════
async function handlePdfUpload(body) {
  const { pdfBase64, fileName, pmid, projectId } = body;
  if (!pdfBase64) throw new Error('Missing pdfBase64');
  const buffer = Buffer.from(pdfBase64, 'base64');
  let pdfParse;
  try { pdfParse = (await import('pdf-parse')).default; } catch { throw new Error('pdf-parse not installed'); }
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text || '';
  const numPages = pdfData.numpages || 0;
  const avgCharsPerPage = text.length / Math.max(numPages, 1);
  const likelyScanned = avgCharsPerPage < 100 && numPages > 0;
  let storageUrl = null;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const storagePath = `${projectId || 'default'}/${pmid || Date.now()}_${fileName || 'document.pdf'}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('research-pdfs').upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true });
      if (!uploadError && uploadData) { const { data: urlData } = supabase.storage.from('research-pdfs').getPublicUrl(storagePath); storageUrl = urlData.publicUrl; }
    } catch (e) { logAgent(AGENT_NAME, 'warn', `Storage error: ${e.message}`); }
  }
  return { text: text.slice(0, 50000), numPages, textLength: text.length, likelyScanned, storageUrl, preview: text.slice(0, 500), warning: likelyScanned ? 'El PDF parece ser escaneado (imagen). El texto extraido puede ser incompleto.' : null };
}

// ═══════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).json({});
  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const action = req.query.action || req.body._action;
  if (!action) return res.status(400).json({ success: false, error: 'Missing action parameter. Use ?action=clinicaltrials-search|import-ris|deduplicate|extract-data|extract-batch|build-dataset|pdf-upload' });

  const start = Date.now();
  try {
    logAgent(AGENT_NAME, 'info', `Action: ${action}`);
    let data;
    switch (action) {
      case 'clinicaltrials-search': data = await handleClinicalTrialsSearch(req.body); break;
      case 'import-ris': data = handleImportRIS(req.body); break;
      case 'deduplicate': data = handleDeduplicate(req.body); break;
      case 'extract-data': data = await handleExtractData(req.body); break;
      case 'extract-batch': data = await handleExtractBatch(req.body); break;
      case 'build-dataset': data = handleBuildDataset(req.body); break;
      case 'pdf-upload': data = await handlePdfUpload(req.body); break;
      default: return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }
    return res.status(200).json({ success: true, data, metrics: { duration: Date.now() - start } });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
