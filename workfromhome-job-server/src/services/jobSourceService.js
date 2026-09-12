const env = require('../config/env');
const https = require('https');
const Parser = require('rss-parser');
const { fetchWorkFromHomeJobs, isLikelyWorkFromHome } = require('./rssService');

const rssParser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  }
});

const COUNTRY_HINTS = {
  DE: ['germany', 'deutschland', 'berlin', 'munich', 'frankfurt', 'hamburg', 'cologne', 'stuttgart', 'dusseldorf', 'de'],
  FR: ['france', 'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'nantes', 'lille', 'fr'],
  IE: ['ireland', 'dublin', 'cork', 'galway', 'limerick', 'irish', 'ie'],
  ES: ['spain', 'espana', 'madrid', 'barcelona', 'valencia', 'seville', 'malaga', 'bilbao', 'es'],
  NL: ['netherlands', 'holland', 'amsterdam', 'rotterdam', 'utrecht', 'the hague', 'eindhoven', 'nl'],
  IT: ['italy', 'italia', 'rome', 'milan', 'turin', 'florence', 'naples', 'bologna', 'it'],
  PT: ['portugal', 'lisbon', 'porto', 'faro', 'braga', 'coimbra', 'pt'],
  PL: ['poland', 'polska', 'warsaw', 'krakow', 'wroclaw', 'gdansk', 'poznan', 'pl'],
  SE: ['sweden', 'sverige', 'stockholm', 'gothenburg', 'malmo', 'se'],
  CH: ['switzerland', 'schweiz', 'zurich', 'geneva', 'basel', 'bern', 'lausanne', 'ch'],
  AT: ['austria', 'osterreich', 'vienna', 'salzburg', 'graz', 'innsbruck', 'at'],
  BE: ['belgium', 'belgique', 'brussels', 'antwerp', 'ghent', 'liege', 'be'],
  NO: ['norway', 'norge', 'oslo', 'bergen', 'trondheim', 'stavanger', 'no'],
  DK: ['denmark', 'danmark', 'copenhagen', 'aarhus', 'odense', 'dk'],
  FI: ['finland', 'suomi', 'helsinki', 'espoo', 'tampere', 'fi'],
  GR: ['greece', 'hellas', 'athens', 'thessaloniki', 'gr'],
  CZ: ['czech republic', 'czechia', 'cesko', 'prague', 'brno', 'cz'],
  RO: ['romania', 'bucharest', 'cluj', 'timisoara', 'iasi', 'ro'],
  HU: ['hungary', 'magyarorszag', 'budapest', 'debrecen', 'hu'],
  UK: ['united kingdom', 'great britain', 'england', 'scotland', 'wales', 'northern ireland', 'london', 'manchester', 'birmingham', 'uk', 'gb'],
  IN: ['india', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'in'],
  SG: ['singapore', 'singaporean', 'sg', 'changi', 'jurong', 'tampines', 'woodlands', 'central region', 'apac', 'asia-pacific', 'southeast asia'],
  US: ['united states of america', 'united states', 'u.s.', 'u.s', 'usa', 'us-only', 'us only', 'new york', 'california', 'san francisco', 'austin', 'seattle']
};

const EUROPE_COUNTRIES = [
  'DE', 'FR', 'IE', 'ES', 'NL', 'IT', 'PT', 'PL', 'SE', 'CH', 'AT', 'BE', 'NO', 'DK', 'FI', 'CZ', 'RO', 'HU', 'GR', 'UK'
];

let euRotationIndex = 0;
let globalRotationIndex = 0;

function getNextEuCountry(allowedCountries = []) {
  const allowed = (allowedCountries && allowedCountries.length)
    ? EUROPE_COUNTRIES.filter(c => allowedCountries.includes(c))
    : EUROPE_COUNTRIES;
  if (!allowed.length) return 'DE';
  const pick = allowed[euRotationIndex % allowed.length];
  euRotationIndex++;
  return pick;
}

function getNextGlobalCountry(allowedCountries = []) {
  const list = (allowedCountries && allowedCountries.length) ? allowedCountries : ['US', 'SG', 'DE', 'UK', 'FR', 'IE', 'ES', 'NL', 'IT', 'PT'];
  const pick = list[globalRotationIndex % list.length];
  globalRotationIndex++;
  return pick;
}

function sanitizeText(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function pickPreferredCountry(candidates = [], allowedCountries = []) {
  const allowed = new Set((allowedCountries || []).map((code) => String(code || '').toUpperCase()));
  for (const candidate of candidates) {
    const normalized = String(candidate || '').toUpperCase();
    if (!normalized) {
      continue;
    }
    if (!allowed.size || allowed.has(normalized)) {
      return normalized;
    }
  }
  return '';
}

function detectCountryFromText(value = '', allowedCountries = []) {
  const text = String(value || '').toLowerCase();
  const allowed = new Set((allowedCountries || []).map((code) => String(code || '').toUpperCase()));
  const matchedCountries = [];

  if (!text) {
    return '';
  }

  for (const [countryCode, hints] of Object.entries(COUNTRY_HINTS)) {
    if (allowed.size && !allowed.has(countryCode)) {
      continue;
    }

    for (const hint of hints) {
      if (hint.length <= 3) {
        if (new RegExp(`\\b${escapeRegExp(hint)}\\b`, 'i').test(text)) {
          matchedCountries.push(countryCode);
          break;
        }
      } else if (text.includes(hint)) {
        matchedCountries.push(countryCode);
        break;
      }
    }
  }

  if (matchedCountries.length) {
    const preferred = pickPreferredCountry(matchedCountries, allowedCountries);
    if (preferred) {
      return preferred;
    }
  }

  if (/(europe|european union|eu\b|emea|eea|schengen)/i.test(text)) {
    return getNextEuCountry(allowedCountries);
  }

  if (/(americas|north america|united states only|usa only|us only|latam|latin america)/i.test(text)) {
    return pickPreferredCountry(['US'], allowedCountries);
  }

  if (/(india only|india)/i.test(text)) {
    return pickPreferredCountry(['IN'], allowedCountries);
  }

  return '';
}

function isGlobalRemoteText(value = '') {
  const text = String(value || '').toLowerCase();
  if (!text) {
    return false;
  }

  return ['worldwide', 'global', 'anywhere', 'remote only', 'all countries', 'international'].some((signal) =>
    text.includes(signal)
  );
}

function pickDefaultCountry(targetCountries = []) {
  if (targetCountries && targetCountries.length) {
    return targetCountries[0];
  }
  return 'US';
}

function shouldKeepCountry(country, targetCountries) {
  if (!country) {
    return false;
  }

  if (!targetCountries || !targetCountries.length) {
    return true;
  }

  return targetCountries.includes(country);
}

function fetchJson(url, timeoutMs, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        }
      },
      (res) => {
        const { statusCode = 0, headers = {} } = res;

        if ([301, 302, 307, 308].includes(statusCode)) {
          const location = headers.location;
          res.resume();

          if (!location) {
            reject(new Error(`Redirect (${statusCode}) without location`));
            return;
          }

          if (redirectCount >= 3) {
            reject(new Error('Too many redirects'));
            return;
          }

          const redirectUrl = new URL(location, url).toString();
          fetchJson(redirectUrl, timeoutMs, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          res.resume();
          reject(new Error(`HTTP ${statusCode}`));
          return;
        }

        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw || '{}'));
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

async function fetchRemotiveJobs(targetCountries) {
  if (!env.ingestEnableRemotive) {
    return [];
  }

  let payload;
  try {
    payload = await fetchJson(env.remotiveApiUrl, env.sourceFetchTimeoutMs);
  } catch (error) {
    console.error('[Sources] Remotive fetch failed:', error.message);
    return [];
  }

  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  const fallbackCountry = pickDefaultCountry(targetCountries);
  const normalized = [];

  for (const job of jobs) {
    const title = sanitizeText(job.title || '');
    const locationText = sanitizeText(job.candidate_required_location || job.location || '');
    const summary = sanitizeText(job.description || job.company_name || '');
    const link = job.url || '';

    if (!title || !link) {
      continue;
    }

    const detectedCountry =
      detectCountryFromText(`${locationText} ${summary} ${title}`, targetCountries) ||
      (isGlobalRemoteText(locationText) ? getNextGlobalCountry(targetCountries) : '');

    if (!shouldKeepCountry(detectedCountry, targetCountries)) {
      continue;
    }

    const publishedAt = parseDate(job.publication_date) || new Date();
    normalized.push({
      source: 'remotive-api',
      sourceLabel: sanitizeText(job.company_name || 'remotive.com'),
      country: detectedCountry,
      category: 'wfh',
      isRemote: true,
      title,
      summary,
      link,
      publishedAt: publishedAt.toISOString(),
      rawItem: job
    });
  }

  return normalized;
}

async function fetchArbeitnowJobs(targetCountries) {
  if (!env.ingestEnableArbeitnow) {
    return [];
  }

  const fallbackCountry = pickDefaultCountry(targetCountries);
  const pages = Math.max(1, env.arbeitnowPages);
  const normalized = [];

  for (let page = 1; page <= pages; page += 1) {
    const url = `${env.arbeitnowApiUrl}?page=${page}`;
    let payload;

    try {
      payload = await fetchJson(url, env.sourceFetchTimeoutMs);
    } catch (error) {
      console.error(`[Sources] Arbeitnow fetch failed (page ${page}):`, error.message);
      continue;
    }

    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    if (!jobs.length) {
      continue;
    }

    for (const job of jobs) {
      const title = sanitizeText(job.title || '');
      const locationText = sanitizeText(job.location || '');
      const summary = sanitizeText(job.description || '');
      const link = job.url || (job.slug ? `https://www.arbeitnow.com/jobs/${job.slug}` : '');

      if (!title || !link) {
        continue;
      }

      // Prefer remote-first jobs from this source for your portal focus.
      const isRemote = Boolean(job.remote) || isLikelyWorkFromHome({ title, summary });
      if (!isRemote) {
        continue;
      }

      const detectedCountry =
        detectCountryFromText(`${locationText} ${summary} ${title}`, targetCountries) ||
        (isGlobalRemoteText(locationText) ? getNextGlobalCountry(targetCountries) : getNextEuCountry(targetCountries));

      if (!shouldKeepCountry(detectedCountry, targetCountries)) {
        continue;
      }

      const publishedAt = parseDate(job.created_at || job.published_at) || new Date();
      normalized.push({
        source: 'arbeitnow-api',
        sourceLabel: sanitizeText(job.company_name || 'arbeitnow.com'),
        country: detectedCountry,
        category: 'wfh',
        isRemote,
        title,
        summary,
        link,
        publishedAt: publishedAt.toISOString(),
        rawItem: job
      });
    }
  }

  return normalized;
}

async function fetchJobicyJobs(targetCountries) {
  if (!env.ingestEnableJobicy) {
    return [];
  }

  const fallbackCountry =
    pickPreferredCountry(['UK', 'US'], targetCountries) || pickDefaultCountry(targetCountries);
  const count = Math.max(20, Math.min(200, env.jobicyCount || 100));
  const url = `${env.jobicyApiUrl}?count=${count}`;

  let payload;
  try {
    payload = await fetchJson(url, env.sourceFetchTimeoutMs);
  } catch (error) {
    console.error('[Sources] Jobicy fetch failed:', error.message);
    return [];
  }

  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  const normalized = [];

  for (const job of jobs) {
    const title = sanitizeText(job.jobTitle || '');
    const geo = sanitizeText(job.jobGeo || '');
    const summary = sanitizeText(job.jobDescription || job.jobExcerpt || '');
    const link = job.url || '';

    if (!title || !link || !summary) {
      continue;
    }

    const detectedCountry =
      detectCountryFromText(`${geo} ${summary} ${title}`, targetCountries) ||
      (isGlobalRemoteText(geo) ? getNextGlobalCountry(targetCountries) : getNextGlobalCountry(targetCountries));

    if (!shouldKeepCountry(detectedCountry, targetCountries)) {
      continue;
    }

    const publishedAt = parseDate(job.pubDate) || new Date();
    normalized.push({
      source: 'jobicy-api',
      sourceLabel: sanitizeText(job.companyName || 'jobicy.com'),
      country: detectedCountry,
      category: 'wfh',
      isRemote: true,
      title,
      summary,
      link,
      publishedAt: publishedAt.toISOString(),
      rawItem: job
    });
  }

  return normalized;
}

async function fetchRemoteOkJobs(targetCountries) {
  if (!env.ingestEnableRemoteok) {
    return [];
  }

  const fallbackCountry =
    pickPreferredCountry(['UK', 'DE', 'FR', 'US'], targetCountries) || pickDefaultCountry(targetCountries);

  let payload;
  try {
    payload = await fetchJson(env.remoteokApiUrl, env.sourceFetchTimeoutMs);
  } catch (error) {
    console.error('[Sources] RemoteOK fetch failed:', error.message);
    return [];
  }

  const jobs = Array.isArray(payload) ? payload.slice(1) : [];
  const normalized = [];

  for (const job of jobs) {
    const title = sanitizeText(job.position || job.title || '');
    const locationText = sanitizeText(job.location || '');
    const tagsText = Array.isArray(job.tags) ? sanitizeText(job.tags.join(' ')) : '';
    const summary = sanitizeText(job.description || '');
    const link = String(job.url || job.apply_url || '').trim();

    if (!title || !link || !summary) {
      continue;
    }

    const detectedCountry =
      detectCountryFromText(`${locationText} ${tagsText} ${summary} ${title}`, targetCountries) ||
      (isGlobalRemoteText(locationText) || locationText.toLowerCase() === 'remote' ? getNextGlobalCountry(targetCountries) : '');

    if (!shouldKeepCountry(detectedCountry, targetCountries)) {
      continue;
    }

    const publishedAt = parseDate(job.date || job.epoch) || new Date();
    normalized.push({
      source: 'remoteok-api',
      sourceLabel: sanitizeText(job.company || 'remoteok.com'),
      country: detectedCountry,
      category: 'wfh',
      isRemote: true,
      title,
      summary,
      link,
      publishedAt: publishedAt.toISOString(),
      rawItem: job
    });
  }

  return normalized;
}

async function fetchHimalayasJobs(targetCountries) {
  if (!env.ingestEnableHimalayas) {
    return [];
  }

  let payload;
  try {
    const url = `${env.himalayasApiUrl}?limit=50`;
    payload = await fetchJson(url, env.sourceFetchTimeoutMs);
  } catch (error) {
    console.error('[Sources] Himalayas fetch failed:', error.message);
    return [];
  }

  const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];
  const normalized = [];

  for (const job of jobs) {
    const title = sanitizeText(job.title || '');
    const company = sanitizeText(job.companyName || 'Remote Tech');
    const summary = sanitizeText(job.excerpt || job.description || '');
    const link = String(job.applicationLink || job.guid || '').trim();

    if (!title || !link || !summary) {
      continue;
    }

    const locRestrictions = Array.isArray(job.locationRestrictions) ? job.locationRestrictions.join(' ') : '';
    const detectedCountry =
      detectCountryFromText(`${locRestrictions} ${summary} ${title}`, targetCountries) ||
      getNextGlobalCountry(targetCountries);

    if (!shouldKeepCountry(detectedCountry, targetCountries)) {
      continue;
    }

    const publishedAt = job.pubDate ? new Date(job.pubDate * 1000) : new Date();
    normalized.push({
      source: 'himalayas-api',
      sourceLabel: company,
      country: detectedCountry,
      category: 'wfh',
      isRemote: true,
      title,
      summary,
      link,
      publishedAt: publishedAt.toISOString(),
      rawItem: job
    });
  }

  return normalized;
}

const WWR_FEEDS = [
  'https://weworkremotely.com/categories/remote-programming-jobs.rss',
  'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss'
];

async function fetchWwrJobs(targetCountries) {
  if (!env.ingestEnableWwr) {
    return [];
  }

  const normalized = [];

  for (const feedUrl of WWR_FEEDS) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      const items = Array.isArray(feed?.items) ? feed.items : [];

      for (const item of items) {
        let title = sanitizeText(item.title || '');
        let company = 'WeWorkRemotely';

        if (title.includes(':')) {
          const parts = title.split(':');
          company = sanitizeText(parts[0]);
          title = sanitizeText(parts.slice(1).join(':'));
        }

        const summary = sanitizeText(item.contentSnippet || item.content || item.description || '');
        const link = String(item.link || item.guid || '').trim();

        if (!title || !link || !summary) {
          continue;
        }

        const regionText = sanitizeText(item.region || '');
        const detectedCountry =
          detectCountryFromText(`${regionText} ${summary} ${title}`, targetCountries) ||
          (isGlobalRemoteText(regionText) || !regionText ? getNextGlobalCountry(targetCountries) : '');

        if (!shouldKeepCountry(detectedCountry, targetCountries)) {
          continue;
        }

        const publishedAt = parseDate(item.isoDate || item.pubDate) || new Date();
        normalized.push({
          source: 'wwr-rss',
          sourceLabel: company,
          country: detectedCountry,
          category: 'wfh',
          isRemote: true,
          title,
          summary,
          link,
          publishedAt: publishedAt.toISOString(),
          rawItem: item
        });
      }
    } catch (error) {
      console.error('[Sources] WWR fetch failed for', feedUrl, error.message);
    }
  }

  return normalized;
}

function dedupeByLink(items) {
  const seenLinks = new Set();
  const deduped = [];

  for (const item of items) {
    const link = String(item.link || '').trim();
    if (!link || seenLinks.has(link)) {
      continue;
    }
    seenLinks.add(link);
    deduped.push(item);
  }

  return deduped;
}

async function fetchCandidateJobs() {
  const targetCountries = env.targetCountries && env.targetCountries.length ? env.targetCountries : ['US'];

  const [rssJobs, remotiveJobs, arbeitnowJobs, jobicyJobs, remoteokJobs, himalayasJobs, wwrJobs] = await Promise.all([
    env.ingestEnableGoogleRss ? fetchWorkFromHomeJobs() : Promise.resolve([]),
    fetchRemotiveJobs(targetCountries),
    fetchArbeitnowJobs(targetCountries),
    fetchJobicyJobs(targetCountries),
    fetchRemoteOkJobs(targetCountries),
    fetchHimalayasJobs(targetCountries),
    fetchWwrJobs(targetCountries)
  ]);

  const merged = dedupeByLink([
    ...himalayasJobs,
    ...wwrJobs,
    ...remotiveJobs,
    ...jobicyJobs,
    ...arbeitnowJobs,
    ...remoteokJobs,
    ...rssJobs
  ]);

  return {
    items: merged,
    sourceStats: {
      googleRss: rssJobs.length,
      remotive: remotiveJobs.length,
      arbeitnow: arbeitnowJobs.length,
      jobicy: jobicyJobs.length,
      remoteok: remoteokJobs.length,
      himalayas: himalayasJobs.length,
      wwr: wwrJobs.length,
      mergedUnique: merged.length
    }
  };
}

module.exports = {
  fetchCandidateJobs
};
