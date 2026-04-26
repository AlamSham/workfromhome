import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import RelatedJobs from "../../components/RelatedJobs";
import NewsletterCTA from "../../components/NewsletterCTA";
import { getCompanyPath } from "../../lib/companies";
import { extractJobId, getJobPath } from "../../lib/jobUrls";

export const revalidate = 7200; // 2 hours - optimized for low traffic

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

  const canonicalPath = getJobPath(job);
  const canonicalParam = canonicalPath.replace("/jobs/", "");
  if (rawParam !== canonicalParam) {
    permanentRedirect(canonicalPath);
  }

  const richDescription = await buildRichDescription(job);
  const pageUrl = `${SITE_URL}${canonicalPath}`;
  const displayTitle = job.seo?.title || job.originalTitle;

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

      {/* Breadcrumb */}
      <nav className="fade-up flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-ink transition">Home</Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold line-clamp-1">{displayTitle}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Main Content ── */}
        <div className="flex flex-1 flex-col gap-6">

          {/* Header card */}
          <header className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="badge bg-brand/10 text-brand-ink">{job.country || "Global"}</span>
              <span className="badge bg-slate-900 text-white">{(job.category || "WFH").toUpperCase()}</span>
              {job.sourceLabel && (
                <Link href={getCompanyPath(job.sourceLabel)} className="badge bg-slate-100 text-slate-600" style={{ textDecoration: "none" }}>
                  {job.sourceLabel}
                </Link>
              )}
              <span className="ml-auto text-slate-400 text-xs">{formatDate(job.publishedAt)}</span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {displayTitle}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {job.seo?.metaDescription || job.summary}
            </p>

            {signalPills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {signalPills.map((pill) => (
                  <span key={pill} className="badge bg-slate-100 text-slate-700">
                    {pill}
                  </span>
                ))}
              </div>
            )}

          </header>

          {/* Overview */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
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
                <div key={label} className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-0.5 font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          {(richDescription || job.summary) && (
            <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
              <h2 className="section-title">Job Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {richDescription || job.summary}
              </p>
            </section>
          )}

          {/* Keywords */}
          {(job.seo?.keywords || []).length > 0 && (
            <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
              <h2 className="section-title">Related Skills & Keywords</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(job.seo?.keywords || []).map((kw) => (
                  <Link
                    key={kw}
                    href={`/?search=${encodeURIComponent(kw)}`}
                    className="tag-pill"
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
              background: "linear-gradient(135deg, rgba(11,143,117,0.12) 0%, rgba(11,143,117,0.04) 100%)",
              border: "2px solid rgba(11,143,117,0.25)",
              borderRadius: "1.5rem",
              padding: "2rem 1.5rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🚀</div>
            <h2
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "clamp(1.3rem, 4vw, 1.75rem)",
                fontWeight: 800,
                color: "#0f172a",
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
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  background: "var(--brand)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1rem",
                  padding: "0.85rem 2.5rem",
                  borderRadius: "0.875rem",
                  textDecoration: "none",
                  transition: "background 0.18s ease, transform 0.12s ease",
                  boxShadow: "0 4px 20px rgba(11,143,117,0.35)",
                  minWidth: "200px",
                }}
              >
                ✨ Apply Now ↗
              </a>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  border: "1.5px solid rgba(11,143,117,0.3)",
                  background: "#fff",
                  color: "var(--brand-ink)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  padding: "0.85rem 1.75rem",
                  borderRadius: "0.875rem",
                  textDecoration: "none",
                  transition: "background 0.18s ease",
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
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 h-11 rounded-2xl text-sm"
            >
              Apply Now ↗
            </a>
            <Link
              href="/"
              className="btn-outline w-full flex items-center justify-center h-11 rounded-2xl text-sm"
            >
              ← Browse More Jobs
            </Link>
          </div>

          {/* Share */}
          <div className="glass-card rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-700">Share This Job</h2>
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
