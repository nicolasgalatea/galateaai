import { callClaude } from './_utils/anthropic-client.js';
import { updatePhaseData } from './_utils/supabase-server.js';
import { logAgent, logError, logMetrics } from './_utils/logger.js';
import { PROMPTS } from '../prompts/system-prompts.js';

const AGENT_NAME = 'orchestrator';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Parse JSON from Claude response, cleaning markdown fences if present
 */
function parseClaudeJSON(text) {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Search PubMed using the internal endpoint logic (direct E-utilities call)
 */
async function searchPubMed(query, maxResults = 20) {
  const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

  // esearch
  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) throw new Error(`PubMed esearch failed: ${searchRes.status}`);
  const searchData = await searchRes.json();
  const pmids = searchData.esearchresult?.idlist || [];
  const count = parseInt(searchData.esearchresult?.count || '0', 10);

  if (!pmids.length) return { count, articles: [] };

  // Rate limit
  await new Promise((r) => setTimeout(r, 350));

  // efetch
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const fetchRes = await fetch(fetchUrl);
  if (!fetchRes.ok) throw new Error(`PubMed efetch failed: ${fetchRes.status}`);
  const xml = await fetchRes.text();

  // Parse XML
  const articles = [];
  const blocks = xml.split('<PubmedArticle>').slice(1);
  for (const block of blocks) {
    try {
      const getTag = (tag) => {
        const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
        return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
      };
      const pmid = getTag('PMID');
      const title = getTag('ArticleTitle');
      const journal = getTag('Title') || getTag('ISOAbbreviation');
      const year = getTag('Year');
      const doiMatch = block.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
      const doi = doiMatch ? doiMatch[1].trim() : '';

      // Authors
      const authors = [];
      const authRegex = /<Author[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<Initials>([^<]+)<\/Initials>[\s\S]*?<\/Author>/g;
      let am;
      while ((am = authRegex.exec(block)) !== null && authors.length < 5) {
        authors.push(`${am[1]} ${am[2]}`);
      }

      // Abstract
      let abstract = '';
      const absMatch = block.match(/<Abstract>([\s\S]*?)<\/Abstract>/);
      if (absMatch) {
        abstract = absMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }

      articles.push({ pmid, title, authors, abstract, journal, year, doi });
    } catch {
      // Skip malformed
    }
  }

  return { count, articles };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { projectId, researchQuestion } = req.body || {};

  if (!researchQuestion) {
    return res.status(400).json({ success: false, error: 'Missing researchQuestion' });
  }

  const totalStart = Date.now();
  const results = {};
  const errors = [];
  const VERCEL_TIMEOUT = 55000; // Leave margin before Vercel's 60s limit

  try {
    logAgent(AGENT_NAME, 'info', 'Starting orchestration', { projectId });

    // Helper: check if we're running out of time
    function timeRemaining() { return VERCEL_TIMEOUT - (Date.now() - totalStart); }
    function checkTimeout(agentName) {
      if (timeRemaining() < 5000) {
        throw new Error(`Orchestrator timeout: not enough time for ${agentName} (${Math.round((Date.now() - totalStart) / 1000)}s elapsed)`);
      }
    }

    // ── Agent 1: PICOT Builder ──
    logAgent(AGENT_NAME, 'info', 'Running PICOT Builder');
    let picotData;
    try {
      const picotResult = await callClaude(
        PROMPTS.PICOT_BUILDER,
        `Pregunta de investigacion:\n"${researchQuestion}"\n\nAnaliza esta pregunta y genera el PICOT estructurado.`
      );
      logMetrics('picot-builder', picotResult);
      picotData = parseClaudeJSON(picotResult.text);
      results.picot = {
        data: picotData,
        metrics: { duration: picotResult.duration, tokensUsed: picotResult.tokensUsed },
      };

      // Save to Supabase
      if (projectId) {
        try {
          await updatePhaseData(projectId, 'picot', picotData.picot);
          await updatePhaseData(projectId, 'framework', picotData.framework);
          await updatePhaseData(projectId, 'study_type', {
            type: picotData.studyType,
            design_locked: picotData.designLocked,
            justification: picotData.justification,
          });
        } catch (dbErr) {
          logError(AGENT_NAME, dbErr, { context: 'picot_save' });
        }
      }
    } catch (err) {
      logError('picot-builder', err);
      errors.push({ agent: 'picot-builder', error: err.message });
      // PICOT is critical — stop if it fails
      return res.status(500).json({
        success: false,
        error: 'PICOT Builder failed — cannot continue without structured question',
        errors,
        totalDuration: Date.now() - totalStart,
      });
    }

    // ── Agent 2: Planteamiento Builder ──
    checkTimeout('planteamiento-builder');
    logAgent(AGENT_NAME, 'info', 'Running Planteamiento Builder');
    try {
      const planteamientoResult = await callClaude(
        PROMPTS.PLANTEAMIENTO_BUILDER,
        `Pregunta de investigacion:\n"${researchQuestion}"\n\nRedacta el planteamiento del problema para esta investigacion.`
      );
      logMetrics('planteamiento-builder', planteamientoResult);
      const planteamientoData = parseClaudeJSON(planteamientoResult.text);
      results.planteamiento = {
        data: planteamientoData,
        metrics: { duration: planteamientoResult.duration, tokensUsed: planteamientoResult.tokensUsed },
      };

      if (projectId) {
        try {
          await updatePhaseData(projectId, 'planteamiento', planteamientoData.planteamiento);
        } catch (dbErr) {
          logError(AGENT_NAME, dbErr, { context: 'planteamiento_save' });
        }
      }
    } catch (err) {
      logError('planteamiento-builder', err);
      errors.push({ agent: 'planteamiento-builder', error: err.message });
    }

    // ── Agent 3: FINER Validator ──
    logAgent(AGENT_NAME, 'info', 'Running FINER Validator');
    try {
      const finerResult = await callClaude(
        PROMPTS.FINER_VALIDATOR,
        `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picotData.picot, null, 2)}\n\nEvalua esta investigacion con los 5 criterios FINER.`
      );
      logMetrics('finer-validator', finerResult);
      const finerData = parseClaudeJSON(finerResult.text);
      results.finer = {
        data: finerData,
        metrics: { duration: finerResult.duration, tokensUsed: finerResult.tokensUsed },
      };

      if (projectId) {
        try {
          await updatePhaseData(projectId, 'finer_results', finerData.finerScores);
        } catch (dbErr) {
          logError(AGENT_NAME, dbErr, { context: 'finer_save' });
        }
      }
    } catch (err) {
      logError('finer-validator', err);
      errors.push({ agent: 'finer-validator', error: err.message });
    }

    // ── Agent 4: Factibilidad Operativa ──
    logAgent(AGENT_NAME, 'info', 'Running Factibilidad Operativa');
    try {
      const feasibilityResult = await callClaude(
        PROMPTS.FACTIBILIDAD_OPERATIVA,
        `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picotData.picot, null, 2)}\n\nFramework: ${picotData.framework}\nTipo de estudio: ${picotData.studyType || 'No especificado'}\n\nScores FINER:\n${JSON.stringify(results.finer?.data?.finerScores || {}, null, 2)}\n\nEvalua la factibilidad operativa de este proyecto de investigacion en las 6 dimensiones.`
      );
      logMetrics('factibilidad-operativa', feasibilityResult);
      const feasibilityData = parseClaudeJSON(feasibilityResult.text);
      results.feasibility = {
        data: feasibilityData,
        metrics: { duration: feasibilityResult.duration, tokensUsed: feasibilityResult.tokensUsed },
      };

      if (projectId) {
        try {
          await updatePhaseData(projectId, 'feasibility', feasibilityData);
        } catch (dbErr) {
          logError(AGENT_NAME, dbErr, { context: 'feasibility_save' });
        }
      }
    } catch (err) {
      logError('factibilidad-operativa', err);
      errors.push({ agent: 'factibilidad-operativa', error: err.message });
    }

    // ── Agents 5+6: Hypothesis Generator + Folder Organizer (parallel) ──
    logAgent(AGENT_NAME, 'info', 'Running Hypothesis Generator + Folder Organizer in parallel');

    const [hypothesisSettled, folderSettled] = await Promise.allSettled([
      // Hypothesis Generator
      (async () => {
        const hypResult = await callClaude(
          PROMPTS.HYPOTHESIS_GENERATOR,
          `Pregunta de investigacion:\n"${researchQuestion}"\n\nEstructuracion PICOT:\n${JSON.stringify(picotData.picot, null, 2)}\n\nFormula las hipotesis de investigacion (H0 y H1).`
        );
        logMetrics('hypothesis-generator', hypResult);
        return { data: parseClaudeJSON(hypResult.text), metrics: { duration: hypResult.duration, tokensUsed: hypResult.tokensUsed } };
      })(),
      // Folder Organizer
      (async () => {
        const folderResult = await callClaude(
          PROMPTS.FOLDER_ORGANIZER,
          `Framework: ${picotData.framework}\nTipo de estudio: ${picotData.studyType || 'No especificado'}\n\nGenera la estructura de carpetas optima para este proyecto de investigacion.`
        );
        logMetrics('folder-organizer', folderResult);
        return { data: parseClaudeJSON(folderResult.text), metrics: { duration: folderResult.duration, tokensUsed: folderResult.tokensUsed } };
      })(),
    ]);

    if (hypothesisSettled.status === 'fulfilled') {
      results.hypothesis = hypothesisSettled.value;
      if (projectId) {
        try { await updatePhaseData(projectId, 'hypothesis', hypothesisSettled.value.data); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'hypothesis_save' }); }
      }
    } else {
      logError('hypothesis-generator', hypothesisSettled.reason);
      errors.push({ agent: 'hypothesis-generator', error: hypothesisSettled.reason?.message || 'failed' });
    }

    if (folderSettled.status === 'fulfilled') {
      results.folderOrganizer = folderSettled.value;
      if (projectId) {
        try { await updatePhaseData(projectId, 'folder_structure', folderSettled.value.data.folders); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'folder_save' }); }
      }
    } else {
      logError('folder-organizer', folderSettled.reason);
      errors.push({ agent: 'folder-organizer', error: folderSettled.reason?.message || 'failed' });
    }

    // ── Agent 7: Literature Scout ──
    checkTimeout('literature-scout');
    logAgent(AGENT_NAME, 'info', 'Running Literature Scout');
    let scoutData;
    try {
      const scoutResult = await callClaude(
        PROMPTS.LITERATURE_SCOUT,
        `Framework: ${picotData.framework}\n\nPICOT estructurado:\n${JSON.stringify(picotData.picot, null, 2)}\n\nGenera la estrategia de busqueda completa, mapeo de descriptores y criterios de inclusion/exclusion.`
      );
      logMetrics('literature-scout', scoutResult);
      scoutData = parseClaudeJSON(scoutResult.text);
      results.literatureScout = {
        data: scoutData,
        metrics: { duration: scoutResult.duration, tokensUsed: scoutResult.tokensUsed },
      };

      if (projectId) {
        try {
          await updatePhaseData(projectId, 'search_strategy', scoutData.searchStrategy);
          await updatePhaseData(projectId, 'descriptor_mapping', scoutData.descriptorMapping);
        } catch (dbErr) {
          logError(AGENT_NAME, dbErr, { context: 'scout_save' });
        }
      }
    } catch (err) {
      logError('literature-scout', err);
      errors.push({ agent: 'literature-scout', error: err.message });
    }

    // ── PubMed Search ──
    logAgent(AGENT_NAME, 'info', 'Running PubMed search');
    let pubmedResult;
    try {
      const pubmedQuery = scoutData?.searchStrategy?.pubmedEquation || researchQuestion;
      pubmedResult = await searchPubMed(pubmedQuery, 10);
      results.pubmed = {
        data: pubmedResult,
        metrics: { duration: 0 },
      };

      logAgent(AGENT_NAME, 'info', `PubMed returned ${pubmedResult.articles.length} articles`);
    } catch (err) {
      logError('pubmed-search', err);
      errors.push({ agent: 'pubmed-search', error: err.message });
    }

    // ── Agents 9+10: EQUATOR Checker + Quality Assessor (parallel) ──
    logAgent(AGENT_NAME, 'info', 'Running EQUATOR Checker + Quality Assessor in parallel');

    const parallelPost = [];

    // EQUATOR Checker
    parallelPost.push(
      (async () => {
        const eqResult = await callClaude(
          PROMPTS.EQUATOR_CHECKER,
          `Framework: ${picotData.framework}\nTipo de estudio: ${picotData.studyType || 'No especificado'}\n\nIdentifica las guias EQUATOR aplicables y evalua el cumplimiento inicial.`
        );
        logMetrics('equator-checker', eqResult);
        return { data: parseClaudeJSON(eqResult.text), metrics: { duration: eqResult.duration, tokensUsed: eqResult.tokensUsed } };
      })()
    );

    // Quality Assessor (only if we have articles)
    const articles = pubmedResult?.articles || [];
    if (articles.length > 0) {
      parallelPost.push(
        (async () => {
          const articleSummaries = articles.slice(0, 10).map((a) => ({
            pmid: a.pmid || '', title: a.title || '', authors: (a.authors || []).join(', '),
            year: a.year || '', abstract: (a.abstract || '').slice(0, 500),
          }));
          const qaResult = await callClaude(
            PROMPTS.QUALITY_ASSESSOR,
            `Articulos a evaluar:\n${JSON.stringify(articleSummaries, null, 2)}\n\nEvalua la calidad metodologica y riesgo de sesgo de cada articulo.`
          );
          logMetrics('quality-assessor', qaResult);
          return { data: parseClaudeJSON(qaResult.text), metrics: { duration: qaResult.duration, tokensUsed: qaResult.tokensUsed } };
        })()
      );
    }

    const postSettled = await Promise.allSettled(parallelPost);

    // EQUATOR result
    if (postSettled[0]?.status === 'fulfilled') {
      results.equatorChecker = postSettled[0].value;
      if (projectId) {
        try { await updatePhaseData(projectId, 'equator_checklist', postSettled[0].value.data.checklist); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'equator_save' }); }
      }
    } else {
      logError('equator-checker', postSettled[0]?.reason);
      errors.push({ agent: 'equator-checker', error: postSettled[0]?.reason?.message || 'failed' });
    }

    // Quality Assessor result
    if (postSettled[1]?.status === 'fulfilled') {
      results.qualityAssessor = postSettled[1].value;
      if (projectId) {
        try { await updatePhaseData(projectId, 'quality_assessments', postSettled[1].value.data.assessments); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'quality_save' }); }
      }
    } else if (articles.length > 0) {
      logError('quality-assessor', postSettled[1]?.reason);
      errors.push({ agent: 'quality-assessor', error: postSettled[1]?.reason?.message || 'failed' });
    }

    // ── Agent 11: Stats Agent ──
    logAgent(AGENT_NAME, 'info', 'Running Stats Agent');
    let statsData;
    const extractionForStats = pubmedResult?.articles?.map((a) => ({
      autor: (a.authors?.[0] || 'N/A') + (a.authors?.length > 1 ? ' et al.' : ''),
      anio: parseInt(a.year) || 0,
      titulo: a.title || '',
      pmid: a.pmid || '',
      n: '',
    })) || [];

    if (extractionForStats.length > 0) {
      try {
        const statsResult = await callClaude(
          PROMPTS.STATS_AGENT,
          `Tipo de estudio: ${picotData.studyType || 'No especificado'}\n\nPICOT:\n${JSON.stringify(picotData.picot, null, 2)}\n\nTabla de extraccion (${extractionForStats.length} estudios):\n${JSON.stringify(extractionForStats, null, 2)}\n\nCalcula las estadisticas pooled, heterogeneidad y estadisticas descriptivas.`
        );
        logMetrics('stats-agent', statsResult);
        statsData = parseClaudeJSON(statsResult.text);
        results.stats = {
          data: statsData,
          metrics: { duration: statsResult.duration, tokensUsed: statsResult.tokensUsed },
        };

        if (projectId) {
          try { await updatePhaseData(projectId, 'stats', statsData); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'stats_save' }); }
        }
      } catch (err) {
        logError('stats-agent', err);
        errors.push({ agent: 'stats-agent', error: err.message });
      }
    }

    // ── Agents 12+13: Protocol Writer + Manuscript Writer (parallel) ──
    checkTimeout('writers');
    logAgent(AGENT_NAME, 'info', 'Running Protocol Writer + Manuscript Writer in parallel');

    // Gather all context for writers
    const writerContext = {
      pregunta: researchQuestion,
      framework: picotData.framework,
      tipo_estudio: picotData.studyType || '',
      picot: picotData.picot,
      planteamiento: (results.planteamiento?.data?.planteamiento || '').slice(0, 1000),
      hipotesis: results.hypothesis?.data || {},
      estrategia_busqueda: results.literatureScout?.data?.searchStrategy || {},
      criterios: results.literatureScout?.data?.criteriaDesigner || {},
      tabla_extraccion: extractionForStats.slice(0, 15),
      estadisticas: statsData || {},
      equator: results.equatorChecker?.data?.checklist || [],
    };

    const [protocolSettled, manuscriptSettled] = await Promise.allSettled([
      (async () => {
        const protResult = await callClaude(
          PROMPTS.PROTOCOL_WRITER,
          `Datos del proyecto de investigacion:\n${JSON.stringify(writerContext, null, 2)}\n\nRedacta el protocolo de investigacion completo.`
        );
        logMetrics('protocol-writer', protResult);
        return { data: parseClaudeJSON(protResult.text), metrics: { duration: protResult.duration, tokensUsed: protResult.tokensUsed } };
      })(),
      (async () => {
        const msResult = await callClaude(
          PROMPTS.MANUSCRIPT_WRITER,
          `Datos completos del proyecto de investigacion:\n${JSON.stringify(writerContext, null, 2)}\n\nRedacta el manuscrito cientifico completo en formato IMRaD.`
        );
        logMetrics('manuscript-writer', msResult);
        return { data: parseClaudeJSON(msResult.text), metrics: { duration: msResult.duration, tokensUsed: msResult.tokensUsed } };
      })(),
    ]);

    if (protocolSettled.status === 'fulfilled') {
      results.protocolWriter = protocolSettled.value;
      if (projectId) {
        try { await updatePhaseData(projectId, 'protocol_draft', protocolSettled.value.data.protocol_draft); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'protocol_save' }); }
      }
    } else {
      logError('protocol-writer', protocolSettled.reason);
      errors.push({ agent: 'protocol-writer', error: protocolSettled.reason?.message || 'failed' });
    }

    if (manuscriptSettled.status === 'fulfilled') {
      results.manuscriptWriter = manuscriptSettled.value;
      if (projectId) {
        try { await updatePhaseData(projectId, 'manuscript', manuscriptSettled.value.data.manuscript); } catch (dbErr) { logError(AGENT_NAME, dbErr, { context: 'manuscript_save' }); }
      }
    } else {
      logError('manuscript-writer', manuscriptSettled.reason);
      errors.push({ agent: 'manuscript-writer', error: manuscriptSettled.reason?.message || 'failed' });
    }

    const totalDuration = Date.now() - totalStart;
    logAgent(AGENT_NAME, 'info', 'Orchestration complete', { totalDuration, errorCount: errors.length });

    return res.status(200).json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : undefined,
      totalDuration,
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({
      success: false,
      error: err.message,
      results,
      errors,
      totalDuration: Date.now() - totalStart,
    });
  }
}
