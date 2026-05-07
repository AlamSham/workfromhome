/**
 * IndexNow Integration — Instant URL Indexing
 *
 * When new jobs are ingested, this module notifies search engines (Bing, Yandex, Seznam)
 * about the new URLs so they get indexed within minutes instead of days/weeks.
 *
 * Setup: Set INDEXNOW_API_KEY in .env (any random string, 8-128 chars, hex only)
 * Then create a file at /public/{key}.txt containing just the key.
 *
 * Docs: https://www.indexnow.org/documentation
 */

const env = require('../config/env');

const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY || '';
const SITE_URL = env.siteUrl || 'https://remotejobdesk.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Submits a batch of URLs to IndexNow for instant indexing.
 * Called after each job ingestion run with newly added job URLs.
 *
 * @param {Array<{_id: string, seo?: {slug?: string}, originalTitle?: string}>} newJobs
 */
async function submitToIndexNow(newJobs) {
  if (!INDEXNOW_API_KEY) {
    return; // IndexNow not configured, silently skip
  }

  if (!newJobs || newJobs.length === 0) {
    return;
  }

  try {
    // Build URL list from new jobs
    const urls = newJobs.map((job) => {
      const slug = job.seo?.slug || slugify(job.originalTitle || 'remote-job');
      return `${SITE_URL}/jobs/${slug}-${job._id}`;
    });

    // Also include the homepage and country pages to refresh their content
    const extraUrls = [
      `${SITE_URL}/`,
      `${SITE_URL}/sitemap.xml`,
    ];

    const allUrls = [...new Set([...urls, ...extraUrls])].slice(0, 10000); // IndexNow limit

    const payload = {
      host: new URL(SITE_URL).hostname,
      key: INDEXNOW_API_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_API_KEY}.txt`,
      urlList: allUrls,
    };

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok || response.status === 202) {
      console.log(`[IndexNow] ✅ Submitted ${allUrls.length} URLs successfully`);
    } else {
      console.warn(`[IndexNow] ⚠️ Response: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Don't let IndexNow failures break the ingestion pipeline
    console.warn(`[IndexNow] ⚠️ Failed to submit: ${error.message}`);
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

module.exports = { submitToIndexNow };
