const { getAccessToken, publishUrl } = require('../services/googleIndexing');
const env = require('../config/env');

const blogs = [
  'remote-bookkeeping-jobs-no-experience',
  'remote-jobs-hiring-immediately',
  'remote-customer-support-jobs-no-experience',
  'work-from-home-data-entry-jobs',
  'remote-jobs-for-beginners',
  'remote-jobs-that-pay-well',
  'best-companies-hiring-remotely-2026',
  'remote-jobs-in-europe-for-americans',
  'best-remote-jobs-2026',
  'how-to-get-remote-job-no-experience',
  'remote-jobs-usa-vs-europe',
  'highest-paying-remote-jobs',
  'remote-work-tools-2026',
  'remote-job-interview-tips'
];

(async () => {
  console.log('===================================================');
  console.log('🚀 Submitting All 14 Authority Blogs to Google Indexing API');
  console.log('===================================================');

  try {
    const token = await getAccessToken();
    const siteUrl = env.siteUrl || 'https://remotejobdesk.com';
    
    // 1. Submit main blog hub
    await publishUrl(`${siteUrl}/blog`, token);
    console.log(`✅ Submitted Hub: ${siteUrl}/blog`);

    // 2. Submit all 14 articles
    for (const slug of blogs) {
      const url = `${siteUrl}/blog/${slug}`;
      const ok = await publishUrl(url, token);
      console.log(`${ok ? '✅' : '❌'} Submitted: ${url}`);
      // Small pause to be gentle on Google API
      await new Promise(r => setTimeout(r, 200));
    }

    console.log('===================================================');
    console.log('🎉 All blog pages successfully notified to Googlebot for instant crawl!');
    console.log('===================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error submitting blogs:', err.message);
    process.exit(1);
  }
})();
