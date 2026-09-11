const mongoose = require('mongoose');
const env = require('../config/env');
const Job = require('../models/Job');

(async () => {
  console.log('====================================================');
  console.log('⚡ BULK HIGH-CTR TITLE & META RE-OPTIMIZER');
  console.log('====================================================');

  try {
    await mongoose.connect(env.mongoUri);
    console.log('✅ Connected to MongoDB Database');

    const totalJobs = await Job.countDocuments();
    console.log(`📊 Total Jobs in DB: ${totalJobs}`);

    // Fetch all jobs in batches to update metaTitle and metaDescription
    const cursor = Job.find({}).select('_id originalTitle sourceLabel country signals seo').cursor();
    
    let updatedCount = 0;
    const bulkOps = [];

    for await (const job of cursor) {
      const cleanTitle = (job.seo?.title || job.originalTitle || 'Remote Specialist')
        .replace(/^[-\s|]+|[-\s|]+$/g, '')
        .trim();
      const company = job.sourceLabel || 'Remote Employer';
      const salaryPart = job.signals?.salaryText ? ` (${job.signals.salaryText})` : '';

      // High-CTR Title Pattern: ⚡ {Title} at {Company} {Salary} — 100% Remote | Apply Direct
      const newMetaTitle = `⚡ ${cleanTitle} at ${company}${salaryPart} — 100% Remote | Apply Direct`;

      // High-CTR Meta Description
      const newMetaDesc = `Apply directly for ${cleanTitle} at ${company}.${salaryPart} Verified 100% work-from-home position. View requirements, benefits, salary & direct application link.`;

      bulkOps.push({
        updateOne: {
          filter: { _id: job._id },
          update: {
            $set: {
              'seo.metaTitle': newMetaTitle,
              'seo.metaDescription': newMetaDesc,
              'seo.title': cleanTitle,
            }
          }
        }
      });

      if (bulkOps.length >= 200) {
        await Job.bulkWrite(bulkOps);
        updatedCount += bulkOps.length;
        console.log(`  ✓ Updated ${updatedCount}/${totalJobs} jobs...`);
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length > 0) {
      await Job.bulkWrite(bulkOps);
      updatedCount += bulkOps.length;
    }

    console.log('\n====================================================');
    console.log(`🎉 SUCCESS: All ${updatedCount} existing jobs in MongoDB now have high-CTR MetaTitles & MetaDescriptions!`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
})();
