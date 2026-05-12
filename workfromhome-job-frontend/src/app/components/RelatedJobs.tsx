import Link from "next/link";
import { JobListItem } from "./SharedJobsFeed";
import { getJobPath } from "../lib/jobUrls";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface RelatedJobsProps {
  currentJobId: string;
  country?: string;
  category?: string;
}

function timeAgo(value: string | undefined): string {
  if (!value) return "Recently";
  const diff = Date.now() - new Date(value).getTime();
  if (isNaN(diff)) return "Recently";
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function getInitials(label: string | undefined): string {
  if (!label) return "J";
  return label.replace(/^https?:\/\/(www\.)?/, "").split(/[.\-\s]/)[0].slice(0, 2).toUpperCase();
}

function getColor(s: string): string {
  const colors = ["#0b8f75","#7c3aed","#dc2626","#d97706","#059669","#2563eb","#db2777","#0891b2"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length;
  return colors[h];
}

async function fetchRelatedJobs(currentJobId: string, country?: string, category?: string): Promise<JobListItem[]> {
  const params = new URLSearchParams({ limit: "6" });
  // Prioritize country if available
  if (country && country.trim() !== "") {
    params.set("country", country);
  } else if (category && category.trim() !== "") {
    params.set("search", category);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const payload = await res.json();
    if (!payload?.success || !Array.isArray(payload?.data)) return [];
    
    // Filter out the current job and limit to 4
    return payload.data.filter((j: JobListItem) => j._id !== currentJobId).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function RelatedJobs({ currentJobId, country, category }: RelatedJobsProps) {
  const jobs = await fetchRelatedJobs(currentJobId, country, category);

  if (!jobs || jobs.length === 0) return null;

  return (
    <section className="mt-8 flex flex-col gap-4 fade-up">
      <h3 className="text-xl font-bold text-slate-100 border-t border-slate-800/60 pt-8">
        Similar Remote Jobs
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {jobs.map((job) => {
          const initials = getInitials(job.sourceLabel);
          const bgColor = getColor(job.sourceLabel || job._id);
          const label = job.seo?.metaTitle || job.originalTitle || job.seo?.title || "Remote Job";
          
          return (
            <Link
              key={job._id}
              href={getJobPath(job)}
              className="group flex flex-col justify-between glass-card p-5 rounded-2xl hover:-translate-y-1 transition-transform border-l-[3px] border-l-transparent hover:border-l-cyan-400"
            >
              <div className="flex gap-3 mb-3">
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg font-black text-sm"
                  style={{ width: "40px", height: "40px", background: bgColor + "22", color: bgColor }}
                >
                  {initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
                    {label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {job.sourceLabel || "Remote Company"}
                  </p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="badge bg-brand/10 text-cyan-400 text-[10px] px-2 py-0.5">
                    {job.country || "Global"}
                  </span>
                  <span className="badge bg-slate-900 text-slate-300 text-[10px] px-2 py-0.5">
                    {job.category || "WFH"}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {timeAgo(job.publishedAt)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-4">
        <Link href="/" className="btn-outline inline-flex">
          View all remote jobs →
        </Link>
      </div>
    </section>
  );
}
