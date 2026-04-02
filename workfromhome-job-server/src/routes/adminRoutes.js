const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const adminAuth = require('../middleware/adminAuth');
const { triggerIngestion } = require('../controllers/adminController');

const router = express.Router();

router.post('/jobs/ingest', adminAuth, asyncHandler(triggerIngestion));

module.exports = router;
