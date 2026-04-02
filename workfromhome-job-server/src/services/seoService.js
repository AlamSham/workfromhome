const slugify = require('slugify');
const env = require('../config/env');
const getOpenAIClient = require('../config/openai');

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

  return {
    title: safeTitle,
    metaTitle: `${safeTitle} | Work From Home Jobs`,
    metaDescription: description,
    keywords,
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

async function generateSeoFields(jobData) {
  const fallback = buildFallbackSeo(jobData);
  const client = getOpenAIClient();

  if (!client) {
    return fallback;
  }

  const userPrompt = [
    'You are an SEO specialist for a job portal.',
    'Generate highly click-worthy but factual SEO metadata in strict JSON format with keys:',
    'title, metaTitle, metaDescription, keywords',
    'Rules:',
    '- Title should be concise and compelling (50-65 chars)',
    '- Meta title should include intent words like Remote, Work From Home, Hiring when relevant',
    '- Meta description should be 140-160 chars and action-oriented',
    '- keywords must be an array of 6 to 8 short strings',
    '- Never use markdown, only valid JSON',
    `Job title: ${jobData.title}`,
    `Job summary: ${jobData.summary || ''}`,
    `Job link: ${jobData.link}`
  ].join('\n');

  try {
    const response = await withTimeout(
      client.chat.completions.create({
        model: env.openaiModel,
        messages: [
          {
            role: 'system',
            content: 'Return only valid JSON. Do not include markdown or extra text.'
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
      return fallback;
    }

    const merged = {
      title: parsed.title || fallback.title,
      metaTitle: parsed.metaTitle || fallback.metaTitle,
      metaDescription: parsed.metaDescription || fallback.metaDescription,
      keywords: Array.isArray(parsed.keywords) && parsed.keywords.length ? parsed.keywords : fallback.keywords
    };

    merged.metaDescription = String(merged.metaDescription).slice(0, 160).trim();
    merged.keywords = merged.keywords.map((keyword) => String(keyword).trim()).filter(Boolean).slice(0, 8);

    merged.slug = slugify(merged.title, { lower: true, strict: true });

    return merged;
  } catch (error) {
    console.error('[SEO] OpenAI call failed, using fallback:', error.message);
    return fallback;
  }
}

module.exports = {
  generateSeoFields
};
