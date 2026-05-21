import Link from "next/link";
import { JobListItem } from "./SharedJobsFeed";
import { getJobPath } from "../lib/jobUrls";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface BlogRelatedJobsProps {
  query?: string;
  country?: string;
  limit?: number;
  label?: string;
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

async function fetchBlogRelatedJobs(query?: string, country?: string, limit: number = 3): Promise<JobListItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (query && query.trim() !== "") {
    params.set("search", query);
  }
  if (country && country.trim() !== "") {
    params.set("country", country);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs?${params}`, { next: { revalidate: 900 } });
    if (!res.ok) return [];
    const payload = await res.json();
    if (!payload?.success || !Array.isArray(payload?.data)) return [];
    return payload.data;
  } catch {
    return [];
  }
}

export default async function BlogRelatedJobs({ query, country, limit = 3, label }: BlogRelatedJobsProps) {
  const jobs = await fetchBlogRelatedJobs(query, country, limit);

  if (!jobs || jobs.length === 0) return null;

  return (
    <div className="mt-8 not-prose flex flex-col gap-4 p-6 rounded-3xl bg-[rgba(15,23,42,0.6)] border border-slate-800/80">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-slate-100">
          {label || "Active Remote Jobs Hiring Now"}
        </h4>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
      <div className="grid gap-3">
        {jobs.map((job) => {
          const initials = getInitials(job.sourceLabel);
          const bgColor = getColor(job.sourceLabel || job._id);
          const title = job.seo?.metaTitle || job.originalTitle || job.seo?.title || "Remote Job";
          
          return (
            <Link
              key={job._id}
              href={getJobPath(job)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/45 hover:bg-slate-900/50 transition border border-slate-800/30 hover:border-cyan-500/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg font-black text-sm"
                  style={{ width: "36px", height: "36px", background: bgColor + "22", color: bgColor }}
                >
                  {initials}
                </div>
                <div>
                  <h5 className="font-bold text-slate-200 text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {title}
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {job.sourceLabel || "Remote Company"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
                <div className="flex gap-1.5">
                  <span className="badge bg-cyan-950/20 text-cyan-400 text-[10px] px-2 py-0.5 border border-cyan-800/10">
                    {job.country || "Global"}
                  </span>
                  {job.signals?.salaryText && (
                    <span className="badge bg-emerald-950/20 text-emerald-400 text-[10px] px-2 py-0.5 border border-emerald-800/10">
                      💰 {job.signals.salaryText}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                  {timeAgo(job.publishedAt)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="text-center mt-2 border-t border-slate-800/40 pt-4">
        <Link href="/" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition">
          Browse All {query ? `Remote ${query.charAt(0).toUpperCase() + query.slice(1)}` : ""} Jobs →
        </Link>
      </div>
    </div>
  );
}
