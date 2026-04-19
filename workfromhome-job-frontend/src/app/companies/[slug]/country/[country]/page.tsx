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
  CompanyCountrySummary,
  CompanySummary,
  getCompanyCountryPath,
  getCompanyPath,
} from "../../../../lib/companies";
import { JOB_CATEGORIES, getJobCategoryCountryPath } from "../../../../lib/jobCategories";
import { getSeoCountryByCode, getSeoCountryBySlug } from "../../../../lib/seoCountries";

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
interface CompanyCountryPayload {
  success?: boolean;
  data?: CompanyCountrySummary[];
}
interface CompanyCountryPageProps {
  params: Promise<{ slug: string; country: string }>;
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

async function fetchCompanyCountries(slug: string): Promise<CompanyCountrySummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/companies/${slug}/countries?minJobs=1&limit=24`, {
      next: { revalidate },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as CompanyCountryPayload;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

async function fetchJobs(companyLabel: string, countryCode: string, page: number, filters: ReturnType<typeof readJobFilters>) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
    company: companyLabel,
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

async function fetchCompanyCountryCombos(): Promise<CompanyCountrySummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/company-country-combos?limit=300&minJobs=2`, {
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
  const combos = await fetchCompanyCountryCombos();
  return combos
    .map((combo) => {
      const country = getSeoCountryByCode(combo.country);
      if (!country) return null;
      return { slug: combo.companySlug, country: country.slug };
    })
    .filter((value): value is { slug: string; country: string } => Boolean(value));
}

export async function generateMetadata({ params, searchParams }: CompanyCountryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const company = await fetchCompany(String(resolvedParams?.slug || ""));
  const country = getSeoCountryBySlug(String(resolvedParams?.country || ""));
  if (!company || !country) {
    return { title: "Page Not Found", description: "This company-country page could not be found." };
  }

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const jobResult = await fetchJobs(company.label, country.code, page, filters);
  const title = `${company.label} Remote Jobs in ${country.name} — Updated Daily`;
  const description = `Browse remote jobs from ${company.label} in ${country.name}. Track fresh work-from-home openings from this hiring source in one focused landing page.`;
  const canonicalUrl = `${SITE_URL}${getCompanyCountryPath(company.label, country.slug)}`;
  const shouldIndex = page <= 1 && jobResult.pagination.total > 0 && !hasActiveJobFilters(filters);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl },
    robots: shouldIndex ? undefined : { index: false, follow: true },
  };
}

export default async function CompanyCountryPage({ params, searchParams }: CompanyCountryPageProps) {
  const resolvedParams = await params;
  const company = await fetchCompany(String(resolvedParams?.slug || ""));
  const country = getSeoCountryBySlug(String(resolvedParams?.country || ""));
  if (!company || !country) notFound();

  const r = await searchParams;
  const page = toInt(getSearchParamValue(r?.page) || 1, 1);
  const filters = readJobFilters(r);
  const { jobs, pagination, error } = await fetchJobs(company.label, country.code, page, filters);
  const companyCountries = await fetchCompanyCountries(company.slug);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <SharedJobsFeed
        jobs={jobs}
        pagination={pagination}
        error={error}
        search=""
        country={country.code}
        baseUrl={getCompanyCountryPath(company.label, country.slug)}
        filters={filters}
        paginationSearch=""
        heroBadgeText="Company + Country Remote Search"
        heroTitle={`Find Remote Jobs From ${company.label} in ${country.name}`}
        heroDescription={`Browse remote openings sourced from ${company.label} in ${country.name}. This page combines company and market intent to surface more relevant opportunities in one place.`}
        alertCompany={company.label}
        alertLabel={`Save alerts for remote jobs from ${company.label} in ${country.name}, including your current filter setup.`}
      />

      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-4 pb-10">
        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Why This Page Matters</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Candidates often narrow remote job searches by both employer and market.
            This page helps users track opportunities from <strong>{company.label}</strong> in <strong>{country.name}</strong>
            without repeating the same search each day.
          </p>
        </section>

        {companyCountries.length > 1 && (
          <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
            <h2 className="section-title">More Countries for {company.label}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {companyCountries
                .filter((item) => item.country !== country.code)
                .map((item) => getSeoCountryByCode(item.country))
                .filter((value): value is NonNullable<typeof value> => Boolean(value))
                .slice(0, 8)
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

        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Popular Remote Searches in {country.name}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {JOB_CATEGORIES.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={getJobCategoryCountryPath(category.slug, country.slug)}
                className="tag-pill"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
          <h2 className="section-title">Broader Company Pages</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={getCompanyPath(company.label)} className="tag-pill">
              All Jobs From {company.label}
            </Link>
            <Link href={`/remote-jobs-in-${country.code.toLowerCase()}`} className="tag-pill">
              All Jobs in {country.name}
            </Link>
          </div>
        </section>

        <PopularCompanies
          excludeSlug={company.slug}
          subtitle="Explore other hiring sources with dedicated company landing pages for additional remote opportunities."
        />
      </div>
    </div>
  );
}
