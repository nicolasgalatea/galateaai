import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'deduplicator';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Normalize a title for comparison: lowercase, remove punctuation, remove stopwords, collapse whitespace
 */
function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\b(the|a|an|of|in|on|for|and|or|to|with|by|from|at|is|are|was|were|el|la|los|las|de|del|en|con|por|para|un|una|que|se|al|es|su|como|mas|pero|entre|sin|sobre|este|esta|estos|estas|o|y|e|u|no|si)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Simple string hash for fast comparison (no crypto needed)
 */
function titleHash(title) {
  const normalized = normalizeTitle(title);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

/**
 * Deduplicate an array of articles using 3-layer strategy:
 * 1. DOI exact match
 * 2. PMID exact match
 * 3. Normalized title hash + same year
 */
function deduplicateArticles(articles) {
  const unique = [];
  const duplicates = [];
  const seenDOIs = new Map();
  const seenPMIDs = new Map();
  const seenTitleHashes = new Map();

  for (const article of articles) {
    let isDuplicate = false;
    let reason = '';
    let keptArticle = null;

    // Layer 1: DOI exact match
    const doi = (article.doi || '').toLowerCase().trim();
    if (doi && doi.length > 5) {
      if (seenDOIs.has(doi)) {
        isDuplicate = true;
        reason = 'DOI match';
        keptArticle = seenDOIs.get(doi);
      } else {
        seenDOIs.set(doi, article);
      }
    }

    // Layer 2: PMID exact match
    if (!isDuplicate) {
      const pmid = (article.pmid || '').trim();
      if (pmid) {
        if (seenPMIDs.has(pmid)) {
          isDuplicate = true;
          reason = 'PMID match';
          keptArticle = seenPMIDs.get(pmid);
        } else {
          seenPMIDs.set(pmid, article);
        }
      }
    }

    // Layer 3: Normalized title hash + same year
    if (!isDuplicate) {
      const hash = titleHash(article.title);
      const year = (article.year || article.anio || '').toString();
      const key = hash + '_' + year;
      if (seenTitleHashes.has(key)) {
        isDuplicate = true;
        reason = 'Title+Year match';
        keptArticle = seenTitleHashes.get(key);
      } else {
        seenTitleHashes.set(key, article);
      }
    }

    if (isDuplicate) {
      duplicates.push({
        kept: keptArticle,
        removed: article,
        reason,
      });
    } else {
      unique.push(article);
    }
  }

  // Compute stats by source
  const bySource = {};
  for (const article of articles) {
    const src = article.source || article.database || 'unknown';
    bySource[src] = (bySource[src] || 0) + 1;
  }
  const dupByReason = {};
  for (const d of duplicates) {
    dupByReason[d.reason] = (dupByReason[d.reason] || 0) + 1;
  }

  return {
    unique,
    duplicates,
    stats: {
      total: articles.length,
      unique: unique.length,
      duplicated: duplicates.length,
      bySource,
      byReason: dupByReason,
    },
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { articles } = req.body || {};

  if (!Array.isArray(articles) || articles.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing or empty articles array' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Deduplicating articles', { count: articles.length });
    const start = Date.now();

    const result = deduplicateArticles(articles);

    const duration = Date.now() - start;
    logAgent(AGENT_NAME, 'info', 'Deduplication complete', { ...result.stats, duration });

    return res.status(200).json({
      success: true,
      data: result,
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
