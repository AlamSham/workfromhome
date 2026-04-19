const connectDb = require('../config/db');
const { runAlertDigests } = require('../services/alertDigestService');

async function main() {
  await connectDb();
  const result = await runAlertDigests('script');
  console.log('[Digest] Completed:', result);
  process.exit(0);
}

main().catch((error) => {
  console.error('[Digest] Failed:', error);
  process.exit(1);
});
