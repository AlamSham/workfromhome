const cron = require('node-cron');
const env = require('../config/env');
const { ingestJobs } = require('../services/jobIngestionService');
const { runAlertDigests } = require('../services/alertDigestService');

let ingestionRunning = false;
let digestRunning = false;

async function executeIngestion(reason = 'cron') {
  if (ingestionRunning) {
    console.log(`[Cron] Previous ingestion still running. Skipping (${reason}).`);
    return;
  }

  ingestionRunning = true;
  try {
    console.log(`[Cron] Ingestion started (${reason}) at ${new Date().toISOString()}`);
    const result = await ingestJobs();
    console.log('[Cron] Ingestion completed:', result);
  } catch (error) {
    console.error('[Cron] Ingestion failed:', error.message);
  } finally {
    ingestionRunning = false;
  }
}

async function executeAlertDigests(reason = 'cron') {
  if (digestRunning) {
    console.log(`[Cron] Previous alert digest run still running. Skipping (${reason}).`);
    return;
  }

  digestRunning = true;
  try {
    console.log(`[Cron] Alert digests started (${reason}) at ${new Date().toISOString()}`);
    const result = await runAlertDigests(reason);
    console.log('[Cron] Alert digests completed:', result);
  } catch (error) {
    console.error('[Cron] Alert digests failed:', error.message);
  } finally {
    digestRunning = false;
  }
}

function startJobCron() {
  const ingestTask = cron.schedule(
    env.cronSchedule,
    async () => {
      await executeIngestion('scheduled');
    },
    {
      timezone: env.cronTimezone
    }
  );

  console.log(`[Cron] Scheduled with pattern "${env.cronSchedule}" (${env.cronTimezone})`);

  const digestTask = cron.schedule(
    env.alertDigestCronSchedule,
    async () => {
      await executeAlertDigests('scheduled');
    },
    {
      timezone: env.cronTimezone
    }
  );

  console.log(`[Cron] Alert digest scheduled with pattern "${env.alertDigestCronSchedule}" (${env.cronTimezone})`);

  setTimeout(() => {
    executeIngestion('startup').catch(() => null);
  }, 3000);

  setTimeout(() => {
    executeAlertDigests('startup').catch(() => null);
  }, 5000);

  return {
    ingestTask,
    digestTask
  };
}

module.exports = {
  startJobCron,
  executeIngestion,
  executeAlertDigests
};
