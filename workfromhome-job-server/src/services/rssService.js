const Parser = require('rss-parser');
const env = require('../config/env');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'description']
  }
});

const COUNTRY_RSS_CONFIG = {
  US: { gl: 'US', hl: 'en-US', ceid: 'US:en', queryName: 'united states' },
  UK: { gl: 'GB', hl: 'en-GB', ceid: 'GB:en', queryName: 'united kingdom' },
  DE: { gl: 'DE', hl: 'de-DE', ceid: 'DE:de', queryName: 'germany' },
  FR: { gl: 'FR', hl: 'fr-FR', ceid: 'FR:fr', queryName: 'france' },
  NL: { gl: 'NL', hl: 'nl-NL', ceid: 'NL:nl', queryName: 'netherlands' },
  IE: { gl: 'IE', hl: 'en-IE', ceid: 'IE:en', queryName: 'ireland' },
  ES: { gl: 'ES', hl: 'es-ES', ceid: 'ES:es', queryName: 'spain' },
  IT: { gl: 'IT', hl: 'it-IT', ceid: 'IT:it', queryName: 'italy' },
  SE: { gl: 'SE', hl: 'sv-SE', ceid: 'SE:sv', queryName: 'sweden' },
  CH: { gl: 'CH', hl: 'de-CH', ceid: 'CH:de', queryName: 'switzerland' },
  NO: { gl: 'NO', hl: 'no-NO', ceid: 'NO:no', queryName: 'norway' },
  DK: { gl: 'DK', hl: 'da-DK', ceid: 'DK:da', queryName: 'denmark' },
  FI: { gl: 'FI', hl: 'fi-FI', ceid: 'FI:fi', queryName: 'finland' },
  AT: { gl: 'AT', hl: 'de-AT', ceid: 'AT:de', queryName: 'austria' },
  BE: { gl: 'BE', hl: 'fr-BE', ceid: 'BE:fr', queryName: 'belgium' },
  PT: { gl: 'PT', hl: 'pt-PT', ceid: 'PT:pt', queryName: 'portugal' },
  PL: { gl: 'PL', hl: 'pl-PL', ceid: 'PL:pl', queryName: 'poland' },
  CZ: { gl: 'CZ', hl: 'cs-CZ', ceid: 'CZ:cs', queryName: 'czech republic' },
  HU: { gl: 'HU', hl: 'hu-HU', ceid: 'HU:hu', queryName: 'hungary' },
  RO: { gl: 'RO', hl: 'ro-RO', ceid: 'RO:ro', queryName: 'romania' },
  GR: { gl: 'GR', hl: 'el-GR', ceid: 'GR:el', queryName: 'greece' },
  IN: { gl: 'IN', hl: 'en-IN', ceid: 'IN:en', queryName: 'india' }
};

const NEWS_SOURCE_BLOCKLIST = new Set(
  [
    'the economic times',
    'economic times',
    'reuters',
    'fortune',
    'yahoo',
    'yahoo finance',
    'the new york times',
    'new york times',
    'bloomberg',
    'forbes',
    'cnbc',
    'the guardian',
    'mint',
    'business standard',
    'msn'
  ].map((value) => value.toLowerCase())
);

const TRUSTED_JOB_SOURCES = new Set([
  'remotive-api',
  'arbeitnow-api',
  'jobicy-api',
  'remoteok-api'
]);

function sanitizeText(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSourceLabel(item = {}) {
  const description = String(item.description || item.content || '');
  const fontMatch = description.match(/<font[^>]*>([^<]+)<\/font>/i);
  const fromDescription = sanitizeText(fontMatch?.[1] || '');
  if (fromDescription) {
    return fromDescription;
  }

  const title = String(item.title || '');
  const parts = title.split(/\s[-|]\s/).map((part) => sanitizeText(part)).filter(Boolean);
  if (parts.length > 1) {
    const maybeSource = parts[parts.length - 1];
    if (maybeSource && maybeSource.length <= 60) {
      return maybeSource;
    }
  }

  return '';
}

function isLikelyWorkFromHome({ title = '', summary = '' }) {
  const text = `${title} ${summary}`.toLowerCase();
  const positiveSignals = [
    'work from home',
    'wfh',
    'remote',
    'hybrid',
    'telecommute',
    'anywhere'
  ];

  return positiveSignals.some((signal) => text.includes(signal));
}

function getCountryFeedConfig(countryCode) {
  const code = String(countryCode || 'US').toUpperCase();
  const mapped = COUNTRY_RSS_CONFIG[code];

  if (mapped) {
    return { country: code, ...mapped };
  }

  return {
    country: code,
    gl: code,
    hl: 'en',
    ceid: `${code}:en`,
    queryName: code
  };
}

function buildDefaultGoogleRssUrl({ category, config }) {
  const days = Math.max(1, env.rssRecencyDays);
  const queryText =
    category === 'wfh'
      ? `"work from home" jobs hiring apply ${config.queryName} when:${days}d -layoffs -analysis -funding -market`
      : `remote jobs hiring apply ${config.queryName} when:${days}d -layoffs -analysis -funding -market`;

  return `https://news.google.com/rss/search?q=${encodeURIComponent(queryText)}&hl=${config.hl}&gl=${config.gl}&ceid=${config.ceid}`;
}

function resolveFeedUrl(country, category, countryConfig) {
  const envKey = `GOOGLE_RSS_URL_${country}_${category.toUpperCase()}`;
  if (process.env[envKey]) {
    return process.env[envKey];
  }

  return buildDefaultGoogleRssUrl({ category, config: countryConfig });
}

function getJobRelevanceScore({ title = '', summary = '', link = '', category = '' }) {
  const titleText = String(title).toLowerCase();
  const fullText = `${title} ${summary}`.toLowerCase();
  const linkText = String(link).toLowerCase();

  const strongSignals = [
    'we are hiring',
    'now hiring',
    'hiring for',
    'apply now',
    'job opening',
    'job openings',
    'vacancy',
    'vacancies',
    'career opportunity',
    'careers',
    'recruitment',
    'walk-in interview',
    'open position',
    'open positions'
  ];

  const mediumSignals = [
    'remote job',
    'work from home',
    'wfh',
    'career',
    'full-time',
    'part-time',
    'contract role',
    'internship',
    'fresher',
    'immediate joiner',
    'join our team',
    'job role',
    'position'
  ];

  const hardNegativeSignals = [
    'job market',
    'future of work',
    'layoff',
    'lays off',
    'job cuts',
    'opinion',
    'analysis',
    'report',
    'survey',
    'housing market',
    'stock market',
    'election',
    'immigration news',
    'celebrity',
    'sports'
  ];

  let score = 0;

  const strongMatchesInTitle = strongSignals.filter((signal) => titleText.includes(signal)).length;
  const strongMatchesInText = strongSignals.filter((signal) => fullText.includes(signal)).length;
  const mediumMatches = mediumSignals.filter((signal) => fullText.includes(signal)).length;
  const hardNegativeMatches = hardNegativeSignals.filter((signal) => fullText.includes(signal)).length;

  score += strongMatchesInTitle * 3;
  score += strongMatchesInText * 2;
  score += Math.min(3, mediumMatches);
  score -= hardNegativeMatches * 3;

  if (linkText.includes('/jobs') || linkText.includes('/careers') || linkText.includes('/career')) {
    score += 2;
  }

  if (category === 'wfh' && isLikelyWorkFromHome({ title, summary })) {
    score += 1;
  }

  return score;
}

function isLikelyJobPosting(item, minScore = 2) {
  const titleText = String(item.title || '').toLowerCase();
  const fullText = `${item.title || ''} ${item.summary || ''}`.toLowerCase();
  const linkText = String(item.link || '').toLowerCase();
  const sourceLabel = String(item.sourceLabel || '').toLowerCase();
  const source = String(item.source || '').toLowerCase();

  if (source === 'google-rss') {
    const summaryText = sanitizeText(item.summary || '');
    const snippetText = sanitizeText(item.rawItem?.contentSnippet || '');
    const titleTextNormalized = sanitizeText(item.title || '').toLowerCase();
    const bestDetail = [summaryText, snippetText].sort((a, b) => b.length - a.length)[0] || '';

    const detailWordCount = bestDetail.split(/\s+/).filter(Boolean).length;
    const isSameAsTitle = bestDetail.toLowerCase() === titleTextNormalized;

    if (
      bestDetail.length < env.ingestMinGoogleDetailChars ||
      detailWordCount < 35 ||
      isSameAsTitle
    ) {
      return false;
    }
  }

  if (TRUSTED_JOB_SOURCES.has(source)) {
    const hasTitle = titleText.length >= 4;
    const hasHttpLink = /^https?:\/\//.test(linkText);
    const appearsRemote = Boolean(item.isRemote) || item.category === 'wfh' || isLikelyWorkFromHome(item);
    return hasTitle && hasHttpLink && appearsRemote;
  }

  const hasHiringIntent = [
    'we are hiring',
    'now hiring',
    'hiring for',
    'hiring',
    'apply',
    'apply now',
    'job opening',
    'job openings',
    'job opportunity',
    'job opportunities',
    'opportunities at',
    'jobs at',
    'careers at',
    'vacancy',
    'vacancies',
    'recruitment',
    'career opportunity',
    'open role',
    'open position',
    'open positions',
    'join our team',
    'job alert'
  ].some((signal) => fullText.includes(signal));

  const hasCareerLinkSignal =
    linkText.includes('/jobs') || linkText.includes('/careers') || linkText.includes('/job/');

  const hasDirectJobTitlePattern = /\b(job openings?|job opportunities?|vacanc(?:y|ies)|hiring|recruitment|apply|position)\b/.test(
    titleText
  );

  const titleHasExplainerSignal = [
    'how ',
    'why ',
    'what ',
    'future of',
    'impact',
    'trend',
    'report',
    'survey'
  ].some((signal) => titleText.includes(signal));

  const titleHasHardNewsSignal = [
    'job market',
    'future of work',
    'layoff',
    'layoffs',
    'job cuts',
    'warning',
    'opinion',
    'analysis',
    'report'
  ].some((signal) => titleText.includes(signal));

  if (titleHasHardNewsSignal) {
    return false;
  }

  const titleHasEmploymentNewsPattern =
    /\b(\d{1,3}(?:,\d{3})?\s+jobs|jobs?\s+at\s+risk|jobs?\s+data|highest-paying jobs|jobs?\s+of\s+the\s+future)\b/.test(
      titleText
    ) || titleText.includes('how to apply for jobs');

  if (titleHasEmploymentNewsPattern && !hasCareerLinkSignal) {
    return false;
  }

  const sourceIsNewsPublisher = NEWS_SOURCE_BLOCKLIST.has(sourceLabel);
  if (sourceIsNewsPublisher && !hasCareerLinkSignal && !hasHiringIntent) {
    return false;
  }

  const hasEconomicNewsSignal = [
    'funding',
    'earnings',
    'quarterly',
    'stock',
    'ipo',
    'market update',
    'economic times',
    'business standard',
    'bloomberg',
    'reuters',
    'cnbc',
    'forbes'
  ].some((signal) => fullText.includes(signal));

  if (hasEconomicNewsSignal && !hasCareerLinkSignal) {
    return false;
  }

  if (titleHasExplainerSignal && !hasCareerLinkSignal && !hasHiringIntent) {
    return false;
  }

  const relevanceScore = getJobRelevanceScore(item);
  return relevanceScore >= minScore && (hasHiringIntent || hasCareerLinkSignal || hasDirectJobTitlePattern);
}

async function fetchWorkFromHomeJobs() {
  const countries = env.targetCountries.length ? env.targetCountries : ['US'];
  const feedConfigs = [];

  countries.forEach((countryCode, index) => {
    const countryConfig = getCountryFeedConfig(countryCode);
    const wfhUrl = resolveFeedUrl(countryConfig.country, 'wfh', countryConfig);
    const mixedUrl = resolveFeedUrl(countryConfig.country, 'mixed', countryConfig);

    feedConfigs.push({
      country: countryConfig.country,
      category: 'wfh',
      url: wfhUrl,
      priority: index + 1
    });
    feedConfigs.push({
      country: countryConfig.country,
      category: 'mixed',
      url: mixedUrl,
      priority: index + 101
    });
  });

  const seen = new Set();
  const collected = [];

  for (const feedConfig of feedConfigs) {
    let feed = null;
    try {
      feed = await parser.parseURL(feedConfig.url);
    } catch (error) {
      console.error(`[RSS] Failed for ${feedConfig.country}:`, error.message);
      continue;
    }

    const items = feed.items || [];

    for (const item of items) {
      const link = item.link || item.guid;
      if (!link || seen.has(link)) {
        continue;
      }

      seen.add(link);

      collected.push({
        source: 'google-rss',
        country: feedConfig.country,
        category: feedConfig.category,
        priority: feedConfig.priority,
        sourceLabel: extractSourceLabel(item),
        title: sanitizeText(item.title || 'Job Opportunity'),
        summary: sanitizeText(item.contentSnippet || item.content || item.description || ''),
        link,
        publishedAt: item.isoDate || item.pubDate || null,
        rawItem: item
      });
    }
  }

  return collected.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
  });
}

module.exports = {
  fetchWorkFromHomeJobs,
  isLikelyWorkFromHome,
  getJobRelevanceScore,
  isLikelyJobPosting
};
