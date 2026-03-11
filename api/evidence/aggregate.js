import { callClaude } from '../_utils/anthropic-client.js';
import { logAgent, logError } from '../_utils/logger.js';

const AGENT_NAME = 'evidence-aggregator';
const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Real PubMed search — returns count + top articles
 */
async function searchPubMed(equation, maxResults = 20) {
  const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(equation)}&retmax=${maxResults}&retmode=json&sort=relevance`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed esearch failed: ${response.status}`);
  const data = await response.json();
  const result = data.esearchresult;
  return {
    count: parseInt(result.count, 10),
    pmids: result.idlist || [],
  };
}

/**
 * Fetch article metadata from PubMed
 */
async function fetchArticles(pmids) {
  if (!pmids.length) return [];
  const url = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed efetch failed: ${response.status}`);
  const xml = await response.text();

  const articles = [];
  const blocks = xml.split('<PubmedArticle>').slice(1);
  for (const block of blocks) {
    try {
      const pmid = extractTag(block, 'PMID');
      const title = cleanXML(extractTag(block, 'ArticleTitle'));
      const journal = cleanXML(extractTag(block, 'Title') || extractTag(block, 'ISOAbbreviation'));
      const year = extractTag(block, 'Year');
      const doi = (block.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/) || [])[1] || '';
      const authors = [];
      const authorRegex = /<Author[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<Initials>([^<]+)<\/Initials>[\s\S]*?<\/Author>/g;
      let m;
      while ((m = authorRegex.exec(block)) !== null && authors.length < 5) {
        authors.push(`${m[1]} ${m[2]}`);
      }
      // Enriched metadata
      const publicationTypes = extractAllTags(block, 'PublicationType');
      const meshTerms = extractAllTags(block, 'DescriptorName');
      const keywords = extractAllTags(block, 'Keyword');
      const country = cleanXML(extractTag(block, 'Country'));
      const grantAgencies = extractAllTags(block, 'Agency');
      const coiStatement = cleanXML(extractTag(block, 'CoiStatement'));
      articles.push({ pmid, title, authors, journal, year, doi, publicationTypes, meshTerms, keywords, country, funding: grantAgencies, coiStatement });
    } catch { /* skip malformed */ }
  }
  return articles;
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : '';
}

function cleanXML(text) {
  return (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function extractAllTags(xml, tag) {
  const results = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g');
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const val = m[1].trim().replace(/<[^>]+>/g, '');
    if (val && !results.includes(val)) results.push(val);
  }
  return results;
}

/**
 * Adapt PubMed equation to plain text for Cochrane
 */
function adaptEquationForCochrane(pubmedEquation) {
  return pubmedEquation
    .replace(/\[MeSH\]/gi, '')
    .replace(/\[MeSH Terms\]/gi, '')
    .replace(/\[tiab\]/gi, '')
    .replace(/\[Title\/Abstract\]/gi, '')
    .replace(/\[Journal\]/gi, '')
    .replace(/\[pt\]/gi, '')
    .replace(/\[sb\]/gi, '')
    .replace(/\[dp\]/gi, '')
    .replace(/\[Majr\]/gi, '')
    .replace(/\[tw\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search Cochrane reviews indexed in PubMed.
 * PubMed indexes all Cochrane Database of Systematic Reviews articles.
 * Filter: "Cochrane Database Syst Rev"[Journal]
 * This gives us a REAL count of Cochrane reviews via NCBI's public API.
 */
async function searchCochraneCENTRAL(cochraneQuery) {
  try {
    const centralQuery = `(${cochraneQuery}) AND "Cochrane Database Syst Rev"[Journal]`;
    const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(centralQuery)}&retmax=0&retmode=json`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const count = parseInt(data.esearchresult?.count, 10);

    if (isNaN(count)) return null;

    return { count, query: cochraneQuery, source: 'cochrane-central-via-pubmed' };
  } catch (err) {
    logAgent(AGENT_NAME, 'warn', `Cochrane CENTRAL via PubMed failed: ${err.message}`);
    return null;
  }
}

/**
 * Try direct Cochrane Library website search
 */
async function searchCochraneWeb(cochraneQuery) {
  try {
    const url = `https://www.cochranelibrary.com/en/search?q=${encodeURIComponent(cochraneQuery)}&p=0&ps=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    const countMatch = html.match(/search-results-section-body[\s\S]*?(\d[\d,]+)\s*results?/i)
      || html.match(/"resultCount"\s*:\s*(\d+)/i)
      || html.match(/Results\s*\((\d[\d,]*)\)/i)
      || html.match(/(\d[\d,]+)\s*results?\s*found/i)
      || html.match(/(\d[\d,]+)\s*results?\s*for/i);

    if (!countMatch) return null;

    const count = parseInt(countMatch[1].replace(/,/g, ''), 10);
    return { count, query: cochraneQuery, source: 'cochrane-web' };
  } catch (err) {
    logAgent(AGENT_NAME, 'warn', `Cochrane web search failed: ${err.message}`);
    return null;
  }
}

/**
 * Search Cochrane — tries multiple strategies:
 * 1. Direct Cochrane Library website
 * 2. Cochrane CENTRAL subset via PubMed API (reliable fallback)
 */
async function searchCochrane(pubmedEquation) {
  const cochraneQuery = adaptEquationForCochrane(pubmedEquation);

  // Try both in parallel — use whichever succeeds
  const [webResult, centralResult] = await Promise.all([
    searchCochraneWeb(cochraneQuery),
    searchCochraneCENTRAL(cochraneQuery),
  ]);

  // Prefer direct web (full Cochrane Library count), fallback to CENTRAL via PubMed
  if (webResult) {
    logAgent(AGENT_NAME, 'info', `Cochrane web: ${webResult.count} results`);
    return webResult;
  }
  if (centralResult) {
    logAgent(AGENT_NAME, 'info', `Cochrane CENTRAL via PubMed: ${centralResult.count} results`);
    return centralResult;
  }

  return null;
}

/**
 * Search LILACS via BVS/BIREME official API (requires BVS_API_KEY)
 */
async function searchLILACSApi(lilacsQuery) {
  const apiKey = process.env.BVS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://api.bvsalud.org/bibliographic/v1/search/?q=${encodeURIComponent(lilacsQuery)}&format=json&count=1`;

    const response = await fetch(url, {
      headers: { 'apikey': apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      logAgent(AGENT_NAME, 'warn', `LILACS API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const count = parseInt(data.response?.numFound ?? data.diapiServerResponse?.[0]?.response?.numFound, 10);

    if (isNaN(count)) {
      logAgent(AGENT_NAME, 'warn', 'LILACS API: could not parse count from response');
      return null;
    }

    return { count, query: lilacsQuery, source: 'lilacs-bvs-api' };
  } catch (err) {
    logAgent(AGENT_NAME, 'warn', `LILACS API search failed: ${err.message}`);
    return null;
  }
}

/**
 * Search LILACS via BVS web portal scraping (no API key needed)
 * Uses pesquisa.bvsalud.org which returns result count in HTML/JSON
 */
async function searchLILACSWeb(lilacsQuery) {
  try {
    // BVS portal search — filter by LILACS database (db:LILACS)
    const url = `https://pesquisa.bvsalud.org/portal/?output=json&lang=en&q=${encodeURIComponent(lilacsQuery)}&filter%5Bdb%5D%5B%5D=LILACS&count=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/html,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8,pt;q=0.7',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      logAgent(AGENT_NAME, 'warn', `LILACS web returned ${response.status}`);
      return null;
    }

    const text = await response.text();
    let count = null;

    // Strategy 1: JSON response (output=json)
    try {
      const json = JSON.parse(text);
      count = parseInt(json.response?.numFound ?? json.diapiServerResponse?.[0]?.response?.numFound, 10);
    } catch { /* not JSON, try HTML parsing */ }

    // Strategy 2: HTML scraping — look for result count patterns
    if (count == null || isNaN(count)) {
      const patterns = [
        /totalFound["\s:]+(\d+)/i,
        /"numFound":\s*(\d+)/i,
        /(\d[\d.,]+)\s*results?\s*found/i,
        /(\d[\d.,]+)\s*resultado/i,
        /resultCount["\s:]+(\d+)/i,
        /Total:\s*(\d[\d.,]*)/i,
      ];
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          count = parseInt(match[1].replace(/[.,]/g, ''), 10);
          break;
        }
      }
    }

    if (count == null || isNaN(count)) {
      logAgent(AGENT_NAME, 'warn', 'LILACS web: could not parse count from response');
      return null;
    }

    return { count, query: lilacsQuery, source: 'lilacs-bvs-web' };
  } catch (err) {
    logAgent(AGENT_NAME, 'warn', `LILACS web search failed: ${err.message}`);
    return null;
  }
}

/**
 * Search LILACS — tries multiple strategies:
 * 1. Official BVS API (if API key configured)
 * 2. BVS web portal scraping (no key needed — works today)
 */
async function searchLILACS(pubmedEquation) {
  const lilacsQuery = adaptEquationForCochrane(pubmedEquation);

  // Try both in parallel — prefer API, fallback to web scraping
  const [apiResult, webResult] = await Promise.all([
    searchLILACSApi(lilacsQuery),
    searchLILACSWeb(lilacsQuery),
  ]);

  if (apiResult) {
    logAgent(AGENT_NAME, 'info', `LILACS API: ${apiResult.count} results`);
    return apiResult;
  }
  if (webResult) {
    logAgent(AGENT_NAME, 'info', `LILACS web scraping: ${webResult.count} results`);
    return webResult;
  }

  return null;
}

/**
 * Search ClinicalTrials.gov API v2 (free, no key required)
 */
async function searchClinicalTrials(pubmedEquation) {
  const query = adaptEquationForCochrane(pubmedEquation);
  try {
    const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(query)}&pageSize=5&format=json`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const totalCount = data.totalCount || 0;

    const studies = (data.studies || []).map(function(study) {
      const proto = study.protocolSection || {};
      const id = proto.identificationModule || {};
      const status = proto.statusModule || {};
      return {
        nctId: id.nctId || '',
        title: id.officialTitle || id.briefTitle || '',
        status: (status.overallStatus || ''),
      };
    });

    return { count: totalCount, studies, query, source: 'clinicaltrials-gov-api' };
  } catch (err) {
    logAgent(AGENT_NAME, 'warn', `ClinicalTrials.gov search failed: ${err.message}`);
    return null;
  }
}

/**
 * Use Claude to estimate other databases + generate translated equations
 * Only estimates databases not already searched directly.
 * NOTE: EMBASE is excluded — users import via RIS/BibTeX instead.
 */
async function estimateOtherDatabases(pubmedEquation, pubmedCount, picot, cochraneRealCount, lilacsRealCount) {
  const cochraneContext = cochraneRealCount != null
    ? `\nNOTA: Cochrane Library ya fue buscada directamente y retorno ${cochraneRealCount} resultados reales.`
    : `\nNOTA: No se pudo obtener datos reales de Cochrane. Estima tambien Cochrane.`;

  const lilacsContext = lilacsRealCount != null
    ? `\nNOTA: LILACS ya fue buscada directamente via API BVS y retorno ${lilacsRealCount} resultados reales.`
    : `\nNOTA: No se pudo obtener datos reales de LILACS. Estima tambien LILACS.`;

  // Determine which databases need estimation
  const needCochrane = cochraneRealCount == null;
  const needLILACS = lilacsRealCount == null;
  const dbsToEstimate = [
    needCochrane ? 'Cochrane Library' : null,
    needLILACS ? 'LILACS' : null,
    'Scopus',
  ].filter(Boolean).join(', ');

  // Build equation instructions
  const eqInstructions = [
    needCochrane ? '   - Cochrane: usa sintaxis Cochrane (MeSH descriptor, ti,ab,kw)' : null,
    needLILACS ? '   - LILACS: TRADUCE a espanol/portugues usando DeCS, sintaxis iAH' : null,
    '   - Scopus: usa TITLE-ABS-KEY()',
  ].filter(Boolean).join('\n');

  // Build JSON schema for response
  const jsonFields = [];
  if (needCochrane) {
    jsonFields.push(`  "cochrane": {
    "equation": "<ecuacion adaptada para Cochrane>",
    "estimatedCount": <numero>,
    "rationale": "<breve justificacion de la estimacion>"
  }`);
  }
  if (needLILACS) {
    jsonFields.push(`  "lilacs": {
    "equation": "<ecuacion en espanol/portugues con DeCS>",
    "estimatedCount": <numero>,
    "rationale": "<breve justificacion>"
  }`);
  }
  jsonFields.push(`  "scopus": {
    "equation": "<ecuacion TITLE-ABS-KEY para Scopus>",
    "estimatedCount": <numero>,
    "rationale": "<breve justificacion>"
  }`);

  const prompt = `Eres un bibliotecario medico experto. Basandote en una ecuacion de busqueda PubMed y su conteo real de resultados, debes:

1. ESTIMAR cuantos resultados encontrarian las mismas palabras clave en ${dbsToEstimate}.
2. GENERAR la ecuacion de busqueda REAL adaptada para cada base de datos:
${eqInstructions}
3. Basa la estimacion en la densidad de la tematica y la cobertura conocida de cada base.
${cochraneContext}${lilacsContext}

DATOS:
- Ecuacion PubMed: ${pubmedEquation}
- Resultados reales PubMed: ${pubmedCount}
- PICOT: ${JSON.stringify(picot)}

RESPONDE SOLO en JSON valido:
{
${jsonFields.join(',\n')}
}`;

  const result = await callClaude(
    'Eres un bibliotecario medico experto en busquedas sistematicas multi-base. Responde SOLO en JSON valido.',
    prompt,
    { temperature: 0.2, max_tokens: 1500 }
  );

  const cleaned = result.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return { data: JSON.parse(cleaned), metrics: result };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { equation, picot, maxResults = 20 } = req.body || {};

  if (!equation) {
    return res.status(400).json({ success: false, error: 'Missing equation' });
  }

  const progress = [];
  const start = Date.now();

  try {
    // ── Step 1: PubMed real search ──
    logAgent(AGENT_NAME, 'info', 'Step 1: PubMed real search', { equation: equation.slice(0, 100) });
    const pubmedSearch = await searchPubMed(equation, maxResults);
    progress.push({ db: 'PubMed/MEDLINE', status: 'complete', real: true });

    await sleep(350); // NCBI rate limit

    // ── Step 2: Fetch article metadata ──
    logAgent(AGENT_NAME, 'info', `Step 2: Fetching ${pubmedSearch.pmids.length} articles`);
    const articles = await fetchArticles(pubmedSearch.pmids);
    progress.push({ db: 'PubMed/MEDLINE', status: 'articles_fetched', count: articles.length });

    // ── Step 2.5: Cochrane real search ──
    logAgent(AGENT_NAME, 'info', 'Step 2.5: Cochrane real search');
    let cochraneResult = null;
    try {
      cochraneResult = await searchCochrane(equation);
      if (cochraneResult) {
        logAgent(AGENT_NAME, 'info', `Cochrane real count: ${cochraneResult.count}`);
        progress.push({ db: 'Cochrane Library', status: 'complete', real: true });
      } else {
        logAgent(AGENT_NAME, 'warn', 'Cochrane search returned null, will use Claude estimation');
        progress.push({ db: 'Cochrane Library', status: 'fallback_to_estimation' });
      }
    } catch (cochErr) {
      logAgent(AGENT_NAME, 'warn', `Cochrane search error: ${cochErr.message}`);
      progress.push({ db: 'Cochrane Library', status: 'fallback_to_estimation', error: cochErr.message });
    }

    // ── Step 2.6: LILACS real search ──
    logAgent(AGENT_NAME, 'info', 'Step 2.6: LILACS real search');
    let lilacsResult = null;
    try {
      lilacsResult = await searchLILACS(equation);
      if (lilacsResult) {
        logAgent(AGENT_NAME, 'info', `LILACS real count: ${lilacsResult.count} (via ${lilacsResult.source})`);
        progress.push({ db: 'LILACS', status: 'complete', real: true, source: lilacsResult.source });
      } else {
        logAgent(AGENT_NAME, 'warn', 'LILACS search returned null, will use Claude estimation');
        progress.push({ db: 'LILACS', status: 'fallback_to_estimation' });
      }
    } catch (lilacsErr) {
      logAgent(AGENT_NAME, 'warn', `LILACS search error: ${lilacsErr.message}`);
      progress.push({ db: 'LILACS', status: 'fallback_to_estimation', error: lilacsErr.message });
    }

    // ── Step 2.7: ClinicalTrials.gov real search ──
    logAgent(AGENT_NAME, 'info', 'Step 2.7: ClinicalTrials.gov real search');
    let ctResult = null;
    try {
      ctResult = await searchClinicalTrials(equation);
      if (ctResult) {
        logAgent(AGENT_NAME, 'info', `ClinicalTrials.gov real count: ${ctResult.count}`);
        progress.push({ db: 'ClinicalTrials.gov', status: 'complete', real: true });
      } else {
        logAgent(AGENT_NAME, 'warn', 'ClinicalTrials.gov search returned null');
        progress.push({ db: 'ClinicalTrials.gov', status: 'failed' });
      }
    } catch (ctErr) {
      logAgent(AGENT_NAME, 'warn', `ClinicalTrials.gov search error: ${ctErr.message}`);
      progress.push({ db: 'ClinicalTrials.gov', status: 'failed', error: ctErr.message });
    }

    // ── Step 3: Claude estimates remaining databases ──
    const cochraneRealCount = cochraneResult ? cochraneResult.count : null;
    const lilacsRealCount = lilacsResult ? lilacsResult.count : null;
    const estimatingDbs = [
      !cochraneResult ? 'Cochrane' : null,
      !lilacsResult ? 'LILACS' : null,
      'Scopus',
    ].filter(Boolean).join('/');
    logAgent(AGENT_NAME, 'info', `Step 3: Claude estimating ${estimatingDbs}`);
    let estimates = null;
    let claudeMetrics = null;
    try {
      const estResult = await estimateOtherDatabases(equation, pubmedSearch.count, picot || {}, cochraneRealCount, lilacsRealCount);
      estimates = estResult.data;
      claudeMetrics = { duration: estResult.metrics.duration, tokens: estResult.metrics.tokensUsed };
      progress.push({ db: estimatingDbs, status: 'estimated' });
    } catch (estErr) {
      logError(AGENT_NAME, estErr, { context: 'claude_estimation' });
      progress.push({ db: estimatingDbs, status: 'estimation_failed', error: estErr.message });
    }

    const duration = Date.now() - start;

    // ── Build response ──
    const databases = [
      {
        database: 'PubMed/MEDLINE',
        real: true,
        count: pubmedSearch.count,
        included: articles.length,
        equation: equation,
        color: 'blue',
      },
    ];

    // Cochrane: use real data if available, otherwise fallback to estimation
    if (cochraneResult) {
      databases.push({
        database: 'Cochrane Library',
        real: true,
        count: cochraneResult.count,
        included: 0,
        equation: cochraneResult.query,
        color: 'indigo',
      });
    } else if (estimates && estimates.cochrane) {
      databases.push({
        database: 'Cochrane Library',
        real: false,
        count: estimates.cochrane.estimatedCount,
        included: Math.round(estimates.cochrane.estimatedCount * 0.15),
        equation: estimates.cochrane.equation,
        rationale: estimates.cochrane.rationale,
        color: 'indigo',
      });
    }

    // LILACS: use real data if available, otherwise fallback to estimation
    if (lilacsResult) {
      databases.push({
        database: 'LILACS',
        real: true,
        count: lilacsResult.count,
        included: 0,
        equation: lilacsResult.query,
        source: lilacsResult.source,
        color: 'green',
      });
    } else if (estimates && estimates.lilacs) {
      databases.push({
        database: 'LILACS',
        real: false,
        count: estimates.lilacs.estimatedCount,
        included: Math.round(estimates.lilacs.estimatedCount * 0.1),
        equation: estimates.lilacs.equation,
        rationale: estimates.lilacs.rationale,
        color: 'green',
      });
    }

    // ClinicalTrials.gov: real data
    if (ctResult) {
      databases.push({
        database: 'ClinicalTrials.gov',
        real: true,
        count: ctResult.count,
        included: (ctResult.studies || []).length,
        equation: ctResult.query,
        color: 'teal',
      });
    }

    // Scopus: always estimated by Claude
    if (estimates && estimates.scopus) {
      databases.push({
        database: 'Scopus',
        real: false,
        count: estimates.scopus.estimatedCount,
        included: Math.round(estimates.scopus.estimatedCount * 0.12),
        equation: estimates.scopus.equation,
        rationale: estimates.scopus.rationale,
        color: 'amber',
      });
    }

    const totalIdentified = databases.reduce((sum, db) => sum + db.count, 0);

    logAgent(AGENT_NAME, 'info', 'Aggregation complete', { totalIdentified, duration });

    return res.status(200).json({
      success: true,
      data: {
        databases,
        articles,
        totalIdentified,
        prisma: {
          identified: totalIdentified,
          duplicates_removed: 0,
          screened_title: totalIdentified,
          excluded_title: totalIdentified - articles.length,
          screened_fulltext: articles.length,
          excluded_fulltext: 0,
          quality_assessed: articles.length,
          excluded_quality: 0,
          included_qualitative: articles.length,
          included_quantitative: articles.length,
        },
      },
      metrics: {
        duration,
        pubmedReal: true,
        claudeEstimation: claudeMetrics,
        progress,
      },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({
      success: false,
      error: err.message,
      progress,
      partialDuration: Date.now() - start,
    });
  }
}
