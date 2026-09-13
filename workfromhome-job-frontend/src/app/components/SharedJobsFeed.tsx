import Link from "next/link";
import JobSearchToolbar from "./JobSearchToolbar";
import NewsletterCTA from "./NewsletterCTA";
import HeroSearchForm from "./HeroSearchForm";
import { getCompanyPath } from "../lib/companies";
import { applyJobFiltersToParams, JobFilterState } from "../lib/jobFilters";
import { JOB_CATEGORIES, getJobCategoryPath } from "../lib/jobCategories";
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
  GR:"🇬🇷 GR", IN:"🇮🇳 IN", SG:"🇸🇬 SG",
};

export interface JobListItem {
  _id: string; country?: string; category?: string;
  source?: string; sourceLabel?: string; publishedAt?: string;
  originalTitle: string; summary?: string; link: string; seo?: any;
  signals?: {
    seniority?: string;
    experienceText?: string;
    experienceMinYears?: number | null;
    experienceMaxYears?: number | null;
    salaryText?: string;
    salaryCurrency?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryInterval?: string;
  };
}
export interface PaginationData { page: number; totalPages: number; total: number; }

interface SharedJobsFeedProps {
  jobs: JobListItem[];
  pagination: PaginationData;
  error?: string;
  search: string;
  country: string; // uppercase code
  baseUrl: string; // "/" or "/remote-jobs-in-xx"
  filters: JobFilterState;
  hideBannerText?: boolean;
  heroBadgeText?: string;
  heroTitle?: string;
  heroDescription?: string;
  paginationSearch?: string;
  alertCompany?: string;
  alertLabel?: string;
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
function makeQS(search: string, page: number, filters: JobFilterState): string {
  const p = new URLSearchParams();
  if (search) p.set("search", search);
  applyJobFiltersToParams(p, filters);
  p.set("page", String(page));
  return p.toString();
}

function buildBrowseHref(path: string, search: string, filters: JobFilterState): string {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  applyJobFiltersToParams(params, filters);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function buildPaginationHref(path: string, search: string, page: number, filters: JobFilterState): string {
  const query = makeQS(search, page, filters);
  return query ? `${path}?${query}` : path;
}
function getInitials(label: string | undefined): string {
  if (!label) return "J";
  return label.replace(/^https?:\/\/(www\.)?/, "").split(/[.\-\s]/)[0].slice(0, 2).toUpperCase();
}
function getColor(s: string): string {
  const colors = ["#06b6d4","#8b5cf6","#f43f5e","#f59e0b","#10b981","#3b82f6","#ec4899","#14b8a6"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length;
  return colors[h];
}

function formatSeniority(value: string | undefined): string {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "";
  switch (normalized) {
    case "entry-level":
      return "Entry Level";
    case "mid-level":
      return "Mid Level";
    case "internship":
      return "Internship";
    default:
      return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export default function SharedJobsFeed({
  jobs,
  pagination,
  error,
  search,
  country,
  baseUrl,
  filters,
  hideBannerText,
  heroBadgeText,
  heroTitle,
  heroDescription,
  paginationSearch,
  alertCompany,
  alertLabel,
}: SharedJobsFeedProps) {
  const currentPage = Math.max(1, pagination.page);
  const totalPages = Math.max(1, pagination.totalPages);
  const totalJobs = pagination.total || jobs.length;
  const effectivePaginationSearch = paginationSearch ?? search;
  const currentAlertLabel =
    alertLabel ||
    (search
      ? `Save alerts for ${search}${country ? ` in ${COUNTRY_LABELS[country] || country}` : ""}.`
      : country
        ? `Save alerts for remote jobs in ${COUNTRY_LABELS[country] || country}.`
        : "Save alerts for fresh remote jobs across your current search page.");
  const displayHeroTitle =
    heroTitle ||
    `Find Your Next Work-From-Home Job ${country ? `in ${COUNTRY_LABELS[country] || country}` : ""}`.trim();
  const displayHeroDescription =
    heroDescription ||
    `Browse fresh remote opportunities ${country ? `in ${COUNTRY_LABELS[country] || country}` : "across the US, UK, and Europe"} — curated daily with AI-enhanced listings from top companies.`;

  return (
    <div className="feed-container mx-auto flex w-full max-w-[1120px] min-w-0 flex-col gap-4 sm:gap-5 px-3 sm:px-4 py-3 sm:py-4">
      {/* ══ HERO ══ */}
      <header
        className="fade-up glass-card p-4 sm:p-6 md:p-8"
        style={{
          position: "relative",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-orb-3" />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ marginBottom: "0.85rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#eff6ff",
                color: "#1d4ed8",
                borderRadius: "8px",
                padding: "5px 12px",
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "1px solid #dbeafe",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb", animation: "pulse-glow 2s ease infinite", boxShadow: "0 0 8px rgba(37,99,235,0.4)" }} />
              {heroBadgeText || "Remote Job Discovery Platform"}
            </span>
          </div>

          {/* Title */}
          <h1
            className="gradient-text break-words [overflow-wrap:anywhere]"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(1.5rem, 5vw, 3.25rem)",
              fontWeight: 800,
              lineHeight: 1.18,
              margin: "0 0 0.85rem",
              maxWidth: "680px",
            }}
          >
            {displayHeroTitle}
          </h1>

          <p style={{ color: "#475569", maxWidth: "560px", lineHeight: 1.7, marginBottom: "1.25rem", fontSize: "clamp(0.85rem, 2.5vw, 0.98rem)" }}>
            {displayHeroDescription}
          </p>

          <HeroSearchForm search={search} country={country} />

          {/* Stats */}
          <div className="hero-stats-grid mt-4 sm:mt-5 flex flex-wrap gap-3 sm:gap-5">
            {[
              { value: totalJobs.toLocaleString(), label: "Active Jobs", color: "#2563eb" },
              { value: "22+", label: "Countries", color: "#7c3aed" },
              { value: "Daily", label: "Updated", color: "#059669" },
              { value: "100%", label: "Free Access", color: "#d97706" },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}40`, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>{value}</span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: "0.3rem", fontWeight: 600 }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══ COUNTRY FILTERS ══ */}
      <section className="country-scroll" style={{ display: "flex", flexWrap: "nowrap", gap: "6px", overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: "4px" }}>
        <Link
          href={buildBrowseHref("/", search, filters)}
          rel={search ? "nofollow" : undefined}
          style={{
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "0.73rem",
            fontWeight: 700,
            textDecoration: "none",
            flexShrink: 0,
            background: !country ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#ffffff",
            color: !country ? "#fff" : "#475569",
            border: `1px solid ${!country ? "transparent" : "#e2e8f0"}`,
            transition: "all 0.2s",
            boxShadow: !country ? "0 2px 8px rgba(37,99,235,0.25)" : "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          All
        </Link>
        {COUNTRY_OPTIONS.map((item) => (
          <Link
            key={item}
            href={buildBrowseHref(`/remote-jobs-in-${item.toLowerCase()}`, search, filters)}
            rel={search ? "nofollow" : undefined}
            style={{
              borderRadius: "8px",
              padding: "6px 13px",
              fontSize: "0.73rem",
              fontWeight: 700,
              textDecoration: "none",
              flexShrink: 0,
              background: country === item ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#ffffff",
              color: country === item ? "#fff" : "#475569",
              border: `1px solid ${country === item ? "transparent" : "#e2e8f0"}`,
              transition: "all 0.2s",
              boxShadow: country === item ? "0 2px 8px rgba(37,99,235,0.25)" : "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            {COUNTRY_LABELS[item] || item}
          </Link>
        ))}
      </section>

      <JobSearchToolbar
        baseUrl={baseUrl}
        initialFilters={filters}
        search={search}
        country={country}
        company={alertCompany}
        alertLabel={currentAlertLabel}
      />

      {!search && !country && (
        <section className="fade-up w-full min-w-0">
          <div className="glass-card p-4 sm:p-5 w-full min-w-0">
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>
              Popular Remote Job Pages
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "0.75rem", width: "100%", minWidth: 0 }}>
              {JOB_CATEGORIES.slice(0, 8).map((category) => (
                <Link key={category.slug} href={buildBrowseHref(getJobCategoryPath(category.slug), "", filters)} className="tag-pill">
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ ERROR ══ */}
      {error && (
        <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: "1rem", padding: "1rem 1.25rem", color: "#fda4af", fontSize: "0.875rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ══ RESULTS HEADER ══ */}
      {!error && (
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600, margin: 0 }}>
            Showing <strong style={{ color: "#0f172a" }}>{jobs.length}</strong> of{" "}
            <strong style={{ color: "#0f172a" }}>{totalJobs.toLocaleString()}</strong> jobs
            {country && <> in <strong style={{ color: "#2563eb" }}>{COUNTRY_LABELS[country] || country}</strong></>}
            {search && <> for <strong style={{ color: "#2563eb" }}>&quot;{search}&quot;</strong></>}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, whiteSpace: "nowrap" }}>
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* ══ JOB CARDS ══ */}
      <section style={{ display: "grid", gap: "0.75rem" }}>
        {jobs.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "3rem", margin: 0 }}>🔍</p>
            <h2 style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>No jobs found</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Try adjusting your search or country filter.</p>
            <Link href="/" className="btn-primary" style={{ display: "inline-flex" }}>Clear Filters</Link>
          </div>
        ) : (
          jobs.map((job) => {
            const initials = getInitials(job.sourceLabel);
            const bgColor = getColor(job.sourceLabel || job._id);
            const label = job.seo?.metaTitle || job.originalTitle || job.seo?.title;
            const desc = trimText(job.seo?.metaDescription || job.summary || "");
            const signalPills = [
              job.signals?.salaryText ? `💰 ${job.signals.salaryText}` : "",
              job.signals?.experienceText ? `📋 ${job.signals.experienceText}` : "",
              job.signals?.seniority ? `🎯 ${formatSeniority(job.signals.seniority)}` : "",
            ].filter(Boolean);
            return (
              <article key={job._id} className="job-card fade-up w-full min-w-0">
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", position: "relative", zIndex: 1, minWidth: 0, width: "100%" }}>
                  {/* Company avatar */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, ${bgColor}18, ${bgColor}32)`,
                      color: bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 900,
                      border: `1.5px solid ${bgColor}35`,
                      boxShadow: `0 2px 8px ${bgColor}15`,
                    }}
                  >
                    <span>{initials}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 w-full min-w-0">
                      {job.country ? (
                        <Link
                          href={`/remote-jobs-in-${job.country.toLowerCase()}`}
                          className="badge badge-accent hover:opacity-85 transition"
                          style={{ textDecoration: "none" }}
                          title={`Browse remote jobs in ${COUNTRY_LABELS[job.country] || job.country}`}
                        >
                          {COUNTRY_LABELS[job.country] || job.country}
                        </Link>
                      ) : (
                        <span className="badge badge-accent">🌍 Global</span>
                      )}
                      <span className="badge badge-dark">🏠 100% Remote</span>
                      {job.sourceLabel && (
                        <Link href={getCompanyPath(job.sourceLabel)} className="badge badge-gray truncate max-w-[150px] sm:max-w-xs" style={{ textDecoration: "none", fontWeight: 700 }}>
                          🏢 {job.sourceLabel}
                        </Link>
                      )}
                      <div className="flex items-center gap-1.5 sm:ml-auto">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "#059669", fontWeight: 700, background: "#ecfdf5", padding: "2px 7px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                          Actively Hiring
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {timeAgo(job.publishedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link
                      href={getJobPath(job)}
                      className="job-title-link break-words [overflow-wrap:anywhere]"
                      style={{
                        display: "block",
                        fontSize: "1.02rem",
                        fontWeight: 800,
                        color: "#0f172a",
                        textDecoration: "none",
                        lineHeight: 1.35,
                        letterSpacing: "-0.015em",
                        transition: "color 0.18s ease",
                      }}
                    >
                      {label}
                    </Link>

                    {/* Description */}
                    {desc && (
                      <p style={{ marginTop: "0.4rem", fontSize: "0.84rem", color: "#475569", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {desc}
                      </p>
                    )}

                    {/* Highlights & Signal pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.65rem", alignItems: "center", width: "100%", minWidth: 0 }}>
                      {job.signals?.salaryText && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "3px 9px", fontSize: "0.74rem", fontWeight: 700 }}>
                          💰 {job.signals.salaryText}
                        </span>
                      )}
                      {job.signals?.experienceText && (
                        <span className="badge badge-gray" style={{ fontWeight: 600 }}>
                          ⏱️ {job.signals.experienceText}
                        </span>
                      )}
                      {job.signals?.seniority && (
                        <span className="badge badge-gray" style={{ fontWeight: 600 }}>
                          🎯 {formatSeniority(job.signals.seniority)}
                        </span>
                      )}
                      {(job.seo?.keywords || []).slice(0, 4).map((kw: string) => (
                        <Link
                          key={kw}
                          href={`/?search=${encodeURIComponent(kw)}`}
                          className="tag-pill hover:text-blue-600 hover:border-blue-300 transition"
                          style={{ fontSize: "0.7rem", color: "#64748b", textDecoration: "none" }}
                        >
                          #{kw}
                        </Link>
                      ))}
                    </div>

                    {/* High-Converting Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          ⚡ <strong className="text-slate-700">Direct Apply</strong>
                        </span>
                        <span>•</span>
                        <span>🛡️ Verified Remote Employer</span>
                      </div>

                      <Link href={getJobPath(job)} className="btn-job-cta w-full sm:w-auto justify-center text-center">
                        <span style={{ color: "#ffffff" }}>View Job & Apply</span>
                        <span className="cta-arrow" style={{ fontSize: "1.05rem", fontWeight: 900, color: "#ffffff" }}>→</span>
                      </Link>
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
            href={buildPaginationHref(baseUrl, effectivePaginationSearch, Math.max(1, currentPage - 1), filters)}
            className="btn-outline"
            rel="nofollow"
            style={{ opacity: currentPage <= 1 ? 0.3 : 1, pointerEvents: currentPage <= 1 ? "none" : "auto" }}
          >
            ← Previous
          </Link>
          <p style={{ fontSize: "0.82rem", color: "#64748b" }}>
            Page <strong style={{ color: "#0f172a" }}>{currentPage}</strong> of{" "}
            <strong style={{ color: "#0f172a" }}>{totalPages}</strong>
          </p>
          <Link
            href={buildPaginationHref(baseUrl, effectivePaginationSearch, Math.min(totalPages, currentPage + 1), filters)}
            className="btn-outline"
            rel="nofollow"
            style={{ opacity: currentPage >= totalPages ? 0.3 : 1, pointerEvents: currentPage >= totalPages ? "none" : "auto" }}
          >
            Next →
          </Link>
        </nav>
      )}

      {/* ══ LEAD CAPTURE ══ */}
      <NewsletterCTA
        search={search}
        country={country}
        company={alertCompany}
        basePath={baseUrl}
        filters={filters}
        alertLabel={currentAlertLabel}
      />
    </div>
  );
}
