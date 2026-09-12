const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const adminAuth = require('../middleware/adminAuth');
const { triggerIngestion, triggerAlertDigests } = require('../controllers/adminController');
const { getAuthUrl, handleOAuthCallback, postJobToLinkedIn } = require('../services/linkedinService');
const Job = require('../models/Job');

const router = express.Router();

router.post('/jobs/ingest', adminAuth, asyncHandler(triggerIngestion));
router.post('/alerts/digest', adminAuth, asyncHandler(triggerAlertDigests));

// LinkedIn OAuth Flow
router.get('/linkedin/auth', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

router.get('/linkedin/callback', asyncHandler(async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`<h3>LinkedIn Auth Error:</h3><p>${error_description || error}</p>`);
  }

  if (!code) {
    return res.status(400).send('<h3>Error: Missing authorization code</h3>');
  }

  const result = await handleOAuthCallback(code);
  res.send(`
    <div style="font-family: sans-serif; max-width: 500px; margin: 40px auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #ecfdf5; text-align: center;">
      <h2 style="color: #065f46; margin-top: 0;">🎉 LinkedIn Connected Successfully!</h2>
      <p style="color: #047857;">Your account has been connected. Remote jobs will now be auto-posted to LinkedIn.</p>
      <p style="font-size: 13px; color: #6b7280;">Author URN: ${result.authorUrn || 'N/A'}</p>
      <a href="/" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Website</a>
    </div>
  `);
}));

// Test LinkedIn posting with latest job
router.post('/linkedin/test', adminAuth, asyncHandler(async (req, res) => {
  const latestJob = await Job.findOne().sort({ createdAt: -1 });
  if (!latestJob) {
    return res.status(404).json({ success: false, message: 'No jobs found in database to post' });
  }

  const postResult = await postJobToLinkedIn(latestJob);
  res.json({ success: true, message: 'Job posted to LinkedIn successfully', postResult });
}));

module.exports = router;

