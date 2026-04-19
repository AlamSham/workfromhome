const mongoose = require('mongoose');

const savedSearchAlertSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    search: { type: String, trim: true, maxlength: 120 },
    country: { type: String, trim: true, uppercase: true, maxlength: 8 },
    company: { type: String, trim: true, maxlength: 120 },
    seniority: { type: String, trim: true, maxlength: 32 },
    experience: { type: String, trim: true, maxlength: 32 },
    minSalary: { type: Number, min: 0 },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    basePath: { type: String, trim: true, default: '/' },
    label: { type: String, trim: true, maxlength: 180 },
    fingerprint: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    lastRequestedAt: { type: Date, default: Date.now },
    lastDigestAt: { type: Date },
    lastSentAt: { type: Date },
    sendCount: { type: Number, default: 0 },
    lastError: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavedSearchAlert', savedSearchAlertSchema);
