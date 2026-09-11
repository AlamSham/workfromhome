const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { getAccessToken, publishUrl } = require('../services/googleIndexing');
const env = require('../config/env');

async function runTest() {
  console.log('===================================================');
  console.log('🚀 Starting Google Indexing API Integration Test...');
  console.log('===================================================');

  const GOOGLE_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
  const GOOGLE_APP_CREDS = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';

  const isOnGcp = !!(
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GAE_ENV ||
    process.env.K_SERVICE ||
    process.env.GCP_PROJECT ||
    process.env.IS_GCP
  );

  if (!GOOGLE_KEY_JSON && !GOOGLE_APP_CREDS && !isOnGcp) {
    console.error('❌ Error: No Google credentials found in environment variables.');
    console.log('\nIf running locally, please add one of the following to your .env file:');
    console.log('1. GOOGLE_SERVICE_ACCOUNT_KEY=\'{"type": "service_account", ...}\'');
    console.log('OR');
    console.log('2. Set IS_GCP=true or GOOGLE_CLOUD_PROJECT if testing on a GCP Cloud instance.');
    console.log('===================================================');
    process.exit(1);
  }

  if (isOnGcp && !GOOGLE_KEY_JSON && !GOOGLE_APP_CREDS) {
    console.log('☁️ Detected Google Cloud Platform (GCP) environment. Using GCP Metadata Server token!');
  } else if (GOOGLE_KEY_JSON) {
    console.log('✅ Found GOOGLE_SERVICE_ACCOUNT_KEY in .env');
    try {
      const parsed = JSON.parse(GOOGLE_KEY_JSON);
      console.log(`🔹 Service Account Email: ${parsed.client_email}`);
      console.log(`🔹 Project ID: ${parsed.project_id}`);
    } catch (err) {
      console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON string:', err.message);
      console.log('Make sure it is valid JSON and wrapped in single quotes in your .env file.');
      process.exit(1);
    }
  } else {
    console.log(`✅ Found GOOGLE_APPLICATION_CREDENTIALS pointing to: ${GOOGLE_APP_CREDS}`);
    try {
      const fs = require('fs');
      const parsed = JSON.parse(fs.readFileSync(GOOGLE_APP_CREDS, 'utf8'));
      console.log(`🔹 Service Account Email: ${parsed.client_email}`);
      console.log(`🔹 Project ID: ${parsed.project_id}`);
    } catch (err) {
      console.error('❌ Failed to read/parse credentials file:', err.message);
      process.exit(1);
    }
  }

  try {
    console.log('\n🔐 Attempting to authenticate with Google OAuth2 server...');
    const token = await getAccessToken();
    console.log('✅ Authentication successful! Access token obtained.');

    const siteUrl = env.siteUrl || 'https://remotejobdesk.com';
    const testUrl = `${siteUrl.replace(/\/$/, '')}/`;

    console.log(`\n📤 Sending test index notification for URL: ${testUrl}`);
    const success = await publishUrl(testUrl, token, 'URL_UPDATED');

    if (success) {
      console.log('\n🎉 SUCCESS! Google Indexing API successfully processed the URL.');
      console.log('Your backend Google Indexing integration is fully working.');
    } else {
      console.log('\n⚠️ The request was sent but Google returned an error.');
      console.log('Common reasons:');
      console.log('1. The Service Account email is not added to Google Search Console.');
      console.log('2. The Service Account is not set as an OWNER of the property in Search Console.');
      console.log(`   (Go to Search Console -> Settings -> Users & Permissions -> Add Service Account email with Owner permission)`);
      console.log(`3. The domain in SITE_URL (${siteUrl}) does not match the verified property in Search Console.`);
    }
  } catch (error) {
    console.error('\n❌ Test Pipeline Failed:', error.message);
    if (error.message.includes('403')) {
      console.log('\n💡 Tip: This is usually a permission error.');
      console.log('Make sure Web Search Indexing API is enabled in Google Cloud Console, and the service account is an OWNER of the site in Search Console.');
    }
  }
  console.log('===================================================');
}

runTest();
