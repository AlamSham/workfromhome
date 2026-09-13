"use client";

import { COUNTRY_LABELS } from "./SharedJobsFeed";
import { JOB_CATEGORIES, getJobCategoryPath, getJobCategoryCountryPath } from "../lib/jobCategories";
import { getSeoCountryByCode } from "../lib/seoCountries";

const COUNTRY_OPTIONS = [
  "US","SG","UK","DE","FR","NL","IE","ES","IT",
  "SE","CH","NO","DK","FI","AT","BE","PT",
  "PL","CZ","HU","RO","GR","IN",
] as const;

export default function HeroSearchForm({ search, country }: { search: string, country: string }) {
  function buildDestination(searchValue: string, countryValue: string) {
    const params = new URLSearchParams(window.location.search);
    const nextSearch = String(searchValue || "").trim();
    const nextCountry = String(countryValue || "").trim().toUpperCase();

    params.delete("page");
    params.delete("search");
    params.delete("country");

    // Try to find a matching category
    const matchedCategory = JOB_CATEGORIES.find(c => 
      c.label.toLowerCase() === nextSearch.toLowerCase() || 
      c.query.toLowerCase() === nextSearch.toLowerCase()
    );

    let basePath = "/";
    
    if (matchedCategory && nextCountry) {
      // Both category and country match programmatic pages
      const seoCountry = getSeoCountryByCode(nextCountry);
      if (seoCountry) {
        basePath = getJobCategoryCountryPath(matchedCategory.slug, seoCountry.slug);
      } else {
        basePath = `/remote-jobs-in-${nextCountry.toLowerCase()}`;
        params.set("search", nextSearch);
      }
    } else if (matchedCategory) {
      // Only category matches
      basePath = getJobCategoryPath(matchedCategory.slug);
    } else if (nextCountry) {
      // Only country matches
      basePath = `/remote-jobs-in-${nextCountry.toLowerCase()}`;
      if (nextSearch) params.set("search", nextSearch);
    } else {
      // Neither matches, fallback to standard query
      if (nextSearch) params.set("search", nextSearch);
    }

    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <form action="/" method="GET" className="hero-search-form">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search role, keyword, or skill…"
          className="hero-search-input"
          style={{
            height: "48px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            padding: "0 1rem",
            fontSize: "0.88rem",
            outline: "none",
            color: "#0f172a",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        />
        <select
          name="country"
          defaultValue={country}
          className="hero-search-select"
          onChange={(e) => {
            const form = document.querySelector('.hero-search-form');
            const input = form?.querySelector('input[name="search"]') as HTMLInputElement;
            window.location.href = buildDestination(input?.value || search, e.target.value);
          }}
          style={{
            height: "48px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            padding: "0 0.875rem",
            fontSize: "0.85rem",
            outline: "none",
            color: "#334155",
            cursor: "pointer",
            transition: "all 0.2s",
            boxSizing: "border-box",
          }}
        >
          <option value="">🌏 All Countries</option>
          {COUNTRY_OPTIONS.map((item) => (
            <option value={item} key={item}>{COUNTRY_LABELS[item] || item}</option>
          ))}
        </select>
        <button
          type="button"
          className="hero-search-btn"
          onClick={() => {
            const form = document.querySelector('.hero-search-form');
            const input = form?.querySelector('input[name="search"]') as HTMLInputElement;
            const select = form?.querySelector('select[name="country"]') as HTMLSelectElement;
            const sVal = input?.value || "";
            const cVal = select?.value || "";
            window.location.href = buildDestination(sVal, cVal);
          }}
          style={{
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "#ffffff",
            padding: "0 1.75rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(37,99,235,0.25)",
            transition: "all 0.2s",
            boxSizing: "border-box",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#ffffff" }}>Find Jobs</span>
        </button>
      </form>

      {/* ── High-Converting Quick Trending Filters (Reduces Bounce Rate) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "0.85rem", flexWrap: "wrap", width: "100%", minWidth: 0 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginRight: "2px" }}>
          Trending:
        </span>
        {[
          { label: "🔥 Hiring Fast", query: "immediately" },
          { label: "🌱 Entry Level", query: "entry level" },
          { label: "🎧 Customer Support", query: "support" },
          { label: "💻 Software Eng", query: "developer" },
          { label: "📊 Data Entry", query: "data entry" },
          { label: "💰 High Pay ($100k+)", query: "senior" },
        ].map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => {
              window.location.href = buildDestination(tag.query, country);
            }}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "9999px",
              padding: "3px 10px",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.color = "#2563eb";
              e.currentTarget.style.background = "#eff6ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.background = "#f8fafc";
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </>
  );
}
