const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

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

  const { query } = req.body || {};

  if (!query) {
    return res.status(400).json({ success: false, error: 'Missing query' });
  }

  const results = {};

  // Strategy 1: Direct Cochrane Library website
  try {
    const url = `https://www.cochranelibrary.com/en/search?q=${encodeURIComponent(query)}&p=0&ps=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) {
      const html = await response.text();
      const countMatch = html.match(/search-results-section-body[\s\S]*?(\d[\d,]+)\s*results?/i)
        || html.match(/"resultCount"\s*:\s*(\d+)/i)
        || html.match(/Results\s*\((\d[\d,]*)\)/i)
        || html.match(/(\d[\d,]+)\s*results?\s*found/i);

      if (countMatch) {
        results.web = { count: parseInt(countMatch[1].replace(/,/g, ''), 10), source: 'cochrane-web' };
      } else {
        results.web = { error: 'Could not parse count from HTML' };
      }
    } else {
      results.web = { error: `HTTP ${response.status}` };
    }
  } catch (err) {
    results.web = { error: err.message };
  }

  // Strategy 2: Cochrane CENTRAL via PubMed
  try {
    const centralQuery = `(${query}) AND "Cochrane Database Syst Rev"[Journal]`;
    const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(centralQuery)}&retmax=0&retmode=json`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (response.ok) {
      const data = await response.json();
      const count = parseInt(data.esearchresult?.count, 10);
      results.central = { count, source: 'cochrane-central-via-pubmed', query: centralQuery };
    } else {
      results.central = { error: `HTTP ${response.status}` };
    }
  } catch (err) {
    results.central = { error: err.message };
  }

  // Pick best result
  const best = results.web?.count != null ? results.web
    : results.central?.count != null ? results.central
    : null;

  return res.status(200).json({
    success: best != null,
    count: best?.count ?? null,
    source: best?.source ?? null,
    query,
    strategies: results,
  });
}
