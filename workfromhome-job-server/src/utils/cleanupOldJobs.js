const mongoose = require('mongoose');
const env = require('../config/env');
const connectDb = require('../config/db');
const Job = require('../models/Job');

async function cleanupOldJobs() {
  console.log('[Cleanup] Connecting to database...');
  await connectDb();

  const now = new Date();
  const ttlDays = Math.max(1, env.jobTtlDays || 30);
  const cutoffDate = new Date(now.getTime() - ttlDays * 24 * 60 * 60 * 1000);

  const totalBefore = await Job.countDocuments();
  console.log(`[Cleanup] Current total jobs in database: ${totalBefore}`);
  console.log(`[Cleanup] Pruning jobs older than ${ttlDays} days (before ${cutoffDate.toISOString().split('T')[0]})...`);

  const deleteResult = await Job.deleteMany({
    $or: [
      { expiresAt: { $lte: now } },
      { publishedAt: { $lt: cutoffDate } },
      { createdAt: { $lt: cutoffDate } }
    ]
  });

  const totalAfter = await Job.countDocuments();
  console.log(`[Cleanup] Successfully removed ${deleteResult.deletedCount || 0} stale/expired jobs.`);
  console.log(`[Cleanup] Remaining active high-quality jobs: ${totalAfter}`);

  await mongoose.disconnect();
  console.log('[Cleanup] Disconnected. Done!');
}

if (require.main === module) {
  cleanupOldJobs().catch((err) => {
    console.error('[Cleanup] Error:', err);
    process.exit(1);
  });
}

module.exports = { cleanupOldJobs };
