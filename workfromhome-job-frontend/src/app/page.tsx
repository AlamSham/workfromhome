import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import PopularCompanies from "./components/PopularCompanies";
import SharedJobsFeed, { JobListItem, PaginationData } from "./components/SharedJobsFeed";
import {
  applyJobFiltersToParams,
  getSearchParamValue,
  hasActiveJobFilters,
  readJobFilters,
  SearchParamValue,
} from "./lib/jobFilters";
import { JOB_CATEGORIES, getJobCategoryPath } from "./lib/jobCategories";
import { SEO_COUNTRIES } from "./lib/seoCountries";

export const revalidate = 28800; // 8 hours — Cloud Run optimized

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface JobsApiPayload { success?: boolean; data?: JobListItem[]; pagination?: Partial<PaginationData>; }
interface HomeProps { searchParams: Promise<Record<string, SearchParamValue>>; }

function toInt(v: unknown, fallback = 1): number {
  const p = Number(v);
  if (!Number.isFinite(p)) return fallback;
  return Math.max(1, Math.floor(p));
}

const fetchJobs = cache(async ({ page, search, country, filters }: { page: number; search: string; country: string; filters: ReturnType<typeof readJobFilters> }) => {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);
  if (country) params.set("country", country);
  applyJobFiltersToParams(params, filters);
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { next: { revalidate } });
    if (!res.ok) throw new Error();
    const payload = (await res.json()) as JobsApiPayload;
    if (!payload?.success) throw new Error();
    return {
      jobs: Array.isArray(payload.data) ? payload.data : [],
      pagination: {
        page: toInt(payload.pagination?.page, 1),
        totalPages: toInt(payload.pagination?.totalPages, 1),
        total: toInt(payload.pagination?.total, 0),
      },
      error: "",
    };
  } catch {
    return { jobs: [], pagination: { page: 1, totalPages: 1, total: 0 }, error: "Unable to load jobs. Please refresh." };
  }
});

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const r = await searchParams;
  const search = getSearchParamValue(r?.search).trim();
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const title = search
    ? `"${search}" Remote Jobs (Hiring Immediately 2026) | RemoteJobDesk`
    : "⚡ 1,000+ Verified Remote Jobs Hiring Immediately (2026) | RemoteJobDesk";
  const desc = search
    ? `Browse active remote "${search}" jobs hiring right now. Transparent salaries, vetted employers, and direct application links updated daily.`
    : "Find 1,000+ verified remote and work-from-home jobs across the US, UK & Europe. High-paying tech, customer support, sales & entry-level roles ($45K–$180K). Apply directly to top companies!";
  const shouldIndex = !search && page <= 1 && !hasActiveJobFilters(filters);
  return {
    title,
    description: desc,
    keywords: [
      "remote jobs 2026",
      "work from home jobs hiring immediately",
      "legitimate remote jobs",
      "entry level remote jobs no experience",
      "high paying wfh jobs",
      "remote jobs us europe",
    ],
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: { title, description: desc, url: `${SITE_URL}/` },
    robots: shouldIndex ? undefined : { index: false, follow: true },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const r = await searchParams;
  const search = getSearchParamValue(r?.search).trim();
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const country = ""; // Root page means global search
  const filters = readJobFilters(r);

  const { jobs, pagination, error } = await fetchJobs({ page, search, country, filters });

  return (
    <>
      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search={search}
        country={country}
        baseUrl="/"
        filters={filters}
      />
      {!search && (
        <div className="mx-auto flex w-full max-w-[1120px] min-w-0 flex-col gap-4 sm:gap-6 px-3 sm:px-4 pb-10">
          <PopularCompanies />

          {/* ── SEO: Browse by Country ── */}
          <section className="glass-card fade-up p-4 sm:p-6 md:p-8">
            <h2 className="section-title">Browse Remote Jobs by Country</h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.7 }}>
              Find work-from-home opportunities in {SEO_COUNTRIES.length}+ countries across North America and Europe.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {SEO_COUNTRIES.map((c) => (
                <Link
                  key={c.code}
                  href={`/remote-jobs-in-${c.code.toLowerCase()}`}
                  className="tag-pill"
                >
                  Remote Jobs in {c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* ── SEO: Browse by Category ── */}
          <section className="glass-card fade-up p-4 sm:p-6 md:p-8">
            <h2 className="section-title">Browse Remote Jobs by Category</h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.7 }}>
              Explore remote positions across the most popular job categories — from software engineering to customer support.
            </p>
            <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {JOB_CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  href={getJobCategoryPath(category.slug)}
                  className="tag-pill"
                >
                  Remote {category.label} Jobs
                </Link>
              ))}
            </div>
          </section>

          {/* ── SEO: What is RemoteJobDesk ── */}
          <section className="glass-card fade-up p-4 sm:p-6 md:p-8">
            <h2 className="section-title">What is RemoteJobDesk?</h2>
            <p style={{ marginTop: "0.75rem", fontSize: "0.88rem", lineHeight: 1.8, color: "#475569" }}>
              RemoteJobDesk is a free job discovery platform that aggregates the best remote and work-from-home 
              opportunities across the United States, United Kingdom, Germany, and 20+ European countries. 
              Our AI-powered system collects listings from dozens of trusted sources — job boards, company career 
              pages, and RSS feeds — and enhances them with smart metadata to help you find the perfect role faster.
            </p>
            <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
              {[
                { color: "#2563eb", label: "22+ Countries", desc: "US, UK, EU & more" },
                { color: "#7c3aed", label: "AI-Enhanced", desc: "Smart job matching" },
                { color: "#059669", label: "Updated Hourly", desc: "Fresh listings daily" },
                { color: "#d97706", label: "100% Free", desc: "No sign-up needed" },
              ].map((item) => (
                <div key={item.label} style={{ borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.85rem", textAlign: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, margin: "0 auto 0.5rem", boxShadow: `0 0 12px ${item.color}40` }} />
                  <p style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a" }}>{item.label}</p>
                  <p style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SEO: Latest from Blog ── */}
          <section className="glass-card fade-up p-4 sm:p-6 md:p-8">
            <h2 className="section-title">Remote Work Guides</h2>
            <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.7 }}>
              Expert tips and career advice for remote professionals.
            </p>
            <div style={{ marginTop: "1rem", display: "grid", gap: "0.6rem", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
              {[
                { href: "/blog/best-remote-jobs-2026", title: "15 Best Remote Jobs in 2026", badge: "Career Guide", color: "#2563eb" },
                { href: "/blog/how-to-get-remote-job-no-experience", title: "Get a Remote Job — No Experience", badge: "Getting Started", color: "#059669" },
                { href: "/blog/highest-paying-remote-jobs", title: "Highest Paying Remote Jobs ($100K+)", badge: "Salary Guide", color: "#d97706" },
                { href: "/blog/remote-job-interview-tips", title: "Ace Your Virtual Interview", badge: "Interview Prep", color: "#7c3aed" },
              ].map((post) => (
                <Link
                  key={post.href}
                  href={post.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.85rem",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ width: "4px", height: "32px", borderRadius: "4px", background: post.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: post.color, textTransform: "uppercase", letterSpacing: "0.1em" }}>{post.badge}</span>
                    <p style={{ marginTop: "0.15rem", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{post.title}</p>
                  </div>
                  <span style={{ color: "#64748b", fontSize: "0.85rem", flexShrink: 0 }}>→</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── SEO: FAQ ── */}
          <section className="glass-card fade-up" style={{ borderRadius: "1.25rem", padding: "1.5rem 2rem" }}>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <details style={{ borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem" }} open>
                <summary style={{ cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>What is a remote job?</summary>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.8, color: "#475569" }}>A remote job (also called work-from-home or WFH) is a position where you work from any location — home, coworking space, or coffee shop — instead of commuting to an office. Remote jobs use digital tools like Slack, Zoom, and email for communication and collaboration.</p>
              </details>
              <details style={{ borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem" }}>
                <summary style={{ cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>How do I find legitimate remote jobs?</summary>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.8, color: "#475569" }}>Use trusted platforms like RemoteJobDesk that aggregate listings from verified sources. Look for company names you recognize, check reviews on Glassdoor, and never pay for a job application. Legitimate remote employers provide clear job descriptions and professional interview processes.</p>
              </details>
              <details style={{ borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem" }}>
                <summary style={{ cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>Which countries have the most remote jobs?</summary>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.8, color: "#475569" }}>The United States has the largest remote job market, followed by the United Kingdom, Germany, France, and the Netherlands. These five countries account for over 80% of all remote job listings in our database.</p>
              </details>
              <details style={{ borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1rem" }}>
                <summary style={{ cursor: "pointer", fontSize: "0.88rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>Are remote jobs available for entry-level candidates?</summary>
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", lineHeight: 1.8, color: "#475569" }}>Yes! Many remote positions in customer support, data entry, virtual assistance, content writing, and sales development are open to candidates with no prior experience. Check our guide on getting your first remote job for detailed tips.</p>
              </details>
            </div>
          </section>

        </div>
      )}

      {/* Home page FAQ JSON-LD */}
      {!search && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "What is a remote job?", acceptedAnswer: { "@type": "Answer", text: "A remote job is a position where you work from any location instead of commuting to an office. Remote jobs use digital tools for communication and collaboration." } },
              { "@type": "Question", name: "How do I find legitimate remote jobs?", acceptedAnswer: { "@type": "Answer", text: "Use trusted platforms like RemoteJobDesk that aggregate listings from verified sources. Look for recognized company names and never pay for a job application." } },
              { "@type": "Question", name: "Which countries have the most remote jobs?", acceptedAnswer: { "@type": "Answer", text: "The US has the largest remote job market, followed by UK, Germany, France, and Netherlands. These five countries account for over 80% of all remote listings." } },
              { "@type": "Question", name: "Are remote jobs available for entry-level candidates?", acceptedAnswer: { "@type": "Answer", text: "Yes! Many remote positions in customer support, data entry, virtual assistance, and content writing are open to candidates with no prior experience." } },
            ],
          }) }}
        />
      )}
    </>
  );
}
