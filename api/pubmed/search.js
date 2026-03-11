import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'pubmed-search';
const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Simple delay for rate limiting
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Step 1: esearch — get PMIDs matching the query
 */
async function searchPMIDs(query, maxResults = 20, filters = '') {
  const fullQuery = filters ? `${query} ${filters}` : query;
  const url = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(fullQuery)}&retmax=${maxResults}&retmode=json&sort=relevance`;

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
 * Step 2: efetch — get article metadata for PMIDs
 */
async function fetchArticles(pmids) {
  if (!pmids.length) return [];

  const url = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed efetch failed: ${response.status}`);

  const xml = await response.text();
  return parseArticlesXML(xml);
}

/**
 * Parse PubMed XML to extract article metadata
 */
function parseArticlesXML(xml) {
  const articles = [];
  const articleBlocks = xml.split('<PubmedArticle>').slice(1);

  for (const block of articleBlocks) {
    try {
      const pmid = extractTag(block, 'PMID');
      const title = extractTag(block, 'ArticleTitle');
      const abstractText = extractAbstract(block);
      const journal = extractTag(block, 'Title') || extractTag(block, 'ISOAbbreviation');
      const year = extractTag(block, 'Year');
      const doi = extractDOI(block);
      const authors = extractAuthors(block);

      // Enriched metadata
      const publicationTypes = extractAllTags(block, 'PublicationType');
      const meshTerms = extractAllTags(block, 'DescriptorName');
      const keywords = extractAllTags(block, 'Keyword');
      const country = extractTag(block, 'Country');
      const grantAgencies = extractAllTags(block, 'Agency');
      const coiStatement = cleanXML(extractTag(block, 'CoiStatement'));

      articles.push({
        pmid,
        title: cleanXML(title),
        authors,
        abstract: cleanXML(abstractText),
        journal: cleanXML(journal),
        year,
        doi,
        publicationTypes,
        meshTerms,
        keywords,
        country: cleanXML(country),
        funding: grantAgencies,
        coiStatement,
      });
    } catch {
      // Skip malformed articles
    }
  }

  return articles;
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

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : '';
}

function extractAbstract(xml) {
  const abstractMatch = xml.match(/<Abstract>([\s\S]*?)<\/Abstract>/);
  if (!abstractMatch) return '';
  // Concatenate all AbstractText elements
  const texts = [];
  const regex = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g;
  let match;
  while ((match = regex.exec(abstractMatch[1])) !== null) {
    texts.push(match[1].trim());
  }
  return texts.join(' ') || abstractMatch[1].replace(/<[^>]+>/g, '').trim();
}

function extractDOI(xml) {
  const match = xml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
  return match ? match[1].trim() : '';
}

function extractAuthors(xml) {
  const authors = [];
  const authorRegex = /<Author[^>]*>[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<Initials>([^<]+)<\/Initials>[\s\S]*?<\/Author>/g;
  let match;
  while ((match = authorRegex.exec(xml)) !== null) {
    authors.push(`${match[1]} ${match[2]}`);
    if (authors.length >= 5) break; // Limit to first 5 authors
  }
  return authors;
}

function cleanXML(text) {
  return (text || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { query, maxResults: rawMax = 20, filters = '' } = req.body || {};
  const maxResults = Math.min(Math.max(parseInt(rawMax, 10) || 20, 1), 100);

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing query' });
  }
  if (query.length > 2000) {
    return res.status(400).json({ success: false, error: 'Query too long (max 2000 chars)' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Starting PubMed search', { query: query.slice(0, 100), maxResults });

    const start = Date.now();

    // Step 1: Search for PMIDs
    const searchResult = await searchPMIDs(query, maxResults, filters);
    logAgent(AGENT_NAME, 'info', `Found ${searchResult.count} results, fetching ${searchResult.pmids.length} articles`);

    // Rate limit: wait 350ms before next request
    await sleep(350);

    // Step 2: Fetch article details
    const articles = await fetchArticles(searchResult.pmids);

    const duration = Date.now() - start;

    logAgent(AGENT_NAME, 'info', 'Search complete', { count: searchResult.count, fetched: articles.length, duration });

    return res.status(200).json({
      success: true,
      data: {
        count: searchResult.count,
        articles,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
