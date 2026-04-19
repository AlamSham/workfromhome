const slugify = require('slugify');

function buildJobPath(job = {}) {
  const id = String(job._id || '').trim();
  if (!id) {
    return '/';
  }

  const slugCandidate = job?.seo?.slug || job?.originalTitle || 'remote-job';
  const slug = slugify(String(slugCandidate || 'remote-job'), {
    lower: true,
    strict: true,
    trim: true
  }).slice(0, 80) || 'remote-job';

  return `/jobs/${slug}-${id}`;
}

function buildAbsoluteJobUrl(job = {}, siteUrl = '') {
  const normalizedSiteUrl = String(siteUrl || '').replace(/\/+$/, '');
  return `${normalizedSiteUrl}${buildJobPath(job)}`;
}

module.exports = {
  buildJobPath,
  buildAbsoluteJobUrl
};
