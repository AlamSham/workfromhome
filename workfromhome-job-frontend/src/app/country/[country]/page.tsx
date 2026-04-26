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
import { getSeoCountryByCode } from "../../lib/seoCountries";

export const revalidate = 7200; // 2 hours - optimized for low traffic

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

export async function generateMetadata({ params, searchParams }: CountryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCountry = (resolvedParams?.country || "").toUpperCase();
  // Valid country check
  if (!COUNTRY_LABELS[rawCountry]) {
    return { title: "Not Found", description: "Country not found." };
  }

  const r = await searchParams;
  const search = getSearchParamValue(r?.search).trim();
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const title = `Remote Work-From-Home Jobs in ${COUNTRY_LABELS[rawCountry] || rawCountry}${search ? ` for "${search}"` : ""}`;
  const desc = `Find fresh remote jobs in ${COUNTRY_LABELS[rawCountry] || rawCountry}${search ? ` for "${search}"` : ""}. Updated daily with AI-enhanced listings.`;
  const url = `${SITE_URL}/remote-jobs-in-${rawCountry.toLowerCase()}`;
  const shouldIndex = !search && page <= 1 && !hasActiveJobFilters(filters);

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url },
    robots: shouldIndex ? undefined : { index: false, follow: true },
  };
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const resolvedParams = await params;
  const rawCountry = (resolvedParams?.country || "").toUpperCase();
  
  // 404 if the country code passed in the URL isn't recognized
  if (!COUNTRY_LABELS[rawCountry]) {
    notFound();
  }

  const r = await searchParams;
  const search = getSearchParamValue(r?.search).trim();
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);

  const { jobs, pagination, error } = await fetchJobs({ page, search, country: rawCountry, filters });
  const seoCountry = getSeoCountryByCode(rawCountry);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search={search}
        country={rawCountry}
        baseUrl={`/remote-jobs-in-${rawCountry.toLowerCase()}`}
        filters={filters}
      />
      {!search && seoCountry && (
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Popular Remote Searches in {seoCountry.name}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {JOB_CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={getJobCategoryCountryPath(category.slug, seoCountry.slug)}
                  className="tag-pill"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
