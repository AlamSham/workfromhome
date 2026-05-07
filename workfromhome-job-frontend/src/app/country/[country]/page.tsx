import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import SharedJobsFeed, { JobListItem, PaginationData, COUNTRY_LABELS } from "../../components/SharedJobsFeed";
import {
  applyJobFiltersToParams,
  getSearchParamValue,
  hasActiveJobFilters,
  readJobFilters,
  SearchParamValue,
} from "../../lib/jobFilters";
import { JOB_CATEGORIES, getJobCategoryCountryPath } from "../../lib/jobCategories";
import { getSeoCountryByCode, SEO_COUNTRIES } from "../../lib/seoCountries";

export const revalidate = 21600; // 6 hours — reduces CPU by 3x vs 2hr
export const dynamicParams = true; // allow non-pre-built country codes

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface JobsApiPayload { success?: boolean; data?: JobListItem[]; pagination?: Partial<PaginationData>; }
interface CountryPageProps {
  params: Promise<{ country: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}

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

// ── Country-specific SEO content for Google rich results ──
const COUNTRY_SEO_CONTENT: Record<string, {
  fullName: string;
  intro: string;
  whyRemote: string;
  topRoles: string[];
  faq: { q: string; a: string }[];
}> = {
  US: {
    fullName: "the United States",
    intro: "The US leads global remote work adoption with major tech hubs in Silicon Valley, Austin, New York, and Seattle offering thousands of fully distributed positions. From Fortune 500 companies to fast-growing startups, American employers are increasingly hiring remote-first teams.",
    whyRemote: "Remote work in the US offers access to competitive salaries, comprehensive benefits, and career growth at scale. With no timezone barriers for domestic roles, US-based remote workers enjoy maximum flexibility while working with world-class teams.",
    topRoles: ["Software Engineer", "Product Manager", "Data Analyst", "Customer Success", "Marketing Manager", "DevOps Engineer"],
    faq: [
      { q: "How many remote jobs are available in the US?", a: "The US has the largest remote job market globally. Our platform aggregates hundreds of fresh remote positions from US companies daily, covering tech, marketing, sales, support, and more." },
      { q: "What are the highest-paying remote jobs in the US?", a: "Software engineering, product management, data science, and DevOps roles typically offer the highest remote salaries in the US, ranging from $100K to $250K+ annually." },
      { q: "Do US remote jobs require US residency?", a: "Many US remote jobs do require US residency or work authorization. However, some companies hire globally. Each listing on RemoteJobDesk specifies location requirements." },
    ],
  },
  UK: {
    fullName: "the United Kingdom",
    intro: "The UK is Europe's largest remote work market, with London, Manchester, Edinburgh, and Bristol leading in distributed hiring. UK employers across fintech, healthcare, e-commerce, and SaaS are actively building remote teams.",
    whyRemote: "Remote work in the UK combines competitive GBP salaries with strong labor protections. The UK's position between US and European timezones makes it ideal for international collaboration.",
    topRoles: ["Full Stack Developer", "Product Designer", "Data Engineer", "Account Manager", "Content Strategist", "QA Engineer"],
    faq: [
      { q: "Are remote jobs common in the UK?", a: "Yes — since 2020, remote work adoption in the UK has grown significantly. Major employers like Revolut, Wise, and Deliveroo offer fully remote positions across multiple departments." },
      { q: "What's the average salary for remote jobs in the UK?", a: "Remote salaries in the UK vary by role. Software engineers earn £50K-£120K, product managers £55K-£100K, and marketing professionals £35K-£70K on average." },
      { q: "Can I work remotely from the UK for a US company?", a: "Some US companies do hire UK-based remote workers, often through Employer of Record (EOR) services. Filter jobs by UK on our platform to find roles available in your location." },
    ],
  },
  DE: {
    fullName: "Germany",
    intro: "Germany is Continental Europe's powerhouse for remote tech hiring. Cities like Berlin, Munich, Hamburg, and Frankfurt are home to thriving startup ecosystems and global corporations embracing distributed work models.",
    whyRemote: "Germany offers strong worker protections, competitive salaries in EUR, and a robust tech ecosystem. Many German companies operate in English, making them accessible to international talent.",
    topRoles: ["Backend Developer", "Machine Learning Engineer", "Product Owner", "UX Researcher", "Sales Engineer", "Cloud Architect"],
    faq: [
      { q: "Do German remote jobs require German language skills?", a: "Many German tech companies operate in English. However, customer-facing roles may require German proficiency. Check individual listings for language requirements." },
      { q: "What's the remote work culture like in Germany?", a: "German companies tend to offer structured remote work with clear work-life boundaries. Many provide home office stipends and follow regulated working hours." },
    ],
  },
};

// Generate SEO content for countries without specific content
function getCountrySeoContent(code: string) {
  if (COUNTRY_SEO_CONTENT[code]) return COUNTRY_SEO_CONTENT[code];
  const country = getSeoCountryByCode(code);
  const name = country?.name || code;
  return {
    fullName: name,
    intro: `${name} is an emerging market for remote work opportunities. Companies across the tech, finance, and creative sectors are actively hiring distributed teams in ${name}.`,
    whyRemote: `Remote work in ${name} offers professionals the chance to work with international companies while enjoying local cost of living advantages. The growing digital infrastructure makes ${name} increasingly attractive for distributed teams.`,
    topRoles: ["Software Developer", "Customer Support", "Marketing Specialist", "Data Analyst", "Product Manager", "Sales Representative"],
    faq: [
      { q: `Are there remote jobs available in ${name}?`, a: `Yes — our platform aggregates remote job listings from companies hiring in ${name} and globally. New positions are added daily across multiple industries.` },
      { q: `What types of remote jobs can I find in ${name}?`, a: `Remote jobs in ${name} span software development, customer support, marketing, sales, data analysis, and product management. Tech roles are the most common.` },
    ],
  };
}

export async function generateStaticParams() {
  return SEO_COUNTRIES.map((c) => ({ country: c.code.toLowerCase() }));
}

export async function generateMetadata({ params, searchParams }: CountryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCountry = (resolvedParams?.country || "").toUpperCase();
  if (!COUNTRY_LABELS[rawCountry]) {
    return { title: "Not Found", description: "Country not found." };
  }

  const seoCountry = getSeoCountryByCode(rawCountry);
  const countryName = seoCountry?.name || COUNTRY_LABELS[rawCountry] || rawCountry;

  const r = await searchParams;
  const search = getSearchParamValue(r?.search).trim();
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const title = search
    ? `"${search}" — Remote Jobs in ${countryName}`
    : `Remote Work-From-Home Jobs in ${countryName} — Updated Daily 2026`;
  const desc = search
    ? `Find remote "${search}" jobs in ${countryName}. Updated daily with AI-enhanced listings.`
    : `Browse ${countryName}'s best remote & work-from-home jobs. Software, marketing, sales, support roles updated daily. Apply directly to top employers.`;
  const url = `${SITE_URL}/remote-jobs-in-${rawCountry.toLowerCase()}`;
  const shouldIndex = !search && page <= 1 && !hasActiveJobFilters(filters);

  return {
    title,
    description: desc,
    keywords: [
      `remote jobs ${countryName}`,
      `work from home ${countryName}`,
      `remote work ${countryName}`,
      `wfh jobs ${rawCountry}`,
      `online jobs ${countryName}`,
      `telecommute ${countryName}`,
    ],
    alternates: { canonical: url },
    openGraph: { title, description: desc, url },
    robots: shouldIndex ? undefined : { index: false, follow: true },
  };
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const resolvedParams = await params;
  const rawCountry = (resolvedParams?.country || "").toUpperCase();
  
  if (!COUNTRY_LABELS[rawCountry]) {
    notFound();
  }

  const r = await searchParams;
  const search = getSearchParamValue(r?.search).trim();
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);

  const { jobs, pagination, error } = await fetchJobs({ page, search, country: rawCountry, filters });
  const seoCountry = getSeoCountryByCode(rawCountry);
  const countryName = seoCountry?.name || COUNTRY_LABELS[rawCountry] || rawCountry;
  const seoContent = getCountrySeoContent(rawCountry);

  // ── Structured Data: BreadcrumbList ──
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Remote Jobs in ${countryName}`, item: `${SITE_URL}/remote-jobs-in-${rawCountry.toLowerCase()}` },
    ],
  };

  // ── Structured Data: FAQPage (boosts SERP real estate) ──
  const faqJsonLd = seoContent.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seoContent.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  } : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* JSON-LD: Breadcrumbs */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* JSON-LD: FAQ */}
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search={search}
        country={rawCountry}
        baseUrl={`/remote-jobs-in-${rawCountry.toLowerCase()}`}
        filters={filters}
      />

      {!search && (
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">

          {/* ── About remote work in this country ── */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Remote Jobs in {countryName} — Overview</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{seoContent.intro}</p>
          </section>

          {/* ── Why work remotely here ── */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Why Work Remotely in {countryName}?</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{seoContent.whyRemote}</p>
            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Top Remote Roles</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {seoContent.topRoles.map((role) => (
                  <span key={role} className="tag-pill">{role}</span>
                ))}
              </div>
            </div>
          </section>

          {/* ── Browse by category in this country ── */}
          {seoCountry && (
            <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
              <h2 className="section-title">Browse Remote Jobs by Category in {countryName}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {JOB_CATEGORIES.slice(0, 8).map((category) => (
                  <Link
                    key={category.slug}
                    href={getJobCategoryCountryPath(category.slug, seoCountry.slug)}
                    className="tag-pill"
                  >
                    {category.label} in {countryName}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Browse other countries ── */}
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Explore Remote Jobs in Other Countries</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {SEO_COUNTRIES.filter((c) => c.code !== rawCountry).slice(0, 12).map((c) => (
                <Link
                  key={c.code}
                  href={`/remote-jobs-in-${c.code.toLowerCase()}`}
                  className="tag-pill"
                >
                  {COUNTRY_LABELS[c.code] || c.name}
                </Link>
              ))}
            </div>
          </section>

          {/* ── FAQ section (visible + schema) ── */}
          {seoContent.faq.length > 0 && (
            <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
              <h2 className="section-title">Frequently Asked Questions — Remote Jobs in {countryName}</h2>
              <div className="mt-4 space-y-4">
                {seoContent.faq.map((item, i) => (
                  <details key={i} className="group rounded-2xl bg-slate-50 p-4" open={i === 0}>
                    <summary className="cursor-pointer text-sm font-bold text-slate-800 leading-6 group-open:mb-2">
                      {item.q}
                    </summary>
                    <p className="text-sm leading-7 text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
