const env = require('../config/env');

const ALLOWED_SENIORITY_VALUES = new Set([
  'internship',
  'entry-level',
  'mid-level',
  'senior',
  'lead',
  'staff',
  'principal',
  'director'
]);

const ALLOWED_EXPERIENCE_FILTERS = new Set(['0-2', '3-5', '6-plus']);

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSearchFilter(value = '', maxLength = 80) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeCountryFilter(value = '') {
  return String(value || '').trim().toUpperCase();
}

function normalizeCompanyFilter(value = '') {
  return String(value || '').trim();
}

function normalizeSeniorityFilter(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ALLOWED_SENIORITY_VALUES.has(normalized) ? normalized : '';
}

function normalizeExperienceFilter(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ALLOWED_EXPERIENCE_FILTERS.has(normalized) ? normalized : '';
}

function normalizeMinSalaryFilter(value = '') {
  const numeric = Number(String(value || '').trim());
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.floor(numeric);
}

function buildExperienceCondition(experience = '') {
  switch (experience) {
    case '0-2':
      return {
        'signals.experienceMinYears': {
          $gte: 0,
          $lte: 2
        }
      };
    case '3-5':
      return {
        'signals.experienceMinYears': {
          $gte: 3,
          $lte: 5
        }
      };
    case '6-plus':
      return {
        'signals.experienceMinYears': {
          $gte: 6
        }
      };
    default:
      return null;
  }
}

function buildJobQueryFilter({
  search = '',
  country = '',
  company = '',
  seniority = '',
  experience = '',
  minSalary = 0,
  publishedSince,
  maxSearchChars = 80
} = {}) {
  const normalizedSearch = normalizeSearchFilter(search, maxSearchChars);
  const normalizedCountry = normalizeCountryFilter(country);
  const normalizedCompany = normalizeCompanyFilter(company);
  const normalizedSeniority = normalizeSeniorityFilter(seniority);
  const normalizedExperience = normalizeExperienceFilter(experience);
  const normalizedMinSalary = normalizeMinSalaryFilter(minSalary);
  const conditions = [];

  // Only return active jobs (published within activeJobDays)
  const activeLimitDate = new Date(Date.now() - (env.activeJobDays * 24 * 60 * 60 * 1000));
  conditions.push({
    publishedAt: { $gte: activeLimitDate }
  });

  if (normalizedCountry) {
    conditions.push({ country: normalizedCountry });
  }

  if (normalizedCompany) {
    conditions.push({ sourceLabel: normalizedCompany });
  }

  if (normalizedSearch) {
    const safeSearchPattern = escapeRegex(normalizedSearch);
    conditions.push({
      $or: [
        { originalTitle: { $regex: safeSearchPattern, $options: 'i' } },
        { 'seo.metaTitle': { $regex: safeSearchPattern, $options: 'i' } },
        { 'seo.keywords': { $elemMatch: { $regex: safeSearchPattern, $options: 'i' } } }
      ]
    });
  }

  if (normalizedSeniority) {
    conditions.push({ 'signals.seniority': normalizedSeniority });
  }

  const experienceCondition = buildExperienceCondition(normalizedExperience);
  if (experienceCondition) {
    conditions.push(experienceCondition);
  }

  if (normalizedMinSalary > 0) {
    conditions.push({
      $or: [
        { 'signals.salaryMax': { $gte: normalizedMinSalary } },
        { 'signals.salaryMin': { $gte: normalizedMinSalary } }
      ]
    });
  }

  if (publishedSince instanceof Date && !Number.isNaN(publishedSince.getTime())) {
    conditions.push({
      publishedAt: {
        $gte: publishedSince
      }
    });
  }

  const filter = conditions.length <= 1
    ? (conditions[0] || {})
    : { $and: conditions };

  return {
    filter,
    normalized: {
      search: normalizedSearch,
      country: normalizedCountry,
      company: normalizedCompany,
      seniority: normalizedSeniority,
      experience: normalizedExperience,
      minSalary: normalizedMinSalary
    }
  };
}

module.exports = {
  buildJobQueryFilter,
  normalizeSearchFilter,
  normalizeCountryFilter,
  normalizeCompanyFilter,
  normalizeSeniorityFilter,
  normalizeExperienceFilter,
  normalizeMinSalaryFilter
};
