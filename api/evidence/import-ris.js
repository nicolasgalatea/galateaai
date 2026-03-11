import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'import-ris';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Parse RIS format text into unified article objects.
 * RIS tags: TY (type), TI (title), AU (author), DO (doi), AB (abstract),
 * JO/JF/T2 (journal), PY/Y1 (year), VL (volume), IS (issue), SP/EP (pages), KW (keywords)
 */
function parseRIS(text) {
  const articles = [];
  const entries = text.split(/\nER\s*-/);

  for (const entry of entries) {
    const lines = entry.split('\n');
    const record = {};
    const authors = [];
    const keywords = [];
    let currentTag = '';
    let currentValue = '';

    for (const line of lines) {
      const tagMatch = line.match(/^([A-Z][A-Z0-9])\s{2}-\s?(.*)/);
      if (tagMatch) {
        // Save previous tag
        if (currentTag === 'AU' || currentTag === 'A1') {
          authors.push(currentValue.trim());
        } else if (currentTag === 'KW') {
          keywords.push(currentValue.trim());
        } else if (currentTag && currentValue.trim()) {
          record[currentTag] = (record[currentTag] ? record[currentTag] + ' ' : '') + currentValue.trim();
        }
        currentTag = tagMatch[1];
        currentValue = tagMatch[2] || '';
      } else if (currentTag) {
        currentValue += ' ' + line.trim();
      }
    }
    // Save last tag
    if (currentTag === 'AU' || currentTag === 'A1') {
      authors.push(currentValue.trim());
    } else if (currentTag === 'KW') {
      keywords.push(currentValue.trim());
    } else if (currentTag && currentValue.trim()) {
      record[currentTag] = (record[currentTag] ? record[currentTag] + ' ' : '') + currentValue.trim();
    }

    const title = record.TI || record.T1 || '';
    if (!title) continue;

    const year = (record.PY || record.Y1 || '').replace(/[^0-9]/g, '').slice(0, 4);

    articles.push({
      title: title.trim(),
      authors: authors.filter(Boolean),
      year: year,
      doi: (record.DO || '').trim(),
      abstract: (record.AB || record.N2 || '').trim(),
      journal: (record.JO || record.JF || record.T2 || '').trim(),
      volume: (record.VL || '').trim(),
      issue: (record.IS || '').trim(),
      pages: [record.SP, record.EP].filter(Boolean).join('-'),
      keywords: keywords.filter(Boolean),
      source: 'EMBASE',
      pmid: (record.AN || '').trim(),
    });
  }

  return articles;
}

/**
 * Parse BibTeX format text into unified article objects.
 */
function parseBibTeX(text) {
  const articles = [];
  const entries = text.match(/@\w+\{[^@]*/g) || [];

  for (const entry of entries) {
    const typeMatch = entry.match(/@(\w+)\{/);
    if (!typeMatch) continue;

    const fields = {};
    const fieldRegex = /(\w+)\s*=\s*\{([^}]*)\}/g;
    let m;
    while ((m = fieldRegex.exec(entry)) !== null) {
      fields[m[1].toLowerCase()] = m[2].trim();
    }

    const title = fields.title || '';
    if (!title) continue;

    const authors = (fields.author || '').split(/\s+and\s+/).map(function(a) { return a.trim(); }).filter(Boolean);

    articles.push({
      title,
      authors,
      year: (fields.year || '').trim(),
      doi: (fields.doi || '').trim(),
      abstract: (fields.abstract || '').trim(),
      journal: (fields.journal || '').trim(),
      volume: (fields.volume || '').trim(),
      issue: (fields.number || '').trim(),
      pages: (fields.pages || '').replace('--', '-'),
      keywords: (fields.keywords || '').split(/[,;]/).map(function(k) { return k.trim(); }).filter(Boolean),
      source: 'EMBASE',
      pmid: (fields.pmid || '').trim(),
    });
  }

  return articles;
}

/**
 * Detect format and parse accordingly
 */
function parseFile(text) {
  const trimmed = text.trim();
  if (trimmed.match(/^TY\s{2}-/m)) {
    return { format: 'RIS', articles: parseRIS(trimmed) };
  }
  if (trimmed.match(/^@\w+\{/m)) {
    return { format: 'BibTeX', articles: parseBibTeX(trimmed) };
  }
  throw new Error('Formato no reconocido. Se esperaba RIS o BibTeX.');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { text, sourceName } = req.body || {};

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing file text content' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Parsing import file', { length: text.length });
    const start = Date.now();

    const result = parseFile(text);

    // Allow custom source name
    if (sourceName) {
      result.articles.forEach(function(a) { a.source = sourceName; });
    }

    const duration = Date.now() - start;
    logAgent(AGENT_NAME, 'info', 'Parse complete', { format: result.format, count: result.articles.length, duration });

    return res.status(200).json({
      success: true,
      data: {
        format: result.format,
        count: result.articles.length,
        articles: result.articles,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
