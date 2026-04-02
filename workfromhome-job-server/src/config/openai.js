const OpenAI = require('openai');
const env = require('./env');

let client = null;

function getOpenAIClient() {
  if (!env.openaiApiKey) {
    return null;
  }

  if (!client) {
    const options = { apiKey: env.openaiApiKey };
    if (env.openaiBaseUrl) {
      options.baseURL = env.openaiBaseUrl;
    }
    client = new OpenAI(options);
  }

  return client;
}

module.exports = getOpenAIClient;
