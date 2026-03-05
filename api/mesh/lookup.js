import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'mesh-decs-lookup';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const MESH_LOOKUP_URL = 'https://id.nlm.nih.gov/mesh/lookup/descriptor';
const MESH_SUGGEST_URL = 'https://id.nlm.nih.gov/mesh/lookup/term';
const DECS_BASE_URL = 'https://api.bvsalud.org/decs/v2/search-by-words';

/**
 * Search NLM MeSH descriptors
 */
async function searchMeSH(query, limit = 10) {
  const url = `${MESH_LOOKUP_URL}?label=${encodeURIComponent(query)}&match=contains&limit=${limit}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error(`MeSH lookup failed: ${response.status}`);
  const data = await response.json();
  // Response is an array of { resource, label }
  return (Array.isArray(data) ? data : []).map(item => ({
    label: item.label,
    uri: item.resource,
    meshId: item.resource ? item.resource.split('/').pop() : '',
    source: 'MeSH',
  }));
}

/**
 * Search MeSH terms (broader search including synonyms/entry terms)
 */
async function suggestMeSH(query, limit = 10) {
  const url = `${MESH_SUGGEST_URL}?label=${encodeURIComponent(query)}&match=contains&limit=${limit}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) throw new Error(`MeSH suggest failed: ${response.status}`);
  const data = await response.json();
  return (Array.isArray(data) ? data : []).map(item => ({
    label: item.label,
    uri: item.resource,
    meshId: item.resource ? item.resource.split('/').pop() : '',
    source: 'MeSH',
  }));
}

/**
 * Get MeSH descriptor details (Spanish translation, tree numbers, etc.)
 */
async function getMeSHDetails(meshId) {
  const url = `https://id.nlm.nih.gov/mesh/${meshId}.json`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data;
}

/**
 * Try to get DeCS (Spanish) equivalent via BVS API
 * Falls back gracefully if API key is not available
 */
async function searchDeCS(query, lang = 'es') {
  try {
    // Try the public DeCS search endpoint
    const url = `${DECS_BASE_URL}?words=${encodeURIComponent(query)}&lang=${lang}&format=json`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    // DeCS response structure varies — try to extract terms
    if (Array.isArray(data)) {
      return data.map(item => ({
        label: item.descriptor || item.label || item.term || '',
        decsId: item.decs_code || item.id || '',
        source: 'DeCS',
      })).filter(item => item.label);
    }
    return [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { query, type = 'search', limit = 10, meshId } = req.body || {};

  if (!query && type !== 'details') {
    return res.status(400).json({ success: false, error: 'Missing query' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Lookup request', { query, type });
    const start = Date.now();

    let results = {};

    if (type === 'search' || type === 'suggest') {
      // Search MeSH descriptors
      const meshResults = await searchMeSH(query, limit);

      // Also try broader term search for more results
      let meshTerms = [];
      if (meshResults.length < 3) {
        meshTerms = await suggestMeSH(query, limit);
      }

      // Try DeCS search (Spanish)
      const decsResults = await searchDeCS(query, 'es');
      // Also try English DeCS
      const decsResultsEn = query !== query.toLowerCase()
        ? await searchDeCS(query, 'en')
        : [];

      results = {
        mesh: meshResults,
        meshTerms: meshTerms,
        decs: [...decsResults, ...decsResultsEn].filter(
          (item, idx, arr) => arr.findIndex(x => x.label === item.label) === idx
        ),
      };
    } else if (type === 'details' && meshId) {
      const details = await getMeSHDetails(meshId);
      results = { details };
    }

    const duration = Date.now() - start;
    logAgent(AGENT_NAME, 'info', 'Lookup complete', { duration, meshCount: results.mesh?.length || 0 });

    return res.status(200).json({ success: true, data: results, metrics: { duration } });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
