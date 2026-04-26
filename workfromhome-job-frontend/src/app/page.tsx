import type { Metadata } from "next";
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

export const revalidate = 3600; // 1 hour - optimized for low traffic

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
        </div>
      )}
    </>
  );
}
