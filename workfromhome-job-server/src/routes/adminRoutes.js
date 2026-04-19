const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const adminAuth = require('../middleware/adminAuth');
const { triggerIngestion, triggerAlertDigests } = require('../controllers/adminController');

const router = express.Router();

router.post('/jobs/ingest', adminAuth, asyncHandler(triggerIngestion));
router.post('/alerts/digest', adminAuth, asyncHandler(triggerAlertDigests));

module.exports = router;
