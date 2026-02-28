import { callClaude } from './utils/anthropic-client.js';
import { updatePhaseData } from './utils/supabase-server.js';
import { logAgent, logError, logMetrics } from './utils/logger.js';
import { PROMPTS } from '../prompts/system-prompts.js';

const AGENT_NAME = 'orchestrator';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
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

  try {
    logAgent(AGENT_NAME, 'info', 'Starting orchestration', { projectId });

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

    // ── Agent 2: FINER Validator ──
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
      // Continue — FINER is not blocking
    }

    // ── Agent 3: Literature Scout ──
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
      // Continue — PubMed may still work with a fallback query
    }

    // ── PubMed Search ──
    logAgent(AGENT_NAME, 'info', 'Running PubMed search');
    try {
      const pubmedQuery = scoutData?.searchStrategy?.pubmedEquation || researchQuestion;
      const pubmedResult = await searchPubMed(pubmedQuery, 10);
      results.pubmed = {
        data: pubmedResult,
        metrics: { duration: 0 }, // timing not tracked separately here
      };

      logAgent(AGENT_NAME, 'info', `PubMed returned ${pubmedResult.articles.length} articles`);
    } catch (err) {
      logError('pubmed-search', err);
      errors.push({ agent: 'pubmed-search', error: err.message });
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
