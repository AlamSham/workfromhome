const cron = require('node-cron');
const env = require('../config/env');
const { ingestJobs } = require('../services/jobIngestionService');

let running = false;

async function executeIngestion(reason = 'cron') {
  if (running) {
    console.log(`[Cron] Previous ingestion still running. Skipping (${reason}).`);
    return;
  }

  running = true;
  try {
    console.log(`[Cron] Ingestion started (${reason}) at ${new Date().toISOString()}`);
    const result = await ingestJobs();
    console.log('[Cron] Ingestion completed:', result);
  } catch (error) {
    console.error('[Cron] Ingestion failed:', error.message);
  } finally {
    running = false;
  }
}

function startJobCron() {
  const task = cron.schedule(
    env.cronSchedule,
    async () => {
      await executeIngestion('scheduled');
    },
    {
      timezone: env.cronTimezone
    }
  );

  console.log(`[Cron] Scheduled with pattern "${env.cronSchedule}" (${env.cronTimezone})`);

  setTimeout(() => {
    executeIngestion('startup').catch(() => null);
  }, 3000);

  return task;
}

module.exports = {
  startJobCron,
  executeIngestion
};
