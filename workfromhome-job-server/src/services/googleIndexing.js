const crypto = require('crypto');
const env = require('../config/env');

const GOOGLE_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

let credentials = null;
if (GOOGLE_KEY_JSON) {
  try {
    credentials = JSON.parse(GOOGLE_KEY_JSON);
  } catch (err) {
    console.error('[Google Indexing] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY env var:', err.message);
  }
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const fs = require('fs');
    credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  } catch (err) {
    console.error('[Google Indexing] Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', err.message);
  }
}

const hasCredentials = !!credentials;
const isOnGcp = !!(process.env.GOOGLE_CLOUD_PROJECT || process.env.GAE_ENV || process.env.K_SERVICE);

async function getAccessToken() {
  // 1. Try local JSON credentials first
  if (hasCredentials) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    
    const now = Math.floor(Date.now() / 1000);
    const payload = Buffer.from(JSON.stringify({
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    })).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(credentials.private_key, 'base64url');

    const jwt = `${header}.${payload}.${signature}`;

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to obtain access token: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  // 2. Fallback to GCP Metadata Server (if running on GCP)
  if (isOnGcp) {
    const response = await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token', {
      headers: { 'Metadata-Flavor': 'Google' },
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`GCP Metadata Server returned status ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  throw new Error('Google Indexing Credentials are not configured.');
}

async function publishUrl(url, accessToken, type = 'URL_UPDATED') {
  try {
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url: url,
        type: type
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Google Indexing] ⚠️ Failed for ${url}: ${response.status} - ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`[Google Indexing] ⚠️ Error during publish for ${url}: ${error.message}`);
    return false;
  }
}

async function submitToGoogleIndexing(newJobs) {
  if (!hasCredentials && !isOnGcp) {
    return; // Google Indexing credentials not set, skip silently
  }

  if (!newJobs || newJobs.length === 0) {
    return;
  }

  try {
    const accessToken = await getAccessToken();
    
    const SITE_URL = env.siteUrl || 'https://remotejobdesk.com';
    const urls = newJobs.map((job) => {
      const slug = job.seo?.slug || slugify(job.originalTitle || 'remote-job');
      return `${SITE_URL}/jobs/${slug}-${job._id}`;
    });

    const extraUrls = [
      `${SITE_URL}/`,
    ];

    const allUrls = [...new Set([...urls, ...extraUrls])];

    console.log(`[Google Indexing] Notifying Google about ${allUrls.length} URLs...`);
    
    let successCount = 0;
    for (const url of allUrls) {
      const ok = await publishUrl(url, accessToken, 'URL_UPDATED');
      if (ok) successCount++;
      // Wait 150ms between requests to stay safe within Google's rate limits
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    console.log(`[Google Indexing] ✅ Successfully notified ${successCount}/${allUrls.length} URLs`);
  } catch (error) {
    console.warn(`[Google Indexing] ⚠️ Pipeline failed: ${error.message}`);
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

module.exports = { submitToGoogleIndexing, getAccessToken, publishUrl };
