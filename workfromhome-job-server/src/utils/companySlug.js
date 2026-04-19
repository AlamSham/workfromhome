function slugifyCompanyLabel(value = '') {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

module.exports = {
  slugifyCompanyLabel
};
