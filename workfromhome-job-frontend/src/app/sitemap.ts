import type { MetadataRoute } from "next";
import { getCompanyCountryPath, getCompanyPath } from "./lib/companies";
import { JOB_CATEGORIES, getJobCategoryCountryPath, getJobCategoryPath } from "./lib/jobCategories";
import { getJobPath } from "./lib/jobUrls";
import { getFeaturedComboCountries, getSeoCountryByCode } from "./lib/seoCountries";

export const revalidate = 21600; // 6 hours — sitemap internally calls multiple APIs, each costing CPU

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

const COUNTRIES = [
  "US","UK","DE","FR","NL","IE","ES","IT",
  "SE","CH","NO","DK","FI","AT","BE","PT",
  "PL","CZ","HU","RO","GR","IN",
];

interface SitemapJob {
  _id: string;
  originalTitle?: string;
  country?: string;
  publishedAt?: string;
  updatedAt?: string;
  seo?: { slug?: string };
}

interface SitemapCompany {
  label: string;
  slug: string;
  totalJobs: number;
  latestPublishedAt?: string;
}

interface SitemapCompanyCountryCombo {
  companyLabel: string;
  companySlug: string;
  country: string;
  totalJobs: number;
  latestPublishedAt?: string;
}

async function getAllJobs(): Promise<SitemapJob[]> {
  try {
    let page = 1;
    const jobsForSitemap: SitemapJob[] = [];

    while (true) {
      const res = await fetch(
        `${API_BASE_URL}/api/jobs?page=${page}&limit=100`,
        { next: { revalidate } }
      );
      if (!res.ok) break;
      const data = await res.json();
      const jobs = data?.data || [];
      if (!Array.isArray(jobs) || jobs.length === 0) break;
      jobsForSitemap.push(...jobs.filter((job: SitemapJob) => job?._id));
      const totalPages = data?.pagination?.totalPages || 1;
      if (page >= totalPages) break;
      page++;
    }

    return jobsForSitemap;
  } catch {
    return [];
  }
}

async function getAllCompanies(): Promise<SitemapCompany[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/companies?limit=100`, {
      next: { revalidate }
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

async function getAllCompanyCountryCombos(): Promise<SitemapCompanyCountryCombo[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/company-country-combos?limit=500&minJobs=2`, {
      next: { revalidate }
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getAllJobs();
  const companies = await getAllCompanies();
  const companyCountryCombos = await getAllCompanyCountryCombos();

  // ── Static Pages (always present — never depend on API) ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/editorial-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/how-we-source-jobs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // RSS feed — helps Google discover new content faster
    {
      url: `${SITE_URL}/rss.xml`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.3,
    },
    // Blog pages — informational content for long-tail keywords
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog/best-remote-jobs-2026`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/how-to-get-remote-job-no-experience`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/highest-paying-remote-jobs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/remote-job-interview-tips`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/remote-jobs-usa-vs-europe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog/remote-work-tools-2026`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // ── Country Pages (ALL 22 countries — always present, no API dependency) ──
  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((code) => ({
    url: `${SITE_URL}/remote-jobs-in-${code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  // ── Category Pages (always present — hardcoded, no API dependency) ──
  const categoryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.map((category) => ({
    url: `${SITE_URL}${getJobCategoryPath(category.slug)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // ── Category × Country combos (always present for featured countries) ──
  const categoryCountryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.flatMap((category) =>
    getFeaturedComboCountries().map((country) => ({
      url: `${SITE_URL}${getJobCategoryCountryPath(category.slug, country.slug)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.65,
    }))
  );

  // ── Company Pages (dynamic — from API) ──
  const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${SITE_URL}${getCompanyPath(company.label)}`,
    lastModified: new Date(company.latestPublishedAt || Date.now()),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // ── Company × Country combos (dynamic — from API) ──
  const companyCountryPages: MetadataRoute.Sitemap = companyCountryCombos
    .map((combo) => {
      const country = getSeoCountryByCode(combo.country);
      if (!country) return null;
      return {
        url: `${SITE_URL}${getCompanyCountryPath(combo.companyLabel, country.slug)}`,
        lastModified: new Date(combo.latestPublishedAt || Date.now()),
        changeFrequency: "daily" as const,
        priority: 0.58,
      };
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value));

  // ── Individual Job Pages (dynamic — from API) ──
  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}${getJobPath(job)}`,
    lastModified: new Date(job.updatedAt || job.publishedAt || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ╔════════════════════════════════════════════════════════════╗
  // ║ NOTE: NO search URLs (/?search=...) in sitemap.           ║
  // ║ These are noindexed, so including them causes Google to   ║
  // ║ report "Excluded by noindex" errors. Only clean,          ║
  // ║ canonical, indexable URLs belong in the sitemap.          ║
  // ╚════════════════════════════════════════════════════════════╝

  return [
    ...staticPages,
    ...countryPages,
    ...categoryPages,
    ...categoryCountryPages,
    ...companyPages,
    ...companyCountryPages,
    ...jobPages,
  ];
}
