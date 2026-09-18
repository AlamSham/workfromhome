import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import RelatedJobs from "../../components/RelatedJobs";
import NewsletterCTA from "../../components/NewsletterCTA";
import { COUNTRY_LABELS } from "../../components/SharedJobsFeed";
import { getCompanyPath } from "../../lib/companies";
import {
  JOB_CATEGORIES,
  JobCategoryDefinition,
  getJobCategoryCountryPath,
  getJobCategoryPath,
} from "../../lib/jobCategories";
import { extractJobId, getJobPath } from "../../lib/jobUrls";
import {
  SEO_COUNTRIES,
  getSeoCountryByCode,
  getSeoCountryBySlug,
} from "../../lib/seoCountries";

export const revalidate = 86400; // 24 hours — job details rarely change
export const dynamicParams = true; // allow non-pre-built job IDs

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://workfromhome-git-61255565662.us-east4.run.app";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface SeoFields {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug?: string;
  content?: string;
}

interface JobSignals {
  seniority?: string;
  experienceText?: string;
  experienceMinYears?: number | null;
  experienceMaxYears?: number | null;
  salaryText?: string;
  salaryCurrency?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryInterval?: string;
}

interface RawJobItem extends Record<string, unknown> {
  description?: string;
  content?: string;
  contentSnippet?: string;
  job_description?: string;
}

interface JobDetail {
  _id: string;
  shortId?: string;
  source?: string;
  sourceLabel?: string;
  country?: string;
  category?: string;
  originalTitle: string;
  summary?: string;
  link: string;
  publishedAt?: string;
  expiresAt?: string;
  seo?: SeoFields;
  signals?: JobSignals;
  rawItem?: RawJobItem;
}

interface WordPressPost {
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
}

interface DetailPageProps {
  params: Promise<{ id?: string }>;
}

function findJobCategory(categoryStr?: string, titleStr?: string): JobCategoryDefinition | undefined {
  const cat = String(categoryStr || "").toLowerCase().trim();
  const title = String(titleStr || "").toLowerCase().trim();

  for (const c of JOB_CATEGORIES) {
    if (c.slug === cat || c.label.toLowerCase() === cat || (cat && cat.includes(c.query))) {
      return c;
    }
  }
  for (const c of JOB_CATEGORIES) {
    if (title.includes(c.query)) {
      return c;
    }
  }
  return undefined;
}

function formatDate(value: string | undefined): string {
  if (!value) return "Recently posted";
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return "Recently posted";
  return parsed.toLocaleDateString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function decodeHtmlEntities(value = ""): string {
  return String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value = ""): string {
  return String(value)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");
}

function normalizeText(value = ""): string {
  return decodeHtmlEntities(stripHtml(value))
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

// ── Smart job description parser: converts wall-of-text into structured sections ──
interface DescriptionSection {
  heading: string;
  items: string[];
  type: "paragraph" | "bullets";
}

const SECTION_HEADINGS = [
  /\b(key\s+)?responsibilities\b/i,
  /\bwhat\s+you('ll|.ll|\s+will)\s+(do|be\s+doing)\b/i,
  /\byour\s+role\b/i,
  /\brequirements?\b/i,
  /\bqualifications?\b/i,
  /\bwhat\s+(we('re|.re|\s+are)\s+looking\s+for|you('ll|.ll|\s+will)\s+need)\b/i,
  /\bskills?\s*(required|needed)?\b/i,
  /\bwhat\s+we\s+offer\b/i,
  /\bbenefits?\b/i,
  /\bperks?\b/i,
  /\bcompensation\b/i,
  /\babout\s+(us|the\s+(company|team|role))\b/i,
  /\bwho\s+(we\s+are|you\s+are)\b/i,
  /\bnice\s+to\s+have\b/i,
  /\bbonus\s+points?\b/i,
  /\bhow\s+to\s+apply\b/i,
  /\bwhy\s+(join|work\s+(with|at|for))\b/i,
];

function isLikelySectionHeading(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length > 80) return false; // Too long for a heading
  if (trimmed.endsWith(":")) return true;
  return SECTION_HEADINGS.some((re) => re.test(trimmed));
}

function isLikelyBulletPoint(text: string): boolean {
  const trimmed = text.trim();
  return /^[-•–—✅✓⭐▶►●○◆★☑]\s/.test(trimmed) ||
    /^\d+[.)]\s/.test(trimmed) ||
    /^[a-z][.)]\s/i.test(trimmed);
}

function cleanBulletPrefix(text: string): string {
  return text.trim()
    .replace(/^[-•–—✅✓⭐▶►●○◆★☑]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/^[a-z][.)]\s*/i, "")
    .trim();
}

function formatJobDescription(rawText: string): DescriptionSection[] {
  if (!rawText || rawText.trim().length === 0) return [];

  // First, try to split by existing newlines
  let lines = rawText.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // If the text is one giant paragraph (no newlines), split by sentence boundaries
  // that look like section transitions
  if (lines.length <= 2 && rawText.length > 300) {
    lines = rawText
      .replace(/\.\s+(?=[A-Z])/g, ".\n")                // Split on ". A" (sentence + capital)
      .replace(/:\s*(?=[A-Z])/g, ":\n")                   // Split after colons
      .replace(/(?<=[.!])\s*(?=(Key\s+Responsibilities|Requirements|What\s+We\s+Offer|About\s+Us|Benefits|Qualifications|Skills|How\s+to\s+Apply|We\s+Offer|Nice\s+to\s+Have|Your\s+Role))/gi, "\n")  // Split before known headings
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  const sections: DescriptionSection[] = [];
  let currentSection: DescriptionSection = { heading: "", items: [], type: "paragraph" };

  for (const line of lines) {
    if (isLikelySectionHeading(line)) {
      // Save previous section if it has content
      if (currentSection.items.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = {
        heading: line.replace(/:$/, "").trim(),
        items: [],
        type: "paragraph",
      };
    } else if (isLikelyBulletPoint(line)) {
      currentSection.type = "bullets";
      currentSection.items.push(cleanBulletPrefix(line));
    } else {
      // Regular text — check if it's short enough to be a bullet
      if (line.length < 120 && currentSection.type === "bullets") {
        currentSection.items.push(line);
      } else {
        currentSection.items.push(line);
      }
    }
  }

  // Push the last section
  if (currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // If everything ended up in one section with no heading, try to split long paragraphs
  if (sections.length === 1 && sections[0].heading === "" && sections[0].items.length === 1 && sections[0].items[0].length > 500) {
    const text = sections[0].items[0];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    return [{ heading: "", items: sentences.map((s) => s.trim()), type: "paragraph" }];
  }

  return sections;
}

function formatSeniority(value: string | undefined): string {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  switch (normalized) {
    case "entry-level":
      return "Entry Level";
    case "mid-level":
      return "Mid Level";
    case "internship":
      return "Internship";
    default:
      return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

function buildBaseSalary(signals: JobSignals | undefined) {
  if (!signals?.salaryCurrency || !signals?.salaryInterval) {
    return undefined;
  }

  const minValue = signals.salaryMin ?? signals.salaryMax;
  const maxValue = signals.salaryMax ?? signals.salaryMin;
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return undefined;
  }

  return {
    "@type": "MonetaryAmount",
    currency: signals.salaryCurrency,
    value: {
      "@type": "QuantitativeValue",
      minValue,
      maxValue,
      unitText: signals.salaryInterval,
    },
  };
}

async function buildRichDescription(job: JobDetail): Promise<string> {
  const raw = (job?.rawItem || {}) as RawJobItem;
  const candidates = [
    job?.seo?.content,
    job?.summary, raw?.description, raw?.content,
    raw?.contentSnippet, raw?.job_description,
  ].map((item) => normalizeText(String(item || ""))).filter(Boolean);

  // Return the longest available description
  return candidates.sort((a, b) => b.length - a.length)[0] || "";
}

const getJobById = cache(async (id: string): Promise<JobDetail | null> => {
  if (!id) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, { next: { revalidate } });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`API responded with ${response.status}`);
    const payload = await response.json();
    if (!payload?.success || !payload?.data) return null;
    return payload.data;
  } catch { return null; }
});

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const resolved = await params;
  const job = await getJobById(extractJobId(String(resolved?.id || "")));
  if (!job) {
    return { title: "Job Not Found", description: "This listing is unavailable or has expired." };
  }
  const jobTitle = job.seo?.title || job.originalTitle;
  const company = job.sourceLabel || "Remote Employer";
  const salaryPart = job.signals?.salaryText ? ` (${job.signals.salaryText})` : "";
  
  const title = job.seo?.metaTitle && job.seo.metaTitle.length > 25
    ? (job.seo.metaTitle.includes("RemoteJobDesk") ? job.seo.metaTitle : `${job.seo.metaTitle} | RemoteJobDesk`)
    : `⚡ ${jobTitle} at ${company}${salaryPart} — 100% Remote | Apply Direct`;

  const desc = job.seo?.metaDescription && job.seo.metaDescription.length > 50
    ? job.seo.metaDescription
    : `Apply directly for ${jobTitle} at ${company}.${salaryPart} Verified 100% work-from-home position. View requirements, benefits, salary & direct application link.`;

  const canonicalPath = getJobPath(job);
  const url = `${SITE_URL}${canonicalPath}`;
  
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&company=${encodeURIComponent(job.sourceLabel || "Remote Company")}&country=${encodeURIComponent(job.country || "Global")}&category=${encodeURIComponent(job.category || "WFH")}`;

  return {
    title,
    description: desc,
    keywords: job.seo?.keywords,
    alternates: { canonical: url },
    robots: { index: true, follow: true, "max-snippet": -1 as const, "max-image-preview": "large" as const },
    openGraph: { 
      title, 
      description: desc, 
      url, 
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: { 
      card: "summary_large_image", 
      title, 
      description: desc,
      images: [ogImageUrl]
    },
  };
}

interface RoleFaq {
  question: string;
  answer: string;
}

function generateRoleFaqs(job: JobDetail): RoleFaq[] {
  const title = job.seo?.title || job.originalTitle;
  const company = job.sourceLabel || "the hiring employer";
  const location = job.country ? `${job.country} and eligible remote regions` : "global remote applicants";
  const exp = job.signals?.experienceText || (job.signals?.experienceMinYears ? `${job.signals.experienceMinYears}+ years of relevant experience` : "relevant industry background, core capabilities, and self-management");
  const salary = job.signals?.salaryText || "competitive compensation aligned with global remote market standards";

  return [
    {
      question: `Is the ${title} role 100% remote?`,
      answer: `Yes, this is a fully remote work-from-home position with ${company}. You can collaborate asynchronously, manage project deliverables, and participate in virtual team meetings from your home office without daily commuting.`
    },
    {
      question: `What qualifications and experience are needed for ${title}?`,
      answer: `Applicants are typically evaluated on ${exp}. Key requirements include strong English communication skills, independent problem-solving abilities, and familiarity with modern remote collaboration platforms like Slack, Zoom, and project management tools.`
    },
    {
      question: `Who is eligible to apply for this job?`,
      answer: `This remote opening welcomes applications from ${location}. Candidates must ensure they meet the work authorization, residency, or independent contractor criteria required by ${company}.`
    },
    {
      question: `What is the salary and benefits package for ${title}?`,
      answer: `The expected compensation for this role is ${salary}. In addition to base compensation, remote positions often provide flexible working hours, home office equipment stipends, and professional growth opportunities.`
    },
    {
      question: `How do I apply and what should I prepare for the interview?`,
      answer: `Click the "Apply Now" button on this page to visit ${company}'s official application portal. Tailor your resume to highlight relevant achievements, and prepare to discuss your experience working productively in an asynchronous remote environment.`
    }
  ];
}

export default async function JobDetailPage({ params }: DetailPageProps) {
  const resolved = await params;
  const rawParam = String(resolved?.id || "");
  const job = await getJobById(extractJobId(rawParam));
  if (!job) notFound();

  const ACTIVE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
  const isExpired = job.publishedAt ? (Date.now() - new Date(job.publishedAt).getTime() > ACTIVE_PERIOD_MS) : false;

  const canonicalPath = getJobPath(job);
  const canonicalParam = canonicalPath.replace("/jobs/", "");
  if (rawParam !== canonicalParam) {
    permanentRedirect(canonicalPath);
  }

  const richDescription = await buildRichDescription(job);
  const pageUrl = `${SITE_URL}${canonicalPath}`;
  const displayTitle = job.seo?.title || job.originalTitle;
  const roleFaqs = generateRoleFaqs(job);

  const companyLogoUrl = job.sourceLabel 
    ? `https://logo.clearbit.com/${job.sourceLabel.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9.]/g, "")}.com`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: displayTitle,
    description: richDescription || job.summary || displayTitle,
    datePosted: job.publishedAt,
    validThrough: job.expiresAt,
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: job.country || "US",
    },
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.sourceLabel || "Remote Company",
      sameAs: job.link,
      ...(companyLogoUrl ? { logo: companyLogoUrl } : {}),
    },
    url: pageUrl,
    ...(job.signals?.experienceText ? { experienceRequirements: job.signals.experienceText } : {}),
    ...(buildBaseSalary(job.signals) ? { baseSalary: buildBaseSalary(job.signals) } : {}),
  };

  const signalPills = [
    job.signals?.salaryText ? `Salary: ${job.signals.salaryText}` : "",
    job.signals?.experienceText ? `Experience: ${job.signals.experienceText}` : "",
    job.signals?.seniority ? `Level: ${formatSeniority(job.signals.seniority)}` : "",
  ].filter(Boolean);

  // SEO & Internal Linking Resolution
  const matchedCountry = job.country ? (getSeoCountryByCode(job.country) || getSeoCountryBySlug(job.country)) : undefined;
  const countryCode = (matchedCountry?.code || job.country || "").toLowerCase();
  const countryName = matchedCountry?.name || (job.country && COUNTRY_LABELS[job.country.toUpperCase()]?.replace(/^[^\s]+\s/, "")) || job.country || "";
  const countryHref = countryCode ? `/remote-jobs-in-${countryCode}` : "";

  const matchedCategory = findJobCategory(job.category, displayTitle || job.originalTitle);
  const categoryHref = matchedCategory ? getJobCategoryPath(matchedCategory.slug) : undefined;

  // Dynamic 4-step Schema BreadcrumbList
  const breadcrumbSchemaItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
  ];
  let breadcrumbPos = 2;
  if (countryHref && countryName) {
    breadcrumbSchemaItems.push({
      "@type": "ListItem",
      position: breadcrumbPos++,
      name: `Remote Jobs in ${countryName}`,
      item: `${SITE_URL}${countryHref}`,
    });
  }
  if (categoryHref && matchedCategory) {
    breadcrumbSchemaItems.push({
      "@type": "ListItem",
      position: breadcrumbPos++,
      name: `Remote ${matchedCategory.label} Jobs`,
      item: `${SITE_URL}${categoryHref}`,
    });
  }
  breadcrumbSchemaItems.push({
    "@type": "ListItem",
    position: breadcrumbPos++,
    name: displayTitle,
    item: pageUrl,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">

      {/* JSON-LD for Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* JSON-LD: FAQPage Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: roleFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }) }}
      />
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbSchemaItems,
        }) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="fade-up flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition font-medium">Home</Link>
        {countryHref && countryName && (
          <>
            <span className="text-slate-300">/</span>
            <Link href={countryHref} className="hover:text-blue-600 transition font-medium">
              Jobs in {countryName}
            </Link>
          </>
        )}
        {categoryHref && matchedCategory && (
          <>
            <span className="text-slate-300">/</span>
            <Link href={categoryHref} className="hover:text-blue-600 transition font-medium">
              {matchedCategory.label}
            </Link>
          </>
        )}
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-semibold line-clamp-1 max-w-[200px] sm:max-w-md">{displayTitle}</span>
      </nav>

      {/* Expired Job Alert Banner */}
      {isExpired && (
        <div className="fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-sm">This job posting has expired</p>
              <p className="text-xs text-amber-700 mt-0.5">Applications are no longer accepted for this role. Discover active remote roles below.</p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 text-xs font-semibold px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 transition text-center"
          >
            Browse Active Jobs
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Main Content ── */}
        <div className="flex flex-1 flex-col gap-6">

          {/* Header card */}
          <header className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {countryHref ? (
                <Link
                  href={countryHref}
                  className="badge badge-accent hover:opacity-85 transition"
                  style={{ textDecoration: "none" }}
                  title={`Browse all remote jobs in ${countryName}`}
                >
                  📍 {countryName || job.country}
                </Link>
              ) : (
                <span className="badge badge-accent">📍 Global</span>
              )}
              {categoryHref && matchedCategory ? (
                <Link
                  href={categoryHref}
                  className="badge badge-dark hover:opacity-85 transition"
                  style={{ textDecoration: "none" }}
                  title={`Browse all remote ${matchedCategory.label} jobs`}
                >
                  💼 {matchedCategory.label.toUpperCase()}
                </Link>
              ) : (
                <span className="badge badge-dark">💼 {(job.category || "REMOTE").toUpperCase()}</span>
              )}
              {job.sourceLabel && (
                <Link href={getCompanyPath(job.sourceLabel)} className="badge badge-gray hover:text-blue-600 transition" style={{ textDecoration: "none" }}>
                  🏢 {job.sourceLabel}
                </Link>
              )}
              <span className="ml-auto text-slate-500 text-xs">{formatDate(job.publishedAt)}</span>
            </div>

            {/* Company logo + title row */}
            <div className="flex items-start gap-4">
              {job.sourceLabel && (
                <div
                  className="shrink-0 w-14 h-14 rounded-2xl bg-blue-50 border border-slate-200 flex items-center justify-center overflow-hidden text-sm font-black text-blue-600"
                  style={{
                    backgroundImage: `url(https://logo.clearbit.com/${job.sourceLabel.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.]/g, '')}.com)`,
                    backgroundSize: '70%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                  aria-label={job.sourceLabel}
                >
                  <span className="opacity-40">{(job.sourceLabel || "J").slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl break-words [overflow-wrap:anywhere]">
                  {displayTitle}
                </h1>
                {job.sourceLabel && (
                  <p className="mt-1 text-sm font-semibold text-blue-600">
                    at {job.sourceLabel}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {job.seo?.metaDescription || job.summary}
            </p>

            {signalPills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {signalPills.map((pill) => (
                  <span key={pill} className="badge badge-gray">
                    {pill}
                  </span>
                ))}
              </div>
            )}

            {/* Apply CTA — Above the fold */}
            {isExpired ? (
              <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                <span
                  className="badge bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed"
                  style={{
                    padding: "0.7rem 2rem",
                    fontSize: "0.95rem",
                    borderRadius: "0.875rem",
                  }}
                >
                  🚫 Listing Expired
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  This position has been filled or closed by the employer
                </span>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    padding: "0.7rem 2rem",
                    fontSize: "0.95rem",
                    borderRadius: "0.875rem",
                  }}
                >
                  ✨ Apply Now ↗
                </a>
                <span className="text-xs text-slate-500 font-medium">
                  Opens employer&apos;s official career page
                </span>
              </div>
            )}

          </header>

          {/* Overview */}
          <section className="glass-card fade-up rounded-2xl p-5 sm:p-8">
            <h2 className="section-title">Job Overview</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                { label: "Published", value: formatDate(job.publishedAt) },
                { label: "Expires", value: formatDate(job.expiresAt) },
                { label: "Source", value: job.sourceLabel || job.source || "—" },
                { label: "Region", value: job.country || "Global" },
                { label: "Type", value: "Remote / Work From Home" },
                { label: "Category", value: (job.category || "wfh").toUpperCase() },
                ...(job.signals?.salaryText ? [{ label: "Salary", value: job.signals.salaryText }] : []),
                ...(job.signals?.experienceText ? [{ label: "Experience", value: job.signals.experienceText }] : []),
                ...(job.signals?.seniority ? [{ label: "Seniority", value: formatSeniority(job.signals.seniority) }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.85rem" }}>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{label}</p>
                  <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          {(richDescription || job.summary) && (() => {
            const descText = richDescription || job.summary || "";
            const sections = formatJobDescription(descText);
            
            return (
              <section className="glass-card fade-up rounded-2xl p-5 sm:p-8">
                <h2 className="section-title">Job Description</h2>
                {sections.length > 0 ? (
                  <div className="mt-4 space-y-5">
                    {sections.map((section, si) => (
                      <div key={si}>
                        {section.heading && (
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                            {section.heading}
                          </h3>
                        )}
                        {section.type === "bullets" ? (
                          <ul className="space-y-2 pl-1">
                            {section.items.map((item, ii) => (
                              <li key={ii} className="flex items-start gap-2 text-sm leading-7 text-slate-700">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="space-y-3">
                            {section.items.map((item, ii) => (
                              <p key={ii} className="text-sm leading-7 text-slate-700">{item}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {descText}
                  </p>
                )}
              </section>
            );
          })()}

          {/* ── Remote Work & Candidate Success Guide ── */}
          <section className="glass-card fade-up rounded-2xl p-5 sm:p-8">
            <h2 className="section-title">Remote Work Guidelines & Career Insights</h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.7, color: "#64748b" }}>
              Practical advice for succeeding as a remote professional in this role.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div style={{ borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>⚡</span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Asynchronous Productivity</h3>
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#475569", margin: 0 }}>
                  High-performing remote teams prioritize asynchronous communication. Document your progress clearly in tickets, maintain organized project repositories, and communicate status updates proactively without waiting for real-time meetings.
                </p>
              </div>

              <div style={{ borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Home Office & Security</h3>
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#475569", margin: 0 }}>
                  Ensure a private, quiet workstation with a reliable high-speed broadband connection (min 50 Mbps). Maintain compliance with employer cybersecurity policies by utilizing secure password managers, 2FA authentication, and authorized VPN services.
                </p>
              </div>

              <div style={{ borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>🎯</span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Resume & Application Tips</h3>
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#475569", margin: 0 }}>
                  Tailor your CV specifically to the requirements of {displayTitle}. Highlight quantifiable achievements from past roles (e.g. revenue growth, efficiency improvements, or software shipped) and showcase proven experience collaborating with remote teams.
                </p>
              </div>

              <div style={{ borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>💬</span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Virtual Interview Prep</h3>
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "#475569", margin: 0 }}>
                  Test your video and audio hardware before virtual calls. Prepare concise STAR-format stories demonstrating how you manage time independently, handle conflicting priorities across different time zones, and solve complex problems autonomously.
                </p>
              </div>
            </div>
          </section>

          {/* ── Role Specific FAQ (Rich Snippets & Google Ranking) ── */}
          <section className="glass-card fade-up rounded-2xl p-5 sm:p-8">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.25rem" }}>❓</span>
              <h2 className="section-title" style={{ margin: 0 }}>Frequently Asked Questions</h2>
            </div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#64748b" }}>
              Key answers about the application process, remote setup, and compensation for {displayTitle}.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {roleFaqs.map((faq, index) => (
                <details
                  key={index}
                  style={{
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    padding: "1rem 1.25rem",
                    transition: "all 0.2s ease",
                  }}
                  open={index === 0}
                >
                  <summary style={{ cursor: "pointer", fontSize: "0.92rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.5, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{faq.question}</span>
                    <span style={{ color: "#2563eb", fontSize: "1.1rem", fontWeight: 700, marginLeft: "0.5rem" }}>+</span>
                  </summary>
                  <p style={{ marginTop: "0.75rem", fontSize: "0.88rem", lineHeight: 1.8, color: "#475569", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem", margin: "0.75rem 0 0" }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Keywords */}
          {(job.seo?.keywords || []).length > 0 && (
            <section className="glass-card fade-up" style={{ borderRadius: "1.25rem", padding: "1.5rem 2rem" }}>
              <h2 className="section-title">Related Skills & Keywords</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.seo?.keywords || []).map((kw) => (
                  <Link
                    key={kw}
                    href={`/?search=${encodeURIComponent(kw)}`}
                    className="tag-pill hover:text-blue-600 hover:border-blue-300 transition"
                    style={{ textDecoration: "none" }}
                    title={`Search remote jobs requiring ${kw}`}
                  >
                    #{kw}
                  </Link>
                ))}
              </div>
            </section>
          )}
          
          {/* Related Jobs Internal Linking */}
          <RelatedJobs
            currentJobId={job._id}
            country={job.country}
            category={job.category}
          />

          {/* ── Internal Linking Taxonomy Silo ── */}
          <section className="glass-card fade-up rounded-2xl p-5 sm:p-7" style={{ border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🌐</span>
              <h3 className="section-title" style={{ margin: 0, fontSize: "1.1rem" }}>
                Explore More Remote Opportunities
              </h3>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0.25rem 0 1rem", lineHeight: 1.6 }}>
              Discover verified work-from-home positions by role, category, and regional hiring markets.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* 1. Related Category & Combo */}
              {matchedCategory && matchedCountry && (
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "0.85rem 1rem" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#166534", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    🎯 Targeted Link for this Role
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={getJobCategoryCountryPath(matchedCategory.slug, matchedCountry.slug)}
                      className="tag-pill"
                      style={{ background: "#ffffff", borderColor: "#86efac", fontWeight: 700, color: "#15803d", textDecoration: "none" }}
                    >
                      Remote {matchedCategory.label} in {countryName} →
                    </Link>
                    <Link
                      href={getJobCategoryPath(matchedCategory.slug)}
                      className="tag-pill"
                      style={{ background: "#ffffff", borderColor: "#86efac", fontWeight: 700, color: "#15803d", textDecoration: "none" }}
                    >
                      All Remote {matchedCategory.label} Jobs →
                    </Link>
                    {countryHref && (
                      <Link
                        href={countryHref}
                        className="tag-pill"
                        style={{ background: "#ffffff", borderColor: "#86efac", fontWeight: 700, color: "#15803d", textDecoration: "none" }}
                      >
                        All Remote Jobs in {countryName} →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Popular Categories */}
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                  Popular Job Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {JOB_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={getJobCategoryPath(cat.slug)}
                      className={`tag-pill ${matchedCategory?.slug === cat.slug ? "font-bold text-blue-700 bg-blue-50 border-blue-300" : ""}`}
                      style={{ fontSize: "0.78rem", textDecoration: "none" }}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 3. Top Remote Countries */}
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
                  Top Hiring Countries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SEO_COUNTRIES.slice(0, 12).map((c) => (
                    <Link
                      key={c.code}
                      href={`/remote-jobs-in-${c.code.toLowerCase()}`}
                      className={`tag-pill ${countryCode === c.code.toLowerCase() ? "font-bold text-blue-700 bg-blue-50 border-blue-300" : ""}`}
                      style={{ fontSize: "0.78rem", textDecoration: "none" }}
                    >
                      {COUNTRY_LABELS[c.code] || c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Lead Capture */}
          <NewsletterCTA
            search={job.category || ""}
            country={job.country || ""}
            company={job.sourceLabel || ""}
            basePath={canonicalPath}
            filters={{
              seniority: job.signals?.seniority || "",
              experience: "",
              minSalary: "",
            }}
            alertLabel={`Save alerts for similar remote jobs${job.sourceLabel ? ` from ${job.sourceLabel}` : ""}.`}
          />

          {/* ══ APPLY CTA — BOTTOM (always visible on all screens) ══ */}
          <section
            className="fade-up"
            style={{
              background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)",
              border: "1px solid #bfdbfe",
              borderRadius: "1.25rem",
              padding: "2rem 1.5rem",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(37,99,235,0.06)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🚀</div>
            <h2
              className="gradient-text"
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(1.3rem, 4vw, 1.75rem)",
                fontWeight: 800,
                margin: "0 0 0.5rem",
              }}
            >
              Ready to Apply?
            </h2>
            <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
              Click the button below to apply on the employer&apos;s official website.
              Always verify job details before submitting personal information.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", alignItems: "center" }}>
              {isExpired ? (
                <span
                  className="badge bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed"
                  style={{
                    display: "inline-flex",
                    padding: "0.85rem 2.5rem",
                    fontSize: "1.05rem",
                    borderRadius: "0.875rem",
                  }}
                >
                  🚫 Listing Expired
                </span>
              ) : (
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: "inline-flex",
                    padding: "0.85rem 2.5rem",
                    fontSize: "1.05rem",
                  }}
                >
                  ✨ Apply Now ↗
                </a>
              )}
              <Link
                href="/"
                className="btn-outline"
                style={{
                  display: "inline-flex",
                  padding: "0.85rem 1.75rem",
                  fontSize: "0.875rem",
                }}
              >
                ← Browse More Jobs
              </Link>
            </div>
          </section>
        </div>

        {/* ── Sticky Sidebar ── */}
        <aside className="hidden lg:flex lg:w-72 flex-col gap-4 lg:sticky lg:top-24 self-start">
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="section-title">Ready to Apply?</h2>
            <p className="text-xs leading-6 text-slate-500">
              Click below to apply on the employer&apos;s official website. Always verify job details before submitting personal info.
            </p>
            {isExpired ? (
              <span
                className="badge bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed w-full flex items-center justify-center h-11 rounded-2xl text-sm font-semibold"
              >
                🚫 Listing Expired
              </span>
            ) : (
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-sm"
              >
                Apply Now ↗
              </a>
            )}
            <Link
              href="/"
              className="btn-outline w-full flex items-center justify-center h-11 rounded-2xl text-sm"
            >
              ← Browse More Jobs
            </Link>
          </div>

          {/* Share */}
          <div className="glass-card rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Share This Job</h2>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayTitle)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs"
              >
                𝕏 Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-xs"
              >
                in LinkedIn
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar (Cuts Mobile Bounce Rate) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-slate-900 truncate">
            {displayTitle}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {job.sourceLabel || "Remote Employer"} {job.signals?.salaryText ? `• ${job.signals.salaryText}` : "• Verified Remote"}
          </div>
        </div>
        {isExpired ? (
          <span className="shrink-0 px-4 py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl">
            Expired
          </span>
        ) : (
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <span>Apply Now</span>
            <span className="text-sm">↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
