const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const {
  listJobs,
  listCompanies,
  getCompanyBySlug,
  listCompanyCountriesBySlug,
  listCompanyCountryCombos,
  getJobById
} = require('../controllers/jobController');

const router = express.Router();

router.get('/', asyncHandler(listJobs));
router.get('/company-country-combos', asyncHandler(listCompanyCountryCombos));
router.get('/companies', asyncHandler(listCompanies));
router.get('/companies/:slug/countries', asyncHandler(listCompanyCountriesBySlug));
router.get('/companies/:slug', asyncHandler(getCompanyBySlug));
router.get('/:id', asyncHandler(getJobById));

module.exports = router;
