const mongoose = require('mongoose');
const env = require('../config/env');
const Job = require('../models/Job');
const { generateSeoFields } = require('../services/seoService');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('====================================================');
  console.log('⚡ DATABASE SEO BACKFILL & OPTIMIZATION SCRIPT');
  console.log('====================================================');

  try {
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB Database');

    const totalJobs = await Job.countDocuments();
    console.log(`📊 Total Jobs in DB: ${totalJobs}`);

    // Find jobs missing rich content or with content < 200 chars
    const unoptimizedJobs = await Job.find({
      $or: [
        { 'seo.content': { $exists: false } },
        { 'seo.content': null },
        { 'seo.content': '' }
      ]
    }).lean();

    console.log(`🎯 Jobs needing Groq AI SEO enrichment: ${unoptimizedJobs.length}`);

    if (unoptimizedJobs.length === 0) {
      console.log('🎉 All existing jobs are already optimized with rich AI content!');
      await mongoose.disconnect();
      process.exit(0);
    }

    let count = 0;
    let successCount = 0;

    for (const job of unoptimizedJobs) {
      count++;
      console.log(`\n[${count}/${unoptimizedJobs.length}] Processing Job ID: ${job._id}`);
      console.log(`   Original Title: ${job.originalTitle}`);

      try {
        const newSeo = await generateSeoFields({
          title: job.originalTitle,
          summary: job.summary,
          link: job.link
        });

        await Job.updateOne(
          { _id: job._id },
          { $set: { seo: newSeo } }
        );

        successCount++;
        console.log(`   ✅ Optimized! AI Content Length: ${newSeo.content ? newSeo.content.length : 0} chars`);
      } catch (err) {
        console.error(`   ❌ Failed to optimize job ${job._id}: ${err.message}`);
      }

      // Small delay to prevent Groq API rate limit (600ms per request)
      await sleep(600);
    }

    console.log('\n====================================================');
    console.log(`🎉 BACKFILL COMPLETED! Successfully optimized ${successCount}/${unoptimizedJobs.length} jobs.`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
})();
