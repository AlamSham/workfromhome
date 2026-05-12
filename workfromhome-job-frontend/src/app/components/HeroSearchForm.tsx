"use client";

import { COUNTRY_LABELS } from "./SharedJobsFeed";
import { JOB_CATEGORIES, getJobCategoryPath, getJobCategoryCountryPath } from "../lib/jobCategories";
import { getSeoCountryByCode } from "../lib/seoCountries";

const COUNTRY_OPTIONS = [
  "US","UK","DE","FR","NL","IE","ES","IT",
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
      <style>{`
        .hero-search-form {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .hero-search-form input,
        .hero-search-form select {
          width: 100%;
        }
        .hero-search-form button {
          width: 100%;
        }
        @media (min-width: 600px) {
          .hero-search-form {
            display: grid;
            grid-template-columns: 1fr auto auto;
            align-items: center;
            gap: 0.75rem;
          }
          .hero-search-form input,
          .hero-search-form select,
          .hero-search-form button {
            width: auto;
          }
        }
        .hero-search-input:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6,182,212,0.12), 0 0 20px rgba(6,182,212,0.08) !important;
        }
        .hero-search-select:focus {
          border-color: #06b6d4 !important;
          box-shadow: 0 0 0 3px rgba(6,182,212,0.12) !important;
        }
        .hero-search-btn:hover {
          box-shadow: 0 4px 24px rgba(6,182,212,0.4) !important;
          transform: translateY(-1px);
        }
      `}</style>
      <form action="/" method="GET" className="hero-search-form">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search role, keyword, or skill…"
          className="hero-search-input"
          style={{
            height: "48px",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.1)",
            background: "rgba(15,23,42,0.6)",
            padding: "0 1rem",
            fontSize: "0.88rem",
            outline: "none",
            color: "#f1f5f9",
            transition: "all 0.2s",
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
            border: "1px solid rgba(148,163,184,0.1)",
            background: "rgba(15,23,42,0.6)",
            padding: "0 0.875rem",
            fontSize: "0.85rem",
            outline: "none",
            color: "#94a3b8",
            cursor: "pointer",
            minWidth: "140px",
            transition: "all 0.2s",
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
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            color: "#fff",
            padding: "0 1.75rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 16px rgba(6,182,212,0.3)",
            transition: "all 0.2s",
          }}
        >
          Find Jobs
        </button>
      </form>
    </>
  );
}
