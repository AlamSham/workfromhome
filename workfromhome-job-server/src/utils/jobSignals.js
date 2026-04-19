function stripHtml(value = '') {
  return String(value || '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCurrencySymbol(symbol = '') {
  switch (symbol.toUpperCase()) {
    case '$':
    case 'USD':
      return 'USD';
    case 'EUR':
    case '€':
      return 'EUR';
    case 'GBP':
    case '£':
      return 'GBP';
    case 'INR':
    case '₹':
      return 'INR';
    default:
      return '';
  }
}

function getCurrencySymbol(currency = '') {
  switch (String(currency || '').toUpperCase()) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'INR':
      return '₹';
    default:
      return '';
  }
}

function normalizeSalaryInterval(value = '') {
  const text = String(value || '').toLowerCase();
  if (/hour|hr/.test(text)) return 'HOUR';
  if (/month|mo/.test(text)) return 'MONTH';
  if (/week|wk/.test(text)) return 'WEEK';
  if (/day/.test(text)) return 'DAY';
  return 'YEAR';
}

function parseCompensationNumber(value = '', suffix = '') {
  const numeric = Number(String(value || '').replace(/,/g, ''));
  if (!Number.isFinite(numeric)) return null;
  const normalizedSuffix = String(suffix || '').toLowerCase();
  if (normalizedSuffix === 'k') return numeric * 1000;
  if (normalizedSuffix === 'm') return numeric * 1000000;
  return numeric;
}

function formatCompensationNumber(value) {
  if (!Number.isFinite(value)) return '';
  if (value >= 1000 && value % 1000 === 0) {
    return `${Math.round(value / 1000)}k`;
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function collectCandidateText({ title = '', summary = '', rawItem = {} }) {
  const raw = rawItem || {};
  return [
    title,
    summary,
    raw.description,
    raw.content,
    raw.contentSnippet,
    raw.job_description,
    raw.requirements,
    raw.qualifications,
    raw.salary,
    raw.compensation
  ]
    .map((value) => stripHtml(value))
    .filter(Boolean)
    .join(' \n ');
}

function extractSeniority(title = '', text = '') {
  const combined = `${title} ${text}`.toLowerCase();

  const patterns = [
    { value: 'director', regex: /\b(chief|vp|vice president|director|head of)\b/i },
    { value: 'principal', regex: /\bprincipal\b/i },
    { value: 'staff', regex: /\bstaff\b/i },
    { value: 'lead', regex: /\b(team lead|lead)\b/i },
    { value: 'senior', regex: /\b(senior|sr\.?)\b/i },
    { value: 'mid-level', regex: /\b(mid[\s-]?level|intermediate)\b/i },
    { value: 'entry-level', regex: /\b(entry[\s-]?level|junior|jr\.?|graduate|new grad|fresher)\b/i },
    { value: 'internship', regex: /\b(intern(ship)?|trainee|apprentice)\b/i }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(combined)) {
      return pattern.value;
    }
  }

  return '';
}

function extractExperience(text = '') {
  const patterns = [
    /\b(\d{1,2})\s*(?:\+|plus)?\s*(?:years?|yrs?)\s+(?:of\s+)?experience\b/i,
    /\b(\d{1,2})\s*(?:years?|yrs?)\s*\+\s*(?:of\s+)?experience\b/i,
    /\b(\d{1,2})\s*(?:-|to|–)\s*(\d{1,2})\s*(?:years?|yrs?)\s+(?:of\s+)?experience\b/i,
    /\bat least\s+(\d{1,2})\s*(?:years?|yrs?)\b/i,
    /\bminimum of\s+(\d{1,2})\s*(?:years?|yrs?)\b/i,
    /\b(\d{1,2})\s*(?:-|to|–)\s*(\d{1,2})\s*(?:years?|yrs?)\b/i,
    /\b(\d{1,2})\s*(?:years?|yrs?)\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const first = Number(match[1]);
    const second = match[2] ? Number(match[2]) : null;
    if (!Number.isFinite(first)) continue;

    if (Number.isFinite(second)) {
      return {
        experienceText: `${first}-${second} years`,
        experienceMinYears: first,
        experienceMaxYears: second
      };
    }

    const sourceText = String(match[0] || '').toLowerCase();
    const isPlus = /\+|plus|at least|minimum/.test(sourceText);
    return {
      experienceText: isPlus ? `${first}+ years` : `${first} years`,
      experienceMinYears: first,
      experienceMaxYears: null
    };
  }

  return {
    experienceText: '',
    experienceMinYears: null,
    experienceMaxYears: null
  };
}

function extractSalary(text = '') {
  const patterns = [
    /(?:(USD|EUR|GBP|INR)|([$€£₹]))\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([kKmM])?\s*(?:-|to|–)\s*(?:(USD|EUR|GBP|INR)|([$€£₹]))?\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([kKmM])?\s*(?:\/|\sper\s|\s*)(year|yr|annum|hour|hr|month|mo|week|wk|day)?/gi,
      /(?:(USD|EUR|GBP|INR)|([$€£₹]))\s?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*([kKmM])?\s*(?:\/|\sper\s|\s*)(year|yr|annum|hour|hr|month|mo|week|wk|day)/gi
  ];

  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const rawMatch = String(match[0] || '');
      const hasCompKeywords = /salary|compensation|pay|earning|earn|rate|budget|ote|annum|hour|month|week|day|\//i.test(rawMatch);
      if (!hasCompKeywords) {
        continue;
      }

      if (match.length >= 9) {
        const currency = normalizeCurrencySymbol(match[1] || match[2] || match[5] || match[6]);
        const minValue = parseCompensationNumber(match[3], match[4]);
        const maxValue = parseCompensationNumber(match[7], match[8]);
        const interval = normalizeSalaryInterval(match[9] || 'year');

        if (!currency || !Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
          continue;
        }

        const symbol = getCurrencySymbol(currency);
        return {
          salaryText: `${symbol}${formatCompensationNumber(minValue)} - ${symbol}${formatCompensationNumber(maxValue)} / ${interval.toLowerCase()}`,
          salaryCurrency: currency,
          salaryMin: minValue,
          salaryMax: maxValue,
          salaryInterval: interval
        };
      }

      if (match.length >= 6) {
        const currency = normalizeCurrencySymbol(match[1] || match[2]);
        const value = parseCompensationNumber(match[3], match[4]);
        const interval = normalizeSalaryInterval(match[5] || 'year');

        if (!currency || !Number.isFinite(value)) {
          continue;
        }

        const symbol = getCurrencySymbol(currency);
        return {
          salaryText: `${symbol}${formatCompensationNumber(value)} / ${interval.toLowerCase()}`,
          salaryCurrency: currency,
          salaryMin: value,
          salaryMax: value,
          salaryInterval: interval
        };
      }
    }
  }

  return {
    salaryText: '',
    salaryCurrency: '',
    salaryMin: null,
    salaryMax: null,
    salaryInterval: ''
  };
}

function extractJobSignals({ title = '', summary = '', rawItem = {} }) {
  const candidateText = collectCandidateText({ title, summary, rawItem });
  const seniority = extractSeniority(title, candidateText);
  const experience = extractExperience(candidateText);
  const salary = extractSalary(candidateText);

  const signals = {};

  if (seniority) {
    signals.seniority = seniority;
  }

  if (experience.experienceText) {
    signals.experienceText = experience.experienceText;
    signals.experienceMinYears = experience.experienceMinYears;
    signals.experienceMaxYears = experience.experienceMaxYears;
  }

  if (salary.salaryText) {
    signals.salaryText = salary.salaryText;
    signals.salaryCurrency = salary.salaryCurrency;
    signals.salaryMin = salary.salaryMin;
    signals.salaryMax = salary.salaryMax;
    signals.salaryInterval = salary.salaryInterval;
  }

  return signals;
}

function hasJobSignals(signals = {}) {
  return Boolean(
    signals &&
    (
      signals.salaryText ||
      signals.experienceText ||
      signals.seniority
    )
  );
}

module.exports = {
  extractJobSignals,
  hasJobSignals
};
