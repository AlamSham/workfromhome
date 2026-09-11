const mongoose = require('mongoose');
const env = require('../config/env');
const Job = require('../models/Job');
const { getAccessToken, publishUrl } = require('../services/googleIndexing');

function slugifyText(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getJobCanonicalUrl(job, siteUrl) {
  const cleanTitle = slugifyText(job.seo?.title || job.originalTitle || 'remote-job');
  const company = slugifyText(job.sourceLabel || '');
  const idStr = String(job._id || '');
  const shortId = idStr.slice(-6) || idStr;
  const slug = company ? `${cleanTitle}-${company}-${shortId}` : `${cleanTitle}-${shortId}`;
  return `${siteUrl}/jobs/${slug}`;
}

(async () => {
  console.log('===================================================');
  console.log('🚀 SUBMITTING TOP EXISTING JOBS TO GOOGLE INDEXING API');
  console.log('===================================================');

  try {
    await mongoose.connect(env.mongoUri);
    const token = await getAccessToken();
    const siteUrl = env.siteUrl || 'https://remotejobdesk.com';

    // Pick top 40 freshest jobs from MongoDB
    const recentJobs = await Job.find({})
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(40)
      .lean();

    console.log(`Found ${recentJobs.length} fresh existing jobs. Submitting to Googlebot...`);

    let count = 0;
    for (const job of recentJobs) {
      const url = getJobCanonicalUrl(job, siteUrl);
      const ok = await publishUrl(url, token);
      count++;
      console.log(`[${count}/${recentJobs.length}] ${ok ? '✅' : '❌'} ${url}`);
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('===================================================');
    console.log(`🎉 SUCCESS: ${count} Existing Jobs Submitted to Google for Immediate Crawl!`);
    console.log('===================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error submitting existing jobs:', err.message);
    process.exit(1);
  }
})();
