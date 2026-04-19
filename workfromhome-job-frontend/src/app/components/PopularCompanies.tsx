import Link from "next/link";
import { CompanySummary, getCompanyPath } from "../lib/companies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface PopularCompaniesProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  excludeSlug?: string;
}

async function fetchCompanies(limit: number): Promise<CompanySummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/companies?limit=${limit}`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export default async function PopularCompanies({
  title = "Popular Hiring Companies",
  subtitle = "Explore company-specific remote job pages to find repeat hiring patterns and fresh openings.",
  limit = 12,
  excludeSlug,
}: PopularCompaniesProps) {
  const companies = (await fetchCompanies(limit + 1)).filter((company) => company.slug !== excludeSlug).slice(0, limit);

  if (!companies.length) return null;

  return (
    <section className="glass-card fade-up rounded-3xl p-6 sm:p-8">
      <h2 className="section-title">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{subtitle}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {companies.map((company) => (
          <Link key={company.slug} href={getCompanyPath(company.label)} className="tag-pill">
            {company.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
