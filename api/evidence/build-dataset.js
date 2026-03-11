import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'dataset-builder';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Transform structured extractions into normalized dataset tables
 */
function buildDataset(extractions, articlesMeta) {
  const studiesTable = [];
  const outcomesTable = [];
  const interventionsTable = [];
  const metadataTable = [];

  const metaMap = {};
  if (Array.isArray(articlesMeta)) {
    articlesMeta.forEach(function(a) {
      if (a.pmid) metaMap[a.pmid] = a;
    });
  }

  Object.entries(extractions).forEach(function([studyId, ext]) {
    if (!ext) return;
    const meta = metaMap[studyId] || {};

    // Studies table
    const authorStr = Array.isArray(meta.authors)
      ? (meta.authors[0] || '') + (meta.authors.length > 1 ? ' et al.' : '')
      : (meta.autor || '');

    studiesTable.push({
      study_id: studyId,
      author: authorStr,
      year: meta.year || meta.anio || '',
      design: ext.studyDesign || '',
      country: (ext.population && ext.population.country) || meta.country || '',
      sample_size: (ext.population && ext.population.sampleSize) || null,
      funding: ext.funding || '',
      rob_overall: (ext.riskOfBias && ext.riskOfBias.overall) || '',
    });

    // Outcomes table
    const outcomes = ext.outcomes || [];
    outcomes.forEach(function(o) {
      // Parse CI if possible
      let ciLower = '', ciUpper = '';
      if (o.ci95) {
        const ciMatch = o.ci95.match(/([\d.-]+)\s*[-–to]+\s*([\d.-]+)/);
        if (ciMatch) {
          ciLower = ciMatch[1];
          ciUpper = ciMatch[2];
        }
      }
      outcomesTable.push({
        study_id: studyId,
        outcome_name: o.name || '',
        type: o.type || 'other',
        measure: o.measure || '',
        effect_size: o.effectSize || '',
        ci_lower: ciLower,
        ci_upper: ciUpper,
        p_value: o.pValue || '',
      });
    });

    // Interventions table
    interventionsTable.push({
      study_id: studyId,
      intervention_name: (ext.intervention && ext.intervention.name) || '',
      dose: (ext.intervention && ext.intervention.dose) || '',
      duration: (ext.intervention && ext.intervention.duration) || '',
      comparator_name: (ext.comparator && ext.comparator.name) || '',
    });

    // Metadata table
    metadataTable.push({
      study_id: studyId,
      keywords: (meta.keywords || []).join('; '),
      mesh_terms: (meta.meshTerms || []).join('; '),
      journal: meta.journal || '',
      doi: meta.doi || '',
      publication_type: (meta.publicationTypes || []).join('; '),
    });
  });

  return { studiesTable, outcomesTable, interventionsTable, metadataTable };
}

/**
 * Convert a table array to CSV string
 */
function tableToCSV(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map(function(h) {
      const val = (row[h] == null ? '' : String(row[h])).replace(/"/g, '""');
      return val.includes(',') || val.includes('"') || val.includes('\n') ? '"' + val + '"' : val;
    });
    lines.push(values.join(','));
  }
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(CORS_HEADERS).forEach(([key, val]) => res.setHeader(key, val));

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { extractions, articlesMeta, format } = req.body || {};

  if (!extractions || typeof extractions !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing extractions object' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Building dataset', { studyCount: Object.keys(extractions).length });
    const start = Date.now();

    const dataset = buildDataset(extractions, articlesMeta);

    const duration = Date.now() - start;

    // If CSV format requested, return CSV strings
    if (format === 'csv') {
      return res.status(200).json({
        success: true,
        data: {
          studies_csv: tableToCSV(dataset.studiesTable),
          outcomes_csv: tableToCSV(dataset.outcomesTable),
          interventions_csv: tableToCSV(dataset.interventionsTable),
          metadata_csv: tableToCSV(dataset.metadataTable),
        },
        metrics: { duration },
      });
    }

    // Default: return JSON tables
    const stats = {
      studies: dataset.studiesTable.length,
      outcomes: dataset.outcomesTable.length,
      interventions: dataset.interventionsTable.length,
      countries: [...new Set(dataset.studiesTable.map(function(s) { return s.country; }).filter(Boolean))].length,
    };

    logAgent(AGENT_NAME, 'info', 'Dataset built', { ...stats, duration });

    return res.status(200).json({
      success: true,
      data: {
        studiesTable: dataset.studiesTable,
        outcomesTable: dataset.outcomesTable,
        interventionsTable: dataset.interventionsTable,
        metadataTable: dataset.metadataTable,
        stats,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
