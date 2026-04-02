const { ingestJobs } = require('../services/jobIngestionService');

async function triggerIngestion(req, res) {
  const result = await ingestJobs();

  res.json({
    success: true,
    message: 'Ingestion completed successfully',
    data: result
  });
}

module.exports = {
  triggerIngestion
};
