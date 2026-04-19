import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PopularCompanies from "../../components/PopularCompanies";
import SharedJobsFeed, { JobListItem, PaginationData } from "../../components/SharedJobsFeed";
import {
  applyJobFiltersToParams,
  getSearchParamValue,
  hasActiveJobFilters,
  readJobFilters,
  SearchParamValue,
} from "../../lib/jobFilters";
import { JOB_CATEGORIES, getJobCategoryPath } from "../../lib/jobCategories";
import { CompanyCountrySummary, CompanySummary, getCompanyCountryPath, getCompanyPath } from "../../lib/companies";
import { getSeoCountryByCode } from "../../lib/seoCountries";

export const revalidate = 900;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

interface JobsApiPayload {
  success?: boolean;
  data?: JobListItem[];
  pagination?: Partial<PaginationData>;
}
interface CompanyLookupPayload {
  success?: boolean;
  data?: CompanySummary;
}
interface CompaniesPayload {
  success?: boolean;
  data?: CompanySummary[];
}
interface CompanyCountryPayload {
  success?: boolean;
  data?: CompanyCountrySummary[];
}
interface CompanyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function toInt(v: unknown, fallback = 1): number {
  const p = Number(v);
  if (!Number.isFinite(p)) return fallback;
  return Math.max(1, Math.floor(p));
}

async function fetchCompany(slug: string): Promise<CompanySummary | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/companies/${slug}`, {
      next: { revalidate },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const payload = (await res.json()) as CompanyLookupPayload;
    return payload?.data || null;
  } catch {
    return null;
  }
}

async function fetchJobs(companyLabel: string, page: number, filters: ReturnType<typeof readJobFilters>) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    company: companyLabel,
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

async function fetchTopCompanies(): Promise<CompanySummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/companies?limit=60`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as CompaniesPayload;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

async function fetchCompanyCountries(slug: string): Promise<CompanyCountrySummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/companies/${slug}/countries?minJobs=1&limit=12`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as CompanyCountryPayload;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const companies = await fetchTopCompanies();
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params, searchParams }: CompanyPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const company = await fetchCompany(String(resolvedParams?.slug || ""));
  if (!company) {
    return { title: "Company Not Found", description: "This company page could not be found." };
  }

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const canonicalUrl = `${SITE_URL}${getCompanyPath(company.label)}`;
  const title = `${company.label} Remote Jobs — Updated Daily`;
  const description = `Browse remote jobs from ${company.label}. Explore fresh work-from-home opportunities and recent openings from this hiring source.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl },
    robots: page <= 1 && !hasActiveJobFilters(filters) ? undefined : { index: false, follow: true },
  };
}

export default async function CompanyPage({ params, searchParams }: CompanyPageProps) {
  const resolvedParams = await params;
  const company = await fetchCompany(String(resolvedParams?.slug || ""));
  if (!company) notFound();

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const { jobs, pagination, error } = await fetchJobs(company.label, page, filters);
  const companyCountries = await fetchCompanyCountries(company.slug);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search=""
        country=""
        baseUrl={getCompanyPath(company.label)}
        filters={filters}
        heroBadgeText="Featured Hiring Company"
        heroTitle={`Find Remote Jobs From ${company.label}`}
        heroDescription={`Browse current remote openings sourced from ${company.label}. This page helps job seekers track repeat hiring activity and fresh opportunities from a single employer or publisher.`}
        alertCompany={company.label}
        alertLabel={`Save alerts for new remote jobs from ${company.label}, including your current salary and experience filters.`}
      />

      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Why Follow This Company Page?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Some employers and publishers post remote openings consistently over
            time. This landing page groups listings from <strong>{company.label}</strong> into
            one place so candidates can monitor new opportunities without
            repeating the same searches every day.
          </p>
        </section>

        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Explore Related Remote Job Categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {JOB_CATEGORIES.slice(0, 6).map((category) => (
              <Link key={category.slug} href={getJobCategoryPath(category.slug)} className="tag-pill">
                {category.label}
              </Link>
            ))}
          </div>
        </section>

        {companyCountries.length > 0 && (
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">Explore {company.label} by Country</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {companyCountries
                .map((item) => getSeoCountryByCode(item.country))
                .filter((value): value is NonNullable<typeof value> => Boolean(value))
                .map((item) => (
                  <Link
                    key={item.code}
                    href={getCompanyCountryPath(company.label, item.slug)}
                    className="tag-pill"
                  >
                    {item.name}
                  </Link>
                ))}
            </div>
          </section>
        )}

        <PopularCompanies
          excludeSlug={company.slug}
          title="More Hiring Companies"
          subtitle="Explore similar company-specific landing pages to discover additional remote hiring sources."
        />
      </div>
    </div>
  );
}
