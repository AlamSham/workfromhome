import Link from "next/link";
import NewsletterCTA from "./NewsletterCTA";
import HeroSearchForm from "./HeroSearchForm";
import { getJobPath } from "../lib/jobUrls";

const COUNTRY_OPTIONS = [
  "US","UK","DE","FR","NL","IE","ES","IT",
  "SE","CH","NO","DK","FI","AT","BE","PT",
  "PL","CZ","HU","RO","GR","IN",
] as const;

export const COUNTRY_LABELS: Record<string, string> = {
  US:"🇺🇸 US", UK:"🇬🇧 UK", DE:"🇩🇪 DE", FR:"🇫🇷 FR",
  NL:"🇳🇱 NL", IE:"🇮🇪 IE", ES:"🇪🇸 ES", IT:"🇮🇹 IT",
  SE:"🇸🇪 SE", CH:"🇨🇭 CH", NO:"🇳🇴 NO", DK:"🇩🇰 DK",
  FI:"🇫🇮 FI", AT:"🇦🇹 AT", BE:"🇧🇪 BE", PT:"🇵🇹 PT",
  PL:"🇵🇱 PL", CZ:"🇨🇿 CZ", HU:"🇭🇺 HU", RO:"🇷🇴 RO",
  GR:"🇬🇷 GR", IN:"🇮🇳 IN",
};

export interface JobListItem {
  _id: string; country?: string; category?: string;
  source?: string; sourceLabel?: string; publishedAt?: string;
  originalTitle: string; summary?: string; link: string; seo?: any;
}
export interface PaginationData { page: number; totalPages: number; total: number; }

interface SharedJobsFeedProps {
  jobs: JobListItem[];
  pagination: PaginationData;
  error?: string;
  search: string;
  country: string; // uppercase code
  baseUrl: string; // "/" or "/remote-jobs-in-xx"
  hideBannerText?: boolean;
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
function trimText(v: string | undefined, max = 155): string {
  const t = String(v || "").trim();
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`;
}
function makeQS(search: string, overrideCountryParam: boolean, page: number): string {
  const p = new URLSearchParams();
  if (search) p.set("search", search);
  p.set("page", String(page));
  return p.toString();
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

export default function SharedJobsFeed({ jobs, pagination, error, search, country, baseUrl, hideBannerText }: SharedJobsFeedProps) {
  const currentPage = Math.max(1, pagination.page);
  const totalPages = Math.max(1, pagination.totalPages);
  const totalJobs = pagination.total || jobs.length;

  return (
    <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "1rem 1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* ══ HERO ══ */}
      <header
        className="fade-up glass-card hero-section"
        style={{ padding: "clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 4vw, 2rem) clamp(1.25rem, 4vw, 2rem)", position: "relative", overflow: "hidden" }}
      >
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: "0.75rem" }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(11,143,117,0.1)", color: "var(--brand-ink)",
                borderRadius: "9999px", padding: "4px 14px",
                fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase",
              }}
            >
              🌍 Remote Job Discovery Platform
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(1.6rem, 5vw, 3.25rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "#0f172a",
              margin: "0 0 0.75rem",
              maxWidth: "700px",
            }}
          >
            Find Your Next{" "}
            <span style={{ color: "var(--brand)" }}>Work-From-Home</span>{" "}
            Job {country ? `in ${COUNTRY_LABELS[country] || country}` : ""}
          </h1>

          <p style={{ color: "#475569", maxWidth: "560px", lineHeight: 1.65, marginBottom: "1.25rem", fontSize: "clamp(0.875rem, 2.5vw, 1rem)" }}>
            Browse fresh remote opportunities {country ? `in ${COUNTRY_LABELS[country] || country}` : "across the US, UK, and Europe"} —
            curated daily with AI-enhanced listings from top companies.
          </p>

          <HeroSearchForm search={search} country={country} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
            {[
              { icon: "📋", label: `${totalJobs.toLocaleString()} listings` },
              { icon: "🔄", label: "Updated daily" },
              { icon: "🌎", label: "22 countries" },
              { icon: "✅", label: "100% remote" },
            ].map(({ icon, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                {icon} <span style={{ color: "#1e293b" }}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ══ COUNTRY FILTERS ══ */}
      <section style={{ display: "flex", flexWrap: "wrap", gap: "6px", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "4px" }}>
        <Link
          href={`/${search ? `?search=${search}` : ''}`}
          style={{
            borderRadius: "9999px",
            padding: "6px 14px",
            fontSize: "0.75rem",
            fontWeight: 700,
            textDecoration: "none",
            background: !country ? "var(--brand)" : "#fff",
            color: !country ? "#fff" : "var(--brand-ink)",
            border: `1.5px solid ${!country ? "var(--brand)" : "rgba(11,143,117,0.25)"}`,
            transition: "all 0.15s",
          }}
        >
          🌏 All
        </Link>
        {COUNTRY_OPTIONS.map((item) => (
          <Link
            key={item}
            href={`/remote-jobs-in-${item.toLowerCase()}${search ? `?search=${search}` : ''}`}
            style={{
              borderRadius: "9999px",
              padding: "6px 13px",
              fontSize: "0.75rem",
              fontWeight: 700,
              textDecoration: "none",
              background: country === item ? "var(--brand)" : "#fff",
              color: country === item ? "#fff" : "var(--brand-ink)",
              border: `1.5px solid ${country === item ? "var(--brand)" : "rgba(11,143,117,0.2)"}`,
              transition: "all 0.15s",
            }}
          >
            {COUNTRY_LABELS[item] || item}
          </Link>
        ))}
      </section>

      {/* ══ ERROR ══ */}
      {error && (
        <div style={{ background: "#fff1f2", border: "1px solid #fda4af", borderRadius: "1rem", padding: "1rem 1.25rem", color: "#be123c", fontSize: "0.875rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ══ RESULTS HEADER ══ */}
      {!error && (
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
            Showing <strong style={{ color: "#0f172a" }}>{jobs.length}</strong> of{" "}
            <strong style={{ color: "#0f172a" }}>{totalJobs.toLocaleString()}</strong> jobs
            {country && <> in <strong style={{ color: "var(--brand-ink)" }}>{COUNTRY_LABELS[country] || country}</strong></>}
            {search && <> for <strong style={{ color: "var(--brand-ink)" }}>&quot;{search}&quot;</strong></>}
          </p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0, whiteSpace: "nowrap" }}>
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* ══ JOB CARDS ══ */}
      <section style={{ display: "grid", gap: "0.875rem" }}>
        {jobs.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "3rem", margin: 0 }}>🔍</p>
            <h2 style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.25rem", fontWeight: 800 }}>No jobs found</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Try adjusting your search or country filter.</p>
            <Link href="/" className="btn-primary" style={{ display: "inline-flex" }}>Clear Filters</Link>
          </div>
        ) : (
          jobs.map((job) => {
            const initials = getInitials(job.sourceLabel);
            const bgColor = getColor(job.sourceLabel || job._id);
            const label = job.seo?.metaTitle || job.originalTitle || job.seo?.title;
            const desc = trimText(job.seo?.metaDescription || job.summary || "");
            return (
              <article key={job._id} className="job-card fade-up">
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      flexShrink: 0, width: "44px", height: "44px",
                      borderRadius: "0.75rem",
                      background: bgColor + "22",
                      color: bgColor,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 900,
                      border: `1.5px solid ${bgColor}33`,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="badge badge-brand">{COUNTRY_LABELS[job.country || ""] || job.country || "Global"}</span>
                      <span className="badge badge-dark">{(job.category || "WFH").toUpperCase()}</span>
                      {job.sourceLabel && <span className="badge badge-gray">{job.sourceLabel}</span>}
                      <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>
                        🕒 {timeAgo(job.publishedAt)}
                      </span>
                    </div>
                    <Link
                      href={getJobPath(job)}
                      style={{ display: "block", fontSize: "1.025rem", fontWeight: 800, color: "#0f172a", textDecoration: "none", lineHeight: 1.4 }}
                    >
                      {label}
                    </Link>
                    {desc && <p style={{ marginTop: "0.4rem", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.65 }}>{desc}</p>}
                    {(job.seo?.keywords || []).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "0.6rem" }}>
                        {(job.seo.keywords || []).slice(0, 5).map((kw: string) => (
                          <span key={kw} className="tag-pill">#{kw}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.875rem", flexWrap: "wrap" }}>
                      <Link href={getJobPath(job)} className="btn-primary">View Details →</Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* ══ PAGINATION ══ */}
      {totalPages > 1 && (
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0 2rem" }}>
          <Link
            href={`${baseUrl}?${makeQS(search, false, Math.max(1, currentPage - 1))}`}
            className="btn-outline"
            style={{ opacity: currentPage <= 1 ? 0.4 : 1, pointerEvents: currentPage <= 1 ? "none" : "auto" }}
          >
            ← Previous
          </Link>
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
            Page <strong style={{ color: "#0f172a" }}>{currentPage}</strong> of{" "}
            <strong style={{ color: "#0f172a" }}>{totalPages}</strong>
          </p>
          <Link
            href={`${baseUrl}?${makeQS(search, false, Math.min(totalPages, currentPage + 1))}`}
            className="btn-outline"
            style={{ opacity: currentPage >= totalPages ? 0.4 : 1, pointerEvents: currentPage >= totalPages ? "none" : "auto" }}
          >
            Next →
          </Link>
        </nav>
      )}

      {/* ══ LEAD CAPTURE ══ */}
      <NewsletterCTA />
    </div>
  );
}
