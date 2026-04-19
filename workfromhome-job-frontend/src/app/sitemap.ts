import type { MetadataRoute } from "next";
import { getJobPath } from "./lib/jobUrls";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await getAllJobs();
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
  ];

  const countryPages: MetadataRoute.Sitemap = Array.from(countrySet).map((code) => ({
    url: `${SITE_URL}/remote-jobs-in-${code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}${getJobPath(job)}`,
    lastModified: new Date(job.updatedAt || job.publishedAt || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...countryPages, ...jobPages];
}
