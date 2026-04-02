import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import RelatedJobs from "../../components/RelatedJobs";
import NewsletterCTA from "../../components/NewsletterCTA";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface SeoFields {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
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

function extractDomain(sourceLabel = ""): string {
  const value = String(sourceLabel || "").trim().toLowerCase();
  if (!value) return "";
  const noProtocol = value.replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(noProtocol)) return noProtocol;
  return "";
}

async function fetchWordPressDetail(job: JobDetail): Promise<string> {
  const domain = extractDomain(job?.sourceLabel);
  if (!domain) return "";
  const cleanTitle = (job?.originalTitle || "")
    .replace(/[^a-zA-Z0-9\s-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!cleanTitle) return "";

  const hosts = [domain, `www.${domain}`];
  for (const host of hosts) {
    try {
      const res = await fetch(
        `https://${host}/wp-json/wp/v2/posts?search=${encodeURIComponent(cleanTitle)}&per_page=5&_fields=title,content,excerpt`,
        { cache: "no-store" }
      );
      if (!res.ok) continue;
      const posts = (await res.json()) as WordPressPost[];
      if (!Array.isArray(posts) || !posts.length) continue;
      let best = "";
      for (const post of posts) {
        const full = normalizeText(post?.content?.rendered || "");
        const excerpt = normalizeText(post?.excerpt?.rendered || "");
        const candidate = full.length > excerpt.length ? full : excerpt;
        if (candidate.length > best.length) best = candidate;
      }
      if (best.length >= 300) return best;
    } catch { continue; }
  }
  return "";
}

async function buildRichDescription(job: JobDetail): Promise<string> {
  const raw = (job?.rawItem || {}) as RawJobItem;
  const candidates = [
    job?.summary, raw?.description, raw?.content,
    raw?.contentSnippet, raw?.job_description,
  ].map((item) => normalizeText(String(item || ""))).filter(Boolean);

  let best = candidates.sort((a, b) => b.length - a.length)[0] || "";
  if (String(job?.source || "").toLowerCase() === "google-rss" && best.length < 260) {
    const wpDetail = await fetchWordPressDetail(job);
    if (wpDetail.length > best.length) best = wpDetail;
  }
  return best;
}

const getJobById = cache(async (id: string): Promise<JobDetail | null> => {
  if (!id) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, { cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`API responded with ${response.status}`);
    const payload = await response.json();
    if (!payload?.success || !payload?.data) return null;
    return payload.data;
  } catch { return null; }
});

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const resolved = await params;
  const job = await getJobById(String(resolved?.id || ""));
  if (!job) {
    return { title: "Job Not Found", description: "This listing is unavailable or has expired." };
  }
  const title = job.seo?.metaTitle || job.originalTitle;
  const desc = job.seo?.metaDescription || job.summary || "Remote work opportunity. Apply now.";
  const url = `${SITE_URL}/jobs/${job._id}`;
  
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
  const job = await getJobById(String(resolved?.id || ""));
  if (!job) notFound();

  const richDescription = await buildRichDescription(job);
  const pageUrl = `${SITE_URL}/jobs/${job._id}`;
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
  };

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
                <span className="badge bg-slate-100 text-slate-600">{job.sourceLabel}</span>
              )}
              <span className="ml-auto text-slate-400 text-xs">{formatDate(job.publishedAt)}</span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {displayTitle}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {job.seo?.metaDescription || job.summary}
            </p>

            {/* Action buttons (visible in mobile, hidden on lg — sticky sidebar handles it) */}
            <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Apply Now ↗
              </a>
              <Link href="/" className="btn-outline">← Back to Jobs</Link>
            </div>
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
          <NewsletterCTA />
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
