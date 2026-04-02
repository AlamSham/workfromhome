const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { listJobs, getJobById } = require('../controllers/jobController');

const router = express.Router();

router.get('/', asyncHandler(listJobs));
router.get('/:id', asyncHandler(getJobById));

module.exports = router;
