const connectDb = require('../config/db');
const { executeIngestion } = require('../cron/jobCron');

(async () => {
  try {
    await connectDb();
    await executeIngestion('manual-script');
    process.exit(0);
  } catch (error) {
    console.error('[Ingest Script] Failed:', error.message);
    process.exit(1);
  }
})();
