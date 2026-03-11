import { logAgent, logError } from '../utils/logger.js';

const AGENT_NAME = 'clinicaltrials-search';
const CT_API_BASE = 'https://clinicaltrials.gov/api/v2/studies';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://galatea-v2-prod.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

/**
 * Search ClinicalTrials.gov API v2 (free, no key required)
 */
async function searchClinicalTrials(query, pageSize = 20) {
  const url = `${CT_API_BASE}?query.term=${encodeURIComponent(query)}&pageSize=${pageSize}&format=json`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`ClinicalTrials.gov API failed: ${response.status}`);

  const data = await response.json();
  const totalCount = data.totalCount || 0;
  const studies = (data.studies || []).map(parseStudy);

  return { count: totalCount, studies };
}

/**
 * Parse a single study from ClinicalTrials.gov API v2 response
 */
function parseStudy(study) {
  const proto = study.protocolSection || {};
  const id = proto.identificationModule || {};
  const status = proto.statusModule || {};
  const design = proto.designModule || {};
  const eligibility = proto.eligibilityModule || {};
  const contacts = proto.contactsLocationsModule || {};
  const sponsor = proto.sponsorCollaboratorsModule || {};
  const outcomes = proto.outcomesModule || {};
  const conditions = proto.conditionsModule || {};
  const interventions = proto.armsInterventionsModule || {};
  const description = proto.descriptionModule || {};

  // Extract interventions
  const interventionList = (interventions.interventions || []).map(function(iv) {
    return {
      type: iv.type || '',
      name: iv.name || '',
      description: iv.description || '',
    };
  });

  // Extract primary outcomes
  const primaryOutcomes = (outcomes.primaryOutcomes || []).map(function(o) {
    return { measure: o.measure || '', timeFrame: o.timeFrame || '' };
  });

  // Extract secondary outcomes
  const secondaryOutcomes = (outcomes.secondaryOutcomes || []).map(function(o) {
    return { measure: o.measure || '', timeFrame: o.timeFrame || '' };
  });

  return {
    nctId: id.nctId || '',
    title: id.officialTitle || id.briefTitle || '',
    briefTitle: id.briefTitle || '',
    status: status.overallStatus || '',
    phase: (design.phases || []).join(', ') || '',
    studyType: design.studyType || '',
    enrollment: (status.enrollmentInfo || {}).count || null,
    conditions: (conditions.conditions || []),
    interventions: interventionList,
    sponsors: {
      lead: (sponsor.leadSponsor || {}).name || '',
      collaborators: (sponsor.collaborators || []).map(function(c) { return c.name || ''; }),
    },
    primaryOutcomes,
    secondaryOutcomes,
    briefSummary: (description.briefSummary || '').slice(0, 500),
    startDate: (status.startDateStruct || {}).date || '',
    completionDate: (status.completionDateStruct || {}).date || '',
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

  const { query, pageSize = 20 } = req.body || {};

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing query' });
  }

  try {
    logAgent(AGENT_NAME, 'info', 'Searching ClinicalTrials.gov', { query: query.slice(0, 100) });
    const start = Date.now();

    const result = await searchClinicalTrials(query, Math.min(pageSize, 50));

    const duration = Date.now() - start;
    logAgent(AGENT_NAME, 'info', 'Search complete', { count: result.count, fetched: result.studies.length, duration });

    return res.status(200).json({
      success: true,
      data: {
        count: result.count,
        studies: result.studies,
      },
      metrics: { duration },
    });
  } catch (err) {
    logError(AGENT_NAME, err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
