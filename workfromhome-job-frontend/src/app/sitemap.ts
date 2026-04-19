import type { MetadataRoute } from "next";
import { getCompanyCountryPath, getCompanyPath } from "./lib/companies";
import { JOB_CATEGORIES, getJobCategoryCountryPath, getJobCategoryPath } from "./lib/jobCategories";
import { getJobPath } from "./lib/jobUrls";
import { getFeaturedComboCountries, getSeoCountryByCode } from "./lib/seoCountries";

export const revalidate = 3600;

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
  const countrySet = new Set(
    jobs.map((job) => String(job.country || "").toUpperCase()).filter((country) => COUNTRIES.includes(country))
  );

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
  ];

  const countryPages: MetadataRoute.Sitemap = Array.from(countrySet).map((code) => ({
    url: `${SITE_URL}/remote-jobs-in-${code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const categoryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.map((category) => ({
    url: `${SITE_URL}${getJobCategoryPath(category.slug)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const categoryCountryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.flatMap((category) =>
    getFeaturedComboCountries().map((country) => ({
      url: `${SITE_URL}${getJobCategoryCountryPath(category.slug, country.slug)}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.65,
    }))
  );

  const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${SITE_URL}${getCompanyPath(company.label)}`,
    lastModified: new Date(company.latestPublishedAt || Date.now()),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

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

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}${getJobPath(job)}`,
    lastModified: new Date(job.updatedAt || job.publishedAt || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...countryPages, ...categoryPages, ...categoryCountryPages, ...companyPages, ...companyCountryPages, ...jobPages];
}
