const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { createSavedSearchAlert } = require('../controllers/alertController');

const router = express.Router();

router.post('/', asyncHandler(createSavedSearchAlert));

module.exports = router;
