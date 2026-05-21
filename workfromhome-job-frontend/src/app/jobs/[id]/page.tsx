import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import RelatedJobs from "../../components/RelatedJobs";
import NewsletterCTA from "../../components/NewsletterCTA";
import { getCompanyPath } from "../../lib/companies";
import { extractJobId, getJobPath } from "../../lib/jobUrls";

export const revalidate = 28800; // 8 hours — job detail rarely changes

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface SeoFields {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug?: string;
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
  const title = job.seo?.metaTitle || job.originalTitle;
  const desc = job.seo?.metaDescription || job.summary || "Remote work opportunity. Apply now.";
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">

      {/* JSON-LD for Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            ...(job.country ? [{ "@type": "ListItem", position: 2, name: `Remote Jobs in ${job.country}`, item: `${SITE_URL}/remote-jobs-in-${(job.country || "us").toLowerCase()}` }] : []),
            { "@type": "ListItem", position: job.country ? 3 : 2, name: displayTitle, item: pageUrl },
          ],
        }) }}
      />

      {/* Breadcrumb */}
      <nav className="fade-up flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-ink transition">Home</Link>
        <span>/</span>
        <span className="text-slate-300 font-semibold line-clamp-1">{displayTitle}</span>
      </nav>

      {/* Expired Job Alert Banner */}
      {isExpired && (
        <div className="fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-sm">This job posting has expired</p>
              <p className="text-xs text-amber-300/80 mt-0.5">Applications are no longer accepted for this role. Discover active remote roles below.</p>
            </div>
          </div>
          <Link
            href="/"
            className="shrink-0 text-xs font-semibold px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/30 text-amber-100 transition text-center"
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
              <span className="badge bg-brand/10 text-cyan-400">{job.country || "Global"}</span>
              <span className="badge bg-slate-900 text-slate-300">{(job.category || "WFH").toUpperCase()}</span>
              {job.sourceLabel && (
                <Link href={getCompanyPath(job.sourceLabel)} className="badge bg-slate-900 text-slate-300" style={{ textDecoration: "none" }}>
                  {job.sourceLabel}
                </Link>
              )}
              <span className="ml-auto text-slate-500 text-xs">{formatDate(job.publishedAt)}</span>
            </div>

            {/* Company logo + title row */}
            <div className="flex items-start gap-4">
              {job.sourceLabel && (
                <div
                  className="shrink-0 w-14 h-14 rounded-2xl bg-brand/10 border border-slate-800 flex items-center justify-center overflow-hidden text-sm font-black text-cyan-400"
                  style={{
                    backgroundImage: `url(https://logo.clearbit.com/${job.sourceLabel.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.]/g, '')}.com)`,
                    backgroundSize: '70%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                  aria-label={job.sourceLabel}
                >
                  <span className="opacity-30">{(job.sourceLabel || "J").slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-2xl font-bold leading-tight text-slate-100 sm:text-3xl">
                  {displayTitle}
                </h1>
                {job.sourceLabel && (
                  <p className="mt-1 text-sm font-semibold text-cyan-400">
                    at {job.sourceLabel}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-400">
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
              <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/60">
                <span
                  className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
                  style={{
                    padding: "0.7rem 2rem",
                    fontSize: "0.95rem",
                    borderRadius: "0.875rem",
                  }}
                >
                  🚫 Listing Expired
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  This position has been filled or closed by the employer
                </span>
              </div>
            ) : (
              <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/60">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    padding: "0.7rem 2rem",
                    fontSize: "0.95rem",
                    borderRadius: "0.875rem",
                    boxShadow: "0 4px 16px rgba(11,143,117,0.3)",
                  }}
                >
                  ✨ Apply Now ↗
                </a>
                <span className="text-xs text-slate-400 font-medium">
                  Opens employer&apos;s official career page
                </span>
              </div>
            )}

          </header>

          {/* Overview */}
          <section className="glass-card fade-up" style={{ borderRadius: "1.25rem", padding: "1.5rem 2rem" }}>
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
                <div key={label} style={{ borderRadius: "12px", background: "rgba(148,163,184,0.04)", border: "1px solid rgba(148,163,184,0.06)", padding: "0.85rem" }}>
                  <p className="text-xs font-bold uppercase tracking-wide text-cyan-400">{label}</p>
                  <p className="mt-0.5 font-semibold text-slate-100">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          {(richDescription || job.summary) && (() => {
            const descText = richDescription || job.summary || "";
            const sections = formatJobDescription(descText);
            
            return (
              <section className="glass-card fade-up" style={{ borderRadius: "1.25rem", padding: "1.5rem 2rem" }}>
                <h2 className="section-title">Job Description</h2>
                {sections.length > 0 ? (
                  <div className="mt-4 space-y-5">
                    {sections.map((section, si) => (
                      <div key={si}>
                        {section.heading && (
                          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide mb-2">
                            {section.heading}
                          </h3>
                        )}
                        {section.type === "bullets" ? (
                          <ul className="space-y-2 pl-1">
                            {section.items.map((item, ii) => (
                              <li key={ii} className="flex items-start gap-2 text-sm leading-7 text-slate-300">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="space-y-3">
                            {section.items.map((item, ii) => (
                              <p key={ii} className="text-sm leading-7 text-slate-300">{item}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {descText}
                  </p>
                )}
              </section>
            );
          })()}

          {/* Keywords */}
          {(job.seo?.keywords || []).length > 0 && (
            <section className="glass-card fade-up" style={{ borderRadius: "1.25rem", padding: "1.5rem 2rem" }}>
              <h2 className="section-title">Related Skills & Keywords</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.seo?.keywords || []).map((kw) => (
                  <span
                    key={kw}
                    className="tag-pill"
                  >
                    #{kw}
                  </span>
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
              background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.04) 100%)",
              border: "1px solid rgba(6,182,212,0.15)",
              borderRadius: "1.25rem",
              padding: "2rem 1.5rem",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
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
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.65, marginBottom: "1.5rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
              Click the button below to apply on the employer&apos;s official website.
              Always verify job details before submitting personal information.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", alignItems: "center" }}>
              {isExpired ? (
                <span
                  className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
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
                className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed w-full flex items-center justify-center h-11 rounded-2xl text-sm font-semibold"
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
            <h2 className="text-sm font-bold text-slate-200">Share This Job</h2>
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
    </div>
  );
}
