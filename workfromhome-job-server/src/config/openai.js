const OpenAI = require('openai');
const env = require('./env');

let groqClient = null;
let groqClient2 = null;
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

module.exports = {
  getGroqClient,
  getGroqClient2,
  getGeminiClient
};


