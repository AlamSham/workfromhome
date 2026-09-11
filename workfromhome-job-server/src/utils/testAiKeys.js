const dotenv = require('dotenv');
dotenv.config();
const OpenAI = require('openai');

async function testGroqSeo() {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  console.log('Testing Groq with model: openai/gpt-oss-120b...');
  const res = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: 'Return only valid JSON with keys: title, metaTitle, metaDescription, keywords, content'
      },
      {
        role: 'user',
        content: 'Write an SEO job profile for "Senior Frontend Engineer (Remote)"'
      }
    ],
    temperature: 0.3
  });

  const content = res.choices[0].message.content;
  console.log('Groq SEO Response (Length):', content.length);
  console.log('Sample output:', content.slice(0, 300));
}

testGroqSeo();
