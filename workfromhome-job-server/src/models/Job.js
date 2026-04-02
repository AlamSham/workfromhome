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
    rawItem: { type: Object }
  },
  { timestamps: true }
);

// MongoDB TTL cleanup: document auto-deletes once expiresAt is reached.
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Job', jobSchema);
