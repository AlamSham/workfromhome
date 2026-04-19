const Job = require('../models/Job');
const env = require('../config/env');
const { extractJobSignals, hasJobSignals } = require('../utils/jobSignals');
const { slugifyCompanyLabel } = require('../utils/companySlug');
const { buildJobQueryFilter } = require('../utils/jobQueryFilters');

function attachSignals(job) {
  if (!job) return job;
  if (hasJobSignals(job.signals)) {
    return job;
  }

  const signals = extractJobSignals({
    title: job.originalTitle,
    summary: job.summary,
    rawItem: job.rawItem
  });

  if (!hasJobSignals(signals)) {
    return job;
  }

  return {
    ...job,
    signals
  };
}

function mapCompanyAggregate(company) {
  return {
    label: company._id,
    slug: slugifyCompanyLabel(company._id),
    totalJobs: company.totalJobs || 0,
    latestPublishedAt: company.latestPublishedAt
  };
}

async function findCompanyBySlug(slug) {
  const companies = await Job.aggregate([
    {
      $match: {
        sourceLabel: {
          $exists: true,
          $type: 'string',
          $ne: ''
        }
      }
    },
    {
      $group: {
        _id: '$sourceLabel',
        totalJobs: { $sum: 1 },
        latestPublishedAt: { $max: '$publishedAt' }
      }
    }
  ]);

  return companies
    .map(mapCompanyAggregate)
    .find((company) => company.slug === slug);
}

async function listJobs(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const { filter } = buildJobQueryFilter({
    search: req.query.search,
    country: req.query.country,
    company: req.query.company,
    seniority: req.query.seniority,
    experience: req.query.experience,
    minSalary: req.query.minSalary,
    maxSearchChars: env.maxSearchChars
  });

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .select('_id source sourceLabel country category originalTitle summary link publishedAt expiresAt createdAt updatedAt seo.title seo.metaTitle seo.metaDescription seo.keywords seo.slug signals.seniority signals.experienceText signals.experienceMinYears signals.experienceMaxYears signals.salaryText signals.salaryCurrency signals.salaryMin signals.salaryMax signals.salaryInterval')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: jobs.map(attachSignals),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

async function listCompanies(req, res) {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 24));
  const minJobs = Math.max(1, Number(req.query.minJobs) || 2);

  const companies = await Job.aggregate([
    {
      $match: {
        sourceLabel: {
          $exists: true,
          $type: 'string',
          $ne: ''
        }
      }
    },
    {
      $group: {
        _id: '$sourceLabel',
        totalJobs: { $sum: 1 },
        latestPublishedAt: { $max: '$publishedAt' }
      }
    },
    {
      $match: {
        totalJobs: { $gte: minJobs }
      }
    },
    { $sort: { totalJobs: -1, latestPublishedAt: -1 } },
    { $limit: limit }
  ]);

  res.json({
    success: true,
    data: companies.map(mapCompanyAggregate)
  });
}

async function getCompanyBySlug(req, res) {
  const slug = slugifyCompanyLabel(String(req.params.slug || ''));
  if (!slug) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  const match = await findCompanyBySlug(slug);

  if (!match) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  return res.json({
    success: true,
    data: match
  });
}

async function listCompanyCountriesBySlug(req, res) {
  const slug = slugifyCompanyLabel(String(req.params.slug || ''));
  const minJobs = Math.max(1, Number(req.query.minJobs) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

  if (!slug) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  const company = await findCompanyBySlug(slug);
  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found'
    });
  }

  const countries = await Job.aggregate([
    {
      $match: {
        sourceLabel: company.label,
        country: {
          $exists: true,
          $type: 'string',
          $ne: ''
        }
      }
    },
    {
      $group: {
        _id: '$country',
        totalJobs: { $sum: 1 },
        latestPublishedAt: { $max: '$publishedAt' }
      }
    },
    {
      $match: {
        totalJobs: { $gte: minJobs }
      }
    },
    { $sort: { totalJobs: -1, latestPublishedAt: -1 } },
    { $limit: limit }
  ]);

  return res.json({
    success: true,
    data: countries.map((country) => ({
      companyLabel: company.label,
      companySlug: company.slug,
      country: String(country._id || '').toUpperCase(),
      totalJobs: country.totalJobs || 0,
      latestPublishedAt: country.latestPublishedAt
    }))
  });
}

async function listCompanyCountryCombos(req, res) {
  const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 300));
  const minJobs = Math.max(1, Number(req.query.minJobs) || 2);

  const combos = await Job.aggregate([
    {
      $match: {
        sourceLabel: {
          $exists: true,
          $type: 'string',
          $ne: ''
        },
        country: {
          $exists: true,
          $type: 'string',
          $ne: ''
        }
      }
    },
    {
      $group: {
        _id: {
          sourceLabel: '$sourceLabel',
          country: '$country'
        },
        totalJobs: { $sum: 1 },
        latestPublishedAt: { $max: '$publishedAt' }
      }
    },
    {
      $match: {
        totalJobs: { $gte: minJobs }
      }
    },
    { $sort: { totalJobs: -1, latestPublishedAt: -1 } },
    { $limit: limit }
  ]);

  return res.json({
    success: true,
    data: combos.map((combo) => ({
      companyLabel: combo._id.sourceLabel,
      companySlug: slugifyCompanyLabel(combo._id.sourceLabel),
      country: String(combo._id.country || '').toUpperCase(),
      totalJobs: combo.totalJobs || 0,
      latestPublishedAt: combo.latestPublishedAt
    }))
  });
}

async function getJobById(req, res) {
  const job = await Job.findById(req.params.id).lean();

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }

  return res.json({
    success: true,
    data: attachSignals(job)
  });
}

module.exports = {
  listJobs,
  listCompanies,
  getCompanyBySlug,
  listCompanyCountriesBySlug,
  listCompanyCountryCombos,
  getJobById
};
