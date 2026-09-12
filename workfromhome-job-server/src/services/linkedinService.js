const https = require('https');
const env = require('../config/env');
const OAuthToken = require('../models/OAuthToken');

function postHttps(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = typeof body === 'string' ? body : JSON.stringify(body);

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(raw || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`LinkedIn API HTTP ${res.statusCode}: ${JSON.stringify(data)}`));
            }
          } catch (err) {
            reject(new Error(`LinkedIn API Invalid JSON: ${raw}`));
          }
        });
      }
    );

    req.setTimeout(15000, () => {
      req.destroy(new Error('LinkedIn request timed out'));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getHttps(url, headers) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);

    const req = https.request(
      {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(raw || '{}');
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`LinkedIn API HTTP ${res.statusCode}: ${JSON.stringify(data)}`));
            }
          } catch (err) {
            reject(new Error(`LinkedIn API Invalid JSON: ${raw}`));
          }
        });
      }
    );

    req.setTimeout(15000, () => {
      req.destroy(new Error('LinkedIn request timed out'));
    });

    req.on('error', reject);
    req.end();
  });
}

function getAuthUrl() {
  const scope = encodeURIComponent('w_member_social openid profile email');
  const redirectUri = encodeURIComponent(env.linkedinRedirectUri);
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.linkedinClientId}&redirect_uri=${redirectUri}&scope=${scope}`;
}

async function handleOAuthCallback(code) {
  const postBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.linkedinRedirectUri,
    client_id: env.linkedinClientId,
    client_secret: env.linkedinClientSecret
  }).toString();

  const tokenData = await postHttps(
    'https://www.linkedin.com/oauth/v2/accessToken',
    {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    postBody
  );

  const accessToken = tokenData.access_token;
  const expiresIn = tokenData.expires_in || 5184000; // 60 days default
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  let authorUrn = '';
  let meta = tokenData;

  try {
    const userInfo = await getHttps('https://api.linkedin.com/v2/userinfo', {
      Authorization: `Bearer ${accessToken}`
    });
    if (userInfo?.sub) {
      authorUrn = `urn:li:person:${userInfo.sub}`;
      meta = { ...tokenData, userInfo };
    }
  } catch (e) {
    console.error('[LinkedIn] Failed to fetch userinfo:', e.message);
  }

  await OAuthToken.findOneAndUpdate(
    { provider: 'linkedin' },
    {
      accessToken,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      authorUrn,
      meta
    },
    { upsert: true, new: true }
  );

  return { success: true, authorUrn, expiresAt };
}

async function getValidToken() {
  const tokenDoc = await OAuthToken.findOne({ provider: 'linkedin' });
  if (!tokenDoc || !tokenDoc.accessToken) {
    return null;
  }

  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() <= Date.now()) {
    console.warn('[LinkedIn] Token expired');
    return null;
  }

  return tokenDoc;
}

async function postJobToLinkedIn(job) {
  if (!env.linkedinAutoPostEnabled) {
    return { skipped: true, reason: 'LinkedIn auto-posting is disabled in env' };
  }

  const tokenDoc = await getValidToken();
  if (!tokenDoc) {
    return { skipped: true, reason: 'LinkedIn access token not found or expired. Authorize via /api/admin/linkedin/auth' };
  }

  const siteUrl = env.siteUrl || 'https://remotejobdesk.com';
  const jobPath = job.shortId ? `/jobs/${job.shortId}` : `/jobs/${job._id}`;
  const jobUrl = `${siteUrl}${jobPath}`;
  const title = job.seo?.title || job.originalTitle || 'Remote Job Opening';
  const company = job.sourceLabel || 'Top Remote Company';
  const country = job.country || 'Global';
  const isSingapore = country.toUpperCase() === 'SG';

  const hashtags = isSingapore
    ? '#SingaporeJobs #RemoteJobs #WorkFromHome #SingaporeTech #Hiring'
    : '#RemoteJobs #TechHiring #WorkFromHome #Careers #RemoteWork';

  const text = `⚡ [100% REMOTE JOB] ${title}

🏢 Company: ${company}
📍 Location: 100% Remote (${country})
💼 Category: ${(job.category || 'WFH').toUpperCase()}

👉 Apply directly & view details:
🔗 ${jobUrl}

${hashtags}`;

  const candidates = [];
  if (env.linkedinOrgId) {
    candidates.push(`urn:li:organization:${env.linkedinOrgId}`);
  }
  if (tokenDoc.authorUrn) {
    candidates.push(tokenDoc.authorUrn);
  }

  let lastError = null;
  for (const author of candidates) {
    try {
      const payload = {
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text: (job.summary || title).slice(0, 200)
                },
                originalUrl: jobUrl,
                title: {
                  text: title.slice(0, 100)
                }
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const result = await postHttps(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          Authorization: `Bearer ${tokenDoc.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        },
        payload
      );

      console.log(`[LinkedIn] Job posted successfully as ${author}:`, result.id || 'OK');
      return { success: true, postId: result.id, author };
    } catch (err) {
      console.warn(`[LinkedIn] Post failed with author ${author}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('No author available for LinkedIn post');
}

module.exports = {
  getAuthUrl,
  handleOAuthCallback,
  postJobToLinkedIn,
  getValidToken
};
