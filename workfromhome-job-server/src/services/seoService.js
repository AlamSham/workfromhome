const slugify = require('slugify');
const env = require('../config/env');

function buildFallbackSeo({ title, summary, sourceLabel, country }) {
  const safeTitle = title || 'Remote Work From Home Job';
  const company = sourceLabel || 'Top Employer';
  const location = country ? `in ${country}` : 'Worldwide';
  const description =
    summary?.slice(0, 155) || `Apply now for ${safeTitle} at ${company}. Explore role requirements, remote benefits, salary range, and submit your application online today.`;

  const keywords = Array.from(
    new Set(
      safeTitle
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
        .slice(0, 7)
        .concat(['work from home', 'remote jobs', 'online careers', 'hiring immediately'])
    )
  );

  const fallbackContent = summary && summary.length > 400
    ? summary
    : [
        `About the Role:`,
        `The ${safeTitle} position is a fully remote, work-from-home opportunity with ${company} accessible to qualified candidates ${location}. In this role, you will collaborate with cross-functional team members, manage independent workflows, and contribute directly to organizational milestones from your home office.`,
        ``,
        `Key Responsibilities:`,
        `- Execute core project deliverables with high attention to detail and precision.`,
        `- Maintain seamless daily communication and status reporting using digital remote collaboration tools.`,
        `- Identify workflow improvements, solve complex operational challenges, and meet target deadlines.`,
        `- Adhere to company compliance standards, data security protocols, and operational best practices.`,
        ``,
        `Required Qualifications & Skills:`,
        `- Demonstrated background and proven relevant experience in ${safeTitle.toLowerCase()} or related domain.`,
        `- Strong written and verbal English communication abilities suitable for asynchronous remote teamwork.`,
        `- Highly self-directed work ethic with proficient time management and problem-solving skills.`,
        `- Reliable high-speed internet connection and a dedicated home office workstation.`,
        ``,
        `Benefits & Perks:`,
        `- 100% remote flexibility — work comfortably from your preferred location.`,
        `- Competitive compensation package commensurate with experience and industry benchmarks.`,
        `- Opportunity for ongoing professional development, career mentorship, and skill advancement.`,
        ``,
        `How to Apply:`,
        `Click the "Apply Now" button on this page to access the official employer application portal. Review all role-specific instructions carefully before submitting your resume and credentials.`
      ].join('\n');

  return {
    title: safeTitle,
    metaTitle: `⚡ ${safeTitle} at ${company} — 100% Remote | Apply Direct`,
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

const { getGroqClient, getGroqClient2, getGeminiClient } = require('../config/openai');

function getAvailableProviders() {
  const providers = [];
  
  // 1. Groq Primary Key
  const groq1 = getGroqClient();
  if (groq1) {
    providers.push({ name: 'Groq-Primary (120B)', client: groq1, model: env.groqModel || 'openai/gpt-oss-120b' });
    providers.push({ name: 'Groq-Primary (20B Backup)', client: groq1, model: 'openai/gpt-oss-20b' });
  }

  // 2. Groq Secondary Key (if configured)
  const groq2 = getGroqClient2();
  if (groq2) {
    providers.push({ name: 'Groq-Secondary (120B)', client: groq2, model: env.groqModel || 'openai/gpt-oss-120b' });
    providers.push({ name: 'Groq-Secondary (20B Backup)', client: groq2, model: 'openai/gpt-oss-20b' });
  }

  // 3. Google Gemini AI (if valid key configured)
  const gemini = getGeminiClient();
  if (gemini) {
    providers.push({ name: 'Gemini', client: gemini, model: env.geminiModel || 'gemini-2.5-flash' });
  }

  return providers;
}

async function generateSeoFields(jobData) {
  const fallback = buildFallbackSeo(jobData);
  const providers = getAvailableProviders();

  if (!providers.length) {
    return fallback;
  }

  const userPrompt = [
    'You are a premier Executive Recruiter and SEO Content Strategist for global remote job listings.',
    'Generate comprehensive, high-authority, and click-worthy SEO metadata and rich professional English job content in strict JSON format with keys:',
    'title, metaTitle, metaDescription, keywords, content',
    'Strict Quality Rules:',
    '1. title: Clean, professional job title (45-65 chars). E.g. "Senior React Developer (Remote)"',
    '2. metaTitle: High-CTR meta title designed for maximum clicks on Google (55-65 chars). E.g. "⚡ Senior React Developer at {company} — 100% Remote | Apply Direct"',
    '3. metaDescription: Actionable, compelling meta description starting with an active verb or power phrase emphasizing verified 100% remote work, salary, and direct application link (145-160 chars).',
    '4. keywords: Array of 6 to 8 relevant search keywords including role, skills, and remote work phrases.',
    '5. content: Write an in-depth, comprehensive, highly professional English job description between 1500 and 2500 characters (approx 300-450 words). You MUST include the following structured sections separated by newlines:',
    '   About the Role: Detailed overview of what this role entails, team structure, and asynchronous remote collaboration.',
    '   Key Responsibilities:',
    '   - Clear bullet point 1 on core day-to-day duties',
    '   - Clear bullet point 2 on collaboration and project delivery',
    '   - Clear bullet point 3 on quality standards and deadlines',
    '   - Clear bullet point 4 on communication and problem solving',
    '   Required Qualifications & Skills:',
    '   - Clear bullet point 1 on required background/experience',
    '   - Clear bullet point 2 on key technical tools and competencies',
    '   - Clear bullet point 3 on communication and time management skills',
    '   - Clear bullet point 4 on home office setup / work authorization',
    '   Why Join & Remote Benefits:',
    '   - Detail flexibility, work-life balance, competitive pay, and growth.',
    '   Application & Interview Tips:',
    '   - Guidance on resume tailoring and what hiring managers look for in this role.',
    '6. Write in flawless, native, professional English. Output pure JSON only without markdown fences.',
    `Job Title: ${jobData.title}`,
    `Company: ${jobData.sourceLabel || 'Hiring Company'}`,
    `Country/Region: ${jobData.country || 'Global/Remote'}`,
    `Job Summary/Raw Data: ${jobData.summary || ''}`,
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

