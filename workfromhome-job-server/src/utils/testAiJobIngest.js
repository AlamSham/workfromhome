const { fetchCandidateJobs } = require('../services/jobSourceService');
const { generateSeoFields } = require('../services/seoService');
const getOpenAIClient = require('../config/openai');
const env = require('../config/env');

(async () => {
  console.log('----------------------------------------------------');
  console.log('🧪 WORK FROM HOME JOB PORTAL - AI INGESTION TEST SCRIPT');
  console.log('----------------------------------------------------');

  console.log(`\n1. Checking AI Providers Configuration:`);
  console.log(`   - Groq API Key: ${env.groqApiKey ? 'YES (' + env.groqApiKey.substring(0, 10) + '...)' : 'NO (Add GROQ_API_KEY in .env for FREE AI)'} [Model: ${env.groqModel}]`);
  console.log(`   - Gemini API Key: ${env.geminiApiKey ? 'YES (' + env.geminiApiKey.substring(0, 10) + '...)' : 'NO (Add GEMINI_API_KEY in .env for FREE AI)'} [Model: ${env.geminiModel}]`);
  console.log(`   - OpenAI API Key: ${env.openaiApiKey ? 'YES (' + env.openaiApiKey.substring(0, 10) + '...)' : 'NO'} [Model: ${env.openaiModel}]`);


  console.log('\n2. Scraping/Fetching candidate jobs from APIs & Google RSS...');
  const startTime = Date.now();
  const { items, sourceStats } = await fetchCandidateJobs();
  const fetchDuration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`   ⏱️ Fetch Completed in ${fetchDuration}s`);
  console.log('   📊 Jobs collected per source:');
  console.table(sourceStats);

  if (!items || items.length === 0) {
    console.error('❌ No jobs were fetched. Please check internet connection or source endpoints.');
    process.exit(1);
  }

  // Pick one sample job
  const sampleJob = items[0];
  console.log('\n3. Sample Scraped Job Selected for AI Enrichment:');
  console.log(`   - Source: ${sampleJob.source} (${sampleJob.sourceLabel})`);
  console.log(`   - Raw Title: ${sampleJob.title}`);
  console.log(`   - Country: ${sampleJob.country}`);
  console.log(`   - Category: ${sampleJob.category}`);
  console.log(`   - Link: ${sampleJob.link}`);
  console.log(`   - Raw Summary Snippet: ${sampleJob.summary.slice(0, 150)}...`);

  console.log('\n4. Sending job to OpenAI for AI SEO Enrichment...');
  const aiStartTime = Date.now();
  const seoFields = await generateSeoFields(sampleJob);
  const aiDuration = ((Date.now() - aiStartTime) / 1000).toFixed(2);

  console.log(`   ⏱️ AI Processing Completed in ${aiDuration}s\n`);
  console.log('====================================================');
  console.log('✨ AI SEO ENRICHMENT RESULTS:');
  console.log('====================================================');
  console.log(JSON.stringify(seoFields, null, 2));

  console.log('\n----------------------------------------------------');
  if (seoFields.metaTitle && seoFields.metaDescription && seoFields.keywords) {
    console.log('✅ TEST RESULT: AI SEO Scraping & Enrichment is working SUCCESSFULLY!');
  } else {
    console.log('⚠️ TEST RESULT: Fallback SEO was returned. Please verify OpenAI API Key validity.');
  }
  console.log('----------------------------------------------------\n');
  process.exit(0);
})();
