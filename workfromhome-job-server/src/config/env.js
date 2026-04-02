const dotenv = require('dotenv');

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  bodyLimit: process.env.BODY_LIMIT || '256kb',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workfromhome_jobs',
  cronSchedule: process.env.CRON_SCHEDULE || '0 */2 * * *',
  cronTimezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
  targetCountries: (
    process.env.TARGET_COUNTRIES || 'US,UK,DE,FR,NL,IE,ES,IT,SE,CH,NO,DK,FI,AT,BE,PT,PL,CZ,HU,RO,GR'
  )
    .split(',')
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean),
  rssRecencyDays: Number(process.env.RSS_RECENCY_DAYS) || 7,
  ingestMaxJobsPerRun: Number(process.env.INGEST_MAX_JOBS_PER_RUN) || 10,
  ingestFreshHours: Number(process.env.INGEST_FRESH_HOURS) || 72,
  ingestTrustedFreshHours: Number(process.env.INGEST_TRUSTED_FRESH_HOURS) || 336,
  ingestWfhRatio: Number(process.env.INGEST_WFH_RATIO) || 0.8,
  ingestMaxPerCountry: Number(process.env.INGEST_MAX_PER_COUNTRY) || 4,
  ingestMaxPerSource: Number(process.env.INGEST_MAX_PER_SOURCE) || 4,
  ingestMinJobRelevanceScore: Number(process.env.INGEST_MIN_JOB_RELEVANCE_SCORE) || 2,
  ingestMinGoogleDetailChars: Number(process.env.INGEST_MIN_GOOGLE_DETAIL_CHARS) || 220,
  ingestEnableGoogleRss: parseBoolean(process.env.INGEST_ENABLE_GOOGLE_RSS, true),
  ingestEnableRemotive: parseBoolean(process.env.INGEST_ENABLE_REMOTIVE, true),
  ingestEnableArbeitnow: parseBoolean(process.env.INGEST_ENABLE_ARBEITNOW, true),
  ingestEnableJobicy: parseBoolean(process.env.INGEST_ENABLE_JOBICY, true),
  ingestEnableRemoteok: parseBoolean(process.env.INGEST_ENABLE_REMOTEOK, true),
  remotiveApiUrl: process.env.REMOTIVE_API_URL || 'https://remotive.com/api/remote-jobs',
  arbeitnowApiUrl: process.env.ARBEITNOW_API_URL || 'https://www.arbeitnow.com/api/job-board-api',
  jobicyApiUrl: process.env.JOBICY_API_URL || 'https://jobicy.com/api/v2/remote-jobs',
  remoteokApiUrl: process.env.REMOTEOK_API_URL || 'https://remoteok.com/api',
  sourceFetchTimeoutMs: Number(process.env.SOURCE_FETCH_TIMEOUT_MS) || 15000,
  arbeitnowPages: Number(process.env.ARBEITNOW_PAGES) || 2,
  jobicyCount: Number(process.env.JOBICY_COUNT) || 100,
  jobTtlDays: Number(process.env.JOB_TTL_DAYS) || 15,
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 15000,
  maxSearchChars: Number(process.env.MAX_SEARCH_CHARS) || 80,
  adminApiKey: process.env.ADMIN_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || process.env.NVIDIA_API_KEY || '',
  openaiBaseUrl: process.env.OPENAI_BASE_URL || process.env.NVIDIA_BASE_URL || '',
  openaiModel: process.env.OPENAI_MODEL || process.env.NVIDIA_MODEL || 'gpt-4.1-mini'
};

module.exports = env;
