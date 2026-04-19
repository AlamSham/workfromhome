const { ingestJobs } = require('../services/jobIngestionService');
const { runAlertDigests } = require('../services/alertDigestService');

async function triggerIngestion(req, res) {
  const result = await ingestJobs();

  res.json({
    success: true,
    message: 'Ingestion completed successfully',
    data: result
  });
}

async function triggerAlertDigests(req, res) {
  const result = await runAlertDigests('admin');

  res.json({
    success: true,
    message: 'Alert digest run completed successfully',
    data: result
  });
}

module.exports = {
  triggerIngestion,
  triggerAlertDigests
};
