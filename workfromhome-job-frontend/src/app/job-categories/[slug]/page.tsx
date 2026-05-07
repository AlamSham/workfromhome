import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import SharedJobsFeed, { JobListItem, PaginationData } from "../../components/SharedJobsFeed";
import {
  applyJobFiltersToParams,
  getSearchParamValue,
  hasActiveJobFilters,
  readJobFilters,
  SearchParamValue,
} from "../../lib/jobFilters";
import {
  JOB_CATEGORIES,
  getJobCategoryBySlug,
  getJobCategoryCountryPath,
  getJobCategoryPath,
} from "../../lib/jobCategories";
import { getFeaturedComboCountries, SEO_COUNTRIES } from "../../lib/seoCountries";

export const revalidate = 14400; // 4 hours - optimized for low traffic

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface JobsApiPayload {
  success?: boolean;
  data?: JobListItem[];
  pagination?: Partial<PaginationData>;
}
interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function toInt(v: unknown, fallback = 1): number {
  const p = Number(v);
  if (!Number.isFinite(p)) return fallback;
  return Math.max(1, Math.floor(p));
}

const fetchJobs = cache(async (query: string, page: number, filters: ReturnType<typeof readJobFilters>) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    search: query,
  });
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
    return {
      jobs: [],
      pagination: { page: 1, totalPages: 1, total: 0 },
      error: "Unable to load jobs. Please refresh.",
    };
  }
});

export async function generateStaticParams() {
  return JOB_CATEGORIES.map((category) => ({ slug: category.slug }));
}

// ── Category-specific FAQ for Google rich results ──
const CATEGORY_FAQ: Record<string, { q: string; a: string }[]> = {
  "software-engineer": [
    { q: "What skills do I need for remote software engineer jobs?", a: "Most remote software engineering roles require proficiency in programming languages like JavaScript, Python, Java, or Go, along with experience in frameworks like React, Node.js, or Django. Cloud platforms (AWS, GCP), Git, and CI/CD knowledge are also commonly required." },
    { q: "How much do remote software engineers earn?", a: "Remote software engineers earn between $80K-$250K+ depending on experience and location. US-based roles typically pay $120K-$200K, while European roles offer €50K-€120K." },
    { q: "Are remote software engineer jobs entry-level friendly?", a: "Yes — many companies offer junior and entry-level remote positions. Look for titles like 'Junior Developer', 'Associate Engineer', or roles that mention 'new graduates welcome'." },
  ],
  "react-developer": [
    { q: "What's the demand for remote React developers?", a: "React remains the most popular frontend framework, making React developers highly sought after. Companies across e-commerce, SaaS, fintech, and healthcare actively hire remote React developers." },
    { q: "Should I learn React or Angular for remote jobs?", a: "React has significantly more remote job listings than Angular. If your goal is remote work, React is the stronger choice — it's used by companies like Meta, Netflix, and thousands of startups." },
  ],
  "customer-support": [
    { q: "Do remote customer support jobs require experience?", a: "Many remote customer support roles are entry-level friendly. Strong communication skills, empathy, and basic tech literacy are often more important than formal experience." },
    { q: "What tools do remote support teams use?", a: "Common tools include Zendesk, Intercom, Freshdesk, Slack, and Zoom. Familiarity with ticketing systems and CRM platforms is a plus." },
  ],
  "data-analyst": [
    { q: "What tools do remote data analysts use?", a: "Remote data analysts typically work with SQL, Python/R, Tableau or Power BI, Excel/Google Sheets, and cloud data warehouses like BigQuery or Snowflake." },
    { q: "Can I become a remote data analyst without a degree?", a: "Yes — many companies value practical skills and certifications (Google Data Analytics, IBM Data Analyst) over formal degrees. A strong portfolio of projects can substitute for traditional education." },
  ],
  "marketing": [
    { q: "What types of remote marketing jobs are available?", a: "Remote marketing roles include content marketing, SEO, paid acquisition, email marketing, social media management, growth marketing, brand management, and marketing operations." },
    { q: "Do remote marketing jobs pay well?", a: "Yes — remote marketing salaries range from $50K-$150K+ for US-based roles. Specialized skills like performance marketing, SEO, and growth hacking command premium salaries." },
  ],
  "product-manager": [
    { q: "What do remote product managers do?", a: "Remote product managers define product strategy, manage roadmaps, prioritize features, and coordinate between engineering, design, and business teams — all done through async communication and video calls." },
    { q: "Is product management a good career for remote work?", a: "Absolutely — product management is one of the most remote-friendly roles. It's communication-heavy rather than location-dependent, making it ideal for distributed teams." },
  ],
};

export async function generateMetadata({ params, searchParams }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = getJobCategoryBySlug(resolvedParams?.slug || "");
  if (!category) {
    return { title: "Category Not Found", description: "This category page could not be found." };
  }

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const url = `${SITE_URL}${getJobCategoryPath(category.slug)}`;

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    keywords: [
      `remote ${category.label.toLowerCase()} jobs`,
      `work from home ${category.label.toLowerCase()}`,
      `${category.label.toLowerCase()} remote positions`,
      `remote ${category.label.toLowerCase()} jobs 2026`,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      url,
    },
    robots: page <= 1 && !hasActiveJobFilters(filters) ? undefined : { index: false, follow: true },
  };
}

export default async function JobCategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = getJobCategoryBySlug(resolvedParams?.slug || "");
  if (!category) notFound();

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const { jobs, pagination, error } = await fetchJobs(category.query, page, filters);

  const relatedCategories = category.relatedSlugs
    .map((slug) => getJobCategoryBySlug(slug))
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  const faq = CATEGORY_FAQ[category.slug] || [];
  const pageUrl = `${SITE_URL}${getJobCategoryPath(category.slug)}`;

  // ── BreadcrumbList JSON-LD ──
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Remote ${category.label} Jobs`, item: pageUrl },
    ],
  };

  // ── FAQPage JSON-LD ──
  const faqJsonLd = faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  } : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search={category.query}
        country=""
        baseUrl={getJobCategoryPath(category.slug)}
        filters={filters}
        paginationSearch=""
        heroBadgeText="Popular Remote Job Category"
        heroTitle={category.heroTitle}
        heroDescription={category.heroDescription}
        alertLabel={`Save alerts for remote ${category.label.toLowerCase()} jobs that match your selected filters.`}
      />

      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">
        {/* ── Category intro ── */}
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">{category.introTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {category.introBody}
          </p>
        </section>

        {/* ── Related categories ── */}
        {relatedCategories.length > 0 && (
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Related Remote Job Pages</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedCategories.map((related) => (
                <Link
                  key={related.slug}
                  href={getJobCategoryPath(related.slug)}
                  className="tag-pill"
                >
                  {related.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Popular countries for this category ── */}
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Popular Countries for {category.label}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {getFeaturedComboCountries().map((country) => (
              <Link
                key={country.code}
                href={getJobCategoryCountryPath(category.slug, country.slug)}
                className="tag-pill"
              >
                Remote {category.label} in {country.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── FAQ section (visible + schema) ── */}
        {faq.length > 0 && (
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Frequently Asked Questions — Remote {category.label} Jobs</h2>
            <div className="mt-4 space-y-4">
              {faq.map((item, i) => (
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

        {/* ── All categories cross-link ── */}
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Browse All Remote Job Categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {JOB_CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
              <Link key={c.slug} href={getJobCategoryPath(c.slug)} className="tag-pill">
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
