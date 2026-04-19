const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    slug: { type: String, trim: true }
  },
  { _id: false }
);

const signalsSchema = new mongoose.Schema(
  {
    seniority: { type: String, trim: true },
    experienceText: { type: String, trim: true },
    experienceMinYears: { type: Number },
    experienceMaxYears: { type: Number },
    salaryText: { type: String, trim: true },
    salaryCurrency: { type: String, trim: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryInterval: { type: String, trim: true }
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    source: { type: String, default: 'google-rss' },
    sourceLabel: { type: String, trim: true, index: true },
    country: { type: String, uppercase: true, trim: true, default: 'US', index: true },
    category: { type: String, enum: ['wfh', 'mixed'], default: 'wfh' },
    dedupeKey: { type: String, unique: true, sparse: true, index: true },
    originalTitle: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    link: { type: String, required: true, unique: true, index: true },
    publishedAt: { type: Date },
    expiresAt: { type: Date, index: true },
    seo: seoSchema,
    signals: signalsSchema,
    rawItem: { type: Object }
  },
  { timestamps: true }
);

// MongoDB TTL cleanup: document auto-deletes once expiresAt is reached.
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
jobSchema.index({ 'signals.seniority': 1, publishedAt: -1 });
jobSchema.index({ 'signals.experienceMinYears': 1, publishedAt: -1 });
jobSchema.index({ 'signals.salaryMax': 1, publishedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
