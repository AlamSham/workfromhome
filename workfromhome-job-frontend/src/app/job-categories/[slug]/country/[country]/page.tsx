import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PopularCompanies from "../../../../components/PopularCompanies";
import SharedJobsFeed, { JobListItem, PaginationData } from "../../../../components/SharedJobsFeed";
import {
  applyJobFiltersToParams,
  getSearchParamValue,
  hasActiveJobFilters,
  readJobFilters,
  SearchParamValue,
} from "../../../../lib/jobFilters";
import {
  JOB_CATEGORIES,
  getJobCategoryBySlug,
  getJobCategoryCountryPath,
  getJobCategoryPath,
} from "../../../../lib/jobCategories";
import {
  FEATURED_COMBO_COUNTRY_CODES,
  getFeaturedComboCountries,
  getSeoCountryByCode,
  getSeoCountryBySlug,
} from "../../../../lib/seoCountries";

export const revalidate = 21600; // 6 hours — was 900s (15min), way too aggressive

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface JobsApiPayload {
  success?: boolean;
  data?: JobListItem[];
  pagination?: Partial<PaginationData>;
}
interface CategoryCountryPageProps {
  params: Promise<{ slug: string; country: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function toInt(v: unknown, fallback = 1): number {
  const p = Number(v);
  if (!Number.isFinite(p)) return fallback;
  return Math.max(1, Math.floor(p));
}

async function fetchJobs(query: string, countryCode: string, page: number, filters: ReturnType<typeof readJobFilters>) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    search: query,
    country: countryCode,
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
}

export async function generateStaticParams() {
  return JOB_CATEGORIES.flatMap((category) =>
    FEATURED_COMBO_COUNTRY_CODES.map((countryCode) => {
      const country = getSeoCountryByCode(countryCode);
      return country ? { slug: category.slug, country: country.slug } : null;
    }).filter((value): value is { slug: string; country: string } => Boolean(value))
  );
}

export async function generateMetadata({ params, searchParams }: CategoryCountryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = getJobCategoryBySlug(resolvedParams?.slug || "");
  const country = getSeoCountryBySlug(resolvedParams?.country || "");
  if (!category || !country) {
    return { title: "Page Not Found", description: "This landing page could not be found." };
  }

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const jobResult = await fetchJobs(category.query, country.code, page, filters);
  const canonicalUrl = `${SITE_URL}${getJobCategoryCountryPath(category.slug, country.slug)}`;
  const title = `Remote ${category.label} Jobs in ${country.name} — Updated Daily`;
  const description = `Browse remote ${category.label.toLowerCase()} jobs in ${country.name}. Fresh work-from-home opportunities updated daily for distributed hiring teams.`;
  const shouldIndex = page <= 1 && jobResult.pagination.total > 0 && !hasActiveJobFilters(filters);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl },
    robots: shouldIndex ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryCountryPage({ params, searchParams }: CategoryCountryPageProps) {
  const resolvedParams = await params;
  const category = getJobCategoryBySlug(resolvedParams?.slug || "");
  const country = getSeoCountryBySlug(resolvedParams?.country || "");
  if (!category || !country) notFound();

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const { jobs, pagination, error } = await fetchJobs(category.query, country.code, page, filters);

  const relatedCountries = getFeaturedComboCountries().filter((item) => item.code !== country.code);
  const relatedCategories = category.relatedSlugs
    .map((slug) => getJobCategoryBySlug(slug))
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search={category.query}
        country={country.code}
        baseUrl={getJobCategoryCountryPath(category.slug, country.slug)}
        filters={filters}
        paginationSearch=""
        heroBadgeText="Long-Tail Remote Job Search"
        heroTitle={`Find Remote ${category.label} Jobs in ${country.name}`}
        heroDescription={`Browse current remote ${category.label.toLowerCase()} jobs in ${country.name}. This landing page combines category intent with country targeting to surface more relevant remote opportunities.`}
        alertLabel={`Save alerts for remote ${category.label.toLowerCase()} jobs in ${country.name}, including your current salary and experience filters.`}
      />

      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Why This Landing Page Matters</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Candidates often search using both a role and a target market, such
            as <strong>{category.label}</strong> roles in <strong>{country.name}</strong>. This page creates
            a dedicated destination for that intent so job seekers can find
            relevant openings faster while search engines see a clearer topical
            match.
          </p>
        </section>

        {relatedCountries.length > 0 && (
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">More Countries for {category.label}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedCountries.slice(0, 6).map((item) => (
                <Link
                  key={item.code}
                  href={getJobCategoryCountryPath(category.slug, item.slug)}
                  className="tag-pill"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedCategories.length > 0 && (
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">More Remote Job Searches in {country.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedCategories.map((item) => (
                <Link
                  key={item.slug}
                  href={getJobCategoryCountryPath(item.slug, country.slug)}
                  className="tag-pill"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Broader Search Options</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={getJobCategoryPath(category.slug)} className="tag-pill">
              All {category.label} Jobs
            </Link>
            <Link href={`/remote-jobs-in-${country.code.toLowerCase()}`} className="tag-pill">
              All Jobs in {country.name}
            </Link>
          </div>
        </section>

        <PopularCompanies subtitle="Follow company pages as well to discover recurring remote hiring sources related to this search intent." />
      </div>
    </div>
  );
}
