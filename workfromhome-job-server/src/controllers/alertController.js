const SavedSearchAlert = require('../models/SavedSearchAlert');

const ALLOWED_FREQUENCIES = new Set(['daily', 'weekly']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function normalizeText(value = '', maxLength = 120) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeFrequency(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ALLOWED_FREQUENCIES.has(normalized) ? normalized : 'daily';
}

function normalizeMinSalary(value = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return Math.floor(numeric);
}

function buildFingerprint(payload) {
  return [
    payload.email,
    payload.basePath,
    payload.search,
    payload.country,
    payload.company,
    payload.seniority,
    payload.experience,
    String(payload.minSalary || 0),
    payload.frequency
  ].join('::');
}

async function createSavedSearchAlert(req, res) {
  const email = normalizeEmail(req.body?.email);
  const search = normalizeText(req.body?.search, 80);
  const country = normalizeText(req.body?.country, 8).toUpperCase();
  const company = normalizeText(req.body?.company, 120);
  const seniority = normalizeText(req.body?.seniority, 32).toLowerCase();
  const experience = normalizeText(req.body?.experience, 32).toLowerCase();
  const minSalary = normalizeMinSalary(req.body?.minSalary);
  const frequency = normalizeFrequency(req.body?.frequency);
  const basePath = normalizeText(req.body?.basePath || '/', 180) || '/';
  const label = normalizeText(req.body?.label, 180);

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.'
    });
  }

  const alertPayload = {
    email,
    search,
    country,
    company,
    seniority,
    experience,
    minSalary,
    frequency,
    basePath,
    label,
    isActive: true,
    lastRequestedAt: new Date()
  };

  const fingerprint = buildFingerprint(alertPayload);

  const alert = await SavedSearchAlert.findOneAndUpdate(
    { fingerprint },
    {
      ...alertPayload,
      fingerprint
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return res.status(201).json({
    success: true,
    message: 'Search alert saved successfully.',
    data: {
      id: alert._id,
      email: alert.email,
      frequency: alert.frequency,
      basePath: alert.basePath
    }
  });
}

module.exports = {
  createSavedSearchAlert
};
