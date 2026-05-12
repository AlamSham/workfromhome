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
  GR:"🇬🇷 GR", IN:"🇮🇳 IN",
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
    <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "1rem 1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* ══ HERO ══ */}
      <header
        className="fade-up glass-card"
        style={{
          padding: "clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2.5rem)",
          position: "relative",
          overflow: "hidden",
          borderImage: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.15), rgba(59,130,246,0.1)) 1",
          borderImageSlice: 1,
          border: "1px solid",
        }}
      >
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="hero-orb-3" />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Badge */}
          <div style={{ marginBottom: "1rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(6,182,212,0.1)",
                color: "#22d3ee",
                borderRadius: "8px",
                padding: "5px 14px",
                fontSize: "0.68rem",
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                border: "1px solid rgba(6,182,212,0.12)",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#06b6d4", animation: "pulse-glow 2s ease infinite", boxShadow: "0 0 8px rgba(6,182,212,0.5)" }} />
              {heroBadgeText || "Remote Job Discovery Platform"}
            </span>
          </div>

          {/* Title */}
          <h1
            className="gradient-text"
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 0.85rem",
              maxWidth: "680px",
            }}
          >
            {displayHeroTitle}
          </h1>

          <p style={{ color: "#94a3b8", maxWidth: "560px", lineHeight: 1.7, marginBottom: "1.5rem", fontSize: "clamp(0.88rem, 2.5vw, 1rem)" }}>
            {displayHeroDescription}
          </p>

          <HeroSearchForm search={search} country={country} />

          {/* Stats */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", marginTop: "1.25rem" }}>
            {[
              { value: totalJobs.toLocaleString(), label: "Active Jobs", color: "#06b6d4" },
              { value: "22+", label: "Countries", color: "#8b5cf6" },
              { value: "Daily", label: "Updated", color: "#10b981" },
              { value: "100%", label: "Free Access", color: "#f59e0b" },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}40` }} />
                <div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f1f5f9" }}>{value}</span>
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
            background: !country ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "transparent",
            color: !country ? "#fff" : "#94a3b8",
            border: `1px solid ${!country ? "transparent" : "rgba(148,163,184,0.1)"}`,
            transition: "all 0.2s",
            boxShadow: !country ? "0 2px 12px rgba(6,182,212,0.2)" : "none",
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
              background: country === item ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "transparent",
              color: country === item ? "#fff" : "#94a3b8",
              border: `1px solid ${country === item ? "transparent" : "rgba(148,163,184,0.08)"}`,
              transition: "all 0.2s",
              boxShadow: country === item ? "0 2px 12px rgba(6,182,212,0.2)" : "none",
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
        <section className="fade-up">
          <div className="glass-card" style={{ padding: "1rem 1.25rem 1.1rem" }}>
            <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>
              Popular Remote Job Pages
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "0.75rem" }}>
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
            Showing <strong style={{ color: "#f1f5f9" }}>{jobs.length}</strong> of{" "}
            <strong style={{ color: "#f1f5f9" }}>{totalJobs.toLocaleString()}</strong> jobs
            {country && <> in <strong style={{ color: "#22d3ee" }}>{COUNTRY_LABELS[country] || country}</strong></>}
            {search && <> for <strong style={{ color: "#22d3ee" }}>&quot;{search}&quot;</strong></>}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#475569", margin: 0, whiteSpace: "nowrap" }}>
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* ══ JOB CARDS ══ */}
      <section style={{ display: "grid", gap: "0.75rem" }}>
        {jobs.length === 0 ? (
          <div className="glass-card fade-up" style={{ padding: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "3rem", margin: 0 }}>🔍</p>
            <h2 style={{ margin: "0.75rem 0 0.5rem", fontSize: "1.25rem", fontWeight: 800, color: "#f1f5f9" }}>No jobs found</h2>
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
              <article key={job._id} className="job-card fade-up">
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                  {/* Company avatar */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: `${bgColor}15`,
                      color: bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.82rem",
                      fontWeight: 900,
                      border: `1px solid ${bgColor}20`,
                      backgroundImage: job.sourceLabel
                        ? `url(https://logo.clearbit.com/${job.sourceLabel.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.]/g, '')}.com)`
                        : "none",
                      backgroundSize: "60%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <span style={{ opacity: 0.4 }}>{initials}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges row */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="badge badge-accent">{COUNTRY_LABELS[job.country || ""] || job.country || "Global"}</span>
                      <span className="badge badge-dark">{(job.category || "WFH").toUpperCase()}</span>
                      {job.sourceLabel && (
                        <Link href={getCompanyPath(job.sourceLabel)} className="badge badge-gray" style={{ textDecoration: "none" }}>
                          {job.sourceLabel}
                        </Link>
                      )}
                      <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {timeAgo(job.publishedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      href={getJobPath(job)}
                      style={{ display: "block", fontSize: "1rem", fontWeight: 800, color: "#f1f5f9", textDecoration: "none", lineHeight: 1.4, transition: "color 0.2s" }}
                    >
                      {label}
                    </Link>

                    {/* Description */}
                    {desc && <p style={{ marginTop: "0.35rem", fontSize: "0.83rem", color: "#64748b", lineHeight: 1.65 }}>{desc}</p>}

                    {/* Signal pills */}
                    {signalPills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.6rem" }}>
                        {signalPills.map((pill) => (
                          <span key={pill} className="badge badge-gray" style={{ fontWeight: 600 }}>
                            {pill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Keywords */}
                    {(job.seo?.keywords || []).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "0.55rem" }}>
                        {(job.seo.keywords || []).slice(0, 5).map((kw: string) => (
                          <span key={kw} className="tag-pill">#{kw}</span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
                      <Link href={getJobPath(job)} className="btn-primary" style={{ fontSize: "0.78rem", padding: "0.45rem 1rem" }}>View Details →</Link>
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
            Page <strong style={{ color: "#f1f5f9" }}>{currentPage}</strong> of{" "}
            <strong style={{ color: "#f1f5f9" }}>{totalPages}</strong>
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
