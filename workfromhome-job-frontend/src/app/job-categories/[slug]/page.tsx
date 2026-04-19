import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { getFeaturedComboCountries } from "../../lib/seoCountries";

export const revalidate = 900;

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

async function fetchJobs(query: string, page: number, filters: ReturnType<typeof readJobFilters>) {
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
}

export async function generateStaticParams() {
  return JOB_CATEGORIES.map((category) => ({ slug: category.slug }));
}

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

  return (
    <div className="flex flex-1 flex-col gap-6">
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
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">{category.introTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {category.introBody}
          </p>
        </section>

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

        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Popular Countries for {category.label}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {getFeaturedComboCountries().map((country) => (
              <Link
                key={country.code}
                href={getJobCategoryCountryPath(category.slug, country.slug)}
                className="tag-pill"
              >
                {country.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
