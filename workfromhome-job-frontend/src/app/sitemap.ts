import type { MetadataRoute } from "next";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://remotejobdesk.com";

const COUNTRIES = [
  "US","UK","DE","FR","NL","IE","ES","IT",
  "SE","CH","NO","DK","FI","AT","BE","PT",
  "PL","CZ","HU","RO","GR","IN",
];

async function getAllJobIds(): Promise<string[]> {
  try {
    let page = 1;
    const ids: string[] = [];

    while (true) {
      const res = await fetch(
        `${API_BASE_URL}/api/jobs?page=${page}&limit=100`,
        { cache: "no-store" }
      );
      if (!res.ok) break;
      const data = await res.json();
      const jobs = data?.data || [];
      if (!Array.isArray(jobs) || jobs.length === 0) break;
      for (const job of jobs) {
        if (job._id) ids.push(job._id);
      }
      const totalPages = data?.pagination?.totalPages || 1;
      if (page >= totalPages) break;
      page++;
    }

    return ids;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobIds = await getAllJobIds();

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

  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((code) => ({
    url: `${SITE_URL}/remote-jobs-in-${code.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const jobPages: MetadataRoute.Sitemap = jobIds.map((id) => ({
    url: `${SITE_URL}/jobs/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...countryPages, ...jobPages];
}
