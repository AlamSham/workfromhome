function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 65);
}

function getJobSlug(job) {
  const seoSlug = String(job?.seo?.slug || '').trim();
  if (seoSlug) return seoSlug;
  return slugify(String(job?.originalTitle || 'remote-job')) || 'remote-job';
}

function buildJobPath(job = {}) {
  const titleSlug = getJobSlug(job);
  const companySlug = slugify(job?.sourceLabel || '');
  const idStr = String(job?._id || '');
  const shortId = (job.shortId || idStr.slice(-6) || '').toLowerCase();

  if (companySlug && !titleSlug.includes(companySlug)) {
    return `/jobs/${titleSlug}-${companySlug}-${shortId}`;
  }
  return `/jobs/${titleSlug}-${shortId}`;
}

function buildAbsoluteJobUrl(job = {}, siteUrl = 'https://remotejobdesk.com') {
  const normalizedSiteUrl = String(siteUrl || 'https://remotejobdesk.com').replace(/\/+$/, '');
  return `${normalizedSiteUrl}${buildJobPath(job)}`;
}

module.exports = {
  slugify,
  getJobSlug,
  buildJobPath,
  buildAbsoluteJobUrl
};
