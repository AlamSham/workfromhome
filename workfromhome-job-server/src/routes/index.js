const express = require('express');
const jobRoutes = require('./jobRoutes');
const adminRoutes = require('./adminRoutes');
const alertRoutes = require('./alertRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    now: new Date().toISOString()
  });
});

router.use('/jobs', jobRoutes);
router.use('/alerts', alertRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
