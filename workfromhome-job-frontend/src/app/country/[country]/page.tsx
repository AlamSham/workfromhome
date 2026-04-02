import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SharedJobsFeed, { JobListItem, PaginationData, COUNTRY_LABELS } from "../../components/SharedJobsFeed";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

type SearchParamValue = string | string[] | undefined;
interface JobsApiPayload { success?: boolean; data?: JobListItem[]; pagination?: Partial<PaginationData>; }
interface CountryPageProps {
  params: Promise<{ country: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function getParamValue(v: SearchParamValue): string {
  if (Array.isArray(v)) return String(v[0] || "");
  return String(v || "");
}
function toInt(v: unknown, fallback = 1): number {
  const p = Number(v);
  if (!Number.isFinite(p)) return fallback;
  return Math.max(1, Math.floor(p));
}

async function fetchJobs({ page, search, country }: { page: number; search: string; country: string }) {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (search) params.set("search", search);
  if (country) params.set("country", country);
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { cache: "no-store" });
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
}

export async function generateMetadata({ params, searchParams }: CountryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const rawCountry = (resolvedParams?.country || "").toUpperCase();
  // Valid country check
  if (!COUNTRY_LABELS[rawCountry]) {
    return { title: "Not Found", description: "Country not found." };
  }

  const r = await searchParams;
  const search = getParamValue(r?.search).trim();
  const title = `Remote Work-From-Home Jobs in ${COUNTRY_LABELS[rawCountry] || rawCountry}${search ? ` for "${search}"` : ""}`;
  const desc = `Find fresh remote jobs in ${COUNTRY_LABELS[rawCountry] || rawCountry}${search ? ` for "${search}"` : ""}. Updated daily with AI-enhanced listings.`;
  const url = `${SITE_URL}/remote-jobs-in-${rawCountry.toLowerCase()}`;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url },
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
  const search = getParamValue(r?.search).trim();
  const page = toInt(getParamValue(r?.page) || 1, 1);

  const { jobs, pagination, error } = await fetchJobs({ page, search, country: rawCountry });

  return (
    <SharedJobsFeed
      jobs={jobs}
      pagination={pagination}
      error={error}
      search={search}
      country={rawCountry}
      baseUrl={`/remote-jobs-in-${rawCountry.toLowerCase()}`}
    />
  );
}
