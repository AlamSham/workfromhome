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

export const revalidate = 14400; // 4 hours — saves CPU on Hobby tier

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
  // We no longer read country here. Root / is global. Country routing handles countries.
  const title = search ? `"${search}" — Remote Work-From-Home Jobs` : "Remote Work-From-Home Jobs";
  const desc = `Find fresh remote jobs across the US & Europe${search ? ` for "${search}"` : ""}. Updated daily.`;
  const shouldIndex = !search && page <= 1 && !hasActiveJobFilters(filters);
  return {
    title,
    description: desc,
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
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">
          <PopularCompanies />

          {/* ── SEO: Browse by Country ── */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Browse Remote Jobs by Country</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6">
              Find work-from-home opportunities in {SEO_COUNTRIES.length}+ countries across North America and Europe.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Browse Remote Jobs by Category</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6">
              Explore remote positions across the most popular job categories — from software engineering to customer support.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">What is RemoteJobDesk?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              RemoteJobDesk is a free job discovery platform that aggregates the best remote and work-from-home 
              opportunities across the United States, United Kingdom, Germany, and 20+ European countries. 
              Our AI-powered system collects listings from dozens of trusted sources — job boards, company career 
              pages, and RSS feeds — and enhances them with smart metadata to help you find the perfect role faster.
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "🌍", label: "22+ Countries", desc: "US, UK, EU & more" },
                { icon: "🤖", label: "AI-Enhanced", desc: "Smart job matching" },
                { icon: "🔄", label: "Updated Hourly", desc: "Fresh listings daily" },
                { icon: "💯", label: "100% Free", desc: "No sign-up needed" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-xl">{item.icon}</p>
                  <p className="mt-1 text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SEO: Latest from Blog ── */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Remote Work Guides</h2>
            <p className="mt-2 text-sm text-slate-600 leading-6">
              Expert tips and career advice for remote professionals.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { href: "/blog/best-remote-jobs-2026", title: "15 Best Remote Jobs in 2026", badge: "Career Guide" },
                { href: "/blog/how-to-get-remote-job-no-experience", title: "Get a Remote Job — No Experience", badge: "Getting Started" },
                { href: "/blog/highest-paying-remote-jobs", title: "Highest Paying Remote Jobs ($100K+)", badge: "Salary Guide" },
                { href: "/blog/remote-job-interview-tips", title: "Ace Your Virtual Interview", badge: "Interview Prep" },
              ].map((post) => (
                <Link
                  key={post.href}
                  href={post.href}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-brand-light"
                  style={{ textDecoration: "none" }}
                >
                  <div>
                    <span className="badge bg-brand/10 text-brand-ink text-[10px]">{post.badge}</span>
                    <p className="mt-1 text-sm font-bold text-slate-800 leading-snug">{post.title}</p>
                  </div>
                  <span className="ml-auto text-brand-ink text-sm">→</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── SEO: FAQ (visible on home page for max SERP impact) ── */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-3">
              <details className="group rounded-2xl bg-slate-50 p-4" open>
                <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">What is a remote job?</summary>
                <p className="text-sm leading-7 text-slate-600">A remote job (also called work-from-home or WFH) is a position where you work from any location — home, coworking space, or coffee shop — instead of commuting to an office. Remote jobs use digital tools like Slack, Zoom, and email for communication and collaboration.</p>
              </details>
              <details className="group rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">How do I find legitimate remote jobs?</summary>
                <p className="text-sm leading-7 text-slate-600">Use trusted platforms like RemoteJobDesk that aggregate listings from verified sources. Look for company names you recognize, check reviews on Glassdoor, and never pay for a job application. Legitimate remote employers provide clear job descriptions and professional interview processes.</p>
              </details>
              <details className="group rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">Which countries have the most remote jobs?</summary>
                <p className="text-sm leading-7 text-slate-600">The United States has the largest remote job market, followed by the United Kingdom, Germany, France, and the Netherlands. These five countries account for over 80% of all remote job listings in our database.</p>
              </details>
              <details className="group rounded-2xl bg-slate-50 p-4">
                <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">Are remote jobs available for entry-level candidates?</summary>
                <p className="text-sm leading-7 text-slate-600">Yes! Many remote positions in customer support, data entry, virtual assistance, content writing, and sales development are open to candidates with no prior experience. Check our guide on getting your first remote job for detailed tips.</p>
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
