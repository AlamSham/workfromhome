const slugify = require('slugify');
const env = require('../config/env');

function buildFallbackSeo({ title, summary }) {
  const safeTitle = title || 'Work From Home Job';
  const description =
    summary?.slice(0, 155) || 'New work from home opportunity. Explore role details, required skills, and apply quickly.';

  const keywords = Array.from(
    new Set(
      safeTitle
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
        .slice(0, 7)
        .concat(['work from home', 'remote jobs'])
    )
  );

  const fallbackContent = summary && summary.length > 200
    ? summary
    : `${safeTitle} is a remote work-from-home opportunity. Candidate will perform core tasks in a flexible remote setting. Minimum required skills include strong communication, role-specific technical capabilities, and self-management. Click apply now to view the full job posting on the official company career portal.`;

  return {
    title: safeTitle,
    metaTitle: `${safeTitle} | Work From Home Jobs`,
    metaDescription: description,
    keywords,
    content: fallbackContent,
    slug: slugify(safeTitle, { lower: true, strict: true })
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function extractJsonCandidate(text = '') {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text.trim();
}

function extractMessageText(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        return part?.text || '';
      })
      .join('\n')
      .trim();
  }

  return '';
}

async function withTimeout(promise, timeoutMs) {
  let timeoutId = null;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`AI request timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

const { getOpenAIClient, getGroqClient, getGroqClient2, getGeminiClient } = require('../config/openai');

function getAvailableProviders() {
  const providers = [];
  
  // 1. Groq Primary Key - Model 1
  const groq1 = getGroqClient();
  if (groq1) {
    providers.push({ name: 'Groq-Primary (70B)', client: groq1, model: env.groqModel || 'llama-3.3-70b-versatile' });
    providers.push({ name: 'Groq-Primary (8B Backup Model)', client: groq1, model: 'llama-3.1-8b-instant' });
  }

  // 2. Groq Secondary Key (if user adds GROQ_API_KEY_2 in .env)
  const groq2 = getGroqClient2();
  if (groq2) {
    providers.push({ name: 'Groq-Secondary (70B)', client: groq2, model: env.groqModel || 'llama-3.3-70b-versatile' });
    providers.push({ name: 'Groq-Secondary (8B Backup Model)', client: groq2, model: 'llama-3.1-8b-instant' });
  }

  // 3. Gemini AI
  const gemini = getGeminiClient();
  if (gemini) providers.push({ name: 'Gemini', client: gemini, model: env.geminiModel });

  // 4. OpenAI
  const openai = getOpenAIClient();
  if (openai) providers.push({ name: 'OpenAI', client: openai, model: env.openaiModel });

  return providers;
}

async function generateSeoFields(jobData) {
  const fallback = buildFallbackSeo(jobData);
  const providers = getAvailableProviders();

  if (!providers.length) {
    return fallback;
  }

  const userPrompt = [
    'You are an expert SEO Content Generator for remote job listings.',
    'Generate comprehensive, high-value, and click-worthy SEO metadata and rich content in strict JSON format with keys:',
    'title, metaTitle, metaDescription, keywords, content',
    'Strict Rules:',
    '1. title: Concise and factual job title (50-65 chars)',
    '2. metaTitle: High-CTR meta title with intent keywords like Remote, Work From Home, Hiring (55-65 chars)',
    '3. metaDescription: Compelling, action-oriented meta description (140-160 chars)',
    '4. keywords: Array of 6 to 8 relevant keywords/phrases',
    '5. content: Write a rich, detailed, comprehensive job posting overview between 1200 and 1800 characters (approx 250-350 words). Include sections:',
    '   - Position Overview & Remote Work Setup',
    '   - Key Responsibilities & Daily Tasks',
    '   - Required Qualifications & Technical Skills',
    '   - Why Join & Remote Work Benefits',
    '   - Application Tips for Candidates',
    '6. Do NOT include markdown code blocks (```json) inside the JSON strings. Output valid JSON only.',
    `Job Title: ${jobData.title}`,
    `Job Summary/Raw: ${jobData.summary || ''}`,
    `Job Link: ${jobData.link}`
  ].join('\n');

  for (const provider of providers) {
    try {
      console.log(`[SEO] Attempting AI generation with ${provider.name} (${provider.model})...`);
      const response = await withTimeout(
        provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: 'Return only valid JSON matching the requested schema. Do not output conversational text.'
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.4
        }),
        env.aiTimeoutMs
      );

      const rawOutput = extractMessageText(response?.choices?.[0]?.message?.content);
      const parsed = safeJsonParse(extractJsonCandidate(rawOutput));

      if (!parsed) {
        console.warn(`[SEO] ${provider.name} returned invalid JSON, trying next provider...`);
        continue;
      }

      const merged = {
        title: parsed.title || fallback.title,
        metaTitle: parsed.metaTitle || fallback.metaTitle,
        metaDescription: parsed.metaDescription || fallback.metaDescription,
        keywords: Array.isArray(parsed.keywords) && parsed.keywords.length ? parsed.keywords : fallback.keywords,
        content: parsed.content && String(parsed.content).length >= 200 ? String(parsed.content).trim() : fallback.content
      };

      merged.metaDescription = String(merged.metaDescription).slice(0, 160).trim();
      merged.keywords = merged.keywords.map((keyword) => String(keyword).trim()).filter(Boolean).slice(0, 8);
      merged.slug = slugify(merged.title, { lower: true, strict: true });

      console.log(`[SEO] ✅ Successfully generated SEO & Rich Content (${merged.content.length} chars) using ${provider.name}`);
      return merged;
    } catch (error) {
      console.error(`[SEO] ${provider.name} call failed (${error.message}), trying next fallback...`);
    }
  }

  console.warn('[SEO] All AI providers failed or unconfigured, using built-in smart fallback.');
  return fallback;
}

module.exports = {
  generateSeoFields
};

