const OpenAI = require('openai');
const env = require('./env');

let openaiClient = null;
let groqClient = null;
let geminiClient = null;

function getGroqClient() {
  if (!env.groqApiKey) return null;
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: env.groqApiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    });
  }
  return groqClient;
}

function getGeminiClient() {
  if (!env.geminiApiKey) return null;
  if (!geminiClient) {
    geminiClient = new OpenAI({
      apiKey: env.geminiApiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
    });
  }
  return geminiClient;
}

function getOpenAIClient() {
  if (!env.openaiApiKey) return null;
  if (!openaiClient) {
    const options = { apiKey: env.openaiApiKey };
    if (env.openaiBaseUrl) {
      options.baseURL = env.openaiBaseUrl;
    }
    openaiClient = new OpenAI(options);
  }
  return openaiClient;
}

let groqClient2 = null;

function getGroqClient2() {
  if (!env.groqApiKey2) return null;
  if (!groqClient2) {
    groqClient2 = new OpenAI({
      apiKey: env.groqApiKey2,
      baseURL: 'https://api.groq.com/openai/v1'
    });
  }
  return groqClient2;
}

module.exports = getOpenAIClient;
module.exports.getOpenAIClient = getOpenAIClient;
module.exports.getGroqClient = getGroqClient;
module.exports.getGroqClient2 = getGroqClient2;
module.exports.getGeminiClient = getGeminiClient;


