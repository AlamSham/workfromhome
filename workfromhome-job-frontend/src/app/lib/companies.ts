export interface CompanySummary {
  label: string;
  slug: string;
  totalJobs: number;
  latestPublishedAt?: string;
}

export interface CompanyCountrySummary {
  companyLabel: string;
  companySlug: string;
  country: string;
  totalJobs: number;
  latestPublishedAt?: string;
}

export function slugifyCompanyLabel(value: string): string {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getCompanyPath(value: string): string {
  return `/remote-jobs-at-${slugifyCompanyLabel(value)}`;
}

export function getCompanyCountryPath(value: string, countrySlug: string): string {
  return `/remote-jobs-at-${slugifyCompanyLabel(value)}-in-${countrySlug}`;
}
