const Job = require('../models/Job');
const env = require('../config/env');
const { fetchCandidateJobs } = require('./jobSourceService');
const {
  isLikelyWorkFromHome,
  getJobRelevanceScore,
  isLikelyJobPosting
} = require('./rssService');
const { extractJobSignals } = require('../utils/jobSignals');
const { generateSeoFields } = require('./seoService');
const { submitToIndexNow } = require('./indexNow');
const TRUSTED_SOURCES = new Set([
  'remotive-api',
  'arbeitnow-api',
  'jobicy-api',
  'remoteok-api'
]);

function normalizeTitle(value = '') {
  const text = String(value)
    .split(/\s[-|]\s/)
    .filter(Boolean);
  const withoutLikelyPublisherSuffix =
    text.length > 1 && /^[a-zA-Z\s.&']{2,40}$/.test(text[text.length - 1])
      ? text.slice(0, -1).join(' ')
      : String(value);

  return withoutLikelyPublisherSuffix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|a|an|latest|new)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDedupeKey(item) {
  const titleFingerprint = normalizeTitle(item.title)
    .split(' ')
    .slice(0, 16)
    .join(' ');

  return `${item.country || 'US'}:${titleFingerprint}`;
}

function pickItemsByRatio(items, maxItems, wfhRatio) {
  const boundedRatio = Math.min(0.95, Math.max(0.5, wfhRatio));
  const desiredWfhCount = Math.ceil(maxItems * boundedRatio);

  const wfhItems = items.filter((item) => item.isLikelyWfh);
  const mixedItems = items.filter((item) => !item.isLikelyWfh);

  const selected = [];
  selected.push(...wfhItems.slice(0, desiredWfhCount));
  selected.push(...mixedItems.slice(0, Math.max(0, maxItems - selected.length)));

  if (selected.length < maxItems) {
    const selectedLinks = new Set(selected.map((item) => item.link));
    const remaining = items.filter((item) => !selectedLinks.has(item.link));
    selected.push(...remaining.slice(0, maxItems - selected.length));
  }

  return selected.slice(0, maxItems);
}

function diversifyByCountry(items, maxItems, maxPerCountry = 4) {
  const limitPerCountry = Math.max(1, maxPerCountry);
  const selected = [];
  const deferred = [];
  const countryCount = new Map();

  for (const item of items) {
    const country = String(item.country || 'US').toUpperCase();
    const count = countryCount.get(country) || 0;

    if (count < limitPerCountry) {
      selected.push(item);
      countryCount.set(country, count + 1);
      if (selected.length >= maxItems) {
        return selected.slice(0, maxItems);
      }
    } else {
      deferred.push(item);
    }
  }

  if (selected.length < maxItems) {
    selected.push(...deferred.slice(0, maxItems - selected.length));
  }

  return selected.slice(0, maxItems);
}

function diversifyBySource(items, maxItems, maxPerSource = 5) {
  const limitPerSource = Math.max(1, maxPerSource);
  const selected = [];
  const deferred = [];
  const sourceCount = new Map();

  for (const item of items) {
    const source = String(item.source || 'google-rss').toLowerCase();
    const count = sourceCount.get(source) || 0;

    if (count < limitPerSource) {
      selected.push(item);
      sourceCount.set(source, count + 1);
      if (selected.length >= maxItems) {
        return selected.slice(0, maxItems);
      }
    } else {
      deferred.push(item);
    }
  }

  if (selected.length < maxItems) {
    selected.push(...deferred.slice(0, maxItems - selected.length));
  }

  return selected.slice(0, maxItems);
}

function getTtlMs() {
  const ttlDays = Math.max(1, env.jobTtlDays);
  return ttlDays * 24 * 60 * 60 * 1000;
}

function computeExpiresAt(publishedAt) {
  const ttlMs = getTtlMs();
  const baseDate = publishedAt instanceof Date && !Number.isNaN(publishedAt.getTime()) ? publishedAt : new Date();
  return new Date(baseDate.getTime() + ttlMs);
}

async function ingestJobs() {
  const sourceBundle = await fetchCandidateJobs();
  const allItems = sourceBundle.items || [];
  const now = new Date();
  const maxJobsPerRun = Math.max(1, env.ingestMaxJobsPerRun);
  const freshWindowHours = Math.max(1, env.ingestFreshHours);
  const trustedFreshHours = Math.max(freshWindowHours, env.ingestTrustedFreshHours);
  const freshnessCutoff = new Date(now.getTime() - freshWindowHours * 60 * 60 * 1000);
  const trustedFreshnessCutoff = new Date(now.getTime() - trustedFreshHours * 60 * 60 * 1000);
  const maxFutureTolerance = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const result = {
    fetched: allItems.length,
    sourceStats: sourceBundle.sourceStats || {},
    fresh: 0,
    relevant: 0,
    selectedForRun: 0,
    created: 0,
    deletedExpired: 0,
    skippedOld: 0,
    skippedIrrelevant: 0,
    skippedDuplicate: 0
  };

  const expirationCutoff = new Date(now.getTime() - getTtlMs());
  const cleanupResult = await Job.deleteMany({
    $or: [
      { expiresAt: { $lte: now } },
      { expiresAt: { $exists: false }, publishedAt: { $lt: expirationCutoff } },
      {
        expiresAt: { $exists: false },
        publishedAt: { $exists: false },
        createdAt: { $lt: expirationCutoff }
      }
    ]
  });
  result.deletedExpired = cleanupResult.deletedCount || 0;

  const freshItems = allItems
    .map((item) => {
      const publishedAt = item.publishedAt ? new Date(item.publishedAt) : null;
      return {
        ...item,
        publishedAt,
        isTrustedSource: TRUSTED_SOURCES.has(String(item.source || '').toLowerCase()),
        isLikelyWfh: item.category === 'wfh' || isLikelyWorkFromHome(item),
        relevanceScore: getJobRelevanceScore(item)
      };
    })
    .filter((item) => {
      if (!item.publishedAt || item.publishedAt > maxFutureTolerance) {
        return false;
      }

      const cutoff = item.isTrustedSource ? trustedFreshnessCutoff : freshnessCutoff;
      return item.publishedAt >= cutoff;
    })
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  const relevantItems = freshItems.filter((item) =>
    isLikelyJobPosting(item, env.ingestMinJobRelevanceScore)
  );

  result.fresh = freshItems.length;
  result.relevant = relevantItems.length;
  result.skippedOld = Math.max(0, allItems.length - freshItems.length);
  result.skippedIrrelevant = Math.max(0, freshItems.length - relevantItems.length);

  const selectionPoolSize = Math.max(maxJobsPerRun * 8, maxJobsPerRun);
  const ratioSelectedItems = pickItemsByRatio(
    relevantItems,
    selectionPoolSize,
    env.ingestWfhRatio
  );
  const candidateItems = diversifyByCountry(
    ratioSelectedItems,
    selectionPoolSize,
    env.ingestMaxPerCountry
  );
  const sourceBalancedItems = diversifyBySource(
    candidateItems,
    selectionPoolSize,
    env.ingestMaxPerSource
  );
  result.selectedForRun = Math.min(sourceBalancedItems.length, maxJobsPerRun);

  const seenLinksInRun = new Set();
  const seenDedupeKeysInRun = new Set();
  const newlyCreatedJobs = [];

  for (const item of sourceBalancedItems) {
    if (result.created >= maxJobsPerRun) {
      break;
    }

    const dedupeKey = buildDedupeKey(item);
    const normalizedLink = String(item.link || '').trim();

    if (
      !normalizedLink ||
      seenLinksInRun.has(normalizedLink) ||
      seenDedupeKeysInRun.has(dedupeKey)
    ) {
      result.skippedDuplicate += 1;
      continue;
    }

    seenLinksInRun.add(normalizedLink);
    seenDedupeKeysInRun.add(dedupeKey);

    const exists = await Job.exists({
      $or: [
        { link: normalizedLink },
        { dedupeKey },
        { country: item.country || 'US', originalTitle: item.title }
      ]
    });

    if (exists) {
      result.skippedDuplicate += 1;
      continue;
    }

    const seo = await generateSeoFields({
      title: item.title,
      summary: item.summary,
      link: item.link
    });
    const signals = extractJobSignals({
      title: item.title,
      summary: item.summary,
      rawItem: item.rawItem
    });

    try {
      const createdJob = await Job.create({
        source: item.source || 'google-rss',
        sourceLabel: item.sourceLabel || '',
        country: item.country || 'US',
        category: item.category || 'wfh',
        dedupeKey,
        originalTitle: item.title,
        summary: item.summary,
        link: normalizedLink,
        publishedAt: item.publishedAt,
        expiresAt: computeExpiresAt(item.publishedAt),
        seo,
        signals,
        rawItem: item.rawItem
      });

      newlyCreatedJobs.push(createdJob);
      result.created += 1;
    } catch (error) {
      if (error?.code === 11000) {
        result.skippedDuplicate += 1;
        continue;
      }
      throw error;
    }
  }

  // Notify search engines about new URLs (Bing, Yandex — instant indexing)
  if (newlyCreatedJobs.length > 0) {
    submitToIndexNow(newlyCreatedJobs).catch(() => {});
  }

  return result;
}

module.exports = {
  ingestJobs
};
