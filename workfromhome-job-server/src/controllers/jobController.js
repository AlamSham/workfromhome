const Job = require('../models/Job');
const env = require('../config/env');

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listJobs(req, res) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
  const rawSearch = String(req.query.search || '').trim();
  const search = rawSearch.slice(0, env.maxSearchChars);
  const safeSearchPattern = escapeRegex(search);
  const country = (req.query.country || '').trim().toUpperCase();

  const filter = {};

  if (country) {
    filter.country = country;
  }

  if (search) {
    filter.$or = [
      { originalTitle: { $regex: safeSearchPattern, $options: 'i' } },
      { 'seo.metaTitle': { $regex: safeSearchPattern, $options: 'i' } },
      { 'seo.keywords': { $elemMatch: { $regex: safeSearchPattern, $options: 'i' } } }
    ];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
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
    data: job
  });
}

module.exports = {
  listJobs,
  getJobById
};
