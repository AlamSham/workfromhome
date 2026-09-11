const mongoose = require('mongoose');
const env = require('../config/env');
const Job = require('../models/Job');
const { generateSeoFields } = require('../services/seoService');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  console.log('====================================================');
  console.log('⚡ DATABASE SEO BACKFILL & RICH CONTENT OPTIMIZATION');
  console.log('====================================================');

  try {
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB Database');

    const totalJobs = await Job.countDocuments();
    console.log(`📊 Total Jobs in DB: ${totalJobs}`);

    // Find jobs that have missing seo, null/empty content, or short thin content (< 1000 chars)
    const allCandidateJobs = await Job.find({
      $or: [
        { 'seo.content': { $exists: false } },
        { 'seo.content': null },
        { 'seo.content': '' },
        { 'seo.metaTitle': { $exists: false } }
      ]
    }).lean();

    // Also find jobs where content is shorter than 1000 characters
    const thinJobs = await Job.find({
      'seo.content': { $exists: true, $ne: null, $ne: '' }
    }).select('_id originalTitle sourceLabel country link summary seo').lean();

    const shortContentJobs = thinJobs.filter(j => !j.seo?.content || j.seo.content.length < 1000);

    // Merge unique job IDs
    const jobMap = new Map();
    for (const j of allCandidateJobs) jobMap.set(String(j._id), j);
    for (const j of shortContentJobs) jobMap.set(String(j._id), j);

    const jobsToOptimize = Array.from(jobMap.values());
    console.log(`🎯 Jobs needing rich English SEO & FAQ enrichment: ${jobsToOptimize.length}`);

    if (jobsToOptimize.length === 0) {
      console.log('🎉 All existing jobs already have rich, comprehensive SEO content!');
      await mongoose.disconnect();
      process.exit(0);
    }

    let count = 0;
    let successCount = 0;

    for (const job of jobsToOptimize) {
      count++;
      console.log(`\n[${count}/${jobsToOptimize.length}] Processing Job ID: ${job._id}`);
      console.log(`   Title: ${job.originalTitle}`);
      console.log(`   Company: ${job.sourceLabel || 'N/A'} | Region: ${job.country || 'Global'}`);

      try {
        const newSeo = await generateSeoFields({
          title: job.originalTitle,
          summary: job.summary,
          link: job.link,
          sourceLabel: job.sourceLabel,
          country: job.country
        });

        await Job.updateOne(
          { _id: job._id },
          { $set: { seo: newSeo } }
        );

        successCount++;
        console.log(`   ✅ Enriched! Title: "${newSeo.metaTitle}"`);
        console.log(`   📝 Rich Content Length: ${newSeo.content ? newSeo.content.length : 0} characters`);
      } catch (err) {
        console.error(`   ❌ Failed to optimize job ${job._id}: ${err.message}`);
      }

      // Small delay to prevent API rate limiting (500ms per request)
      await sleep(500);
    }

    console.log('\n====================================================');
    console.log(`🎉 BACKFILL COMPLETED! Successfully enriched ${successCount}/${jobsToOptimize.length} jobs.`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
})();
